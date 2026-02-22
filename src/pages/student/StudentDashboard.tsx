import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Trophy, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { ExerciseCard } from '@/components/ExerciseCard';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { BottomNav } from '@/components/BottomNav';
import StudentLayout from '@/components/StudentLayout';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSimulatedAsync } from '@/hooks/useSimulatedAsync';
import { useToast } from '@/components/ui/use-toast';

const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { currentStudent, markExerciseComplete, setCurrentStudent, students } = useWorkoutStore();
  const { execute, isLoading } = useSimulatedAsync<void>();
  const { toast } = useToast();

  const [activeDay, setActiveDay] = useState<string>('Segunda-feira');
  const [activeTab, setActiveTab] = useState('home');

  // Fetch initial student data mock based on Auth
  useEffect(() => {
    if (user?.email) {
      const found = students.find(s => s.email === user.email) || students[0];
      setCurrentStudent(found);
    }
  }, [user, students]);

  const workoutDays = currentStudent?.workouts || [];

  const currentDayData = useMemo(() => {
    return workoutDays.find(d => d.dayOfWeek === activeDay) || { id: 'temp', dayOfWeek: activeDay, exercises: [] };
  }, [activeDay, workoutDays]);

  const totalExercises = useMemo(() => workoutDays.reduce((sum, d) => sum + d.exercises.length, 0), [workoutDays]);
  const completedExercises = useMemo(() => workoutDays.reduce((sum, d) => sum + d.exercises.filter(e => e.completed).length, 0), [workoutDays]);

  const toggleComplete = async (exerciseId: string) => {
    try {
      // Simulate network request before changing state
      await execute(async () => { }, { delay: 400 });
      markExerciseComplete(currentDayData.id, exerciseId);
    } catch (e) {
      toast({ title: "Erro na conexão", description: "Não foi possível sincronizar o exercício.", variant: "destructive" });
    }
  };

  const dayCompleted = currentDayData.exercises.length > 0 && currentDayData.exercises.every(e => e.completed);

  return (
    <StudentLayout>
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Weekly overview */}
        <GlassCard variant="strong" glow className="relative overflow-hidden p-6 rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-foreground text-xl">Treino da Semana</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Foco total, {currentStudent?.name.split(' ')[0]}!</p>
            <WeeklyProgress completed={completedExercises} total={totalExercises} />

            {completedExercises === totalExercises && totalExercises > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center justify-center gap-2 text-success glass-subtle py-3 rounded-2xl"
              >
                <Trophy className="w-5 h-5 fill-success/20" />
                <span className="text-sm font-semibold tracking-wide uppercase">Semana Impecável 🎉</span>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Day tabs Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {weekDays.map((dayLabel) => {
            const dayData = workoutDays.find(d => d.dayOfWeek === dayLabel);
            const hasExercises = dayData && dayData.exercises.length > 0;
            const allDone = dayData?.exercises.every(e => e.completed) && hasExercises;
            const isActive = activeDay === dayLabel;

            // Short label for mobile: S, T, Q, Q, S, S, D
            const shortLabel = dayLabel.slice(0, 3);

            return (
              <button
                key={dayLabel}
                onClick={() => setActiveDay(dayLabel)}
                className="relative flex-shrink-0"
              >
                {isActive && (
                  <motion.div
                    layoutId="dayIndicator"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'text-primary-foreground' : hasExercises ? 'text-foreground glass-subtle hover:bg-white/5' : 'text-muted-foreground hover:bg-white/5'
                  }`}>
                  {shortLabel}
                  {allDone && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Day completed banner */}
        <AnimatePresence>
          {dayCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="glass rounded-2xl p-4 flex items-center gap-3 ring-1 ring-success/20 bg-success/5"
            >
              <Flame className="w-6 h-6 text-warning" />
              <div>
                <p className="text-sm font-semibold text-foreground">Treino de {activeDay.split('-')[0]} estraçalhado!</p>
                <p className="text-xs text-muted-foreground">O músculo cresce agora no descanso 💪</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise cards List */}
        <AnimatePresence mode="popLayout">
          {isLoading && currentDayData.exercises.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {currentDayData.exercises.length > 0 ? (
                <div className="grid grid-cols-1 gap-5">
                  {currentDayData.exercises.map((ex, i) => (
                    <motion.div
                      key={ex.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <ExerciseCard
                        workoutExercise={{ exercise: ex as any, id: ex.id, reps: ex.reps.toString(), sets: ex.sets.toString(), completed: ex.completed }}
                        onToggleComplete={toggleComplete}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard variant="subtle" className="text-center py-16 px-6 mt-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum treino hoje</h3>
                  <p className="text-sm text-muted-foreground">O professor ainda não definiu o treino de {activeDay.split('-')[0].toLowerCase()}.</p>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </StudentLayout>
  );
}
