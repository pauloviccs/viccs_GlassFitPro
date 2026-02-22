import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Save, ChevronDown, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { useWorkoutStore, WorkoutDay } from '@/store/workoutStore';
import { Exercise } from '@/store/workoutStore';

const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function AdminWorkouts() {
  const { students, exerciseLibrary, assignWorkoutToStudent } = useWorkoutStore();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [activeDay, setActiveDay] = useState<string>('Segunda-feira');
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for the builder before saving to global store
  const currentStudent = students.find(s => s.id === selectedStudentId);

  // Initialize local builder state with current student workouts or empty structure
  const [builderState, setBuilderState] = useState<WorkoutDay[]>(
    currentStudent?.workouts || []
  );

  // Sync builder state when student changes
  useMemo(() => {
    setBuilderState(students.find(s => s.id === selectedStudentId)?.workouts || []);
  }, [selectedStudentId, students]);


  const currentDayExercises = useMemo(() =>
    builderState.find(d => d.dayOfWeek === activeDay)?.exercises || [],
    [builderState, activeDay]
  );

  const addExercise = (exerciseTemplate: Omit<Exercise, 'completed' | 'id'>) => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: exerciseTemplate.name,
      sets: exerciseTemplate.sets,
      reps: exerciseTemplate.reps,
      completed: false,
    };

    setBuilderState(prev => {
      const dayExists = prev.find(d => d.dayOfWeek === activeDay);
      if (dayExists) {
        return prev.map(d => d.dayOfWeek === activeDay ? { ...d, exercises: [...d.exercises, newEx] } : d);
      }
      return [...prev, { id: `day-${Date.now()}`, dayOfWeek: activeDay, exercises: [newEx] }];
    });

    setShowExerciseList(false);
  };

  const removeExercise = (exerciseId: string) => {
    setBuilderState(prev => prev.map(d =>
      d.dayOfWeek === activeDay
        ? { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
        : d
    ));
  };


  const updateExercise = (exerciseId: string, field: 'sets' | 'reps', value: number) => {
    setBuilderState(prev => prev.map(d =>
      d.dayOfWeek === activeDay
        ? { ...d, exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, [field]: value } : e) }
        : d
    ));
  };

  const reorderExercises = (newOrder: Exercise[]) => {
    setBuilderState(prev => prev.map(d =>
      d.dayOfWeek === activeDay
        ? { ...d, exercises: newOrder }
        : d
    ));
  };

  const handleSaveWorkout = () => {
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
      const currentDayWorkout = builderState.find(d => d.dayOfWeek === activeDay);
      if (currentDayWorkout) {
        assignWorkoutToStudent(selectedStudentId, currentDayWorkout);
      }
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Student selector */}
      <GlassCard variant="strong" className="p-4 rounded-2xl">
        <label className="text-sm text-muted-foreground mb-2 block font-medium">Selecionar Aluno para Editagem</label>
        <div className="relative">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent cursor-pointer font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </GlassCard>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekDays.map((day) => {
          const hasExercises = builderState.find(d => d.dayOfWeek === day)?.exercises.length;
          const shortLabel = day.slice(0, 3);
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className="relative flex-shrink-0"
            >
              {isActive && (
                <motion.div layoutId="workoutDayTab" className="absolute inset-0 bg-primary/20 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <div className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary' : hasExercises ? 'text-foreground glass-subtle hover:bg-white/5' : 'text-muted-foreground hover:bg-white/5'
                }`}>
                {shortLabel}
                {hasExercises ? <span className="ml-1.5 text-xs opacity-60 bg-white/10 px-1.5 py-0.5 rounded-sm">({hasExercises})</span> : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Exercises for the Builder */}
      <GlassCard variant="strong" className="rounded-3xl border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{activeDay.split('-')[0]}</h3>
            <p className="text-xs text-muted-foreground mt-1">Configure o treino para este dia da semana.</p>
          </div>
          <Button size="sm" variant="glass" onClick={() => setShowExerciseList(true)} className="flex items-center gap-1.5 rounded-xl border border-white/10">
            <Plus className="w-4 h-4" /> Adicionar Exercício
          </Button>
        </div>

        <div className="p-6 bg-black/20">
          {currentDayExercises.length > 0 ? (
            <Reorder.Group axis="y" values={currentDayExercises} onReorder={reorderExercises} className="space-y-4">
              {currentDayExercises.map((ex) => (
                <Reorder.Item key={ex.id} value={ex}>
                  <motion.div
                    layout
                    className="glass-subtle rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Séries</span>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, 'sets', +e.target.value)}
                          className="w-12 text-center glass rounded-lg py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all bg-black/30"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Reps</span>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.id, 'reps', +e.target.value)}
                          className="w-12 text-center glass rounded-lg py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all bg-black/30"
                        />
                      </div>
                      <button onClick={() => removeExercise(ex.id)} className="p-2.5 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors mt-4">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto mb-4 border-white/5">
                <Plus className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">Nenhum exercício para a {activeDay}</p>
              <p className="text-xs mt-1">Monte a estrutura do treino selecionando os exercícios no banco de dados.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Save button */}
      <Button
        variant={isSaving ? "glass" : "default"}
        size="lg"
        className="w-full flex items-center justify-center gap-2 rounded-2xl h-14"
        onClick={handleSaveWorkout}
        disabled={currentDayExercises.length === 0 || isSaving}
      >
        {isSaving ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Save className="w-5 h-5 opacity-50" />
          </motion.div>
        ) : (
          <>
            <Check className="w-5 h-5" /> Confirmar Alterações do Dia
          </>
        )}
      </Button>

      {/* Add exercise modal */}
      <AnimatePresence>
        {showExerciseList && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setShowExerciseList(false)} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md"
            >
              <div className="glass-strong rounded-3xl p-6 max-h-[75vh] flex flex-col border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-foreground mb-4">Biblioteca de Exercícios</h2>
                <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hidden">
                  {exerciseLibrary.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => addExercise(ex)}
                      className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-primary/20 transition-colors text-left border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{ex.name}</p>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{ex.sets}x{ex.reps} Padrão</p>
                      </div>
                    </button>
                  ))}

                  {exerciseLibrary.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">Nenhum exercício na biblioteca ainda.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
