-- =====================================================================
-- MIGRATION: GlassFitPro v2 — Multi-Teacher System
-- Execute no SQL Editor do Supabase (em ordem)
-- =====================================================================

-- 1. ATUALIZAR CONSTRAINT DE ROLE EM PROFILES
-- =====================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'super_admin'));

-- Promover o admin principal para super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'pauloviccsdesign@gmail.com'
);

-- 2. ADICIONAR teacher_id EM EXERCISES (Biblioteca Privada por Professor)
-- =====================================================================
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Atribuir exercícios existentes ao super_admin
UPDATE public.exercises
SET teacher_id = (
  SELECT id FROM auth.users WHERE email = 'pauloviccsdesign@gmail.com'
)
WHERE teacher_id IS NULL;

-- 3. ADICIONAR teacher_id EM WORKOUT_TEMPLATES (Templates Privados por Professor)
-- =====================================================================
ALTER TABLE public.workout_templates
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Atribuir templates existentes ao super_admin
UPDATE public.workout_templates
SET teacher_id = (
  SELECT id FROM auth.users WHERE email = 'pauloviccsdesign@gmail.com'
)
WHERE teacher_id IS NULL;

-- 4. TABELA TEACHER_STUDENTS (Vínculo Professor ↔ Aluno)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.teacher_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (teacher_id, student_id)
);

ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;

-- Professores/super_admin podem ver e gerenciar seus vínculos
CREATE POLICY "Professores gerenciam seus alunos" 
ON public.teacher_students FOR ALL TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Alunos podem ver seus próprios vínculos (para saber quem é seu professor)
CREATE POLICY "Alunos veem seus vínculos"
ON public.teacher_students FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- Vincular alunos existentes ao super_admin
INSERT INTO public.teacher_students (teacher_id, student_id)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'pauloviccsdesign@gmail.com'),
  p.id
FROM public.profiles p
WHERE p.role = 'student'
ON CONFLICT (teacher_id, student_id) DO NOTHING;


-- 5. TABELA TEACHER_REQUESTS (Solicitações de Aprovação)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.teacher_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

-- Super admin pode ver e gerenciar todas as solicitações
CREATE POLICY "Super admin gerencia solicitações"
ON public.teacher_requests FOR ALL TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Usuário pode ver e criar sua própria solicitação
CREATE POLICY "Usuário cria sua solicitação"
ON public.teacher_requests FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário vê sua solicitação"
ON public.teacher_requests FOR SELECT TO authenticated
USING (user_id = auth.uid());


-- 6. ATUALIZAR RLS DE EXERCISES (Privada por Professor)
-- =====================================================================
-- Remover policies antigas
DROP POLICY IF EXISTS "Visualização de exercícios pública (para autenticados)" ON public.exercises;
DROP POLICY IF EXISTS "Somente admins podem modificar exercícios" ON public.exercises;

-- Alunos podem ver exercícios dos seus professores
CREATE POLICY "Alunos veem exercícios dos seus professores"
ON public.exercises FOR SELECT TO authenticated
USING (
  -- Professor vê seus próprios exercícios
  teacher_id = auth.uid()
  -- Super admin vê tudo
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  -- Aluno vê exercícios dos professores vinculados
  OR teacher_id IN (
    SELECT ts.teacher_id FROM public.teacher_students ts WHERE ts.student_id = auth.uid()
  )
);

-- Professores gerenciam seus próprios exercícios
CREATE POLICY "Professores gerenciam seus exercícios"
ON public.exercises FOR INSERT TO authenticated
WITH CHECK (
  teacher_id = auth.uid()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Professores atualizam seus exercícios"
ON public.exercises FOR UPDATE TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Professores deletam seus exercícios"
ON public.exercises FOR DELETE TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);


-- 7. ATUALIZAR RLS DE WORKOUT_TEMPLATES (Privado por Professor)
-- =====================================================================
-- Criar policies (as tabelas podem não ter tido policies antes)
DROP POLICY IF EXISTS "Templates visíveis para autenticados" ON public.workout_templates;
DROP POLICY IF EXISTS "Admins gerenciam templates" ON public.workout_templates;

CREATE POLICY "Professores veem seus templates"
ON public.workout_templates FOR SELECT TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Professores criam seus templates"
ON public.workout_templates FOR INSERT TO authenticated
WITH CHECK (
  teacher_id = auth.uid()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Professores atualizam seus templates"
ON public.workout_templates FOR UPDATE TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Professores deletam seus templates"
ON public.workout_templates FOR DELETE TO authenticated
USING (
  teacher_id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);
