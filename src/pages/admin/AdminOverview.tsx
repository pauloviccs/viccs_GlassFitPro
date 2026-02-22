import { motion } from 'framer-motion';
import { Users, Dumbbell, CalendarDays, TrendingUp, Activity } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { mockStudents, mockExercises, mockAllWorkouts } from '@/data/mockData';

const stats = [
  { label: 'Total de Alunos', value: mockStudents.length, icon: Users, color: 'text-primary' },
  { label: 'Exercícios Cadastrados', value: mockExercises.length, icon: Dumbbell, color: 'text-accent' },
  { label: 'Treinos Ativos', value: mockAllWorkouts.length, icon: CalendarDays, color: 'text-success' },
  { label: 'Taxa de Conclusão', value: '72%', icon: TrendingUp, color: 'text-warning' },
];

const recentActivity = [
  { text: 'Paulo Silva concluiu treino de Segunda', time: '2h atrás' },
  { text: 'Maria Santos foi adicionada', time: '5h atrás' },
  { text: 'Novo exercício "Leg Press 45°" criado', time: '1 dia atrás' },
  { text: 'Treino semanal de João Oliveira atualizado', time: '2 dias atrás' },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={stat.label} className="flex items-center gap-4" transition={{ delay: i * 0.1 }}>
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
      <GlassCard variant="strong">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Atividade Recente</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <motion.div
              key={i}
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
