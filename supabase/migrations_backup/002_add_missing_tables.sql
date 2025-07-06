-- Adicionar tabelas que estão faltando no schema

-- Create team_statistics table
CREATE TABLE IF NOT EXISTS public.team_statistics (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  statistics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(team_id, league_id, season)
);

-- Create standings table
CREATE TABLE IF NOT EXISTS public.standings (
  id SERIAL PRIMARY KEY,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  standings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(league_id, season)
);

-- Enable RLS for new tables
ALTER TABLE public.team_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

-- Public read access for team_statistics and standings
CREATE POLICY "Anyone can view team_statistics" ON public.team_statistics
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view standings" ON public.standings
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_statistics_team_id ON public.team_statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_team_statistics_league_id ON public.team_statistics(league_id);
CREATE INDEX IF NOT EXISTS idx_team_statistics_season ON public.team_statistics(season);
CREATE INDEX IF NOT EXISTS idx_standings_league_id ON public.standings(league_id);
CREATE INDEX IF NOT EXISTS idx_standings_season ON public.standings(season);
