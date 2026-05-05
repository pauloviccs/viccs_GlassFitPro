import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, MessageSquare, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useToast } from '@/components/ui/use-toast';

export default function TeacherRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      toast({ title: "Atenção", description: "Preencha nome, e-mail e senha.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verificar se já existe uma conta com esse e-mail como aluno (Google)
      // Tentamos fazer signUp — se o email já existe no auth, o Supabase retorna erro
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() }
        }
      });

      // Se o email já existe, signUp pode retornar um user sem session (email exists)
      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          toast({ 
            title: "E-mail já cadastrado", 
            description: "Este e-mail já está em uso como conta de aluno ou outro professor. Use um e-mail diferente.", 
            variant: "destructive" 
          });
          setIsSubmitting(false);
          return;
        }
        if (signUpError.message.includes('rate limit') || signUpError.status === 429) {
          toast({ 
            title: "Muitas tentativas", 
            description: "O servidor de autenticação limitou as requisições. Aguarde alguns minutos e tente novamente.", 
            variant: "destructive" 
          });
          setIsSubmitting(false);
          return;
        }
        throw signUpError;
      }

      // Supabase pode retornar user mas sem confirmação (email já existe)
      if (!signUpData.user) {
        toast({ title: "Erro", description: "Não foi possível criar a conta.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // 2. Criar o perfil como 'student' temporariamente (será promovido após aprovação)
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: signUpData.user.id,
        name: name.trim(),
        role: 'student',
      }]);

      // Se o perfil já existir (por trigger), ignorar
      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile insert error:', profileError);
      }

      // 3. Criar a solicitação de professor
      const { error: requestError } = await supabase.from('teacher_requests').insert([{
        user_id: signUpData.user.id,
        name: name.trim(),
        email: email.trim(),
        message: message.trim() || null,
      }]);

      if (requestError) {
        console.error('Request insert error:', requestError);
        // Não bloquear — o importante é a conta ter sido criada
      }

      // 4. Fazer logout (o professor precisa esperar aprovação)
      await supabase.auth.signOut();

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ 
        title: "Erro no cadastro", 
        description: error.message || "Tente novamente mais tarde.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold gradient-text">GlassFit Pro</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Cadastro de Professor</p>
            </div>
          </div>
        </motion.div>

        <GlassCard variant="strong" className="p-8">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Solicitação Enviada!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sua solicitação foi recebida e está aguardando aprovação do administrador. 
                Você receberá acesso ao painel de professor assim que for aprovado.
              </p>
              <AnimatedButton
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                className="w-full mt-4"
              >
                Voltar ao Login
              </AnimatedButton>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
                Solicitar Acesso
              </h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Preencha seus dados para solicitar acesso como professor.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Seu e-mail (diferente da conta de aluno)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    placeholder="Por que quer ser professor na plataforma? (Opcional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                    rows={3}
                    className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 flex items-center justify-center font-bold"
                  disabled={isSubmitting || !name || !email || !password || !confirmPassword}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Enviar Solicitação'
                  )}
                </AnimatedButton>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center mx-auto gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Voltar ao Login
                </button>
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
