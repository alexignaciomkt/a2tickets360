import { db } from '../db';
import { 
    platformMasters, 
    organizers, 
    employees, 
    employeeEventAccess, 
    employeeRoles, 
    rolePermissions, 
    permissions,
    employeePermissionOverrides,
    eventStaff,
    eventStaffRoles,
    eventStaffPermissionOverrides
} from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthorizationContext {
    userId: string;
    organizerId: string;
    eventId?: string;
    permissionKey: string;
}

export class AuthorizationEngine {
    /**
     * Motor principal de autorização contextual.
     * Retorna true se o usuário tiver acesso à capability solicitada.
     */
    static async hasPermission(context: AuthorizationContext): Promise<boolean> {
        const { userId, organizerId, eventId, permissionKey } = context;

        if (!permissionKey) return false;

        // 1. MASTER BYPASS
        const masterRecords = await db.select()
            .from(platformMasters)
            .where(and(
                eq(platformMasters.userId, userId),
                eq(platformMasters.status, 'active')
            ));
            
        if (masterRecords.length > 0) {
            return true;
        }

        // 2. OWNER BYPASS (Produtor Principal)
        const ownerRecords = await db.select()
            .from(organizers)
            .where(and(
                eq(organizers.userId, userId),
                eq(organizers.userId, organizerId)
            ));
            
        if (ownerRecords.length > 0) {
            return true;
        }

        // Lookup permission ID for the requested key
        const requestedPermission = await db.select()
            .from(permissions)
            .where(eq(permissions.systemKey, permissionKey));
            
        if (requestedPermission.length === 0) {
            return false; // Permission doesn't exist
        }
        
        const permissionId = requestedPermission[0].id;

        // 3. EMPLOYEE MEMBERSHIP
        const isEmployeeAuthorized = await this.checkEmployeeAuthorization(userId, organizerId, eventId, permissionId);
        if (isEmployeeAuthorized) {
            return true;
        }

        // 4. EVENT STAFF (FASE 4)
        if (eventId) {
            const isEventStaffAuthorized = await this.checkEventStaffAuthorization(userId, organizerId, eventId, permissionId);
            if (isEventStaffAuthorized) {
                return true;
            }
        }

        return false;
    }

    private static async checkEmployeeAuthorization(userId: string, organizerId: string, eventId: string | undefined, permissionId: string): Promise<boolean> {
        const membershipRecords = await db.select()
            .from(employees)
            .where(and(
                eq(employees.userId, userId),
                eq(employees.organizerId, organizerId),
                eq(employees.status, 'active')
            ));

        if (membershipRecords.length === 0) {
            return false;
        }

        const employee = membershipRecords[0];

        // EVENT SCOPE (ALL_EVENTS vs SELECTED_EVENTS)
        if (eventId && employee.accessScope === 'SELECTED_EVENTS') {
            const eventAccess = await db.select()
                .from(employeeEventAccess)
                .where(and(
                    eq(employeeEventAccess.employeeId, employee.id),
                    eq(employeeEventAccess.eventId, eventId)
                ));
                
            if (eventAccess.length === 0) {
                return false;
            }
        }

        // RBAC & PERMISSION RESOLUTION
        const empRoles = await db.select({ roleId: employeeRoles.roleId })
            .from(employeeRoles)
            .where(eq(employeeRoles.employeeId, employee.id));
          
        let hasBasePermission = false;
        const roleIds = empRoles.map(r => r.roleId);

        if (roleIds.length > 0) {
            for (const rId of roleIds) {
                const hasPerm = await db.select()
                    .from(rolePermissions)
                    .where(and(
                        eq(rolePermissions.roleId, rId),
                        eq(rolePermissions.permissionId, permissionId)
                    ));
                if (hasPerm.length > 0) {
                    hasBasePermission = true;
                    break;
                }
            }
        }

        // PERMISSION OVERRIDES (GRANT / DENY)
        const override = await db.select()
            .from(employeePermissionOverrides)
            .where(and(
                eq(employeePermissionOverrides.employeeId, employee.id),
                eq(employeePermissionOverrides.permissionId, permissionId)
            ));

        if (override.length > 0) {
            const type = override[0].overrideType;
            if (type === 'DENY') return false;
            if (type === 'GRANT') return true;
        }

        return hasBasePermission;
    }

    private static async checkEventStaffAuthorization(userId: string, organizerId: string, eventId: string, permissionId: string): Promise<boolean> {
        const staffRecords = await db.select()
            .from(eventStaff)
            .where(and(
                eq(eventStaff.userId, userId),
                eq(eventStaff.organizerId, organizerId), // CROSS TENANT PROTECTION
                eq(eventStaff.eventId, eventId),
                eq(eventStaff.status, 'ACTIVE')
            ));

        if (staffRecords.length === 0) {
            return false;
        }

        const staff = staffRecords[0];

        // RBAC & PERMISSION RESOLUTION
        const staffRoleRecords = await db.select({ roleId: eventStaffRoles.roleId })
            .from(eventStaffRoles)
            .where(eq(eventStaffRoles.eventStaffId, staff.id));
          
        let hasBasePermission = false;
        const roleIds = staffRoleRecords.map(r => r.roleId);

        if (roleIds.length > 0) {
            for (const rId of roleIds) {
                const hasPerm = await db.select()
                    .from(rolePermissions)
                    .where(and(
                        eq(rolePermissions.roleId, rId),
                        eq(rolePermissions.permissionId, permissionId)
                    ));
                if (hasPerm.length > 0) {
                    hasBasePermission = true;
                    break;
                }
            }
        }

        // PERMISSION OVERRIDES (GRANT / DENY)
        const override = await db.select()
            .from(eventStaffPermissionOverrides)
            .where(and(
                eq(eventStaffPermissionOverrides.eventStaffId, staff.id),
                eq(eventStaffPermissionOverrides.permissionId, permissionId)
            ));

        if (override.length > 0) {
            const type = override[0].overrideType;
            if (type === 'DENY') return false;
            if (type === 'GRANT') return true;
        }

        return hasBasePermission;
    }
}
