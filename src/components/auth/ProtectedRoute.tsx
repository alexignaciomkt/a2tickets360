import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ProfileStatus } from '@/lib/supabase-config';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    requireApproved?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireApproved = true,
}) => {
    const { user, loading, isAuthenticated, personalModules, staffProfileComplete } = useAuth();
    const location = useLocation();

    console.log('[PROTECTED ROUTE]', { authLoading: loading, hasUser: !!user, pathname: location.pathname });

    // Show loading while checking session
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    // Not authenticated -> check localStorage before redirecting
    // The user state may not be hydrated yet even though localStorage has valid data
    // BUT: add a safety timeout to prevent infinite spinner from stale localStorage
    if (!isAuthenticated && !loading) {
        const savedUser = localStorage.getItem('A2Tickets_user');
        if (savedUser) {
            // Give AuthProvider 5 seconds max to hydrate, then clear stale data
            setTimeout(() => {
                const stillNoUser = !document.querySelector('[data-auth-ready]');
                if (stillNoUser) {
                    console.warn('⏰ [ProtectedRoute] Timeout de sync - limpando localStorage stale');
                    localStorage.removeItem('A2Tickets_user');
                    window.location.href = '/login';
                }
            }, 5000);

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-950">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Sincronizando seu perfil...</p>
                    </div>
                </div>
            );
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Caso tenhamos sessão mas o perfil ainda não chegou (user nulo),
    // mantemos o loading em vez de redirecionar para o login.
    if (isAuthenticated && (!user || personalModules === undefined) && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Sincronizando seu perfil...</p>
                </div>
            </div>
        );
    }

    // Role not allowed -> redirect to appropriate dashboard
    let isAllowed = allowedRoles.includes(user!.role);
    if (!isAllowed && personalModules) {
        if (allowedRoles.includes('staff' as UserRole) && personalModules.staff) isAllowed = true;
        if (allowedRoles.includes('promoter' as UserRole) && personalModules.promoter) isAllowed = true;
        if (allowedRoles.includes('customer' as UserRole) && personalModules.tickets) isAllowed = true;
    }

    if (personalModules?.staff) {
        const isStaffRoute = location.pathname.startsWith('/dashboard/staff') || location.pathname.startsWith('/staff/');
        const isOnboardingRoute = location.pathname === '/onboarding/staff';

        if (!staffProfileComplete && isStaffRoute && !isOnboardingRoute) {
             return <Navigate to="/onboarding/staff" replace />;
        }
        if (staffProfileComplete && isOnboardingRoute) {
             return <Navigate to="/dashboard/staff/invites" replace />;
        }
    }

    if (!isAllowed) {
        const redirectMap: Record<string, string> = {
            master: '/master',
            organizer: '/organizer/dashboard',
            staff: (personalModules?.staff && !staffProfileComplete) ? '/onboarding/staff' : '/dashboard/staff/invites',
            exhibitor: '/organizer/exhibitor',
            customer: '/dashboard',
        };
        


        if (personalModules?.tickets) {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to={redirectMap[user.role] || '/'} replace />;
    }

    // Organizer not approved yet (REMOVIDO BLOQUEIO - agora gerenciado via Banner no DashboardLayout)
    // if (requireApproved && user.role === 'organizer' && user.status === 'pending') {
    //  ... // Removido para permitir acesso ao dashboard para configurar eventos
    // }

    // Rejected account
    if (user.status === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Cadastro Não Aprovado</h2>
                    <p className="text-gray-400">
                        Infelizmente seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
