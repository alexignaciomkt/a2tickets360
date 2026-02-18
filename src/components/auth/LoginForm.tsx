
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
        // Redirecionamento automático baseado na role retornada pelo backend
        const savedUser = localStorage.getItem('A2Tickets_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.role === 'master' || user.role === 'admin') {
            navigate('/master');
          } else if (user.role === 'organizer') {
            navigate('/organizer');
          } else if (user.role === 'staff') {
            navigate('/organizer'); // Staff also goes to organizer dashboard context
          } else {
            navigate('/dashboard');
          }
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
      </div>
    </form>
  );
};

export default LoginForm;
