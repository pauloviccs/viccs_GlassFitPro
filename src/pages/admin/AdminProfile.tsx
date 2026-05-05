import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, Save, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function AdminProfile() {
  const { user, updateProfileState } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let avatarUrl = user.avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: false });

        if (uploadError) {
          console.error('Upload error, retrying without upsert...', uploadError);
          // Retry with unique name
          const retryName = `${user.id}-${Date.now()}-retry.${ext}`;
          const { error: retryError } = await supabase.storage
            .from('avatars')
            .upload(retryName, avatarFile);
          
          if (retryError) throw retryError;
          
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(retryName);
          avatarUrl = urlData.publicUrl;
        } else {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Update profile in DB
      const updates: Record<string, any> = {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      };
      if (avatarUrl !== user.avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      updateProfileState({
        displayName: updates.display_name,
        bio: updates.bio,
        avatarUrl: updates.avatar_url || user.avatarUrl,
      });

      toast({ title: "Sucesso", description: "Perfil atualizado!" });
      setAvatarFile(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível salvar o perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações de professor.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 space-y-8"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary/50" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como seus alunos te verão"
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Uma breve descrição sobre você..."
              rows={3}
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/150</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              E-mail
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full glass-subtle rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 rounded-xl flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" /> Salvar Perfil
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
