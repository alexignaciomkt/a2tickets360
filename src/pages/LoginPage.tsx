
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LoginPage = () => {

  return (
    <MainLayout>
      <div className="bg-[#050505] min-h-screen pt-24 pb-20 overflow-hidden relative">
        {/* Background Visual Elements */}
        <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">
                ACESSAR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">SISTEMA.</span>
              </h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">Entre com suas credenciais A2</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-10">
              <LoginForm />

              <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                <p className="text-gray-500 font-medium text-sm">
                  Ainda não faz parte da elite? <br />
                  <Link to="/register" className="text-primary font-black uppercase tracking-widest text-xs hover:underline mt-2 inline-block">
                    Criar minha conta agora
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} A2 Tickets 360º — Business Intelligence
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
