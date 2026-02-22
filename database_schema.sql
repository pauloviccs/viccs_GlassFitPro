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
CREATE POLICY "Admins podem ver todos os profiles" 
ON public.profiles FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Usuários podem ver o próprio profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

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
