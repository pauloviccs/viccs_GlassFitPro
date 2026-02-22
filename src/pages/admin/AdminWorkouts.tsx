import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Plus, Trash2, Save, ChevronDown, Check, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function AdminWorkouts() {
  const [students, setStudents] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activeDay, setActiveDay] = useState<string>('Segunda-feira');

  const [dayCacheId, setDayCacheId] = useState<string | null>(null);
  const [currentDayExercises, setCurrentDayExercises] = useState<any[]>([]);

  const [showExerciseList, setShowExerciseList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchWorkoutForDay(selectedStudentId, activeDay);
    }
  }, [selectedStudentId, activeDay]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, libraryRes] = await Promise.all([
        supabase.from('profiles').select('id, name').eq('role', 'student'),
        supabase.from('exercises').select('*').order('created_at', { ascending: false })
      ]);

      if (studentsRes.data && studentsRes.data.length > 0) {
        setStudents(studentsRes.data);
        setSelectedStudentId(studentsRes.data[0].id);
      }
      if (libraryRes.data) {
        setExerciseLibrary(libraryRes.data);
      }
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao carregar alunos e exercícios.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutForDay = async (studentId: string, day: string) => {
    // 1. Acha o workout_day deste estudante para este dia
    const { data: dayData } = await supabase
      .from('workout_days')
      .select('id')
      .eq('student_id', studentId)
      .eq('day_of_week', day)
      .maybeSingle();

    if (!dayData) {
      setDayCacheId(null);
      setCurrentDayExercises([]);
      return;
    }

    setDayCacheId(dayData.id);

    // 2. Acha os items
    const { data: items } = await supabase
      .from('workout_exercises')
      .select(`*, exercises(*)`)
      .eq('workout_day_id', dayData.id)
      .order('order_index', { ascending: true });

    if (items) {
      // Remapeia para a tipagem que os inputs locais entendem
      const mapped = items.map(item => ({
        uid: item.id, // Record na tabela pivot
        exercise_id: item.exercise_id,
        name: item.exercises?.name || 'Desconhecido',
        sets: item.sets,
        reps: item.reps,
        order_index: item.order_index
      }));
      setCurrentDayExercises(mapped);
    }
  };

  const addExercise = (ex: any) => {
    const newEx = {
      uid: `temp-${Date.now()}`, // Temporary ID till save
      exercise_id: ex.id,
      name: ex.name,
      sets: ex.default_sets || 3,
      reps: ex.default_reps || 12,
      order_index: currentDayExercises.length
    };
    setCurrentDayExercises(prev => [...prev, newEx]);
    setShowExerciseList(false);
  };

  const removeExercise = (uid: string) => {
    setCurrentDayExercises(prev => prev.filter(e => e.uid !== uid));
  };

  const updateExercise = (uid: string, field: 'sets' | 'reps', value: number) => {
    setCurrentDayExercises(prev => prev.map(e => e.uid === uid ? { ...e, [field]: value } : e));
  };

  const reorderExercises = (newOrder: any[]) => {
    setCurrentDayExercises(newOrder);
  };

  const handleSaveWorkout = async () => {
    if (!selectedStudentId) return;
    setIsSaving(true);
    try {
      let currentDayId = dayCacheId;

      // Se não tem Day ID, cria a dimensão do dia primeiro
      if (!currentDayId) {
        const { data: newDay, error: dayError } = await supabase
          .from('workout_days')
          .insert([{ student_id: selectedStudentId, day_of_week: activeDay }])
          .select()
          .single();

        if (dayError) throw dayError;
        currentDayId = newDay.id;
        setDayCacheId(newDay.id);
      }

      // Agora deleta as entries atuais brutamente para simplificar e re-insere na ordem certinha ou faz um Upsert massivo (Deletar e recriar é mais limpo no MVP UI Builder)
      // Como o 'uid' dos temporários não existem no banco, não podemos dar delete in() genérico, então expurgamos o dia.
      const { error: delError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_day_id', currentDayId);

      if (delError) throw delError;

      // Salva array na nova ordem
      if (currentDayExercises.length > 0) {
        const inserts = currentDayExercises.map((ex, idx) => ({
          workout_day_id: currentDayId,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          order_index: idx
        }));

        const { error: insError } = await supabase.from('workout_exercises').insert(inserts);
        if (insError) throw insError;
      }

      toast({ title: "Treino Atualizado!", description: "O cronograma do aluno foi sincronizado." });

      // Refresh IDs from db to avoid 'temp-' bugs on subsequent edit before reload
      fetchWorkoutForDay(selectedStudentId, activeDay);

    } catch (e) {
      console.error(e);
      toast({ title: "Falha", description: "Não foi possível gravar o treino.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

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
            {students.length === 0 && <option value="">Nenhum aluno encontrado (ver aba Alunos)</option>}
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
              <div className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:bg-white/5'
                }`}>
                {shortLabel}
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
                <Reorder.Item key={ex.uid} value={ex}>
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
                          onChange={(e) => updateExercise(ex.uid, 'sets', +e.target.value)}
                          className="w-12 text-center glass rounded-lg py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all bg-black/30"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Reps</span>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.uid, 'reps', +e.target.value)}
                          className="w-12 text-center glass rounded-lg py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all bg-black/30"
                        />
                      </div>
                      <button onClick={() => removeExercise(ex.uid)} className="p-2.5 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors mt-4">
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
        disabled={isSaving || !selectedStudentId}
      >
        {isSaving ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 className="w-5 h-5 opacity-80" />
          </motion.div>
        ) : (
          <>
            <Save className="w-5 h-5" /> Salvar Treino Baseado no Dia
          </>
        )}
      </Button>

      {/* Add exercise modal */}
      <AnimatePresence>
        {showExerciseList && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md" onClick={() => setShowExerciseList(false)} />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <div className="glass-strong rounded-3xl p-6 max-h-[75vh] flex flex-col border border-white/10 shadow-2xl">
                  <h2 className="text-lg font-bold text-foreground mb-4">Biblioteca de Exercícios</h2>
                  <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hidden">
                    {exerciseLibrary.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => addExercise(ex)}
                        className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-primary/20 transition-colors text-left border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{ex.name}</p>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{ex.default_sets}x{ex.default_reps} Padrão</p>
                        </div>
                      </button>
                    ))}

                    {exerciseLibrary.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-8">Nenhum exercício na biblioteca. Acesse a aba 'Exercícios'.</p>
                    )}
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
