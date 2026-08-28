import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortariaLoginPage from '@/pages/portaria/PortariaLoginPage';
import PortariaResetPasswordPage from '@/pages/portaria/PortariaResetPasswordPage';
import PortariaGuardPage from '@/pages/portaria/PortariaGuardPage';
import TicketScannerPage from '@/pages/dashboard/TicketScannerPage';
import { useAuth } from '@/contexts/AuthContext';

class PortariaErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: 'red', padding: '20px', background: '#222', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h2>Frontend Crash!</h2>
                    <pre>{this.state.error?.toString()}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const PortariaAuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) return <div className="min-h-screen bg-zinc-950" />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

export default function PortariaAppRoutes() {
    return (
        <PortariaErrorBoundary>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PortariaLoginPage />} />
            <Route path="/redefinir-senha" element={<PortariaResetPasswordPage />} />
            
            {/* App Routes (Needs Auth) */}
            <Route path="/app" element={
                <PortariaAuthWrapper>
                    <PortariaGuardPage />
                </PortariaAuthWrapper>
            } />
            
            {/* Scanner Route - Permite acesso ao scanner. A segurança é garantida pela API */}
            <Route path="/:slug/scanner" element={
                <PortariaAuthWrapper>
                    <TicketScannerPage />
                </PortariaAuthWrapper>
            } />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </PortariaErrorBoundary>
    );
}
