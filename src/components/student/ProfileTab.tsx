import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, MapPin, Calendar, Activity, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase';
import { EditProfileModal } from './EditProfileModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FeedPost } from '@/types';
import { feedService } from '@/services/feedService';
import { FeedPostCard } from './feed/FeedPostCard';
import { Loader2 } from 'lucide-react';

interface ProfileStats {
    totalCompleted: number;
    totalWorkouts: number;
}

export function ProfileTab() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<ProfileStats>({ totalCompleted: 0, totalWorkouts: 0 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('get_profile_stats', { user_id: user.id });
            if (!error && data) {
                setStats({
                    totalCompleted: data.total_completed_exercises || 0,
                    totalWorkouts: data.total_workouts || 0
                });
            }
        } catch (e) {
            console.error('Failed to fetch profile stats', e);
        }
    };

    const fetchUserPosts = async () => {
        if (!user) return;
        setLoadingPosts(true);
        try {
            // Buscando os últimos 20 posts do aluno
            const fetchedPosts = await feedService.getUserPosts(user.id, 0, 20, user.id);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Failed to fetch user posts', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUserPosts();
    }, [user]);

    // Format Join Date
    const joinDate = user?.createdAt ? format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: ptBR }) : '';

    return (
        <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 pb-24 min-h-[calc(100vh-3rem)] bg-background relative overflow-x-hidden">

            {/* Banner Section */}
            <div className="relative w-full h-40 bg-gradient-to-tr from-primary/30 via-secondary/50 to-primary/10 overflow-hidden">
                {user?.bannerUrl && (
                    <img src={user.bannerUrl} alt="Profile Banner" className="absolute inset-0 w-full h-full object-cover" />
                )}
            </div>

            {/* Profile Header (Avatar and Edit Button) */}
            <div className="px-4 relative flex justify-between items-end mb-4">
                <div className="relative -mt-16 w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden z-10 shadow-lg">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                    )}
                </div>

                <div className="pb-2">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-5 py-2 glass rounded-full font-bold text-sm text-foreground hover:bg-white/10 transition z-10"
                    >
                        Editar Perfil
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="px-4 space-y-3">
                <div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                        {user?.displayName || user?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                        @{user?.username || user?.name.toLowerCase().replace(/\s+/g, '')}
                        <span className="bg-primary/20 text-primary text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold ml-2">
                            ALUNO
                        </span>
                    </p>
                </div>

                {user?.bio && (
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        {user.bio}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-1">
                    {joinDate && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> Entrou em {joinDate}
                        </span>
                    )}
                </div>

                {/* Stats Row inside GlassCard */}
                <GlassCard variant="strong" className="mt-4 p-4 rounded-3xl flex items-center justify-center gap-8 border border-white/5 divide-x divide-white/10">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-2xl font-black text-foreground">{stats.totalCompleted}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1 text-center">Exercícios<br />Concluídos</span>
                    </div>

                    <div className="flex flex-col items-center flex-1">
                        <span className="text-2xl font-black text-foreground">{stats.totalWorkouts}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1 text-center">Treinos<br />Inscritos</span>
                    </div>
                </GlassCard>
            </div>

            {/* User Timeline Feed */}
            <div className="px-4 mt-8 space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Meus Check-ins</h3>

                {loadingPosts ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 glass-subtle rounded-3xl border border-white/5">
                        <p className="text-muted-foreground font-medium text-sm">Nenhum check-in registrado.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <FeedPostCard key={post.id} post={post} />
                    ))
                )}
            </div>

            {/* Settings Options / Footer actions */}
            <div className="px-4 mt-12 pb-10">
                <button
                    onClick={logout}
                    className="w-full glass-subtle border border-destructive/20 hover:border-destructive text-destructive rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-sm">Encerrar Sessão</span>
                </button>
            </div>

            {/* Edit Modal / Drawer */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                onUpdate={fetchStats}
            />
        </div>
    );
}
