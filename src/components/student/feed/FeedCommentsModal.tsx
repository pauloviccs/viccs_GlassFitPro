import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { FeedPost, FeedComment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { feedService } from '@/services/feedService';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MentionTextarea } from '@/components/ui/MentionTextarea';

interface FeedCommentsModalProps {
    post: FeedPost;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onCommentAdded: (newComment: FeedComment) => void;
}

export function FeedCommentsModal({ post, isOpen, setIsOpen, onCommentAdded }: FeedCommentsModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Limit setup
    const MAX_LENGTH = 250;

    // Derived state determining if user can comment
    const hasAlreadyCommented = post.comments?.some(c => c.student_id === user?.id) || false;

    const renderContentWithMentions = (text: string) => {
        const parts = text.split(/(@\S+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="text-primary font-bold cursor-pointer hover:opacity-80 transition-opacity">
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || hasAlreadyCommented || !user) return;

        setIsSubmitting(true);
        try {
            const newComment = await feedService.createComment(post.id, user.id, content.trim());
            onCommentAdded(newComment);
            setContent('');
            toast({ title: 'Comentário enviado!', description: 'Seu comentário foi adicionado ao check-in.' });
        } catch (error: any) {
            toast({ title: 'Atenção', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                    />

                    {/* Modal Content - Bottom sheet on Mobile, Centered on Desktop */}
                    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-lg bg-background/95 backdrop-blur-xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col h-[70vh] sm:max-h-[80vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0 bg-background/50">
                                <h3 className="font-black text-lg">Respostas</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors" disabled={isSubmitting}>
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* View Original Post Summary (Optional context to remember what user is replying to) */}
                            <div className="px-4 py-3 bg-white/5 border-b border-white/5 shrink-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                                        {post.profiles?.avatar_url ? (
                                            <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xs text-primary">{post.profiles?.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                                        <span className="text-foreground font-bold mr-1">@{post.profiles?.name.toLowerCase().replace(/\s+/g, '')}</span>
                                        {renderContentWithMentions(post.content)}
                                    </p>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {(!post.comments || post.comments.length === 0) ? (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground font-medium text-sm">Seja o primeiro a incentivar!</p>
                                    </div>
                                ) : (
                                    post.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="flex-shrink-0 pt-1">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                                                    {comment.profiles?.avatar_url ? (
                                                        <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-xs text-primary">{comment.profiles?.name?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <span className="font-bold text-sm text-foreground truncate">{comment.profiles?.display_name || comment.profiles?.name}</span>
                                                    <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}</span>
                                                </div>
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                                                    {renderContentWithMentions(comment.content)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Comment Input Footer */}
                            <div className="p-4 border-t border-white/5 shrink-0 bg-background/80">
                                {hasAlreadyCommented ? (
                                    <div className="py-3 text-center bg-primary/10 rounded-2xl border border-primary/20">
                                        <p className="text-sm font-bold text-primary">Você já deixou seu recado hoje! 💪</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2 relative focus-within:border-primary/50 transition-colors">
                                            <MentionTextarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                maxLength={MAX_LENGTH}
                                                placeholder="Adicione um recado... (@ para mencionar)"
                                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 border-none outline-none resize-none pt-1 px-2 min-h-[40px] max-h-[100px]"
                                                disabled={isSubmitting}
                                                rows={1}
                                                style={{ fieldSizing: "content" } as any}
                                            />
                                            <div className="absolute right-3 bottom-2 text-xs font-bold text-muted-foreground">
                                                {content.length > 0 && `${content.length}/${MAX_LENGTH}`}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!content.trim() || isSubmitting}
                                            className="h-[46px] w-[46px] rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5 text-primary-foreground ml-1" />
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
