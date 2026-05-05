-- =====================================================================
-- FIX: RLS de workout_days e workout_exercises
-- Problema: Policies originais só permitem role='admin'.
--           Com o sistema multi-teacher, o super_admin (que tem role='super_admin')
--           não passa na verificação e recebe 403 (42501).
-- Solução:  Recriar as policies aceitando 'admin' OU 'super_admin',
--           e escopar por teacher_students quando relevante.
-- 100% IDEMPOTENTE — Pode ser re-executado sem erros.
-- =====================================================================


-- =========================================================
-- 1. WORKOUT_DAYS — Policies de CRUD para Professores
-- =========================================================

-- Drop das policies antigas
DROP POLICY IF EXISTS "Admins podem gerenciar qualquer workout_days" ON public.workout_days;
DROP POLICY IF EXISTS "Estudantes podem ver seus próprios workout_days" ON public.workout_days;
DROP POLICY IF EXISTS "Professores gerenciam workout_days dos seus alunos" ON public.workout_days;
DROP POLICY IF EXISTS "Professores inserem workout_days dos seus alunos" ON public.workout_days;
DROP POLICY IF EXISTS "Professores atualizam workout_days dos seus alunos" ON public.workout_days;
DROP POLICY IF EXISTS "Professores deletam workout_days dos seus alunos" ON public.workout_days;
DROP POLICY IF EXISTS "Alunos veem seus workout_days" ON public.workout_days;

-- SELECT: Professores veem workout_days dos seus alunos + super_admin vê tudo + aluno vê o próprio
CREATE POLICY "Professores gerenciam workout_days dos seus alunos"
ON public.workout_days FOR SELECT TO authenticated
USING (
  -- O aluno vê os próprios dias
  student_id = auth.uid()
  -- Super admin vê tudo
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  -- Professor vê os dias dos alunos vinculados
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND student_id IN (
      SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
    )
  )
);

-- INSERT: Professores (admin/super_admin) criam dias de treino para seus alunos
CREATE POLICY "Professores inserem workout_days dos seus alunos"
ON public.workout_days FOR INSERT TO authenticated
WITH CHECK (
  -- Super admin pode inserir para qualquer aluno
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  -- Professor pode inserir para alunos vinculados
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND student_id IN (
      SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
    )
  )
);

-- UPDATE: Professores atualizam dias de treino dos seus alunos
CREATE POLICY "Professores atualizam workout_days dos seus alunos"
ON public.workout_days FOR UPDATE TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND student_id IN (
      SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
    )
  )
);

-- DELETE: Professores deletam dias de treino dos seus alunos
CREATE POLICY "Professores deletam workout_days dos seus alunos"
ON public.workout_days FOR DELETE TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND student_id IN (
      SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
    )
  )
);


-- =========================================================
-- 2. WORKOUT_EXERCISES — Policies de CRUD para Professores
-- =========================================================

-- Drop das policies antigas
DROP POLICY IF EXISTS "Admins podem gerenciar tudo em workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Estudantes podem ver os items de seus treinos" ON public.workout_exercises;
DROP POLICY IF EXISTS "Estudantes podem editar os items dos seus treinos (para marcar completo)" ON public.workout_exercises;
DROP POLICY IF EXISTS "Professores gerenciam workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Professores inserem workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Professores atualizam workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Professores deletam workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Alunos veem seus workout_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Alunos marcam exercícios como completos" ON public.workout_exercises;

-- SELECT: Todos que podem ver o workout_day podem ver os exercícios
CREATE POLICY "Alunos veem seus workout_exercises"
ON public.workout_exercises FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    WHERE wd.id = workout_exercises.workout_day_id
    AND (
      wd.student_id = auth.uid()
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
      OR (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        AND wd.student_id IN (
          SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
        )
      )
    )
  )
);

-- INSERT: Professores inserem exercícios nos treinos dos seus alunos
CREATE POLICY "Professores inserem workout_exercises"
ON public.workout_exercises FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    WHERE wd.id = workout_exercises.workout_day_id
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
      OR (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        AND wd.student_id IN (
          SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
        )
      )
    )
  )
);

-- UPDATE: Professores E alunos (para marcar completed) podem editar
CREATE POLICY "Professores atualizam workout_exercises"
ON public.workout_exercises FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    WHERE wd.id = workout_exercises.workout_day_id
    AND (
      wd.student_id = auth.uid()
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
      OR (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        AND wd.student_id IN (
          SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
        )
      )
    )
  )
);

-- DELETE: Professores deletam exercícios dos treinos
CREATE POLICY "Professores deletam workout_exercises"
ON public.workout_exercises FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    WHERE wd.id = workout_exercises.workout_day_id
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
      OR (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        AND wd.student_id IN (
          SELECT ts.student_id FROM public.teacher_students ts WHERE ts.teacher_id = auth.uid()
        )
      )
    )
  )
);
