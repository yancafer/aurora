import { supabase } from "@/lib/supabase";

async function createMinimalBetHistory() {
  console.log("🎯 Criando tabela bet_history de forma simplificada...");

  try {
    // Primeiro, vamos tentar usar o service role key diretamente
    console.log("🔑 Verificando configuração atual...");

    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("URL:", url);
    console.log("Service Key disponível:", !!serviceKey);

    if (!serviceKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada");
      return;
    }

    // Criar um cliente com service role
    const { createClient } = await import("@supabase/supabase-js");
    const adminSupabase = createClient(url!, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🛠️ Cliente admin criado, executando SQL...");

    // SQL simplificado para criar apenas o que precisamos
    const sql = `
      -- Criar tabela bet_history se não existir
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
    `;

    // Tentar executar usando RPC personalizada
    const { data, error } = await adminSupabase.rpc("exec_sql", { query: sql });

    if (error) {
      console.log(
        "❌ RPC exec_sql não disponível, tentando método alternativo..."
      );

      // Método alternativo: tentar inserir um registro de teste para forçar criação
      console.log("🔄 Testando se a tabela já existe...");

      const { error: testError } = await supabase
        .from("bet_history")
        .select("id")
        .limit(1);

      if (testError) {
        console.log("❌ Tabela não existe. Erro:", testError.message);

        console.log("\n" + "=".repeat(60));
        console.log("🚨 AÇÃO NECESSÁRIA - EXECUTE NO SUPABASE STUDIO:");
        console.log("=".repeat(60));
        console.log(
          "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu"
        );
        console.log("2. Vá em 'SQL Editor'");
        console.log("3. Cole e execute este SQL:");
        console.log("\n" + "-".repeat(40));
        console.log(sql);
        console.log("-".repeat(40));
        console.log(
          "\n4. Depois execute: npx tsx src/scripts/test-betting-flow.ts"
        );
        console.log("=".repeat(60));

        return false;
      } else {
        console.log("✅ Tabela bet_history já existe!");
        return true;
      }
    } else {
      console.log("✅ SQL executado com sucesso!");
      return true;
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    return false;
  }
}

// Executar e testar o fluxo completo
async function runFullTest() {
  console.log("🚀 Iniciando processo completo...");

  const tableCreated = await createMinimalBetHistory();

  if (tableCreated) {
    console.log("\n🧪 Executando teste do fluxo de apostas...");

    // Importar e executar o teste
    try {
      const { testBettingFlow } = await import("./test-betting-flow");
      await testBettingFlow();
    } catch (error) {
      console.error("❌ Erro ao executar teste:", error);
    }
  } else {
    console.log(
      "\n⏸️ Teste pausado. Execute o SQL no Supabase Studio primeiro."
    );
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  runFullTest();
}

export { createMinimalBetHistory };
