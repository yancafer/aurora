import { supabaseAdmin } from "../lib/supabase";

async function checkAnalyses() {
  console.log("🔍 Verificando análises geradas...\n");

  try {
    const { data: analyses, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("user_id", "972c2801-bf56-429f-bf58-5325071d10a9")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Erro ao buscar análises:", error);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log("❌ Nenhuma análise encontrada");
      return;
    }

    console.log(`✅ ${analyses.length} análises encontradas\n`);

    for (const analysis of analyses) {
      console.log("─".repeat(50));
      console.log(`🏆 ${analysis.home_team} vs ${analysis.away_team}`);
      console.log(`📊 Mercado: ${analysis.market}`);
      console.log(`💰 Odd: ${analysis.odd_value}`);
      console.log(
        `📈 Prob. Estimada: ${(analysis.estimated_probability * 100).toFixed(
          1
        )}%`
      );
      console.log(
        `💸 Valor Esperado: ${(analysis.expected_value * 100).toFixed(2)}%`
      );
      console.log(
        `✨ Value Bet: ${analysis.is_value_bet ? "✅ SIM" : "❌ NÃO"}`
      );

      if (analysis.recomendacao) {
        console.log(`🎯 Recomendação: ${analysis.recomendacao}`);
      }

      if (analysis.prob_1) {
        console.log(
          `📊 Prob. 1X2: Casa ${(analysis.prob_1 * 100).toFixed(
            1
          )}% | Empate ${(analysis.prob_x * 100).toFixed(1)}% | Visitante ${(
            analysis.prob_2 * 100
          ).toFixed(1)}%`
        );
      }

      if (analysis.prob_over25) {
        console.log(
          `⚽ Prob. Over 2.5: ${(analysis.prob_over25 * 100).toFixed(1)}%`
        );
      }

      if (analysis.prob_btts) {
        console.log(`🥅 Prob. BTTS: ${(analysis.prob_btts * 100).toFixed(1)}%`);
      }

      console.log("");
    }

    // Verificar quantas são value bets
    const valueBets = analyses.filter((a) => a.is_value_bet);
    console.log("─".repeat(50));
    console.log(
      `🎯 Resumo: ${valueBets.length}/${analyses.length} são value bets`
    );

    if (valueBets.length > 0) {
      console.log("✅ Value bets encontradas:");
      valueBets.forEach((vb) => {
        console.log(
          `   • ${vb.market} - ${vb.home_team} vs ${vb.away_team} (EV: +${(
            vb.expected_value * 100
          ).toFixed(2)}%)`
        );
      });
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

checkAnalyses();
