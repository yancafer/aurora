// Script utilitário para cálculos probabilísticos de análises esportivas
// (Baseado nos requisitos do arquivo requisitos.md)

import { factorial } from "mathjs";

export function calcProb1X2(wins: number, draws: number, loses: number) {
  const total = wins + draws + loses;
  return {
    prob1: wins / total,
    probX: draws / total,
    prob2: loses / total,
  };
}

export function calcOver25(matchesWithOver25: number, totalMatches: number) {
  return matchesWithOver25 / totalMatches;
}

export function calcBTTS(probHomeScores: number, probAwayScores: number) {
  return probHomeScores * probAwayScores;
}

export function calcExpGols(avgGoalsFor: number, avgGoalsAgainst: number) {
  return avgGoalsFor + avgGoalsAgainst;
}

export function poisson(k: number, lambda: number) {
  // P(k, λ) = (λ^k * e^-λ) / k!
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function calcValorEsperado(prob: number, odd: number) {
  // Valor esperado correto: (probabilidade * odd) - 1
  // Se prob = 0.5 e odd = 2.5, então EV = (0.5 * 2.5) - 1 = 0.25 (positivo)
  return prob * odd - 1;
}

// Função melhorada para recomendação de apostas
export function recomendarAposta(
  valores: { mercado: string; valorEsperado: number }[]
) {
  // Filtrar apostas com valor esperado maior que -0.10 (limiar mais flexível)
  const melhores = valores.filter((v) => v.valorEsperado > -0.1);
  if (melhores.length === 0) return "Nenhuma aposta recomendada";

  // Pegar a melhor aposta
  const melhor = melhores.reduce((a, b) =>
    a.valorEsperado > b.valorEsperado ? a : b
  );

  // Se o valor esperado for positivo, recomendar fortemente
  if (melhor.valorEsperado > 0.02) {
    return `Apostar em ${melhor.mercado} (EV: +${(
      melhor.valorEsperado * 100
    ).toFixed(1)}%)`;
  }

  // Se for levemente positivo
  if (melhor.valorEsperado > 0) {
    return `Considerar ${melhor.mercado} (EV: +${(
      melhor.valorEsperado * 100
    ).toFixed(1)}%)`;
  }

  // Se for levemente negativo mas ainda interessante
  return `Considerar ${melhor.mercado} (EV: ${(
    melhor.valorEsperado * 100
  ).toFixed(1)}%)`;
}

// Função melhorada para calcular Over 2.5
export function calcOver25Improved(avgGoalsHome: number, avgGoalsAway: number) {
  // Média total de gols esperados no jogo
  const totalExpectedGoals = avgGoalsHome + avgGoalsAway;

  // Usar distribuição de Poisson para calcular P(Over 2.5)
  // P(Over 2.5) = 1 - P(0) - P(1) - P(2)
  const p0 = poisson(0, totalExpectedGoals);
  const p1 = poisson(1, totalExpectedGoals);
  const p2 = poisson(2, totalExpectedGoals);

  return 1 - (p0 + p1 + p2);
}

// Função melhorada para calcular BTTS
export function calcBTTSImproved(avgGoalsHome: number, avgGoalsAway: number) {
  // P(home team scores at least 1) = 1 - P(home scores 0)
  const probHomeScores = 1 - poisson(0, avgGoalsHome);

  // P(away team scores at least 1) = 1 - P(away scores 0)
  const probAwayScores = 1 - poisson(0, avgGoalsAway);

  // P(both teams score) = P(home scores) * P(away scores)
  return probHomeScores * probAwayScores;
}

// Função para calcular probabilidades 1X2 melhoradas
export function calcProb1X2Improved(
  homeGoalsAvg: number,
  awayGoalsAvg: number,
  homeAdvantage: number = 0.3 // vantagem de jogar em casa
) {
  // Ajustar médias de gols com vantagem de casa
  const adjustedHomeGoals = homeGoalsAvg + homeAdvantage;
  const adjustedAwayGoals = awayGoalsAvg;

  // Usar modelo Poisson bivariado simplificado
  let prob1 = 0,
    probX = 0,
    prob2 = 0;

  // Calcular para diferentes combinações de gols (0-5 para cada time)
  for (let homeScore = 0; homeScore <= 5; homeScore++) {
    for (let awayScore = 0; awayScore <= 5; awayScore++) {
      const probHomeScore = poisson(homeScore, adjustedHomeGoals);
      const probAwayScore = poisson(awayScore, adjustedAwayGoals);
      const jointProb = probHomeScore * probAwayScore;

      if (homeScore > awayScore) {
        prob1 += jointProb;
      } else if (homeScore === awayScore) {
        probX += jointProb;
      } else {
        prob2 += jointProb;
      }
    }
  }

  // Normalizar para garantir que soma = 1
  const total = prob1 + probX + prob2;
  return {
    prob1: prob1 / total,
    probX: probX / total,
    prob2: prob2 / total,
  };
}
