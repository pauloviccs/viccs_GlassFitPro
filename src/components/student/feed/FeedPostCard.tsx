import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeedPost } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { feedService } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FeedCommentsModal } from './FeedCommentsModal';
import { FeedComment } from '@/types';

export function FeedPostCard({ post }: { post: FeedPost }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.isLikedByMe || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);

    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [localComments, setLocalComments] = useState<FeedComment[]>(post.comments || []);

    const handleLike = async () => {
        if (!user) return;

        // Optimistic UI Update
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

        try {
            await feedService.toggleLike(post.id, user.id);
        } catch (error) {
            // Rollback on failure
            setLiked(!newLikedState);
            setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
            console.error("Erro ao curtir post", error);
        }
    };

    const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR });

    const renderContentWithMentions = (text: string) => {
        const parts = text.split(/(@\S+)/g);

        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link
                        key={i}
                        to={`/student/profile/${username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary font-bold hover:opacity-80 transition-opacity"
                    >
                        {part}
                    </Link>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <GlassCard variant="subtle" className="p-4 border-white/5 bg-black/20 hover:bg-black/30 transition-colors">
            <div className="flex gap-3">
                {/* Avatar Column */}
                <Link to={`/student/profile/${post.student_id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-white/10">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-primary">{post.profiles?.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </Link>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Link to={`/student/profile/${post.student_id}`} className="hover:underline decoration-primary underline-offset-2">
                            <span className="font-bold text-foreground truncate">{post.profiles?.display_name || post.profiles?.name}</span>
                        </Link>
                        <Link to={`/student/profile/${post.student_id}`}>
                            <span className="text-sm font-medium text-muted-foreground truncate hover:text-primary transition-colors">
                                @{post.profiles?.username || post.profiles?.name.toLowerCase().replace(/\s+/g, '')}
                            </span>
                        </Link>
                        <span className="text-muted-foreground text-xs">• {timeAgo}</span>
                    </div>

                    <p className="mt-1 text-sm md:text-base text-foreground/90 whitespace-pre-wrap break-words">
                        {renderContentWithMentions(post.content)}
                    </p>

                    {post.image_url && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 max-h-[300px] md:max-h-[400px] flex items-center justify-center bg-black/40">
                            <img
                                src={post.image_url}
                                alt="Post media"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-6 mt-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all ${liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500/70'}`}
                        >
                            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                            {likesCount > 0 && likesCount}
                        </button>

                        <button
                            onClick={() => setIsCommentModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary/70 transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {localComments.length > 0 && localComments.length}
                        </button>
                    </div>
                </div>
            </div>

            <FeedCommentsModal
                post={{ ...post, comments: localComments }}
                isOpen={isCommentModalOpen}
                setIsOpen={setIsCommentModalOpen}
                onCommentAdded={(newComment) => {
                    setLocalComments(prev => [...prev, newComment]);
                }}
            />
        </GlassCard>
    );
}
