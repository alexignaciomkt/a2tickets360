
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

const StaffLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useStaffAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      navigate('/staff/checkin');
    }

    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Área de Trabalho"
      title="Acesse sua conta"
      subtitle="Use suas credenciais para acessar seus eventos e atividades."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Email do Staff
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 h-14 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5 relative">
          <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 h-14 pr-12 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px]">Acesso Restrito para Colaboradores</p>
        </div>
      </form>
    </AuthShell>
  );
};

export default StaffLoginPage;
