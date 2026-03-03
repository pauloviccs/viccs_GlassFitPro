import { motion } from 'framer-motion';
import { Home, Dumbbell, BarChart3, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'workout', label: 'Treino', icon: Dumbbell },
    { id: 'progress', label: 'Progresso', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: User },
];

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
    return (
        <aside className="hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-[220px] flex-col glass-strong border-r border-white/[0.06] py-6 px-3 gap-2">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center shadow-[0_0_12px_rgba(var(--primary),0.25)]">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-bold tracking-tight text-foreground">GlassFit Pro</span>
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col gap-1 flex-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                            )}
                        >
                            {/* Active background */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebarActiveIndicator"
                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}

                            {/* Active left bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebarLeftBar"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}

                            <tab.icon className={cn(
                                'w-[18px] h-[18px] relative z-10 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto px-3 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wider uppercase">
                    GlassFit Pro v1.0
                </p>
            </div>
        </aside>
    );
}
