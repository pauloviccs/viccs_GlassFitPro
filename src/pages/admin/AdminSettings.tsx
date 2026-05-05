import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, GraduationCap, Clock, CheckCircle, XCircle, Loader2, Mail, Lock, Save, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { TeacherRequest } from '@/types';

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Stats
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<TeacherRequest[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Account
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [studentsRes, teachersRes, requestsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('teacher_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ]);

      setTotalStudents(studentsRes.count || 0);
      setTotalTeachers(teachersRes.count || 0);
      setPendingRequests((requestsRes.data as TeacherRequest[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    setIsSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Um link de confirmação foi enviado para o novo e-mail." });
      setNewEmail('');
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Não foi possível alterar o e-mail.", variant: "destructive" });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Senha atualizada com sucesso." });
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Não foi possível alterar a senha.", variant: "destructive" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleApproveRequest = async (request: TeacherRequest) => {
    setProcessingId(request.id);
    try {
      // 1. Promover o perfil para 'admin'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', request.user_id);

      if (profileError) throw profileError;

      // 2. Atualizar a solicitação
      const { error: requestError } = await supabase
        .from('teacher_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast({ title: "Aprovado!", description: `${request.name} agora é professor da plataforma.` });
      fetchStats();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao aprovar solicitação.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (request: TeacherRequest) => {
    if (!window.confirm(`Rejeitar a solicitação de ${request.name}?`)) return;
    setProcessingId(request.id);
    try {
      const { error } = await supabase
        .from('teacher_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', request.id);

      if (error) throw error;
      toast({ title: "Rejeitado", description: `Solicitação de ${request.name} foi rejeitada.` });
      fetchStats();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao rejeitar solicitação.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoadingStats) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground text-sm">Painel exclusivo do administrador principal.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard variant="strong" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Alunos Cadastrados</p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalTeachers}</p>
            <p className="text-xs text-muted-foreground">Professores Ativos</p>
          </div>
        </GlassCard>

        <GlassCard variant="strong" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes de Aprovação</p>
          </div>
        </GlassCard>
      </div>

      {/* Teacher Approval Requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard variant="strong" className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Solicitações de Professores</h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-400/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-subtle rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{req.name}</p>
                    <p className="text-xs text-muted-foreground">{req.email}</p>
                    {req.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">"{req.message}"</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(req)}
                      disabled={processingId === req.id}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(req)}
                      disabled={processingId === req.id}
                      className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard variant="strong" className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Alterar E-mail</h2>
          </div>
          <p className="text-xs text-muted-foreground">E-mail atual: <span className="text-foreground">{user?.email}</span></p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Novo e-mail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
            <Button onClick={handleUpdateEmail} disabled={isSavingEmail || !newEmail.trim()} className="gap-1 shrink-0">
              {isSavingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard variant="strong" className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Alterar Senha</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="space-y-3">
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
            <Button type="submit" disabled={isSavingPassword || !newPassword || !confirmPassword} className="w-full gap-2">
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Atualizar Senha
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
