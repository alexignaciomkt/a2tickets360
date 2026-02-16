
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';

const RegisterPage = () => {
  return (
    <MainLayout>
      <div className="bg-page min-h-[80vh] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary p-6">
              <h1 className="text-2xl font-bold text-white text-center">Registre-se</h1>
            </div>

            <div className="p-6">
              <p className="text-center text-gray-600 mb-4">
                Página em construção. Por favor, utilize os acessos de demonstração abaixo:
              </p>

              <div className="text-center text-sm text-gray-600">
                <p className="mt-4">
                  Usuários disponíveis:
                </p>
                <table className="w-full mt-2 text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left">Perfil</th>
                      <th className="px-2 py-1 text-left">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 py-1">Cliente</td>
                      <td className="px-2 py-1">
                        <Link to="/dashboard" className="text-primary hover:underline">Acessar</Link>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-2 py-1">Organizador</td>
                      <td className="px-2 py-1">
                        <Link to="/organizer" className="text-primary hover:underline">Acessar</Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Master Admin</td>
                      <td className="px-2 py-1">
                        <Link to="/master" className="text-primary hover:underline">Acessar</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Entrar
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

export default RegisterPage;
