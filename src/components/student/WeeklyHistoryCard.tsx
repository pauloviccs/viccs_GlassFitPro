import { motion } from 'framer-motion';
import { Trophy, Activity, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyProgressHistoryProps {
    historyData: any[];
}

export function WeeklyHistoryCard({ historyData }: WeeklyProgressHistoryProps) {
    if (!historyData || historyData.length === 0) {
        return (
            <GlassCard variant="subtle" className="text-center py-8 px-4 rounded-3xl border-white/5">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Sem histórico</h3>
                <p className="text-xs text-muted-foreground mt-1">Conclua exercícios esta semana para gerar seus primeiros registros.</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-2">Minhas Semanas Anteriores</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyData.map((week, idx) => {
                    // Prevenir bug de timezone (SQL date puro vs UTC):
                    const [year, month, day] = week.week_start_date.split('-');
                    const startDate = new Date(Number(year), Number(month) - 1, Number(day));
                    const formattedDate = format(startDate, "dd 'de' MMM", { locale: ptBR });
                    const isPerfectWeek = week.progress_percentage === 100;

                    return (
                        <motion.div
                            key={week.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard variant="strong" className="p-4 rounded-3xl relative overflow-hidden border border-white/5 flex flex-col justify-between h-full min-h-[140px]">
                                {isPerfectWeek && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-success/20 rounded-full blur-2xl pointer-events-none" />
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold text-foreground">Semana {formattedDate}</span>
                                        </div>
                                        {isPerfectWeek && <Trophy className="w-4 h-4 text-success" />}
                                    </div>
                                    <div className="flex items-end gap-2 my-2">
                                        <span className="text-3xl font-black text-foreground">{week.progress_percentage}%</span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {week.completed_exercises} de {week.total_exercises} exercícios concluídos
                                    </p>
                                </div>

                                <div className="w-full h-2 bg-black/40 rounded-full mt-4 overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${week.progress_percentage}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                        className={`h-full rounded-full ${isPerfectWeek ? 'bg-success' : 'bg-primary'}`}
                                    />
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
