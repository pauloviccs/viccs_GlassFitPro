import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Smile, Loader2, Save } from 'lucide-react';
import Picker, { Theme } from 'emoji-picker-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, DrawerTrigger } from '@/components/ui/drawer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ImageCropper, getCroppedImg } from './ImageCropper';
import type { Area } from 'react-easy-crop';

interface EditProfileModalProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onUpdate: () => void;
}

export function EditProfileModal({ isOpen, setIsOpen, onUpdate }: EditProfileModalProps) {
    const { user, updateProfileState } = useAuth();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // File Upload States
    const [bannerFile, setBannerFile] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<string | null>(null);

    // Crop States
    const [croppingType, setCroppingType] = useState<'avatar' | 'banner' | null>(null);
    const [currentUploadedImage, setCurrentUploadedImage] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // File inputs Refs
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: 'Arquivo muito grande', description: 'O limite é de 5MB.', variant: 'destructive' });
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCurrentUploadedImage(reader.result?.toString() || '');
                setCroppingType(type);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async () => {
        if (!currentUploadedImage || !croppedAreaPixels || !croppingType) return;
        try {
            const croppedBlob = await getCroppedImg(currentUploadedImage, croppedAreaPixels);
            if (!croppedBlob) throw new Error("Falha no recorte");

            // Transforma o blob num base64 preview para mostrar na UI imediatamente
            const croppedUrl = URL.createObjectURL(croppedBlob);

            if (croppingType === 'avatar') {
                setAvatarFile(croppedUrl);
            } else {
                setBannerFile(croppedUrl);
            }

            // Cleanup
            setCroppingType(null);
            setCurrentUploadedImage(null);
            setCroppedAreaPixels(null);

        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao cortar imagem', description: 'Tente com uma imagem diferente.', variant: 'destructive' });
        }
    };

    const cancelCrop = () => {
        setCroppingType(null);
        setCurrentUploadedImage(null);
        setCroppedAreaPixels(null);
    };

    const uploadToStorage = async (fileUrl: string, bucket: string): Promise<string | null> => {
        try {
            // Converte o blob url (blob:http://...) de volta para um Blob verdadeiro
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            const fileName = `${user?.id}-${Date.now()}.jpg`;
            const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: true
            });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return publicUrl;
        } catch (error) {
            console.error(`Erro upando pro bucket ${bucket}:`, error);
            return null;
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            let finalAvatarUrl = user.avatarUrl;
            let finalBannerUrl = user.bannerUrl;

            if (avatarFile && avatarFile.startsWith('blob:')) {
                finalAvatarUrl = await uploadToStorage(avatarFile, 'avatars') || finalAvatarUrl;
            }

            if (bannerFile && bannerFile.startsWith('blob:')) {
                finalBannerUrl = await uploadToStorage(bannerFile, 'banners') || finalBannerUrl;
            }

            const updates = {
                display_name: displayName,
                bio: bio,
                avatar_url: finalAvatarUrl,
                banner_url: finalBannerUrl
            };

            const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

            if (error) throw error;

            // Update local Context fast
            updateProfileState({
                displayName: displayName,
                bio: bio,
                avatarUrl: finalAvatarUrl,
                bannerUrl: finalBannerUrl
            });

            toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
            onUpdate(); // tells parent to re-fetch if needed
            setIsOpen(false);
        } catch (e: any) {
            toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onEmojiClick = (emojiObj: any) => {
        if (bio.length + emojiObj.emoji.length <= 150) {
            setBio(prev => prev + emojiObj.emoji);
        }
        setShowEmojiPicker(false);
    };

    // --------------------------------------------------
    // RENDER: Cropper View vs Form View
    // --------------------------------------------------
    if (croppingType && currentUploadedImage) {
        return (
            <Drawer open={true} onOpenChange={(open) => !open && cancelCrop()}>
                <DrawerContent className="bg-background border-none h-[95vh] outline-none">
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <button onClick={cancelCrop} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        <h3 className="font-bold">Ajustar Imagem</h3>
                        <button onClick={handleCropComplete} className="text-primary font-bold px-4">Salvar</button>
                    </div>
                    <div className="flex-1 w-full bg-black">
                        <ImageCropper
                            image={currentUploadedImage}
                            aspectRatio={croppingType === 'avatar' ? 1 : 3}
                            cropShape={croppingType === 'avatar' ? 'round' : 'rect'}
                            onCropComplete={setCroppedAreaPixels}
                        />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    // --------------------------------------------------
    // RENDER: Form View
    // --------------------------------------------------
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="bg-background/95 backdrop-blur-3xl border-t border-white/5 outline-none max-h-[95vh]">
                <DrawerHeader className="px-6 border-b border-white/5 flex items-center justify-between">
                    <DrawerTitle className="font-bold text-xl">Editar Perfil</DrawerTitle>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                    </button>
                </DrawerHeader>

                <div className="overflow-y-auto w-full pb-10">
                    <form className="flex flex-col">

                        {/* Banner Section */}
                        <div className="relative w-full h-32 bg-primary/20 flex items-center justify-center overflow-hidden">
                            {(bannerFile || user?.bannerUrl) && (
                                <img src={bannerFile || user?.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                            <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={(e) => onFileChange(e, 'banner')} />
                            <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                className="relative z-10 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Avatar Section (margin negative) */}
                        <div className="px-6 relative flex justify-between items-end mb-4">
                            <div className="relative -mt-12 w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden">
                                {(avatarFile || user?.avatarUrl) ? (
                                    <img src={avatarFile || user?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                                )}
                                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                                <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => onFileChange(e, 'avatar')} />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer hover:bg-black/20 transition rounded-full"
                                >
                                    <div className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Inputs Section */}
                        <div className="px-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                    Nome
                                    <span className="text-xs">{displayName.length}/50</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                                    placeholder="Seu nome social"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                    Bio
                                    <span className="text-xs">{bio.length}/150</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        maxLength={150}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-28 resize-none text-foreground focus:outline-none focus:border-primary transition"
                                        placeholder="Escreva algo sobre você..."
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Emoji Picker Popover */}
                                <AnimatePresence>
                                    {showEmojiPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-[100%] right-0 z-50 mb-2 shadow-2xl"
                                        >
                                            <Picker
                                                onEmojiClick={onEmojiClick}
                                                theme={Theme.DARK}
                                                width={300}
                                                height={350}
                                                lazyLoadEmojis={true}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
