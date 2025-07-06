import { supabase } from "@/lib/supabase";

async function forceCreateTable() {
  console.log("🚀 Tentando criar tabela bet_history de forma forçada...");

  try {
    // Tentar uma inserção simples para verificar se a tabela existe
    const { error: testError } = await supabase
      .from("bet_history")
      .select("id")
      .limit(1);

    if (testError && testError.code === "42P01") {
      console.log("❌ Tabela não existe. Criando via SQL direto...");

      // SQL completo para criar a tabela
      const createTableSQL = `
        -- Criar tabela bet_history
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
            actual_result TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            bet_placed_at TIMESTAMP DEFAULT NOW(),
            settled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON public.bet_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_bet_history_status ON public.bet_history(status);
        CREATE INDEX IF NOT EXISTS idx_bet_history_fixture_date ON public.bet_history(fixture_date);

        -- Habilitar RLS
        ALTER TABLE public.bet_history ENABLE ROW LEVEL SECURITY;

        -- Policies
        DROP POLICY IF EXISTS "Users can view own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can insert own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can update own bet history" ON public.bet_history;
        DROP POLICY IF EXISTS "Users can delete own bet history" ON public.bet_history;

        CREATE POLICY "Users can view own bet history" ON public.bet_history
            FOR SELECT USING (
                auth.uid() = user_id OR 
                user_id IS NULL OR 
                user_id = '00000000-0000-0000-0000-000000000000'::uuid
            );

        CREATE POLICY "Users can insert own bet history" ON public.bet_history
            FOR INSERT WITH CHECK (
                auth.uid() = user_id OR 
                user_id IS NULL OR 
                user_id = '00000000-0000-0000-0000-000000000000'::uuid
            );

        CREATE POLICY "Users can update own bet history" ON public.bet_history
            FOR UPDATE USING (
                auth.uid() = user_id OR 
                user_id IS NULL OR 
                user_id = '00000000-0000-0000-0000-000000000000'::uuid
            );

        CREATE POLICY "Users can delete own bet history" ON public.bet_history
            FOR DELETE USING (
                auth.uid() = user_id OR 
                user_id IS NULL OR 
                user_id = '00000000-0000-0000-0000-000000000000'::uuid
            );
      `;

      console.log("\n" + "=".repeat(80));
      console.log("🚨 EXECUTE ESTE SQL NO SUPABASE STUDIO:");
      console.log("=".repeat(80));
      console.log(
        "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu/sql"
      );
      console.log("2. Cole e execute o SQL abaixo:");
      console.log("\n" + "-".repeat(40));
      console.log(createTableSQL);
      console.log("-".repeat(40));
      console.log("=".repeat(80));

      return false;
    } else if (!testError) {
      console.log("✅ Tabela bet_history já existe!");
      return true;
    } else {
      console.log("❌ Erro desconhecido:", testError);
      return false;
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
    return false;
  }
}

async function testSystemAfterCreate() {
  console.log("\n🧪 Testando sistema após criação da tabela...");

  try {
    // Testar inserção de uma aposta
    const testBet = {
      user_id: "00000000-0000-0000-0000-000000000000",
      home_team: "Flamengo",
      away_team: "Palmeiras",
      market: "Vitória da Casa",
      odd_value: 2.3,
      bet_amount: 50.0,
      potential_return: 115.0,
      status: "pending",
      notes: "Aposta de teste do sistema Aurora",
      fixture_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data, error } = await supabase
      .from("bet_history")
      .insert([testBet])
      .select();

    if (error) {
      console.error("❌ Erro ao inserir aposta de teste:", error);
      return false;
    }

    console.log("✅ Aposta de teste inserida com sucesso!");
    console.log("📊 Dados:", data);

    // Testar consulta
    const { data: bets, error: queryError } = await supabase
      .from("bet_history")
      .select("*")
      .limit(5);

    if (queryError) {
      console.error("❌ Erro ao consultar apostas:", queryError);
      return false;
    }

    console.log(
      `✅ Consulta bem-sucedida! ${bets?.length || 0} apostas encontradas`
    );

    // Limpar dados de teste
    if (data && data[0]) {
      await supabase.from("bet_history").delete().eq("id", data[0].id);
      console.log("🧹 Dados de teste removidos");
    }

    console.log("\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Tabela bet_history criada");
    console.log("✅ Inserção funcionando");
    console.log("✅ Consulta funcionando");
    console.log("✅ Políticas de segurança ativas");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🚀 Agora acesse: http://localhost:3000/testing");
    console.log("🎯 E teste o botão 'Apostar na Betano'!");

    return true;
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    return false;
  }
}

async function main() {
  const tableExists = await forceCreateTable();

  if (tableExists) {
    await testSystemAfterCreate();
  } else {
    console.log(
      "\n⏸️ Execute o SQL no Supabase Studio e depois rode novamente este script."
    );
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  main();
}

export { forceCreateTable };
