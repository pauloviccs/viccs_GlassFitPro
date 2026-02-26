import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileState: (updates: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        syncProfile(currentSession.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          username: data.username,
          lastUsernameUpdate: data.last_username_update,
          email: authUser.email || '',
          role: data.role as UserRole,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          bannerUrl: data.banner_url,
          bio: data.bio,
          createdAt: data.created_at,
        });
      } else {
        // Se usuário não tem perfil explícito na tabela, tenta deduzir.
        // E-mail estrito para administrador:
        const isAdmin = authUser.email === 'pauloviccsdesign@gmail.com';
        const role = isAdmin ? 'admin' : 'student';

        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          role: role,
        };

        const { error: insertError } = await supabase.from('profiles').insert([newProfile]);

        if (insertError) {
          console.error("Erro ao criar perfil. Verifique se a tabela 'profiles' existe.", insertError);
        }

        setUser({
          id: newProfile.id,
          name: newProfile.name,
          email: authUser.email || '',
          role: newProfile.role as UserRole,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Erro no AuthContext:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfileState = (updates: Partial<AppUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signInWithGoogle, signInWithEmail, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
