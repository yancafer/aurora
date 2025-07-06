import { readFileSync } from "fs";

async function executeSetupViaHTTP() {
  console.log("🚀 Tentando executar setup via HTTP direto...");

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://kliueivioyijupyqpfyu.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    console.error("❌ Service key não encontrada");
    return false;
  }

  try {
    // Ler o SQL do arquivo
    const sqlContent = readFileSync("./setup-bet-history.sql", "utf8");

    console.log("📄 SQL carregado, tentando executar...");

    // Dividir em statements individuais
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 && !stmt.startsWith("--") && !stmt.startsWith("/*")
      );

    console.log(`📋 ${statements.length} statements para executar`);

    // Tentar executar via REST API do PostgREST
    for (let i = 0; i < Math.min(statements.length, 5); i++) {
      const statement = statements[i];

      if (statement.toLowerCase().includes("create table")) {
        console.log(
          `🔨 Executando CREATE TABLE [${i + 1}/${statements.length}]...`
        );

        try {
          const response = await fetch(`${url}/rest/v1/rpc/exec`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
              apikey: serviceKey,
            },
            body: JSON.stringify({ sql: statement }),
          });

          if (response.ok) {
            console.log(`   ✅ Statement ${i + 1} executado`);
          } else {
            const errorText = await response.text();
            console.log(`   ❌ Erro ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.log(`   ❌ Exception: ${error}`);
        }
      }
    }

    // Testar se a tabela foi criada
    console.log("\n🔍 Verificando se a tabela foi criada...");

    const checkResponse = await fetch(
      `${url}/rest/v1/bet_history?select=id&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      }
    );

    if (checkResponse.ok) {
      console.log("✅ Tabela bet_history existe e está acessível!");
      return true;
    } else {
      console.log("❌ Tabela ainda não existe ou não está acessível");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    return false;
  }
}

// Função final que tenta tudo
async function finalSetupAttempt() {
  console.log("🎯 TENTATIVA FINAL DE SETUP AUTOMÁTICO");
  console.log("=====================================");

  const success = await executeSetupViaHTTP();

  if (success) {
    console.log("\n🎉 SETUP CONCLUÍDO AUTOMATICAMENTE!");
    console.log("Executando teste final...");

    // Executar teste
    try {
      const { testBettingFlow } = await import("./test-betting-flow");
      await testBettingFlow();
    } catch (error) {
      console.error("❌ Erro no teste:", error);
    }
  } else {
    console.log("\n📋 SETUP MANUAL NECESSÁRIO");
    console.log("==========================");
    console.log(
      "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu/sql"
    );
    console.log(
      "2. Cole e execute o conteúdo do arquivo 'setup-bet-history.sql'"
    );
    console.log("3. Execute: npx tsx src/scripts/verify-database-setup.ts");
    console.log("4. Execute: npm run dev");
    console.log("5. Acesse: http://localhost:3000/testing");
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  // Carregar variáveis de ambiente
  require("dotenv").config();
  finalSetupAttempt();
}

export { executeSetupViaHTTP };
