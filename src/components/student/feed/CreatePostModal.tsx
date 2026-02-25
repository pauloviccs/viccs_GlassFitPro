import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { feedService } from '@/services/feedService';
import { AnimatedButton } from '@/components/AnimatedButton';
import { getCroppedImg } from '@/components/student/ImageCropper';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Cropper from 'react-easy-crop';

interface CreatePostModalProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    onPostCreated: () => void;
}

export function CreatePostModal({ isOpen, setIsOpen, onPostCreated }: CreatePostModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image states
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [finalImageData, setFinalImageData] = useState<{ blob: Blob, url: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_LENGTH = 250;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Clear previous states
            setFinalImageData(null);
            const url = URL.createObjectURL(file);
            setSelectedImage(url);
        }
    };

    const handleCropComplete = async () => {
        if (!selectedImage || !croppedAreaPixels) return;
        try {
            // Otimização igual ao avatar: max 800x800, jpeg 80%
            const blob = await getCroppedImg(selectedImage, croppedAreaPixels, 800, 800);
            if (blob) {
                setFinalImageData({ blob, url: URL.createObjectURL(blob) });
                setSelectedImage(null); // Fecha a tela de crop
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Não foi possível processar a imagem', variant: 'destructive' });
        }
    };

    const handleUploadToStorage = async (blob: Blob) => {
        const fileName = `${user?.id}-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage.from('feed_images').upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false
        });

        if (error) {
            console.error(error);
            throw new Error(`Falha no upload: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('feed_images').getPublicUrl(fileName);
        return publicUrl;
    };

    const handleSubmit = async () => {
        if (!content.trim() && !finalImageData) return;
        if (!user) return;

        setIsSubmitting(true);
        try {
            let imageUrl = undefined;
            if (finalImageData) {
                imageUrl = await handleUploadToStorage(finalImageData.blob);
            }

            await feedService.createPost(user.id, content.trim(), imageUrl);

            toast({ title: "Check-in realizado!", description: "Seu treino foi compartilhado com os colegas." });
            setContent('');
            setFinalImageData(null);
            setIsOpen(false);
            onPostCreated();
        } catch (error: any) {
            toast({ title: "Erro na publicação", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                    />

                    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-lg bg-background/95 backdrop-blur-xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors" disabled={isSubmitting}>
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <AnimatedButton
                                    onClick={handleSubmit}
                                    disabled={(!content.trim() && !finalImageData) || isSubmitting}
                                    className="h-9 px-6 rounded-full font-bold text-sm"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar"}
                                </AnimatedButton>
                            </div>

                            <div className="p-4 overflow-y-auto w-full">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/20 overflow-hidden">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <textarea
                                            placeholder="Descreva seu treino de hoje!"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            maxLength={MAX_LENGTH}
                                            className="w-full bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 border-none outline-none resize-none pt-2 min-h-[100px]"
                                            disabled={isSubmitting}
                                        />

                                        {/* Crop Modal View (In-line replacing textarea visually when active) */}
                                        {selectedImage && (
                                            <div className="relative w-full h-[300px] mt-4 rounded-2xl overflow-hidden bg-black/50">
                                                <Cropper
                                                    image={selectedImage}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    onCropChange={setCrop}
                                                    onZoomChange={setZoom}
                                                    onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                                                />
                                                <button onClick={handleCropComplete} className="absolute bottom-4 right-4 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-full shadow-lg z-10">
                                                    Cortar Imagem
                                                </button>
                                            </div>
                                        )}

                                        {/* Final Thumbnail Preview */}
                                        {finalImageData && !selectedImage && (
                                            <div className="relative w-full mt-4 rounded-2xl overflow-hidden border border-white/10 group">
                                                <img src={finalImageData.url} alt="Anexo" className="w-full h-auto max-h-[300px] object-cover" />
                                                <button
                                                    onClick={() => setFinalImageData(null)}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black border border-white/10 rounded-full transition-colors backdrop-blur-md"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Toolbar */}
                            <div className="p-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={isSubmitting || !!selectedImage || !!finalImageData}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-primary hover:bg-primary/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSubmitting || !!selectedImage || !!finalImageData}
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    {content.length > 0 && (
                                        <span className={`text-xs font-bold ${content.length >= MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            {content.length}/{MAX_LENGTH}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
