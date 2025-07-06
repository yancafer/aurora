import { supabaseAdmin } from "../lib/supabase";

async function createTestDataAndAnalyses() {
  console.log("🧪 Criando dados de teste para análises...\n");

  try {
    // 1. Buscar um fixture existente
    const { data: fixtures, error: fixturesError } = await supabaseAdmin
      .from("fixtures")
      .select("*")
      .limit(5);

    if (fixturesError || !fixtures || fixtures.length === 0) {
      console.error("❌ Erro ao buscar fixtures:", fixturesError);
      return;
    }

    console.log(`✅ Encontrados ${fixtures.length} fixtures`);

    // 2. Criar estatísticas de teste para alguns times
    const testStats = [
      {
        team_id: 1,
        league_id: 1,
        season: 2025,
        statistics: {
          fixtures: {
            played: { home: 15, away: 15, total: 30 },
            wins: { home: 8, away: 5, total: 13 },
            draws: { home: 4, away: 6, total: 10 },
            loses: { home: 3, away: 4, total: 7 },
          },
          goals: {
            for: {
              total: { home: 24, away: 18, total: 42 },
              average: { home: "1.60", away: "1.20", total: "1.40" },
            },
            against: {
              total: { home: 12, away: 20, total: 32 },
              average: { home: "0.80", away: "1.33", total: "1.07" },
            },
          },
        },
      },
      {
        team_id: 2,
        league_id: 1,
        season: 2025,
        statistics: {
          fixtures: {
            played: { home: 15, away: 15, total: 30 },
            wins: { home: 6, away: 4, total: 10 },
            draws: { home: 5, away: 5, total: 10 },
            loses: { home: 4, away: 6, total: 10 },
          },
          goals: {
            for: {
              total: { home: 20, away: 15, total: 35 },
              average: { home: "1.33", away: "1.00", total: "1.17" },
            },
            against: {
              total: { home: 15, away: 22, total: 37 },
              average: { home: "1.00", away: "1.47", total: "1.23" },
            },
          },
        },
      },
    ];

    // 3. Inserir estatísticas de teste
    for (const stat of testStats) {
      const { error } = await supabaseAdmin
        .from("team_statistics")
        .upsert(stat, { onConflict: "team_id,league_id,season" });

      if (error) {
        console.error(
          `❌ Erro ao inserir estatística do time ${stat.team_id}:`,
          error
        );
      } else {
        console.log(`✅ Estatística do time ${stat.team_id} inserida`);
      }
    }

    // 4. Verificar se as estatísticas foram salvas
    const { data: savedStats, error: statsError } = await supabaseAdmin
      .from("team_statistics")
      .select("*")
      .in("team_id", [1, 2]);

    if (statsError) {
      console.error("❌ Erro ao verificar estatísticas:", statsError);
    } else {
      console.log(
        `✅ ${savedStats?.length || 0} estatísticas encontradas no banco`
      );
    }

    console.log("\n🎯 Dados de teste criados com sucesso!");
    console.log("Agora você pode executar:");
    console.log(
      "npx tsx src/scripts/generate-analyses.ts 2025-07-02 [seu-user-id]"
    );
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

createTestDataAndAnalyses();
