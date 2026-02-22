import { motion } from 'framer-motion';
import { Home, Dumbbell, User, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'workout', label: 'Treino', icon: Dumbbell },
  { id: 'progress', label: 'Progresso', icon: BarChart3 },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 px-2 pb-safe md:hidden">
      <nav className="flex items-center justify-around py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 w-full min-h-[56px] px-2 py-2 touch-manipulation tap-highlight-transparent"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-10 h-1 rounded-b-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {/* Active Backlight Glow effect */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl scale-75 blur-md" />
              )}

              <tab.icon
                className={cn(
                  'w-6 h-6 transition-colors z-10',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] transition-colors font-medium z-10',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
