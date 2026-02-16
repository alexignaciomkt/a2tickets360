
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Redirect based on role
        if (email === 'maria@example.com' || email === 'joao@example.com') {
          navigate('/dashboard');
        } else if (email === 'ana@eventpro.com') {
          navigate('/organizer');
        } else if (email === 'admin@sanjapass.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field w-full"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field w-full"
          placeholder="********"
          required
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p className="text-gray-500">Faça login para gerenciar sua conta na A2 Tickets 360.</p>
        <table className="w-full mt-2 text-xs">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1 text-left">Perfil</th>
              <th className="px-2 py-1 text-left">Email</th>
              <th className="px-2 py-1 text-left">Senha</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">Cliente</td>
              <td className="px-2 py-1">maria@example.com</td>
              <td className="px-2 py-1">qualquer</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">Organizador</td>
              <td className="px-2 py-1">ana@eventpro.com</td>
              <td className="px-2 py-1">qualquer</td>
            </tr>
            <tr>
              <td className="px-2 py-1">Admin</td>
              <td className="px-2 py-1">admin@sanjapass.com</td>
              <td className="px-2 py-1">qualquer</td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default LoginForm;
