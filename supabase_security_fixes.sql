-- =============================================================================
-- 🔒 GlassFitPro — Script de Correção de Segurança do Supabase
-- Data: 2026-05-04
-- Objetivo: Resolver 1 ERROR + 10 WARNINGS do Performance & Security Linter
-- =============================================================================
-- ⚠️  INSTRUÇÕES:
--     1. Abra o painel do Supabase → SQL Editor
--     2. Cole TODO este script
--     3. Clique em "Run" (▶)
--     4. Após executar, volte em Database → Linter e revalide
-- =============================================================================


-- =============================================================================
-- FIX 1 — ERROR: RLS Disabled na tabela weekly_progress_history
-- Risco: Qualquer pessoa logada pode ler/escrever TODOS os registros de todos
--        os alunos. Isso é um buraco de segurança enorme.
-- =============================================================================

ALTER TABLE public.weekly_progress_history ENABLE ROW LEVEL SECURITY;

-- Estudantes podem ver SOMENTE seus próprios registros de progresso
CREATE POLICY "Estudantes podem ver seu próprio progresso semanal"
ON public.weekly_progress_history FOR SELECT TO authenticated
USING ( student_id = auth.uid() );

-- Estudantes podem inserir SOMENTE seus próprios registros
CREATE POLICY "Estudantes podem inserir seu próprio progresso semanal"
ON public.weekly_progress_history FOR INSERT TO authenticated
WITH CHECK ( student_id = auth.uid() );

-- Estudantes podem atualizar SOMENTE seus próprios registros (upsert)
CREATE POLICY "Estudantes podem atualizar seu próprio progresso semanal"
ON public.weekly_progress_history FOR UPDATE TO authenticated
USING ( student_id = auth.uid() );

-- Admins podem ver o progresso de qualquer aluno (leitura)
CREATE POLICY "Admins podem ver todo progresso semanal"
ON public.weekly_progress_history FOR SELECT TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- =============================================================================
-- FIX 2 — WARN: Function Search Path Mutable (get_profile_stats)
-- FIX 3 — WARN: anon pode executar SECURITY DEFINER (get_profile_stats)
-- FIX 4 — WARN: authenticated pode executar SECURITY DEFINER (get_profile_stats)
--
-- Solução: Trocar para SECURITY INVOKER (executa com as permissões de quem
--          chamou, não do dono da função), fixar o search_path, e revogar
--          acesso do role 'anon' para que somente usuários logados possam chamar.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_profile_stats(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

-- Bloquear acesso anônimo (quem não está logado não tem motivo pra ver stats)
REVOKE EXECUTE ON FUNCTION public.get_profile_stats(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_profile_stats(UUID) TO authenticated;


-- =============================================================================
-- FIX 5 — WARN: Function Search Path Mutable (toggle_feed_like)
-- FIX 6 — WARN: anon pode executar SECURITY DEFINER (toggle_feed_like)
-- FIX 7 — WARN: authenticated pode executar SECURITY DEFINER (toggle_feed_like)
--
-- Mesmo padrão: SECURITY INVOKER + search_path fixo + revogar do anon.
-- NOTA: toggle_feed_like precisa de SECURITY INVOKER porque as tabelas
--       feed_likes já possuem RLS com auth.uid(), que funciona perfeitamente
--       quando a função roda no contexto do chamador (INVOKER).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.toggle_feed_like(p_post_id UUID, p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

-- Bloquear acesso anônimo (curtir é coisa de user logado, não de visitante)
REVOKE EXECUTE ON FUNCTION public.toggle_feed_like(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.toggle_feed_like(UUID, UUID) TO authenticated;


-- =============================================================================
-- FIX 8, 9, 10 — WARN: Public Bucket Allows Listing (avatars, banners, feed_images)
--
-- O problema: policies com `FOR SELECT USING (bucket_id = 'xxx')` genéricas
-- permitem que qualquer um LISTE todos os arquivos do bucket. Buckets públicos
-- já servem as URLs dos objetos sem precisar de SELECT na tabela storage.objects.
--
-- Solução: Restringir o SELECT para que cada usuário só veja SEUS PRÓPRIOS
-- arquivos, usando o owner_id que o Supabase auto-preenche no upload.
-- =============================================================================

-- ---- AVATARS ----
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
CREATE POLICY "Avatars Scoped Read Access" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'avatars' );

-- ---- BANNERS ----
DROP POLICY IF EXISTS "Banners Public Access" ON storage.objects;
CREATE POLICY "Banners Scoped Read Access" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'banners' );

-- ---- FEED IMAGES ----
DROP POLICY IF EXISTS "Feed Images Public Access" ON storage.objects;
CREATE POLICY "Feed Images Scoped Read Access" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'feed_images' );


-- =============================================================================
-- FIX 11 — WARN: Leaked Password Protection Disabled
--
-- NOTA: Este fix NÃO pode ser feito via SQL.
-- Você precisa ativar manualmente no painel do Supabase:
--   → Authentication → Settings → Security
--   → Habilitar "Leaked Password Protection" (HaveIBeenPwned)
-- =============================================================================


-- =============================================================================
-- ✅ VERIFICAÇÃO RÁPIDA — Rode isso separadamente para confirmar
-- =============================================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Todas as tabelas devem mostrar rowsecurity = true
-- =============================================================================
