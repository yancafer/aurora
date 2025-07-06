-- Migration para criar tabela de histórico de apostas
CREATE TABLE IF NOT EXISTS public.bet_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    analysis_id BIGINT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    market TEXT NOT NULL,
    odd_value DECIMAL(10,2) NOT NULL,
    expected_value DECIMAL(10,4),
    estimated_probability DECIMAL(10,4),
    fixture_date TIMESTAMP,
    bet_amount DECIMAL(10,2) DEFAULT 0,
    potential_return DECIMAL(10,2),
    actual_result TEXT, -- 'win', 'loss', 'void', 'half_win', 'half_loss'
    status TEXT DEFAULT 'pending', -- 'pending', 'settled', 'cancelled'
    notes TEXT,
    bet_placed_at TIMESTAMP DEFAULT NOW(),
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON public.bet_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_history_status ON public.bet_history(status);
CREATE INDEX IF NOT EXISTS idx_bet_history_fixture_date ON public.bet_history(fixture_date);

-- RLS (Row Level Security)
ALTER TABLE public.bet_history ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas suas próprias apostas
CREATE POLICY "Users can view own bet history" ON public.bet_history
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Policy para usuários criarem suas próprias apostas
CREATE POLICY "Users can insert own bet history" ON public.bet_history
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Policy para usuários atualizarem suas próprias apostas
CREATE POLICY "Users can update own bet history" ON public.bet_history
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Policy para usuários excluírem suas próprias apostas
CREATE POLICY "Users can delete own bet history" ON public.bet_history
    FOR DELETE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );
