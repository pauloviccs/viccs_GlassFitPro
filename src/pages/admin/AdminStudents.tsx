import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { mockStudents } from '@/data/mockData';
import { User } from '@/types';

export default function AdminStudents() {
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<User | null>(null);
  const [progressStudent, setProgressStudent] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditStudent(null); setForm({ name: '', email: '' }); setModalOpen(true); };
  const openEdit = (s: User) => { setEditStudent(s); setForm({ name: s.name, email: s.email }); setModalOpen(true); };

  const handleSave = () => {
    if (editStudent) {
      setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...s, ...form } : s));
    } else {
      setStudents(prev => [...prev, { id: `st-${Date.now()}`, ...form, role: 'student' as const, createdAt: new Date().toISOString() }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-subtle rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <AnimatedButton onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Aluno
        </AnimatedButton>
      </div>

      {/* Students list */}
      <div className="space-y-3">
        {filtered.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="flex items-center gap-4 p-4">
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">{student.email}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setProgressStudent(student)} className="glass-subtle rounded-lg p-2 hover:bg-secondary transition-colors">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => openEdit(student)} className="glass-subtle rounded-lg p-2 hover:bg-secondary transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(student.id)} className="glass-subtle rounded-lg p-2 hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
            >
              <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">{editStudent ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                  <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="space-y-4">
                  <input
                    placeholder="Nome"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <AnimatedButton onClick={handleSave} className="w-full">
                    {editStudent ? 'Salvar' : 'Adicionar'}
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {progressStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setProgressStudent(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
            >
              <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Progresso - {progressStudent.name}</h2>
                  <button onClick={() => setProgressStudent(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <WeeklyProgress completed={3} total={13} />
                <div className="mt-4 glass-subtle rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Dados detalhados serão exibidos com integração ao backend.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
