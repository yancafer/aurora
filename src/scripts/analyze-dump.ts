import { supabaseAdmin } from "../lib/supabase";

async function main(date: string) {
  // Buscar todas as partidas do dia
  const { data: fixtures, error: fixturesError } = await supabaseAdmin
    .from("fixtures")
    .select("*, teams, league")
    .eq("date", date);
  if (fixturesError) {
    console.error("Erro ao buscar fixtures:", fixturesError);
    return;
  }
  // Buscar estatísticas dos times
  const { data: stats, error: statsError } = await supabaseAdmin
    .from("team_statistics")
    .select("*")
    .eq("season", new Date().getFullYear());
  if (statsError) {
    console.error("Erro ao buscar estatísticas dos times:", statsError);
    return;
  }
  // Indexar estatísticas por team_id e league_id
  const statsMap = new Map();
  for (const s of stats) {
    statsMap.set(`${s.team_id}_${s.league_id}`, s.statistics);
  }
  // Analisar cada partida
  for (const fixture of fixtures) {
    const home = fixture.teams.home;
    const away = fixture.teams.away;
    const leagueId = fixture.league.id;
    const homeStats = statsMap.get(`${home.id}_${leagueId}`);
    const awayStats = statsMap.get(`${away.id}_${leagueId}`);
    if (!homeStats || !awayStats) {
      console.log(
        `Partida ${home.name} x ${away.name}: estatísticas ausentes.`
      );
      continue;
    }
    // Exemplo de análise: médias e taxas
    console.log(`\n${home.name} x ${away.name} (${fixture.league.name})`);
    console.log(
      `  Home - Média gols pró: ${
        homeStats.goals?.for?.average?.total ?? "-"
      } | Win rate: ${homeStats.fixtures?.wins?.total ?? "-"} / ${
        homeStats.fixtures?.played?.total ?? "-"
      }`
    );
    console.log(
      `  Away - Média gols pró: ${
        awayStats.goals?.for?.average?.total ?? "-"
      } | Win rate: ${awayStats.fixtures?.wins?.total ?? "-"} / ${
        awayStats.fixtures?.played?.total ?? "-"
      }`
    );
  }
}

// Use a data de hoje por padrão
const date = process.argv[2] || new Date().toISOString().split("T")[0];
main(date);
