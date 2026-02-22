import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, BarChart3, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AdminStudents() {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<User | null>(null);
  const [progressStudent, setProgressStudent] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) throw error;

      if (data) {
        setStudents(data.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email || 'Email indisponível (Auth)', // In a real app we might need an edge function to fetch auth.users emails securely
          role: d.role as 'student',
          createdAt: d.created_at
        })));
      }
    } catch (e) {
      console.error("Erro ao puxar estudantes", e);
      toast({ title: "Erro de Conexão", description: "Não conseguimos sincronizar com o banco.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: '', email: '' });
    setModalOpen(true);
  };

  const openEdit = (s: User) => {
    setEditStudent(s);
    setForm({ name: s.name, email: s.email });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    setIsSaving(true);
    try {
      if (editStudent) {
        // Atualização de Profile Name
        const { error } = await supabase
          .from('profiles')
          .update({ name: form.name })
          .eq('id', editStudent.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Aluno atualizado." });
      } else {
        // Para CRIAR um estudante via App Client é complexo sem uma Edge Function no Supabase (pois auth.users exige registro no backend seguro).
        // Em um MVP Frontend, avisaremos o professor que o convite por e-mail ainda não está ativo
        alert("Para cadastros novos na V2, o Aluno precisa fazer Login via Google e a conta aparecerá aqui!");
        // Para não travar, apenas fechamos o modal.
      }

      await fetchStudents();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao gravar aluno", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Alerta que auth.users não pode ser deletado de public.profiles facilmente sem triggers/RPC no servidor, mas simularemos remoção de acesso
    if (!confirm("Apenas administradores de sistema podem deletar Auth Users na V2. Deseja tentar mesmo assim?")) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setStudents(prev => prev.filter(s => s.id !== id));
      toast({ title: "Removido", description: "Aluno excluído do acesso." });
    } catch (e) {
      toast({ title: "Falha na segurança", description: "O Supabase bloqueou. Delete no painel Cloud para auth.users.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <AnimatedButton onClick={openAdd} className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Cadastrar Manual (V2)
        </AnimatedButton>
      </div>

      {/* Students list */}
      <div className="space-y-3 relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 glass-subtle rounded-3xl border border-white/5">
            <p className="text-muted-foreground text-sm font-medium">Nenhum aluno encontrado ou cadastrado.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Peça para eles fazerem login com o Google na página inicial.</p>
          </div>
        ) : (
          filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard variant="strong" className="flex items-center gap-4 p-4 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <span className="text-base font-bold text-primary">{student.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{student.name}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate uppercase tracking-widest mt-0.5">Aluno Ativo</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setProgressStudent(student)} className="glass rounded-xl p-2.5 hover:bg-secondary transition-colors" title="Progresso">
                    <BarChart3 className="w-4 h-4 text-foreground" />
                  </button>
                  <button onClick={() => openEdit(student)} className="glass rounded-xl p-2.5 hover:bg-secondary transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4 text-foreground" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="glass rounded-xl p-2.5 hover:bg-destructive/20 transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <div className="glass-strong border border-white/10 shadow-2xl rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">{editStudent ? 'Editar Aluno' : 'Convite de Aluno'}</h2>
                    <button onClick={() => setModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Nome Completo</label>
                      <input
                        placeholder="Nome"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full glass-subtle rounded-xl px-4 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    {!editStudent && (
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-xs text-primary font-medium">Na versão atual, novos alunos devem realizar o Login com a conta Google pelo site diretamente.</p>
                      </div>
                    )}

                    <AnimatedButton onClick={handleSave} className="w-full mt-4 h-12" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editStudent ? 'Salvar Edição' : 'Entendi')}
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {progressStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setProgressStudent(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <div className="glass-strong rounded-3xl border border-white/10 shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-foreground truncate">Progresso - <span className="text-primary">{progressStudent.name.split(' ')[0]}</span></h2>
                    <button onClick={() => setProgressStudent(null)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>

                  {/* Aqui futuramente contaremos workouts completados direto do banco. Por hora, simulado visual. */}
                  <WeeklyProgress completed={0} total={0} />

                  <div className="mt-6 glass rounded-2xl p-4 border border-white/5">
                    <p className="text-sm text-foreground/80 font-medium text-center">Nenhum treino completado na semana para calcular métricas reais.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
