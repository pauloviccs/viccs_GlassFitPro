import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Dumbbell, CalendarDays, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  text: string;
  time: string;
  date: Date;
}

export default function AdminOverview() {
  const [counts, setCounts] = useState({
    students: 0,
    exercises: 0,
    workouts: 0,
    completionRate: '0%'
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const [
          studentsRes,
          exercisesRes,
          workoutsRes,
          workoutExercisesRes,
          recentStudentsRes,
          recentExercisesRes
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('exercises').select('id', { count: 'exact', head: true }),
          supabase.from('workout_days').select('id', { count: 'exact', head: true }),
          supabase.from('workout_exercises').select('completed'),
          supabase.from('profiles').select('id, name, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(3),
          supabase.from('exercises').select('id, name, created_at').order('created_at', { ascending: false }).limit(3)
        ]);

        // Calcula a taxa de conclusão real
        let completionRate = '0%';
        if (workoutExercisesRes.data && workoutExercisesRes.data.length > 0) {
          const totalExercises = workoutExercisesRes.data.length;
          const completedExercises = workoutExercisesRes.data.filter(e => e.completed).length;
          completionRate = Math.round((completedExercises / totalExercises) * 100) + '%';
        }

        setCounts({
          students: studentsRes.count || 0,
          exercises: exercisesRes.count || 0,
          workouts: workoutsRes.count || 0,
          completionRate
        });

        // Montar logs de atividade recente misturando estudantes e exercícios
        const logs: ActivityLog[] = [];

        if (recentStudentsRes.data) {
          recentStudentsRes.data.forEach(s => {
            logs.push({
              id: `stu-${s.id}`,
              text: `Novo aluno "${s.name}" adicionado a plataforma`,
              date: new Date(s.created_at),
              time: formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: ptBR })
            });
          });
        }

        if (recentExercisesRes.data) {
          recentExercisesRes.data.forEach(e => {
            logs.push({
              id: `ex-${e.id}`,
              text: `Novo exercício "${e.name}" cadastrado na biblioteca`,
              date: new Date(e.created_at),
              time: formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: ptBR })
            });
          });
        }

        // Ordena tudo do mais recente pro mais antigo e pega os 5 primeiros
        const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

        if (sortedLogs.length === 0) {
          sortedLogs.push({ id: 'empty', text: 'Nenhuma atividade recente encontrada no banco de dados.', time: '', date: new Date() });
        }

        setRecentActivity(sortedLogs);
      } catch (e) {
        console.error("Erro ao puxar estatísticas", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    { label: 'Total de Alunos', value: counts.students, icon: Users, color: 'text-primary' },
    { label: 'Exercícios Cadastrados', value: counts.exercises, icon: Dumbbell, color: 'text-accent' },
    { label: 'Treinos Ativos (Dias)', value: counts.workouts, icon: CalendarDays, color: 'text-success' },
    { label: 'Taxa de Conclusão', value: counts.completionRate, icon: TrendingUp, color: 'text-warning' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={stat.label} variant="strong" className="flex items-center gap-4 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent activity */}
      <GlassCard variant="strong" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between glass-subtle rounded-xl px-4 py-3"
            >
              <p className="text-sm text-foreground">{item.text}</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
