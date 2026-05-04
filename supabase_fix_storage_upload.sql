-- =====================================================================
-- FIX: Storage Upload RLS — Corrigir "new row violates row-level security policy"
-- =====================================================================
-- Problema: Uploads para buckets 'avatars', 'banners' e 'feed_images'
-- falham com erro de RLS. Causas possíveis:
--   1. auth.role() pode não retornar 'authenticated' em certas configs
--   2. upsert:true precisa de SELECT policy para verificar existência
--   3. Policies anteriores foram dropadas sem reposição adequada
--
-- Solução: Recriar TODAS as policies de storage de forma robusta,
-- usando auth.uid() IS NOT NULL (mais confiável que auth.role()).
--
-- INSTRUÇÕES: Execute este SQL no SQL Editor do Supabase Dashboard.
-- =====================================================================


-- =====================================================================
-- PASSO 1: Limpar TODAS as policies existentes dos buckets do app
-- =====================================================================
DROP POLICY IF EXISTS "Avatars Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Scoped Read Access" ON storage.objects;

DROP POLICY IF EXISTS "Banners Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Banners Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Banners Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Banners Scoped Read Access" ON storage.objects;

DROP POLICY IF EXISTS "Feed Images Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Feed Images Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Feed Images Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Feed Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Feed Images Scoped Read Access" ON storage.objects;


-- =====================================================================
-- PASSO 2: Recriar policies usando auth.uid() IS NOT NULL
-- (Mais robusto que auth.role() = 'authenticated')
-- =====================================================================

-- ---- AVATARS ----
-- INSERT: Qualquer usuário logado pode fazer upload
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- UPDATE: Qualquer usuário logado pode atualizar (upsert)
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- SELECT: Necessário para upsert funcionar (verifica se arquivo já existe)
-- Buckets públicos servem URLs diretamente, mas o upsert precisa disso.
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');


-- ---- BANNERS ----
CREATE POLICY "banners_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "banners_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "banners_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'banners');


-- ---- FEED IMAGES ----
CREATE POLICY "feed_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'feed_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "feed_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'feed_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "feed_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'feed_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "feed_images_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'feed_images');


-- =====================================================================
-- VERIFICAÇÃO: Rode isso separadamente para confirmar:
-- =====================================================================
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;
--
-- Deve listar:
--   avatars_insert (INSERT), avatars_update (UPDATE), avatars_select (SELECT)
--   banners_insert (INSERT), banners_update (UPDATE), banners_select (SELECT)
--   feed_images_insert (INSERT), feed_images_update (UPDATE),
--   feed_images_delete (DELETE), feed_images_select (SELECT)
-- =====================================================================
