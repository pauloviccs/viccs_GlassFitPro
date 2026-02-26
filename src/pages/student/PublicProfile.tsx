import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { FeedPostCard } from '@/components/student/feed/FeedPostCard';
import { feedService } from '@/services/feedService';
import { FeedPost } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileStats {
    totalCompleted: number;
    totalWorkouts: number;
}

export function PublicProfile() {
    const { idOrUsername } = useParams<{ idOrUsername: string }>();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState<any>(null);
    const [stats, setStats] = useState<ProfileStats>({ totalCompleted: 0, totalWorkouts: 0 });
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!idOrUsername) return;
            setLoading(true);
            try {
                // Check if it's a UUID
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

                if (isUUID) {
                    const { data, error } = await supabase.from('profiles').select('*').eq('id', idOrUsername).single();
                    if (!error && data) {
                        setUserProfile(data);
                    } else {
                        setUserProfile(null);
                    }
                    return;
                } else {
                    const searchQuery = idOrUsername.split('').join('%');
                    const { data, error } = await supabase.from('profiles')
                        .select('*')
                        .ilike('name', `%${searchQuery}%`)
                        .limit(50);

                    if (!error && data) {
                        const exactMatch = data.find(p => p.name.toLowerCase().replace(/\s+/g, '') === idOrUsername.toLowerCase());
                        if (exactMatch) {
                            setUserProfile(exactMatch);
                            return;
                        }
                    }
                    setUserProfile(null);
                    return;
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [idOrUsername]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userProfile?.id) return;

            // 1. Fetch Stats
            try {
                const { data, error } = await supabase.rpc('get_profile_stats', { user_id: userProfile.id });
                if (!error && data) {
                    setStats({
                        totalCompleted: data.total_completed_exercises || 0,
                        totalWorkouts: data.total_workouts || 0
                    });
                }
            } catch (e) { }

            // 2. Fetch Posts (We pass the profile ID)
            setPostsLoading(true);
            try {
                const fetchedPosts = await feedService.getUserPosts(userProfile.id, 0, 20, userProfile.id);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Failed to fetch user posts', error);
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserData();
    }, [userProfile?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-foreground">Perfil não encontrado</h2>
                <p className="text-muted-foreground text-sm mt-2 text-center">O usuário que você procura não existe ou mudou de nome.</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 glass rounded-full font-bold">Voltar</button>
            </div>
        );
    }

    const joinDate = userProfile.created_at ? format(new Date(userProfile.created_at), "MMMM 'de' yyyy", { locale: ptBR }) : '';

    return (
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden relative">
            {/* Header / Back Action */}
            <div className="absolute top-4 left-4 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition shadow-xl">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Banner Section */}
            <div className="relative w-full h-40 bg-gradient-to-tr from-primary/30 via-secondary/50 to-primary/10 overflow-hidden">
                {userProfile.banner_url && (
                    <img src={userProfile.banner_url} alt="Profile Banner" className="absolute inset-0 w-full h-full object-cover" />
                )}
            </div>

            {/* Profile Header (Avatar and Follow Button mockup) */}
            <div className="px-4 relative flex justify-between items-end mb-4">
                <div className="relative -mt-16 w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden z-10 shadow-lg">
                    {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-bold">{userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}</span>
                    )}
                </div>

                <div className="pb-2">
                    <button className="px-5 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition z-10">
                        Seguir
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="px-4 space-y-3">
                <div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                        {userProfile.display_name || userProfile.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                        @{userProfile.name.toLowerCase().replace(/\s+/g, '')}
                    </p>
                </div>

                {userProfile.bio && (
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        {userProfile.bio}
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
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Check-ins de {userProfile.name.split(' ')[0]}</h3>

                {postsLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 glass-subtle rounded-3xl border border-white/5">
                        <p className="text-muted-foreground font-medium text-sm">Este usuário não tem publicações ainda.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <FeedPostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
}
