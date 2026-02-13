
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
  const { setUserByRole } = useAuth();

  return (
    <MainLayout>
      <div className="bg-page min-h-[80vh] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary p-6">
              <h1 className="text-2xl font-bold text-white text-center">Login</h1>
            </div>
            
            <div className="p-6">
              <LoginForm />
              
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-center font-medium mb-4">Acesso rápido (desenvolvimento)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setUserByRole('customer')}>
                    <Link to="/dashboard">Cliente</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUserByRole('organizer')}>
                    <Link to="/organizer">Organizador</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUserByRole('admin')}>
                    <Link to="/admin">Admin</Link>
                  </Button>
                  <Button variant="default" size="sm" onClick={() => setUserByRole('master')}>
                    <Link to="/master">Master Admin</Link>
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    Registre-se
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
