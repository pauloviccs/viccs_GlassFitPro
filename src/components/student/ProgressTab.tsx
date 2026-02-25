import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Weight, Loader2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { useWorkoutStore } from '@/store/workoutStore';
import { useAuth } from '@/contexts/AuthContext';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';

export function ProgressTab() {
    const { user } = useAuth();
    const { weightLogs, fetchWeightLogs, addWeightLog, isLoadingWeights } = useWorkoutStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [weightInput, setWeightInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchWeightLogs(user.id);
        }
    }, [user?.id, fetchWeightLogs]);

    const handleAddWeight = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !weightInput || isNaN(Number(weightInput))) return;

        setIsSubmitting(true);
        await addWeightLog(user.id, Number(weightInput));
        setIsSubmitting(false);
        setWeightInput('');
        setIsDrawerOpen(false);
    };

    // Formata a data pro gráfico (ex: "15 Fev")
    const chartData = weightLogs.map(log => {
        const d = new Date(log.recorded_at);
        return {
            name: `${d.getDate()} ${d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}`,
            weight: log.weight,
        };
    });

    const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
    const previousWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : null;

    let trendIcon = <Minus className="w-5 h-5 text-muted-foreground" />;
    let trendColor = "text-muted-foreground";
    if (latestWeight && previousWeight) {
        if (latestWeight < previousWeight) {
            trendIcon = <TrendingDown className="w-5 h-5 text-success" />;
            trendColor = "text-success";
        } else if (latestWeight > previousWeight) {
            trendIcon = <TrendingUp className="w-5 h-5 text-destructive" />;
            trendColor = "text-destructive";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Meu Progresso</h2>
                    <p className="text-sm text-muted-foreground">Acompanhe sua evolução física</p>
                </div>

                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-primary-foreground p-3 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-background/90 backdrop-blur-2xl border-t border-white/10">
                        <div className="mx-auto w-full max-w-sm">
                            <DrawerHeader>
                                <DrawerTitle className="text-center font-bold text-xl">Registrar Peso Hoje</DrawerTitle>
                            </DrawerHeader>
                            <form onSubmit={handleAddWeight} className="p-4 pb-0 flex flex-col gap-6">
                                <div className="flex items-center justify-center gap-4">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.1"
                                        placeholder="00.0"
                                        value={weightInput}
                                        onChange={(e) => setWeightInput(e.target.value)}
                                        className="text-center text-5xl font-black bg-transparent w-40 border-b-2 border-primary/30 focus:border-primary outline-none transition-colors py-2 text-foreground"
                                        autoFocus
                                    />
                                    <span className="text-2xl font-bold text-muted-foreground">kg</span>
                                </div>

                                <DrawerFooter className="px-0">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !weightInput}
                                        className="w-full flex justify-center items-center h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] disabled:opacity-50 transition-opacity"
                                    >
                                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Salvar Registro"}
                                    </button>
                                    <DrawerClose asChild>
                                        <button type="button" className="w-full h-12 rounded-2xl glass font-medium text-foreground">
                                            Cancelar
                                        </button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </form>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {isLoadingWeights ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : weightLogs.length === 0 ? (
                <GlassCard variant="strong" className="p-10 text-center rounded-3xl border-white/5">
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                        <Weight className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Comece sua jornada!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Registre seu primeiro peso tocando no botão + ali em cima.
                        O acompanhamento contínuo é chave para os resultados.
                    </p>
                </GlassCard>
            ) : (
                <>
                    <GlassCard variant="strong" className="p-6 rounded-3xl grid grid-cols-2 gap-4 items-center">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Último Peso</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-foreground">{latestWeight}</span>
                                <span className="text-sm font-medium text-muted-foreground">kg</span>
                            </div>
                        </div>

                        <div className={`glass-subtle py-3 px-4 rounded-2xl flex flex-col items-end justify-center ${trendColor} border border-white/5`}>
                            {trendIcon}
                            <span className="text-xs font-bold mt-1 uppercase tracking-wider">
                                {trendColor === 'text-success' ? 'Perdendo' : trendColor === 'text-destructive' ? 'Ganhando' : 'Estável'}
                            </span>
                        </div>
                    </GlassCard>

                    <GlassCard variant="subtle" className="p-4 rounded-3xl h-[300px] border-white/5 w-full">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2 pt-2 mb-4">Evolução do Peso (kg)</p>
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    tickFormatter={(val) => val.toFixed(1)}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    formatter={(value: any) => [`${value} kg`, 'Peso']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: "#fff" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </>
            )}
        </div>
    );
}
