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
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

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
    if (isAuthenticated && !user && !loading) {
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
    if (!allowedRoles.includes(user.role)) {
        const redirectMap: Record<UserRole, string> = {
            master: '/master',
            organizer: '/organizer/dashboard',
            staff: '/staff/portal',
            exhibitor: '/organizer/exhibitor',
            customer: '/dashboard',
        };
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
