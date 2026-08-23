
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import AuthShell from '@/components/auth/AuthShell';

const LoginPage = () => {
  return (
    <MainLayout>
      <AuthShell
        eyebrow="Acesso ao Sistema"
        title="Entre na sua conta"
        subtitle="Use suas credenciais para acessar a plataforma."
        footer={
          <p className="text-zinc-500 font-medium text-sm">
            Ainda não faz parte da elite? <br />
            <Link to="/register" className="text-indigo-400 font-black uppercase tracking-widest text-xs hover:text-indigo-300 transition-colors mt-2 inline-block">
              Criar minha conta agora
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthShell>
    </MainLayout>
  );
};

export default LoginPage;
