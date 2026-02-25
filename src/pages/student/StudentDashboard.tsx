import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import StudentLayout from '@/components/StudentLayout';
import { useWorkoutStore } from '@/store/workoutStore';
import { HomeWorkoutTab } from '@/components/student/HomeWorkoutTab';
import { ProgressTab } from '@/components/student/ProgressTab';
import { GlassCard } from '@/components/ui/GlassCard';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { fetchStudentData, isLoading: storeLoading } = useWorkoutStore();

  const [activeDay, setActiveDay] = useState<string>('Segunda-feira');
  const [activeTab, setActiveTab] = useState('home');

  // Fetch initial student data based on Auth Supabase
  useEffect(() => {
    if (user?.id) {
      fetchStudentData(user.id);
    }
  }, [user?.id, fetchStudentData]);

  const renderTabContent = () => {
    if (storeLoading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
      case 'workout':
        return <HomeWorkoutTab activeDay={activeDay} setActiveDay={setActiveDay} />;
      case 'progress':
        return <ProgressTab />;
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
            <p className="text-sm text-muted-foreground">Gerencie sua conta</p>

            <GlassCard variant="strong" className="p-6 rounded-3xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{user?.email}</p>
                <p className="text-xs text-primary font-medium mt-1 uppercase tracking-wider">Aluno Ativo</p>
              </div>
            </GlassCard>

            <button
              onClick={signOut}
              className="w-full glass-subtle hover:bg-destructive/10 border border-white/5 hover:border-destructive/30 text-destructive rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">Encerrar Sessão</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </StudentLayout>
  );
}
