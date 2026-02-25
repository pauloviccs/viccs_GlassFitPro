import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import StudentLayout from '@/components/StudentLayout';
import { useWorkoutStore } from '@/store/workoutStore';
import { HomeWorkoutTab } from '@/components/student/HomeWorkoutTab';
import { ProgressTab } from '@/components/student/ProgressTab';
import { ProfileTab } from '@/components/student/ProfileTab';
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
        return <ProfileTab />;
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
