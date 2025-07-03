import "dotenv/config";
import { supabaseAdmin } from "../lib/supabase";

/**
 * Script de teste para verificar se o Supabase está funcionando
 * Testa inserção, RLS e permissões
 */
async function testSupabaseConnection() {
  console.log("🧪 Testando conexão com Supabase...");

  // Verificar variáveis de ambiente
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  console.log(
    "Service Role Key:",
    serviceRoleKey
      ? `${serviceRoleKey.slice(0, 6)}...${serviceRoleKey.slice(-6)}`
      : "NÃO ENCONTRADA"
  );
  console.log("Supabase URL:", supabaseUrl || "NÃO ENCONTRADA");

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("❌ Variáveis de ambiente não configuradas!");
    console.log("\n💡 Para corrigir:");
    console.log("1. Crie um arquivo .env.local na raiz do projeto");
    console.log("2. Adicione as variáveis:");
    console.log("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
    console.log("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
    return;
  }

  try {
    // 1. Testar conexão básica
    console.log("\n🔗 Testando conexão básica...");
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from("fixtures")
      .select("id")
      .limit(1);

    if (healthError) {
      console.error("❌ Erro na conexão:", healthError);

      if (healthError.message.includes("JWT")) {
        console.log(
          "💡 Problema de autenticação - verifique a SUPABASE_SERVICE_ROLE_KEY"
        );
      }

      if (
        healthError.message.includes("relation") ||
        healthError.message.includes("table")
      ) {
        console.log("💡 Tabela não existe - execute as migrações no Supabase");
      }

      return;
    }

    console.log("✅ Conexão básica OK");

    // 2. Verificar se as tabelas necessárias existem
    console.log("\n📋 Verificando tabelas...");
    const tables = ["fixtures", "odds", "team_statistics", "standings"];

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin.from(table).select("id").limit(1);

        if (error) {
          console.log(`❌ Tabela '${table}' - ${error.message}`);
        } else {
          console.log(`✅ Tabela '${table}' OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}' - erro: ${err}`);
      }
    }

    // 3. Testar inserção de dados
    console.log("\n📝 Testando inserção de dados...");
    const testFixture = {
      api_fixture_id: 999999,
      date: "2025-07-02",
      timestamp: Date.now(),
      status: { long: "Not Started", short: "NS", elapsed: null },
      venue: { id: 1, name: "Estádio Teste", city: "Cidade Teste" },
      teams: {
        home: { id: 1, name: "Time Casa" },
        away: { id: 2, name: "Time Visitante" },
      },
      goals: { home: null, away: null },
      score: { halftime: null, fulltime: null, extratime: null, penalty: null },
      league: { id: 1, name: "Liga Teste", country: "BR", season: 2025 },
      updated_at: new Date().toISOString(),
    };

    console.log("Dados de teste:", JSON.stringify(testFixture, null, 2));

    const { data, error } = await supabaseAdmin
      .from("fixtures")
      .upsert(testFixture, { onConflict: "api_fixture_id" })
      .select();

    if (error) {
      console.error("❌ Erro ao inserir:", error);
      console.error("Código do erro:", error.code);
      console.error("Detalhes:", error.details);
      console.error("Hint:", error.hint);

      // Diagnósticos específicos
      if (error.code === "23505") {
        console.log("💡 Erro de chave duplicada - dados já existem");
      }

      if (error.code === "42501") {
        console.log("💡 Erro de permissão - verifique RLS policies");
      }

      if (error.code === "23502") {
        console.log("💡 Campo obrigatório faltando");
      }
    } else {
      console.log("✅ Dados inseridos com sucesso!");
      console.log("Resultado:", data);
    }

    // 4. Verificar se os dados foram realmente salvos
    console.log("\n🔍 Verificando dados salvos...");
    const { data: selectData, error: selectError } = await supabaseAdmin
      .from("fixtures")
      .select("*")
      .eq("api_fixture_id", 999999);

    if (selectError) {
      console.error("❌ Erro ao buscar:", selectError);
    } else {
      console.log(
        "✅ Dados encontrados:",
        selectData?.length || 0,
        "registros"
      );
      if (selectData && selectData.length > 0) {
        console.log("Primeiro registro:", selectData[0]);
      }
    }

    // 5. Testar contagem geral
    console.log("\n📊 Estatísticas do banco...");
    const { count: fixturesCount, error: countError } = await supabaseAdmin
      .from("fixtures")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log("❌ Erro ao contar fixtures:", countError);
    } else {
      console.log(`📈 Total de fixtures no banco: ${fixturesCount || 0}`);
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);

    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

// Executar teste
testSupabaseConnection()
  .then(() => {
    console.log("🏁 Teste finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  });
