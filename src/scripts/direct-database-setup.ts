import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config();

async function directDatabaseSetup() {
  console.log("🚀 Executando setup direto do banco...");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🔗 URL:", url);
  console.log("🔑 Service Key disponível:", !!serviceKey);

  if (!url || !serviceKey) {
    console.error("❌ Variáveis de ambiente faltando!");
    console.error("URL:", url ? "✅" : "❌");
    console.error("Service Key:", serviceKey ? "✅" : "❌");
    return false;
  }

  // Criar cliente com service role
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // SQL mínimo para criar tabela bet_history
    const sql = `
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

    console.log("📋 Executando SQL...");

    // Tentar várias abordagens

    // 1. Tentar RPC padrão
    try {
      const { data, error } = await supabase.rpc("exec_sql", { query: sql });
      if (!error) {
        console.log("✅ Método 1 (RPC exec_sql) funcionou!");
        return true;
      } else {
        console.log("❌ Método 1 falhou:", error.message);
      }
    } catch (e) {
      console.log("❌ Método 1 exception:", e);
    }

    // 2. Tentar RPC com parâmetro sql
    try {
      const { data, error } = await supabase.rpc("exec_sql", { sql });
      if (!error) {
        console.log("✅ Método 2 (RPC com 'sql') funcionou!");
        return true;
      } else {
        console.log("❌ Método 2 falhou:", error.message);
      }
    } catch (e) {
      console.log("❌ Método 2 exception:", e);
    }

    // 3. Tentar usar postgREST direto
    try {
      const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        console.log("✅ Método 3 (postgREST direto) funcionou!");
        return true;
      } else {
        const errorText = await response.text();
        console.log("❌ Método 3 falhou:", response.status, errorText);
      }
    } catch (e) {
      console.log("❌ Método 3 exception:", e);
    }

    // 4. Verificar se a tabela já existe fazendo um select
    try {
      const { data, error } = await supabase
        .from("bet_history")
        .select("id")
        .limit(1);

      if (!error) {
        console.log("✅ Tabela bet_history já existe!");
        return true;
      } else {
        console.log("❌ Tabela não existe. Erro:", error.message);
      }
    } catch (e) {
      console.log("❌ Verificação de existência falhou:", e);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🚨 NENHUM MÉTODO AUTOMÁTICO FUNCIONOU");
    console.log("=".repeat(60));
    console.log("Por favor, execute manualmente no Supabase Studio:");
    console.log(
      "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu"
    );
    console.log("2. Vá em 'SQL Editor'");
    console.log("3. Cole e execute este SQL:");
    console.log("\n" + "-".repeat(40));
    console.log(sql);
    console.log("-".repeat(40));
    console.log("=".repeat(60));

    return false;
  } catch (error) {
    console.error("❌ Erro geral:", error);
    return false;
  }
}

// Função para testar após setup
async function testAfterSetup() {
  console.log("\n🧪 Testando após setup...");

  try {
    // Importar e executar o teste de fluxo
    const { testBettingFlow } = await import("./test-betting-flow");
    await testBettingFlow();
    console.log("✅ Teste concluído!");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

// Executar tudo
async function main() {
  const setupSuccess = await directDatabaseSetup();

  if (setupSuccess) {
    await testAfterSetup();
  } else {
    console.log(
      "\n⏸️ Setup manual necessário. Execute o SQL no Supabase Studio e depois rode:"
    );
    console.log("npx tsx src/scripts/test-betting-flow.ts");
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  main();
}

export { directDatabaseSetup };
