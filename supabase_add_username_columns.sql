-- =====================================================================
-- MIGRAÇÃO: Adicionar colunas username e last_username_update à profiles
-- =====================================================================
-- Problema: O código do frontend referencia 'username' e 'last_username_update'
-- na tabela 'profiles', mas essas colunas nunca foram criadas.
-- Isso causa o erro:
--   "Could not find the 'last_username_update' column of 'profiles' in the schema cache"
--
-- INSTRUÇÕES: Execute este SQL no SQL Editor do Supabase Dashboard.
-- =====================================================================

-- 1. Adicionar coluna username (único, alfanumérico + underscore)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Adicionar constraint UNIQUE para impedir duplicatas de username
-- (Só adiciona se não existir — idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
END $$;

-- 3. Adicionar coluna last_username_update (timestamp para cooldown de 3h)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_username_update TIMESTAMP WITH TIME ZONE;

-- =====================================================================
-- VERIFICAÇÃO: Após executar, rode esta query para confirmar:
--   SELECT column_name, data_type 
--   FROM information_schema.columns 
--   WHERE table_name = 'profiles' 
--   ORDER BY ordinal_position;
-- Você deve ver 'username' e 'last_username_update' na lista.
-- =====================================================================
