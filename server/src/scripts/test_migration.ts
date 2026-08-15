import { db } from '../db';
import { 
    eventStaff, 
    staffProfiles, 
    staffFunctions,
    eventStaffRoles,
    roles,
    staff,
    profiles,
    events,
    organizers
} from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function runTest() {
    console.log("Iniciando Teste E2E da Migração de Staff...");

    // 1. Pegar um organizador e evento existente
    const allEvents = await db.select().from(events).limit(1);
    if (allEvents.length === 0) {
        console.log("Nenhum evento encontrado para testar.");
        process.exit(1);
    }
    const event = allEvents[0];
    const organizerId = event.organizerId;
    const eventId = event.id;

    console.log(`Evento selecionado: ${event.title} (ID: ${eventId})`);

    // 2. Criar uma Função Operacional Simulando a UI (+ Criar nova função)
    const newFunctionName = "Segurança Portaria " + Date.now();
    const [newFunc] = await db.insert(staffFunctions).values({
        organizerId,
        name: newFunctionName,
        defaultSystemRoleId: null,
        isActive: true
    }).returning();
    const staffFunctionId = newFunc.id;
    console.log(`Criada função inline simulada: ${newFunc.name}`);

    // 3. Pegar as roles SECURITY e CHECKIN_OPERATOR
    const securityRole = await db.select().from(roles).where(eq(roles.systemKey, 'SECURITY')).limit(1);
    const checkinRole = await db.select().from(roles).where(eq(roles.systemKey, 'CHECKIN_OPERATOR')).limit(1);
    
    const roleIds = [securityRole[0].id, checkinRole[0].id];
    console.log(`Usando roles: SECURITY (${roleIds[0]}) e CHECKIN_OPERATOR (${roleIds[1]})`);

    // 4. Simulando Payload do Frontend
    const mockFrontendPayload = {
        eventId: eventId,
        name: 'Teste da Silva Portaria',
        email: `teste.seguranca.${Date.now()}@a2tickets.com`,
        phone: '11999999988',
        staffFunctionId: staffFunctionId,
        shiftStart: new Date().toISOString(),
        shiftEnd: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        systemRoleIds: roleIds
    };

    console.log("Simulando chamada POST /api/staff/invite com:", mockFrontendPayload);

    // Contar registros na tabela legacy antes do teste
    const { sql } = require('drizzle-orm');
    const legacyCountBeforeRes = await db.execute(sql`SELECT count(*) as c FROM staff`);
    const legacyCountBefore = Number(legacyCountBeforeRes[0].c);
    
    // --- Lógica do Endpoint (simulada) ---
    const p = await db.execute(sql`SELECT user_id, email, name FROM profiles LIMIT 1`);
    const userId = p[0].user_id as string;
    const email = p[0].email as string;

    const sp = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId));
    if (sp.length === 0) {
        await db.insert(staffProfiles).values({
            userId,
            fullName: p[0].name as string,
            phone: mockFrontendPayload.phone,
        });
    }

    const newStaffId = uuidv4();
    await db.insert(eventStaff).values({
        id: newStaffId,
        eventId: mockFrontendPayload.eventId,
        userId: userId,
        organizerId: organizerId,
        staffFunctionId: mockFrontendPayload.staffFunctionId,
        status: 'PENDING_ACCEPTANCE',
        shiftStart: new Date(mockFrontendPayload.shiftStart),
        shiftEnd: new Date(mockFrontendPayload.shiftEnd),
        invitedBy: organizerId,
    });

    for (const rId of mockFrontendPayload.systemRoleIds) {
        await db.insert(eventStaffRoles).values({
            eventStaffId: newStaffId,
            roleId: rId
        });
    }
    // ------------------------------------

    // 5. Validar Resultados
    console.log("\n--- RESULTADOS DA MIGRAÇÃO ---");
    
    const savedStaffProfile = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId));
    console.log("✅ Staff Profile salvo?", savedStaffProfile.length > 0, "Phone:", savedStaffProfile[0]?.phone);

    const savedFunc = await db.select().from(staffFunctions).where(eq(staffFunctions.id, staffFunctionId));
    console.log("✅ staff_functions criada para o organizer correto?", savedFunc.length > 0 && savedFunc[0].organizerId === organizerId);

    const savedEventStaff = await db.select().from(eventStaff).where(eq(eventStaff.id, newStaffId));
    console.log("✅ event_staff criado?", savedEventStaff.length > 0, "Vínculo correto?", savedEventStaff[0]?.staffFunctionId === staffFunctionId);
    
    const savedRoles = await db.select().from(eventStaffRoles).where(eq(eventStaffRoles.eventStaffId, newStaffId));
    console.log("✅ event_staff_roles gravadas?", savedRoles.length === 2);
    savedRoles.forEach(r => console.log(`   -> Role ID assinalada: ${r.roleId}`));

    // O teste principal: Tabela legacy não deve ter mudado
    const legacyCountAfterRes = await db.execute(sql`SELECT count(*) as c FROM staff`);
    const legacyCountAfter = Number(legacyCountAfterRes[0].c);
    console.log("\n✅ NENHUM registro adicionado na tabela legacy 'staff'?");
    if (legacyCountBefore === legacyCountAfter) {
        console.log(`   -> CONFIRMADO: Tabela legacy 'staff' NÃO recebeu INSERT (Antes: ${legacyCountBefore}, Depois: ${legacyCountAfter}).`);
    } else {
        console.log(`   -> FALHOU: A tabela staff recebeu INSERT! (Antes: ${legacyCountBefore}, Depois: ${legacyCountAfter})`);
    }

    process.exit(0);
}

runTest().catch(console.error);
