import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus } from 'lucide-react';
import { FeedPost } from '@/types';
import { feedService } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';
import { FeedPostCard } from './FeedPostCard';
import { CreatePostModal } from './CreatePostModal';

export function FeedTab() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Limits
    const LIMIT = 10;

    const fetchPosts = async (pageNumber: number, override = false) => {
        if (!user) return;
        try {
            const newPosts = await feedService.getFeedPosts(pageNumber, LIMIT, user.id);

            if (newPosts.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (override) {
                setPosts(newPosts);
            } else {
                setPosts(prev => {
                    // Prevent duplicates in StrictMode via set filtering
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newPosts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (error) {
            console.error("Erro ao puxar feed", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        setPosts([]);
        fetchPosts(0, true);
    }, [user?.id]);

    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchPosts(nextPage);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handlePostCreated = () => {
        // Reset to top to show new post
        setLoading(true);
        setPage(0);
        setHasMore(true);
        fetchPosts(0, true);
    };

    if (loading && page === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full relative pb-24">
            {/* Top Fixed Header */}
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 mb-4">
                <h1 className="text-lg font-black text-foreground">Início</h1>
            </div>

            {/* Feed Content */}
            <div className="px-4 space-y-4 max-w-2xl mx-auto">
                {posts.length === 0 ? (
                    <div className="text-center py-10 glass-subtle rounded-3xl border border-white/5">
                        <p className="text-muted-foreground font-medium text-sm">Nenhum check-in ainda.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Seja o primeiro a compartilhar seu treino hoje!</p>
                    </div>
                ) : (
                    posts.map((post, index) => {
                        if (posts.length === index + 1) {
                            return <div ref={lastPostElementRef} key={post.id}><FeedPostCard post={post} /></div>;
                        }
                        return <div key={post.id}><FeedPostCard post={post} /></div>;
                    })
                )}

                {loading && page > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-4 md:right-8 lg:right-auto lg:ml-[calc(100%-80px)] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 shadow-primary/20"
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                setIsOpen={setIsCreateModalOpen}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
}
