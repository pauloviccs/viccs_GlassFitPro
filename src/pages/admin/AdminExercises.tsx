import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Image, Video } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { UploadModal } from '@/components/UploadModal';
import { mockExercises } from '@/data/mockData';
import { Exercise } from '@/types';

const muscleGroups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];

export default function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState({ name: '', description: '', muscleGroup: '', defaultSets: 3, defaultReps: 12 });

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === 'Todos' || ex.muscleGroup === filterGroup;
    return matchSearch && matchGroup;
  });

  const openAdd = () => {
    setEditExercise(null);
    setForm({ name: '', description: '', muscleGroup: '', defaultSets: 3, defaultReps: 12 });
    setModalOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditExercise(ex);
    setForm({ name: ex.name, description: ex.description, muscleGroup: ex.muscleGroup, defaultSets: ex.defaultSets, defaultReps: ex.defaultReps });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editExercise) {
      setExercises(prev => prev.map(ex => ex.id === editExercise.id ? { ...ex, ...form } : ex));
    } else {
      setExercises(prev => [...prev, {
        id: `ex-${Date.now()}`,
        ...form,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => setExercises(prev => prev.filter(ex => ex.id !== id));

  return (
    <div className="space-y-6 max-w-6xl">
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
        <AnimatedButton onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Exercício
        </AnimatedButton>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => setFilterGroup(group)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterGroup === group ? 'bg-primary text-primary-foreground' : 'glass-subtle text-muted-foreground hover:text-foreground'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, i) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-0 overflow-hidden">
              <div className="relative h-40">
                <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-semibold text-foreground text-sm">{ex.name}</h3>
                  <p className="text-xs text-muted-foreground">{ex.muscleGroup}</p>
                </div>
                {ex.videoUrl && (
                  <div className="absolute top-2 right-2 glass rounded-lg p-1.5">
                    <Video className="w-3.5 h-3.5 text-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex gap-3 mb-3">
                  <div className="glass-subtle rounded-lg px-3 py-1.5 text-center flex-1">
                    <p className="text-[10px] text-muted-foreground">Séries</p>
                    <p className="text-sm font-bold text-foreground">{ex.defaultSets}</p>
                  </div>
                  <div className="glass-subtle rounded-lg px-3 py-1.5 text-center flex-1">
                    <p className="text-[10px] text-muted-foreground">Reps</p>
                    <p className="text-sm font-bold text-foreground">{ex.defaultReps}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <AnimatedButton variant="secondary" size="sm" className="flex-1 flex items-center justify-center gap-1" onClick={() => openEdit(ex)}>
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="sm" onClick={() => handleDelete(ex.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg"
            >
              <div className="glass-strong rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">{editExercise ? 'Editar Exercício' : 'Novo Exercício'}</h2>
                  <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="space-y-4">
                  <input placeholder="Nome do exercício" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none" />

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Grupo Muscular</label>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroups.filter(g => g !== 'Todos').map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, muscleGroup: g }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            form.muscleGroup === g ? 'bg-primary text-primary-foreground' : 'glass-subtle text-muted-foreground'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Séries</label>
                      <input type="number" value={form.defaultSets} onChange={(e) => setForm(f => ({ ...f, defaultSets: +e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Repetições</label>
                      <input type="number" value={form.defaultReps} onChange={(e) => setForm(f => ({ ...f, defaultReps: +e.target.value }))} className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AnimatedButton variant="secondary" size="sm" onClick={() => setUploadOpen(true)} className="flex items-center gap-1.5">
                      <Image className="w-4 h-4" /> Upload Mídia
                    </AnimatedButton>
                  </div>

                  <AnimatedButton onClick={handleSave} className="w-full">
                    {editExercise ? 'Salvar Alterações' : 'Criar Exercício'}
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload de Mídia" />
    </div>
  );
}
