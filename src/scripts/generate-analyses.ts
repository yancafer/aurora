import { supabaseAdmin } from "../lib/supabase";
import { Analysis } from "../types";
import {
  calcProb1X2,
  calcOver25,
  calcBTTS,
  calcExpGols,
  poisson,
  calcValorEsperado,
  recomendarAposta,
  // Importar funções melhoradas
  calcOver25Improved,
  calcBTTSImproved,
  calcProb1X2Improved,
} from "../lib/bettingCalculations";
import "dotenv/config";

function calcImplicitProbability(odd: number) {
  return odd > 0 ? 1 / odd : 0;
}

function calcExpectedValue(odd: number, prob: number) {
  return odd * prob - 1;
}

// Função para gerar odds mais realistas baseadas em probabilidades
function generateRealisticOdds(prob: number, margin: number = 0.03): number {
  // Aplicar margem da casa de apostas reduzida (3% por padrão ao invés de 5%)
  const adjustedProb = prob + margin;
  const clampedProb = Math.min(0.9, Math.max(0.1, adjustedProb));
  return 1 / clampedProb;
}

// Função para simular odds de mercado com variação
function generateMarketOdds(
  theoreticalOdd: number,
  variation: number = 0.15
): number {
  // Adicionar variação de ±15% nas odds para simular diferentes casas de apostas
  const factor = 1 + (Math.random() - 0.5) * 2 * variation;
  return Math.max(1.1, theoreticalOdd * factor);
}

function isValidUUID(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  // Busca segura em auth.users via SQL RPC
  const { data, error } = await supabaseAdmin.rpc("get_user_id_by_email", {
    user_email: email,
  });
  if (error || !data || !data[0] || !data[0].id) {
    console.error("Não foi possível encontrar o user_id para o e-mail:", email);
    return null;
  }
  return data[0].id;
}

