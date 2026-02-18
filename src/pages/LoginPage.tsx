
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LoginPage = () => {

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
