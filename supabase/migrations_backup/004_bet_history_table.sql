-- Migration para criar tabela de histórico de apostas
CREATE TABLE bet_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id BIGINT REFERENCES analyses(id) ON DELETE SET NULL,
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
CREATE INDEX idx_bet_history_user_id ON bet_history(user_id);
CREATE INDEX idx_bet_history_status ON bet_history(status);
CREATE INDEX idx_bet_history_fixture_date ON bet_history(fixture_date);

-- RLS (Row Level Security)
ALTER TABLE bet_history ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas suas próprias apostas
CREATE POLICY "Users can view own bet history" ON bet_history
    FOR SELECT USING (auth.uid() = user_id);

-- Policy para usuários criarem suas próprias apostas
CREATE POLICY "Users can insert own bet history" ON bet_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy para usuários atualizarem suas próprias apostas
CREATE POLICY "Users can update own bet history" ON bet_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para usuários excluírem suas próprias apostas
CREATE POLICY "Users can delete own bet history" ON bet_history
    FOR DELETE USING (auth.uid() = user_id);
