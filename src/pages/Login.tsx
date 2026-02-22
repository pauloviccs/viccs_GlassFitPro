import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loadingAction, setLoadingAction] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = async () => {
    setLoadingAction(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Erro no login com Google", error);
      setLoadingAction(false);
      toast({ title: "Ops!", description: "Não foi possível conectar com a conta Google.", variant: "destructive" });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoadingAction(true);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Erro de credencial", error);
      setLoadingAction(false);
      toast({ title: "Acesso Negado", description: "Credenciais inválidas para o painel de mestre.", variant: "destructive" });
    }
  };

  // Prevent flash of login screen if already authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold gradient-text">GlassFit Pro</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Portal de Acesso</p>
            </div>
          </div>
        </motion.div>

        <GlassCard variant="strong" className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
            Boas-vindas
          </h2>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            {isAdminMode ? 'Painel de Gestão e Administrativo.' : 'Acesse para gerenciar seus treinos.'}
          </p>

          <AnimatePresence mode="wait">
            {!isAdminMode ? (
              <motion.div
                key="student"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedButton
                  onClick={handleGoogleLogin}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 mb-4"
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="font-semibold">Continuar com Google</span>
                    </>
                  )}
                </AnimatedButton>
                <div className="text-center mt-6">
                  <button onClick={() => setIsAdminMode(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
                    Sou Professor (Acesso Restrito)
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Senha mestra"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded appearance-none border border-white/20 bg-black/20 checked:bg-primary checked:border-primary cursor-pointer transition-colors relative 
                               after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] 
                               after:bg-no-repeat after:bg-center after:bg-[length:10px_10px] after:opacity-0 checked:after:opacity-100"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                      Manter conectado
                    </label>
                  </div>

                  <AnimatedButton type="submit" variant="primary" size="lg" className="w-full h-12 flex items-center justify-center font-bold" disabled={loadingAction || !email || !password}>
                    {loadingAction ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : 'Acessar Base'}
                  </AnimatedButton>
                </form>
                <div className="text-center mt-6">
                  <button onClick={() => setIsAdminMode(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center mx-auto gap-1">
                    Voltar para o Portal do Aluno
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </GlassCard>
      </motion.div>
    </div>
  );
}
