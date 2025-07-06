-- Adiciona campos de data/hora do jogo na tabela de análises
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS fixture_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS fixture_timestamp BIGINT;
