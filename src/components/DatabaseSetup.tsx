"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SetupResult {
  success: boolean;
  message: string;
  details?: string;
}

export default function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);

  const createBetHistoryTable = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // SQL para criar a tabela bet_history
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.bet_history (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            market TEXT NOT NULL,
            odd_value DECIMAL(10,2) NOT NULL,
            bet_amount DECIMAL(10,2) DEFAULT 0,
            potential_return DECIMAL(10,2),
            actual_result TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            fixture_date TIMESTAMP,
            bet_placed_at TIMESTAMP DEFAULT NOW(),
            settled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON public.bet_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_bet_history_status ON public.bet_history(status);
        CREATE INDEX IF NOT EXISTS idx_bet_history_fixture_date ON public.bet_history(fixture_date);

        -- Configurar RLS (Row Level Security)
        ALTER TABLE public.bet_history ENABLE ROW LEVEL SECURITY;

        -- Policies de segurança
        DROP POLICY IF EXISTS "Users can view own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can insert own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can update own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can delete own bet history" ON public.bet_history;

        CREATE POLICY "Users can view own bet history" ON public.bet_history
            FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can insert own bet history" ON public.bet_history
            FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can update own bet history" ON public.bet_history
            FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can delete own bet history" ON public.bet_history
            FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
      `;

      // Tentar criar a tabela usando diferentes métodos
      let success = false;
      let errorDetails = '';

      // Método 1: Tentar inserir para testar se a tabela existe
      const { error: testError } = await supabase
        .from('bet_history')
        .select('id')
        .limit(1);

      if (!testError) {
        setResult({
          success: true,
          message: 'Tabela bet_history já existe e está funcionando!',
        });
        return;
      }

      // Método 2: Usar o service role se disponível
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey,
            {
              auth: { autoRefreshToken: false, persistSession: false }
            }
          );

          // Tentar executar SQL (se houver RPC disponível)
          const { error: rpcError } = await adminClient.rpc('exec_sql', {
            query: createTableSQL
          });

          if (!rpcError) {
            success = true;
          } else {
            errorDetails += `RPC Error: ${rpcError.message}. `;
          }
        } catch (error) {
          errorDetails += `Service Role Error: ${error}. `;
        }
      }

      if (success) {
        setResult({
          success: true,
          message: 'Tabela bet_history criada com sucesso!',
        });
      } else {
        setResult({
          success: false,
          message: 'Não foi possível criar a tabela automaticamente.',
          details: `${errorDetails}\n\nPor favor, execute o SQL manualmente no Supabase Studio:\n\n${createTableSQL}`,
        });
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao tentar criar a tabela.',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testBettingFlow = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Importar e executar o teste
      const { testBettingFlow } = await import('@/scripts/test-betting-flow');
      await testBettingFlow();

      setResult({
        success: true,
        message: 'Teste de fluxo de apostas executado! Verifique o console para detalhes.',
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao executar teste de fluxo.',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠️ Setup do Banco de Dados - Aurora</h1>

      <div className="grid gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">1. Criar Tabela bet_history</h2>
          <p className="text-gray-600 mb-4">
            Cria a tabela necessária para armazenar o histórico de apostas.
          </p>
          <button
            onClick={createBetHistoryTable}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? '⏳ Criando...' : '🔨 Criar Tabela'}
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">2. Testar Fluxo de Apostas</h2>
          <p className="text-gray-600 mb-4">
            Executa um teste completo do fluxo de apostas (criar, consultar, atualizar, deletar).
          </p>
          <button
            onClick={testBettingFlow}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? '⏳ Testando...' : '🧪 Testar Fluxo'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`border rounded-lg p-4 ${result.success
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
          }`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'
            }`}>
            {result.success ? '✅ Sucesso!' : '❌ Erro'}
          </h3>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
          {result.details && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">
                Ver detalhes
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {result.details}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="mt-8 border border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          📋 Instruções Manuais (se necessário)
        </h3>
        <ol className="text-yellow-700 space-y-2">
          <li>1. Acesse: <a href="https://app.supabase.com/project/kliueivioyijupyqpfyu" target="_blank" rel="noopener noreferrer" className="underline">Supabase Studio</a></li>
          <li>2. Vá em &quot;SQL Editor&quot;</li>
          <li>3. Cole o conteúdo do arquivo <code>setup_complete_database.sql</code></li>
          <li>4. Execute o script</li>
          <li>5. Teste novamente usando os botões acima</li>
        </ol>
      </div>
    </div>
  );
}
