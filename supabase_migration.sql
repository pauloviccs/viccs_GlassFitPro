-- Corrigir o dado existente que foi salvo com data errada (UTC ao invés de BRT)
-- A segunda-feira de 03/03/2026 foi salva como 02/03/2026 por causa do bug de fuso horário
UPDATE public.weekly_progress_history
SET week_start_date = '2026-03-03'
WHERE week_start_date = '2026-03-02';
