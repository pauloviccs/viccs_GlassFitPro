-- =============================================================================
-- 🔒 GlassFitPro — Script de Correção v2 — Bucket Listing
-- Data: 2026-05-04
-- Objetivo: Resolver os 3 WARNINGS restantes de "Public Bucket Allows Listing"
-- =============================================================================
-- ⚠️  INSTRUÇÕES:
--     1. Abra o painel do Supabase → SQL Editor
--     2. Cole TODO este script
--     3. Clique em "Run" (▶)
--     4. Após executar, volte em Database → Linter e revalide
-- =============================================================================
--
-- POR QUE ISSO FUNCIONA:
-- ─────────────────────
-- Os buckets avatars, banners e feed_images são PÚBLICOS.
-- Isso significa que qualquer URL de objeto tipo:
--   https://xxx.supabase.co/storage/v1/object/public/avatars/meu-avatar.jpg
-- já é acessível DIRETAMENTE, sem nenhuma policy de SELECT.
--
-- A policy SELECT na tabela storage.objects controla apenas a operação
-- de LISTAGEM (supabase.storage.from('bucket').list()), que é tipo dar
-- um "ls" no diretório. O app NÃO usa .list() — ele só usa .upload()
-- e .getPublicUrl(), que é montagem de URL no client sem bater no banco.
--
-- Portanto: remover a policy SELECT elimina o warning sem quebrar nada.
-- =============================================================================


-- ---- AVATARS: Remover policy de listagem ----
DROP POLICY IF EXISTS "Avatars Scoped Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;

-- ---- BANNERS: Remover policy de listagem ----
DROP POLICY IF EXISTS "Banners Scoped Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Banners Public Access" ON storage.objects;

-- ---- FEED IMAGES: Remover policy de listagem ----
DROP POLICY IF EXISTS "Feed Images Scoped Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Feed Images Public Access" ON storage.objects;


-- =============================================================================
-- ✅ As policies de INSERT e UPDATE continuam intactas:
--    - "Avatars Upload Access"   (INSERT, authenticated)
--    - "Avatars Update Access"   (UPDATE, authenticated)
--    - "Banners Upload Access"   (INSERT, authenticated)
--    - "Banners Update Access"   (UPDATE, authenticated)
--    - "Feed Images Upload Access"  (INSERT, authenticated)
--    - "Feed Images Update Access"  (UPDATE, authenticated)
--    - "Feed Images Delete Access"  (DELETE, authenticated)
-- =============================================================================


-- =============================================================================
-- 🔍 VERIFICAÇÃO — Rode isso separadamente para confirmar que as policies
--    de SELECT foram removidas e as de INSERT/UPDATE continuam:
-- =============================================================================
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;
-- =============================================================================