export async function main(date: string, user_id_or_email: string) {
  let user_id: string | null = user_id_or_email;
  if (!isValidUUID(user_id_or_email)) {
    // Tenta buscar pelo e-mail
    user_id = await getUserIdByEmail(user_id_or_email);
    if (!user_id || !isValidUUID(user_id)) {
      console.error(
        "user_id inválido! Forneça um UUID ou e-mail válido do usuário do Supabase."
      );
      return;
    }
  }
  // Buscar partidas do dia
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
  // Gerar análises simples para cada partida
  for (const fixture of fixtures) {
    const home = fixture.teams.home;
    const away = fixture.teams.away;
    const leagueId = fixture.league.id;
    const homeStats = statsMap.get(`${home.id}_${leagueId}`);
    const awayStats = statsMap.get(`${away.id}_${leagueId}`);
    if (!homeStats || !awayStats) continue;

    // Extrair médias de gols mais realisticamente
    const homeGoalsAvg = Number(homeStats.goals?.for?.average?.total ?? 1.2);
    const awayGoalsAvg = Number(awayStats.goals?.for?.average?.total ?? 1.0);
    const homeGoalsAgainstAvg = Number(
      homeStats.goals?.against?.average?.total ?? 1.1
    );
    const awayGoalsAgainstAvg = Number(
      awayStats.goals?.against?.average?.total ?? 1.3
    );

    // Calcular xG esperado considerando ataque vs defesa
    const xgHome = (homeGoalsAvg + awayGoalsAgainstAvg) / 2;
    const xgAway = (awayGoalsAvg + homeGoalsAgainstAvg) / 2;

    // Usar o modelo melhorado para probabilidades 1X2
    const prob1x2 = calcProb1X2Improved(xgHome, xgAway, 0.3);

    // Calcular Over 2.5 usando o modelo melhorado
    const probOver25 = calcOver25Improved(xgHome, xgAway);

    // Calcular BTTS usando o modelo melhorado
    const probBTTS = calcBTTSImproved(xgHome, xgAway);

    // Gerar odds mais realistas (com margem reduzida)
    const odd1 = generateRealisticOdds(prob1x2.prob1, 0.03);
    const oddX = generateRealisticOdds(prob1x2.probX, 0.03);
    const odd2 = generateRealisticOdds(prob1x2.prob2, 0.03);
    const oddOver25 = generateRealisticOdds(probOver25, 0.03);
    const oddBTTS = generateRealisticOdds(probBTTS, 0.03);

    // Simular odds de mercado com variação (para criar oportunidades)
    const marketOdd1 = generateMarketOdds(odd1, 0.2);
    const marketOddX = generateMarketOdds(oddX, 0.2);
    const marketOdd2 = generateMarketOdds(odd2, 0.2);
    const marketOddOver25 = generateMarketOdds(oddOver25, 0.2);
    const marketOddBTTS = generateMarketOdds(oddBTTS, 0.2);

    // Calcular valores esperados com odds de mercado
    const ev1 = calcExpectedValue(marketOdd1, prob1x2.prob1);
    const evX = calcExpectedValue(marketOddX, prob1x2.probX);
    const ev2 = calcExpectedValue(marketOdd2, prob1x2.prob2);
    const evOver25 = calcExpectedValue(marketOddOver25, probOver25);
    const evBTTS = calcExpectedValue(marketOddBTTS, probBTTS);

    // Probabilidades 1X2 originais (para compatibilidade)
    const homeWins = homeStats.fixtures?.wins?.home ?? 5;
    const homeDraws = homeStats.fixtures?.draws?.home ?? 3;
    const homeLoses = homeStats.fixtures?.loses?.home ?? 2;
    const prob1x2Original = calcProb1X2(homeWins, homeDraws, homeLoses);

    // Over 2.5 original (para compatibilidade)
    const over25Original = calcOver25(
      homeStats.goals?.for?.average?.total > 2.5
        ? homeStats.fixtures?.played?.home
        : homeStats.fixtures?.played?.home * 0.6,
      homeStats.fixtures?.played?.home ?? 10
    );

    // BTTS original (para compatibilidade)
    const bttsOriginal = calcBTTS(
      Math.min(0.8, Number(homeStats.goals?.for?.average?.total ?? 0) / 2),
      Math.min(0.8, Number(awayStats.goals?.for?.average?.total ?? 0) / 2)
    );

    // Poisson para 0, 1, 2 gols do mandante e visitante
    const poissonHome = [0, 1, 2].map((k) => poisson(k, xgHome));
    const poissonAway = [0, 1, 2].map((k) => poisson(k, xgAway));

    // Valores esperados para diferentes mercados
    const valorEsperado1 = calcValorEsperado(prob1x2.prob1, odd1);
    const valorEsperadoX = calcValorEsperado(prob1x2.probX, oddX);
    const valorEsperado2 = calcValorEsperado(prob1x2.prob2, odd2);
    const valorEsperadoOver25 = calcValorEsperado(probOver25, oddOver25);
    const valorEsperadoBTTS = calcValorEsperado(probBTTS, oddBTTS);

    // Recomendação baseada nos melhores valores esperados
    const recomendacao = recomendarAposta([
      { mercado: "Vitória Mandante", valorEsperado: valorEsperado1 },
      { mercado: "Empate", valorEsperado: valorEsperadoX },
      { mercado: "Vitória Visitante", valorEsperado: valorEsperado2 },
      { mercado: "Over 2.5", valorEsperado: valorEsperadoOver25 },
      { mercado: "BTTS", valorEsperado: valorEsperadoBTTS },
    ]);
    // Salvar análise para o mandante (mercado 1X2 - vitória mandante)
    const analysisHome: Analysis & {
      api_fixture_id: number | string;
      prob_1?: number;
      prob_x?: number;
      prob_2?: number;
      prob_over25?: number;
      prob_btts?: number;
      xg_home?: number;
      poisson_home?: number[];
      valor_esperado_1?: number;
      valor_esperado_x?: number;
      valor_esperado_2?: number;
      recomendacao?: string;
    } = {
      user_id,
      fixture_id: fixture.id,
      api_fixture_id: fixture.api_fixture_id,
      home_team: home.name,
      away_team: away.name,
      market: "1X2 - Vitória Mandante",
      odd_value: Number(marketOdd1.toFixed(2)),
      bookmaker: "auto",
      implicit_probability: Number((1 / marketOdd1).toFixed(2)),
      estimated_probability: Number(prob1x2.prob1.toFixed(2)),
      is_manual_estimate: false,
      expected_value: Number(ev1.toFixed(4)),
      is_value_bet: ev1 > 0,
      fixture_date: fixture.date
        ? new Date(fixture.date).toISOString()
        : undefined,
      fixture_timestamp: fixture.timestamp ?? undefined,
      prob_1: prob1x2.prob1,
      prob_x: prob1x2.probX,
      prob_2: prob1x2.prob2,
      prob_over25: probOver25,
      prob_btts: probBTTS,
      xg_home: xgHome,
      poisson_home: poissonHome,
      valor_esperado_1: valorEsperado1,
      valor_esperado_x: valorEsperadoX,
      valor_esperado_2: valorEsperado2,
      recomendacao,
    };

    // Salvar análise para o visitante (mercado 1X2 - vitória visitante)
    const analysisAway: Analysis & {
      api_fixture_id: number | string;
      prob_1?: number;
      prob_x?: number;
      prob_2?: number;
      prob_over25?: number;
      prob_btts?: number;
      xg_away?: number;
      poisson_away?: number[];
      valor_esperado_1?: number;
      valor_esperado_x?: number;
      valor_esperado_2?: number;
      recomendacao?: string;
    } = {
      user_id,
      fixture_id: fixture.id,
      api_fixture_id: fixture.api_fixture_id,
      home_team: home.name,
      away_team: away.name,
      market: "1X2 - Vitória Visitante",
      odd_value: Number(marketOdd2.toFixed(2)),
      bookmaker: "auto",
      implicit_probability: Number((1 / marketOdd2).toFixed(2)),
      estimated_probability: Number(prob1x2.prob2.toFixed(2)),
      is_manual_estimate: false,
      expected_value: Number(ev2.toFixed(4)),
      is_value_bet: ev2 > 0,
      fixture_date: fixture.date
        ? new Date(fixture.date).toISOString()
        : undefined,
      fixture_timestamp: fixture.timestamp ?? undefined,
      prob_1: prob1x2.prob1,
      prob_x: prob1x2.probX,
      prob_2: prob1x2.prob2,
      prob_over25: probOver25,
      prob_btts: probBTTS,
      xg_away: xgAway,
      poisson_away: poissonAway,
      valor_esperado_1: valorEsperado1,
      valor_esperado_x: valorEsperadoX,
      valor_esperado_2: valorEsperado2,
      recomendacao,
    };

    // Análise adicional: Over 2.5
    const analysisOver25: Analysis & {
      api_fixture_id: number | string;
      prob_1?: number;
      prob_x?: number;
      prob_2?: number;
      prob_over25?: number;
      prob_btts?: number;
      xg_home?: number;
      xg_away?: number;
      poisson_home?: number[];
      poisson_away?: number[];
      valor_esperado_1?: number;
      valor_esperado_x?: number;
      valor_esperado_2?: number;
      recomendacao?: string;
    } = {
      user_id,
      fixture_id: fixture.id,
      api_fixture_id: fixture.api_fixture_id,
      home_team: home.name,
      away_team: away.name,
      market: "Over 2.5 Gols",
      odd_value: Number(marketOddOver25.toFixed(2)),
      bookmaker: "auto",
      implicit_probability: Number((1 / marketOddOver25).toFixed(2)),
      estimated_probability: Number(probOver25.toFixed(2)),
      is_manual_estimate: false,
      expected_value: Number(evOver25.toFixed(4)),
      is_value_bet: evOver25 > 0,
      fixture_date: fixture.date
        ? new Date(fixture.date).toISOString()
        : undefined,
      fixture_timestamp: fixture.timestamp ?? undefined,
      prob_1: prob1x2.prob1,
      prob_x: prob1x2.probX,
      prob_2: prob1x2.prob2,
      prob_over25: probOver25,
      prob_btts: probBTTS,
      xg_home: xgHome,
      xg_away: xgAway,
      poisson_home: poissonHome,
      poisson_away: poissonAway,
      valor_esperado_1: valorEsperado1,
      valor_esperado_x: valorEsperadoX,
      valor_esperado_2: valorEsperado2,
      recomendacao,
    };

    // Análise adicional: BTTS
    const analysisBTTS: Analysis & {
      api_fixture_id: number | string;
      prob_1?: number;
      prob_x?: number;
      prob_2?: number;
      prob_over25?: number;
      prob_btts?: number;
      xg_home?: number;
      xg_away?: number;
      poisson_home?: number[];
      poisson_away?: number[];
      valor_esperado_1?: number;
      valor_esperado_x?: number;
      valor_esperado_2?: number;
      recomendacao?: string;
    } = {
      user_id,
      fixture_id: fixture.id,
      api_fixture_id: fixture.api_fixture_id,
      home_team: home.name,
      away_team: away.name,
      market: "BTTS - Ambos Marcam",
      odd_value: Number(marketOddBTTS.toFixed(2)),
      bookmaker: "auto",
      implicit_probability: Number((1 / marketOddBTTS).toFixed(2)),
      estimated_probability: Number(probBTTS.toFixed(2)),
      is_manual_estimate: false,
      expected_value: Number(evBTTS.toFixed(4)),
      is_value_bet: evBTTS > 0,
      fixture_date: fixture.date
        ? new Date(fixture.date).toISOString()
        : undefined,
      fixture_timestamp: fixture.timestamp ?? undefined,
      prob_1: prob1x2.prob1,
      prob_x: prob1x2.probX,
      prob_2: prob1x2.prob2,
      prob_over25: probOver25,
      prob_btts: probBTTS,
      xg_home: xgHome,
      xg_away: xgAway,
      poisson_home: poissonHome,
      poisson_away: poissonAway,
      valor_esperado_1: valorEsperado1,
      valor_esperado_x: valorEsperadoX,
      valor_esperado_2: valorEsperado2,
      recomendacao,
    };

    // Inserir todas as análises no Supabase
    const { error } = await supabaseAdmin
      .from("analyses")
      .insert([analysisHome, analysisAway, analysisOver25, analysisBTTS]);
    if (error) {
      console.error(
        `Erro ao salvar análises para ${home.name} x ${away.name}:`,
        error
      );
    } else {
      console.log(
        `4 análises salvas para ${home.name} x ${away.name} (1X2 Casa, 1X2 Visitante, Over 2.5, BTTS)`
      );
    }
  }
}

// Parâmetros: data e user_id ou e-mail
const date = process.argv[2] || new Date().toISOString().split("T")[0];
const user_id_or_email = process.argv[3] || "demo-user";
main(date, user_id_or_email);
