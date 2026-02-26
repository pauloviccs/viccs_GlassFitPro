-- 1. Profiles Table (Linked to Auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies para Profiles
CREATE POLICY "Leitura de Profiles (necessário para checar role sem recursão)" 
ON public.profiles FOR SELECT 
TO authenticated
USING ( true );

CREATE POLICY "Usuários podem ver o próprio profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar qualquer profile" 
ON public.profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Usuários podem inserir o próprio profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Exercises (Biblioteca Global de Exercícios)
CREATE TABLE public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visualização de exercícios pública (para autenticados)" 
ON public.exercises FOR SELECT TO authenticated USING (true);

CREATE POLICY "Somente admins podem modificar exercícios" 
ON public.exercises FOR ALL TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 3. Workout Days (Treinos dos Estudantes divididos por dia)
CREATE TABLE public.workout_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar qualquer workout_days" 
ON public.workout_days FOR ALL TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Estudantes podem ver seus próprios workout_days" 
ON public.workout_days FOR SELECT TO authenticated 
USING ( student_id = auth.uid() );


-- 4. Workout Exercises (Instâncias do exercício dentro do Treino)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar tudo em workout_exercises" 
ON public.workout_exercises FOR ALL TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Estudantes podem ver os items de seus treinos" 
ON public.workout_exercises FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_days 
    WHERE workout_days.id = workout_exercises.workout_day_id 
    AND workout_days.student_id = auth.uid()
  )
);

CREATE POLICY "Estudantes podem editar os items dos seus treinos (para marcar completo)" 
ON public.workout_exercises FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_days 
    WHERE workout_days.id = workout_exercises.workout_day_id 
    AND workout_days.student_id = auth.uid()
  )
);

-- 5. Weight Logs (Registro de Peso do Estudante)
CREATE TABLE public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estudantes podem ver seus próprios pesos" 
ON public.weight_logs FOR SELECT TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Estudantes podem inserir seus próprios pesos" 
ON public.weight_logs FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Estudantes podem deletar seus próprios pesos" 
ON public.weight_logs FOR DELETE TO authenticated 
USING (student_id = auth.uid());

-- 6. Atualizações no Profile para a Feature de "Profile Tab"
ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN bio VARCHAR(150);

-- 7. RPC de Estatísticas (Exercícios Concluídos) para Perfil
CREATE OR REPLACE FUNCTION get_profile_stats(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_completed_exercises INT;
  total_workouts INT;
  result json;
BEGIN
  -- Total de exercícios concluídos
  SELECT COUNT(*) INTO total_completed_exercises
  FROM public.workout_exercises we
  JOIN public.workout_days wd ON wd.id = we.workout_day_id
  WHERE wd.student_id = user_id AND we.completed = true;

  -- Total de treinos planejados na conta
  SELECT COUNT(*) INTO total_workouts
  FROM public.workout_days
  WHERE student_id = user_id;

  result := json_build_object(
    'total_completed_exercises', total_completed_exercises,
    'total_workouts', total_workouts
  );

  RETURN result;
END;
$$;


-- -----------------------------------------------------------------------------------------
-- 8. STORAGE RLS POLICIES (AVATARS & BANNERS)
-- Rode esses scripts para liberar o upload/leitura de imagens nos buckets pelo seu app
-- -----------------------------------------------------------------------------------------

-- Liberar leitura pública do bucket 'avatars'
CREATE POLICY "Avatars Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Liberar upload de imagens para usuários logados no bucket 'avatars'
CREATE POLICY "Avatars Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Liberar atualização para usuários logados
CREATE POLICY "Avatars Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Liberar leitura pública do bucket 'banners'
CREATE POLICY "Banners Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- Liberar upload de imagens para usuários logados no bucket 'banners'
CREATE POLICY "Banners Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Liberar atualização para usuários logados
CREATE POLICY "Banners Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');


-- -----------------------------------------------------------------------------------------
-- 9. FEED (TWITTER-STYLE) TABLES & POLICIES
-- -----------------------------------------------------------------------------------------

-- Tabela de Posts do Feed
CREATE TABLE public.feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content VARCHAR(250) NOT NULL,
  image_url TEXT,
  post_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- CONSTRAINT MATADORA: Garante apenas 1 post por dia por aluno no fuso horário do BD
  CONSTRAINT one_post_per_day UNIQUE (student_id, post_date)
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública do feed para autenticados" 
ON public.feed_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Estudantes inserem seus próprios posts" 
ON public.feed_posts FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Estudantes deletam seus próprios posts" 
ON public.feed_posts FOR DELETE TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Admins podem deletar qualquer post" 
ON public.feed_posts FOR DELETE TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Tabela de Likes do Feed
CREATE TABLE public.feed_likes (
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, student_id)
);

ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de likes pública para autenticados" 
ON public.feed_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Estudantes curtem com seu próprio usuário" 
ON public.feed_likes FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Estudantes descurtem seus próprios likes" 
ON public.feed_likes FOR DELETE TO authenticated 
USING (student_id = auth.uid());

-- Storage RLS para feed_images
-- Liberar leitura pública do bucket 'feed_images'
-- PS: Certifique-se de que o bucket 'feed_images' foi criado no painel do Supabase.
CREATE POLICY "Feed Images Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'feed_images');

CREATE POLICY "Feed Images Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'feed_images' AND auth.role() = 'authenticated');

CREATE POLICY "Feed Images Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'feed_images' AND auth.role() = 'authenticated');

CREATE POLICY "Feed Images Delete Access" ON storage.objects
  FOR DELETE USING (bucket_id = 'feed_images' AND auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------------------
-- 10. FEED RPCs (Para contagens e queries otimizadas)
-- -----------------------------------------------------------------------------------------

-- Função para curtir / descurtir (Toggle Like)
CREATE OR REPLACE FUNCTION toggle_feed_like(p_post_id UUID, p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.feed_likes WHERE post_id = p_post_id AND student_id = p_user_id
  ) INTO like_exists;

  IF like_exists THEN
    DELETE FROM public.feed_likes WHERE post_id = p_post_id AND student_id = p_user_id;
    RETURN false; -- Retorna false indicando que removeu o like
  ELSE
    INSERT INTO public.feed_likes (post_id, student_id) VALUES (p_post_id, p_user_id);
    RETURN true; -- Retorna true indicando que adicionou o like
  END IF;
END;
$$;


-- -----------------------------------------------------------------------------------------
-- 11. FEED COMMENTS
-- -----------------------------------------------------------------------------------------
CREATE TABLE public.feed_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content VARCHAR(250) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- CONSTRAINT MATADORA: 1 comentário por pessoa por post
  CONSTRAINT one_comment_per_post UNIQUE (post_id, student_id)
);

ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de comentários" 
ON public.feed_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Estudantes inserem próprios comentários" 
ON public.feed_comments FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Estudantes deletam próprios comentários" 
ON public.feed_comments FOR DELETE TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Admins podem gerenciar comentários" 
ON public.feed_comments FOR ALL TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
