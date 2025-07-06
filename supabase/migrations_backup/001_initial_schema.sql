-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create fixtures table (dump diário)
CREATE TABLE public.fixtures (
  id SERIAL PRIMARY KEY,
  api_fixture_id INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  status JSONB NOT NULL,
  venue JSONB NOT NULL,
  teams JSONB NOT NULL,
  goals JSONB,
  score JSONB,
  league JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create odds table
CREATE TABLE public.odds (
  id SERIAL PRIMARY KEY,
  fixture_id INTEGER REFERENCES public.fixtures(id) ON DELETE CASCADE,
  api_fixture_id INTEGER NOT NULL,
  bookmaker_id INTEGER NOT NULL,
  bookmaker_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analyses table
CREATE TABLE public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fixture_id INTEGER REFERENCES public.fixtures(id) ON DELETE CASCADE NOT NULL,
  api_fixture_id INTEGER NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  market TEXT NOT NULL,
  odd_value DECIMAL(10,2) NOT NULL,
  bookmaker TEXT NOT NULL,
  implicit_probability DECIMAL(5,2) NOT NULL,
  estimated_probability DECIMAL(5,2) NOT NULL,
  is_manual_estimate BOOLEAN DEFAULT false,
  expected_value DECIMAL(10,4) NOT NULL,
  is_value_bet BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  choice TEXT NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  odd_value DECIMAL(10,2) NOT NULL,
  potential_return DECIMAL(10,2) NOT NULL,
  result TEXT CHECK (result IN ('win', 'lose', 'pending')) DEFAULT 'pending',
  profit_loss DECIMAL(10,2),
  match_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analyses policies
CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Bets policies
CREATE POLICY "Users can view own bets" ON public.bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets" ON public.bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bets" ON public.bets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bets" ON public.bets
  FOR DELETE USING (auth.uid() = user_id);

-- Fixtures and odds are public (read-only for users)
CREATE POLICY "Anyone can view fixtures" ON public.fixtures
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view odds" ON public.odds
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_fixtures_date ON public.fixtures(date);
CREATE INDEX idx_fixtures_api_id ON public.fixtures(api_fixture_id);
CREATE INDEX idx_odds_fixture_id ON public.odds(fixture_id);
CREATE INDEX idx_odds_api_fixture_id ON public.odds(api_fixture_id);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_fixture_id ON public.analyses(fixture_id);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_analysis_id ON public.bets(analysis_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
