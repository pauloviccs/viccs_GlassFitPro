import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Image, Video, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { UploadModal } from '@/components/UploadModal';
import { Exercise } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const muscleGroups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Core'];

export default function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    description: '',
    muscleGroup: 'Peito',
    defaultSets: 3,
    defaultReps: 12,
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        setExercises(data.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          muscleGroup: d.muscle_group,
          imageUrl: d.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
          videoUrl: d.video_url || undefined,
          defaultSets: d.default_sets,
          defaultReps: d.default_reps
        })));
      }
    } catch (e) {
      console.error("Fetch exercises abort", e);
      toast({ title: "Ops!", description: "Não conseguimos carregar os exercícios.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === 'Todos' || ex.muscleGroup === filterGroup;
    return matchSearch && matchGroup;
  });

  const openAdd = () => {
    setEditExercise(null);
    setForm({ name: '', description: '', muscleGroup: 'Peito', defaultSets: 3, defaultReps: 12, imageUrl: '', videoUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditExercise(ex);
    setForm({
      name: ex.name,
      description: ex.description,
      muscleGroup: ex.muscleGroup,
      defaultSets: ex.defaultSets,
      defaultReps: ex.defaultReps,
      imageUrl: ex.imageUrl,
      videoUrl: ex.videoUrl || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.muscleGroup) {
      toast({ title: "Atenção", description: "Nome e grupo muscular são obrigatórios." });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        muscle_group: form.muscleGroup,
        image_url: form.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
        video_url: form.videoUrl || null,
        default_sets: Number(form.defaultSets),
        default_reps: Number(form.defaultReps)
      };

      if (editExercise) {
        const { error } = await supabase.from('exercises').update(payload).eq('id', editExercise.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Exercício atualizado." });
      } else {
        const { error } = await supabase.from('exercises').insert([payload]);
        if (error) throw error;
        toast({ title: "Criado", description: "Novo exercício adicionado na biblioteca geral." });
      }

      await fetchExercises();
      setModalOpen(false);
    } catch (e) {
      toast({ title: "Falha", description: "Erro ao gravar no banco de dados.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("A exclusão desse exercício o removerá do histórico de todos os alunos. Tem certeza?")) return;

    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;

      setExercises(prev => prev.filter(ex => ex.id !== id));
      toast({ title: "Deletado", description: "Exercício excluído da base." });
    } catch (e) {
      toast({ title: "Falha", description: "Erro de permissão ao deletar.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Buscar exercício..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <AnimatedButton onClick={openAdd} className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Novo Exercício
        </AnimatedButton>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => setFilterGroup(group)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterGroup === group ? 'bg-primary text-primary-foreground' : 'glass-subtle text-muted-foreground hover:text-foreground'
              }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="min-h-[200px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-subtle border border-white/5 rounded-3xl mt-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">A biblioteca está vazia.</p>
            <p className="text-xs text-muted-foreground mt-1">Crie exercícios para montar as fichas dos alunos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard variant="strong" className="p-0 overflow-hidden hover:border-primary/30 transition-colors group">
                  <div className="relative h-44">
                    <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-foreground text-base tracking-tight">{ex.name}</h3>
                      <p className="text-xs font-semibold text-primary uppercase tracking-widest mt-1">{ex.muscleGroup}</p>
                    </div>
                    {ex.videoUrl && (
                      <div className="absolute top-3 right-3 glass-strong rounded-xl p-2 mix-blend-luminosity">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-background/50">
                    <div className="flex gap-3 mb-4">
                      <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Séries</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{ex.defaultSets}</p>
                      </div>
                      <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Reps</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{ex.defaultReps}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AnimatedButton variant="secondary" size="sm" className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-white/5" onClick={() => openEdit(ex)}>
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </AnimatedButton>
                      <AnimatedButton variant="ghost" size="sm" onClick={() => handleDelete(ex.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 p-0 flex justify-center">
                        <Trash2 className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setModalOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg pointer-events-auto"
              >
                <div className="glass-strong border border-white/10 shadow-2xl rounded-3xl p-6 max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-foreground">{editExercise ? 'Editar Exercício' : 'Novo Exercício da Base'}</h2>
                    <button onClick={() => setModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hidden">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Nome do Exercício</label>
                      <input placeholder="Ex: Supino Reto com Halteres" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Foco Muscular</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {muscleGroups.filter(g => g !== 'Todos').map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, muscleGroup: g }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${form.muscleGroup === g ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'glass-subtle border-white/5 text-muted-foreground hover:bg-white/10'
                              }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Séries Padrão</label>
                        <input type="number" min="1" value={form.defaultSets} onChange={(e) => setForm(f => ({ ...f, defaultSets: +e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Reps Padrão</label>
                        <input type="number" min="1" value={form.defaultReps} onChange={(e) => setForm(f => ({ ...f, defaultReps: +e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Instruções / Dicas (Opcional)</label>
                      <textarea placeholder="Lembre-se de contrair o abdômen..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none" />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground pl-1">Mídia URL (Opcional)</label>
                      <input placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>

                    <div className="pt-4">
                      <AnimatedButton onClick={handleSave} className="w-full h-12" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editExercise ? 'Salvar Base' : 'Adicionar ao Banco')}
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload de Mídia" />
    </div>
  );
}
