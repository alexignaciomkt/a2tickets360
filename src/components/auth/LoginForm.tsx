import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const { login, sendPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email necessário',
        description: 'Digite seu email no campo acima para recuperar a senha.',
      });
      return;
    }
    await sendPasswordRecovery(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    setLoading(true);

    try {
      console.log('Login attempt started for:', email);
      const success = await login(email, password);
      console.log('Login success status:', success);

      if (success) {
        // Redirecionamento automático baseado na role retornada pelo backend
        const savedUser = localStorage.getItem('A2Tickets_user');
        console.log('Saved user in localStorage:', savedUser);
        if (savedUser) {
          const user = JSON.parse(savedUser);
          console.log('Parsed user role:', user.role);
          if (user.role === 'master' || user.role === 'admin') {
            navigate('/master');
          } else if (user.role === 'organizer') {
            if (!user.profileComplete) {
              navigate('/organizer/onboarding');
            } else {
              navigate('/organizer/dashboard');
            }
          } else if (user.role === 'staff') {
            navigate('/dashboard/staff/invites');
          } else {
            navigate('/dashboard');
          }
        } else {
          console.error('Login returned success but A2Tickets_user is not in localStorage');
          navigate('/dashboard'); // fallback
        }
      }
    } catch (err) {
      console.error('Unhandled error in LoginForm handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-bold uppercase tracking-widest text-[10px]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary focus:bg-white transition-all"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-bold uppercase tracking-widest text-[10px]">
            Senha
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
          >
            Esqueci a senha
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-primary focus:border-primary focus:bg-white transition-all"
            placeholder="********"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'Entrando...' : 'Entrar na A2'}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Acesso Seguro A2 Tickets 360º</p>
      </div>
    </motion.form>
  );
};

export default LoginForm;
