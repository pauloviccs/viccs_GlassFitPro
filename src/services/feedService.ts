import { supabase } from '@/lib/supabase';
import { FeedPost } from '@/types';

export const feedService = {
    /**
     * Busca os posts de feed paginados.
     * @param page Página atual (0-indexed)
     * @param limit Quantos posts trazer
     */
    async getFeedPosts(page: number, limit: number, userId?: string) {
        const start = page * limit;
        const end = start + limit - 1;

        // Trazendo as informações do usuário (profiles) e a contagem/status de likes
        let query = supabase
            .from('feed_posts')
            .select(`
                *,
                profiles:profiles!feed_posts_student_id_fkey ( name, display_name, avatar_url ),
                feed_likes ( student_id ),
                feed_comments ( id, post_id, student_id, content, created_at, profiles (name, display_name, avatar_url) )
            `)
            .order('created_at', { ascending: false })
            .range(start, end);

        const { data, error } = await query;
        if (error) throw error;

        // Processa os dados brutos pro nosso formato limpo do front
        const formattedData: FeedPost[] = (data as any[]).map(post => {
            const likesCount = post.feed_likes?.length || 0;
            const isLikedByMe = userId ? post.feed_likes?.some((like: any) => like.student_id === userId) : false;

            return {
                id: post.id,
                student_id: post.student_id,
                content: post.content,
                image_url: post.image_url,
                post_date: post.post_date,
                created_at: post.created_at,
                profiles: post.profiles,
                likesCount,
                isLikedByMe,
                comments: post.feed_comments || []
            };
        });

        return formattedData;
    },

    /**
     * Busca os posts apenas de um usuário específico (Para a aba Meu Perfil)
     */
    async getUserPosts(studentId: string, page: number, limit: number, currentUserId?: string) {
        const start = page * limit;
        const end = start + limit - 1;

        let query = supabase
            .from('feed_posts')
            .select(`
                *,
                profiles:profiles!feed_posts_student_id_fkey ( name, display_name, avatar_url ),
                feed_likes ( student_id ),
                feed_comments ( id, post_id, student_id, content, created_at, profiles (name, display_name, avatar_url) )
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .range(start, end);

        const { data, error } = await query;
        if (error) throw error;

        const formattedData: FeedPost[] = (data as any[]).map(post => {
            const likesCount = post.feed_likes?.length || 0;
            const isLikedByMe = currentUserId ? post.feed_likes?.some((like: any) => like.student_id === currentUserId) : false;

            return {
                id: post.id,
                student_id: post.student_id,
                content: post.content,
                image_url: post.image_url,
                post_date: post.post_date,
                created_at: post.created_at,
                profiles: post.profiles,
                likesCount,
                isLikedByMe,
                comments: post.feed_comments || []
            };
        });

        return formattedData;
    },

    /**
     * Cria um novo post
     */
    async createPost(studentId: string, content: string, imageUrl?: string) {
        // Usa YYYY-MM-DD local logic
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);

        const { data, error } = await supabase.from('feed_posts').insert({
            student_id: studentId,
            content,
            image_url: imageUrl,
            post_date: localISOTime
        }).select().single();

        if (error) {
            if (error.code === '23505') { // postgres unique violation
                throw new Error('Você já realizou o Check-in de treino hoje!');
            }
            throw new Error(`Erro ao postar: ${error.message}`);
        }

        return data;
    },

    /**
     * Dá/Tira Like usando a RPC `toggle_feed_like`
     */
    async toggleLike(postId: string, userId: string) {
        const { data, error } = await supabase.rpc('toggle_feed_like', {
            p_post_id: postId,
            p_user_id: userId
        });

        if (error) throw error;
        // Retorna TRUE se adicionou o like, FALSE se removeu.
        return data as boolean;
    },

    /**
     * Cria um comentário
     */
    async createComment(postId: string, studentId: string, content: string) {
        const { data, error } = await supabase.from('feed_comments').insert({
            post_id: postId,
            student_id: studentId,
            content
        }).select(`
            *,
            profiles (name, display_name, avatar_url)
        `).single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('Você só pode fazer 1 comentário por Check-in.');
            }
            throw new Error(`Erro ao comentar: ${error.message}`);
        }

        return data;
    }
};
