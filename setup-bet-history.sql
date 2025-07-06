-- ===================================================================
-- SETUP COMPLETO PARA AURORA - TABELA BET_HISTORY
-- Execute este SQL no Supabase Studio para criar a funcionalidade de apostas
-- ===================================================================

-- 1. CRIAR TABELA BET_HISTORY
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.bet_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    market TEXT NOT NULL,
    odd_value DECIMAL(10,2) NOT NULL,
    bet_amount DECIMAL(10,2) DEFAULT 0,
    potential_return DECIMAL(10,2),
    actual_result TEXT, -- 'win', 'loss', 'void', 'half_win', 'half_loss'
    status TEXT DEFAULT 'pending', -- 'pending', 'settled', 'cancelled'
    notes TEXT,
    fixture_date TIMESTAMP,
    bet_placed_at TIMESTAMP DEFAULT NOW(),
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON public.bet_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_history_status ON public.bet_history(status);
CREATE INDEX IF NOT EXISTS idx_bet_history_fixture_date ON public.bet_history(fixture_date);
CREATE INDEX IF NOT EXISTS idx_bet_history_bet_placed_at ON public.bet_history(bet_placed_at);

-- 3. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ===================================================================
ALTER TABLE public.bet_history ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA
-- ===================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own bet history" ON public.bet_history;
DROP POLICY IF EXISTS "Users can insert own bet history" ON public.bet_history;
DROP POLICY IF EXISTS "Users can update own bet history" ON public.bet_history;
DROP POLICY IF EXISTS "Users can delete own bet history" ON public.bet_history;

-- Política para visualizar apostas
CREATE POLICY "Users can view own bet history" ON public.bet_history
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Política para inserir apostas
CREATE POLICY "Users can insert own bet history" ON public.bet_history
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Política para atualizar apostas
CREATE POLICY "Users can update own bet history" ON public.bet_history
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- Política para deletar apostas
CREATE POLICY "Users can delete own bet history" ON public.bet_history
    FOR DELETE USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        user_id = '00000000-0000-0000-0000-000000000000'::uuid
    );

-- 5. INSERIR DADOS DE TESTE (OPCIONAL)
-- ===================================================================
INSERT INTO public.bet_history (
    user_id,
    home_team,
    away_team,
    market,
    odd_value,
    bet_amount,
    potential_return,
    status,
    notes,
    fixture_date
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    'Flamengo',
    'Palmeiras',
    'Vitória da Casa',
    2.30,
    50.00,
    115.00,
    'pending',
    'Aposta de teste do sistema Aurora',
    NOW() + INTERVAL '1 day'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Santos',
    'Corinthians',
    'Mais de 2.5 Gols',
    1.85,
    30.00,
    55.50,
    'pending',
    'Teste - Clássico com tendência de gols',
    NOW() + INTERVAL '2 days'
);

-- 6. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- ===================================================================
SELECT 
    'Tabela bet_history criada!' as status,
    count(*) as total_registros
FROM public.bet_history;

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'bet_history';

-- Verificar políticas
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'bet_history';

-- ===================================================================
-- SETUP CONCLUÍDO!
-- 
-- Agora você pode:
-- 1. Executar: npx tsx src/scripts/test-betting-flow.ts
-- 2. Acessar a página de testes: http://localhost:3000/testing
-- 3. Usar o componente BettingSimulator para testar apostas
-- ===================================================================
