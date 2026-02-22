import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeeklyProgressProps {
  completed: number;
  total: number;
  className?: string;
}

export function WeeklyProgress({ completed, total, className }: WeeklyProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progresso Semanal</span>
        <span className="font-semibold text-foreground">{percentage}%</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className={cn(
            'h-full rounded-full',
            percentage === 100
              ? 'bg-success shadow-[0_0_12px_hsl(var(--success)/0.5)]'
              : 'bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
          )}
          style={{
            background: percentage < 100
              ? 'linear-gradient(90deg, hsl(250 80% 65%), hsl(200 90% 55%))'
              : undefined,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {completed} de {total} exercícios concluídos
      </p>
    </div>
  );
}
