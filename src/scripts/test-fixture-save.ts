import { supabaseAdmin } from "../lib/supabase";

/**
 * Script simplificado para testar apenas o salvamento de fixtures
 */
async function testFixtureSave() {
  console.log("🧪 Testando salvamento de fixture...");

  // Verificar variáveis de ambiente
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("❌ Variáveis de ambiente não configuradas!");
    console.log("Crie um arquivo .env.local com:");
    console.log("NEXT_PUBLIC_SUPABASE_URL=your-url");
    console.log("SUPABASE_SERVICE_ROLE_KEY=your-key");
    return;
  }

  console.log("✅ Variáveis de ambiente OK");
  console.log(`URL: ${supabaseUrl}`);
  console.log(
    `Key: ${serviceRoleKey.slice(0, 6)}...${serviceRoleKey.slice(-6)}`
  );

  try {
    // Fixture de teste simples
    const testFixture = {
      api_fixture_id: 888888,
      date: "2025-07-02",
      timestamp: Date.now(),
      status: { long: "Not Started", short: "NS", elapsed: null },
      venue: { id: 1, name: "Test Stadium", city: "Test City" },
      teams: {
        home: { id: 1, name: "Home Team" },
        away: { id: 2, name: "Away Team" },
      },
      goals: { home: null, away: null },
      score: { halftime: null, fulltime: null, extratime: null, penalty: null },
      league: { id: 1, name: "Test League", country: "BR", season: 2025 },
      updated_at: new Date().toISOString(),
    };

    console.log("📝 Tentando inserir fixture de teste...");

    // Primeiro, verificar se a tabela fixtures existe
    const { data: tables, error: tableError } = await supabaseAdmin
      .from("fixtures")
      .select("id")
      .limit(1);

    if (tableError) {
      console.error("❌ Erro ao acessar tabela fixtures:", tableError);
      console.log("💡 Verifique se a migração foi executada no Supabase");
      return;
    }

    console.log("✅ Tabela fixtures acessível");

    // Tentar inserir dados
    const { data, error } = await supabaseAdmin
      .from("fixtures")
      .upsert(testFixture, { onConflict: "api_fixture_id" })
      .select();

    if (error) {
      console.error("❌ Erro ao inserir fixture:", error);
      console.log("Detalhes:", JSON.stringify(error, null, 2));
    } else {
      console.log("✅ Fixture inserida com sucesso!");
      console.log("Dados inseridos:", data);
    }

    // Verificar se o dado foi salvo
    const { data: savedData, error: selectError } = await supabaseAdmin
      .from("fixtures")
      .select("*")
      .eq("api_fixture_id", 888888);

    if (selectError) {
      console.error("❌ Erro ao buscar fixture:", selectError);
    } else {
      console.log(
        "✅ Fixture encontrada no banco:",
        savedData?.length || 0,
        "registros"
      );
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar teste
testFixtureSave()
  .then(() => {
    console.log("🏁 Teste finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  });
