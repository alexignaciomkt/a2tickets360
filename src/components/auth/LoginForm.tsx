import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const { login, sendPasswordRecovery, refreshCapabilities } = useAuth();
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
        const contextsData = await refreshCapabilities();
        const personalModules = contextsData?.personalModules || {};
        const staffProfileComplete = contextsData?.staffProfileComplete || false;

        const savedUser = localStorage.getItem('A2Tickets_user');
        const intentData = localStorage.getItem('A2Tickets_PendingRegistration');
        
        let targetRoute = '/dashboard';
        let intentConsumed = false;

        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          if (intentData) {
             try {
                const intent = JSON.parse(intentData);
                // Valida se a intenção pertence ao e-mail/user que acabou de logar
                if (intent.email === user.email || intent.userId === user.id) {
                    if (intent.role === 'staff' && personalModules.staff) {
                        targetRoute = staffProfileComplete ? '/dashboard/staff/invites' : '/onboarding/staff';
                        intentConsumed = true;
                    } else if (intent.role === 'promoter') {
                        targetRoute = '/onboarding/promoter';
                        intentConsumed = true;
                    }
                }
             } catch(e) {
                console.error('Invalid intent payload', e);
             }
          }
          
          if (intentConsumed) {
              localStorage.removeItem('A2Tickets_PendingRegistration');
              navigate(targetRoute);
          } else {
             // Fallback para role permanente apenas se não houver intenção one-time
             if (user.role === 'master' || user.role === 'admin') {
               navigate('/master');
             } else if (user.role === 'organizer') {
               navigate(!user.profileComplete ? '/organizer/onboarding' : '/organizer/dashboard');
             } else {
               navigate('/dashboard'); // default para customer/multi-capability
             }
          }
        } else {
          navigate('/dashboard');
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
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 h-14 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="space-y-1.5 relative">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Senha
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
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
            className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 h-14 pr-12 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
            placeholder="********"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px]">Acesso Seguro A2 Tickets 360º</p>
      </div>
    </motion.form>
  );
};

export default LoginForm;
