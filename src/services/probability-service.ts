import { ApiFootballService } from "./api-football";
import { ProbabilityEstimator } from "@/utils/probability-estimator";
import { Fixture, TeamStatistics, Standing } from "@/types";

export interface ProbabilityResult {
  homeWinProbability: number;
  awayWinProbability: number;
  drawProbability: number;
  confidence: number; // 0-100 baseado na qualidade dos dados
  dataQuality: {
    hasForm: boolean;
    hasStats: boolean;
    hasH2H: boolean;
    hasStandings: boolean;
  };
}

export class ProbabilityService {
  /**
   * Gera probabilidades automáticas para uma partida baseada em dados da API-Football
   */
  static async generateAutomaticProbability(
    fixture: Fixture,
    season: number = new Date().getFullYear()
  ): Promise<ProbabilityResult> {
    try {
      const homeTeamId = fixture.teams.home.id;
      const awayTeamId = fixture.teams.away.id;
      const leagueId = fixture.league.id;

      console.log(
        `🔄 Gerando probabilidades para ${fixture.teams.home.name} vs ${fixture.teams.away.name}`
      );

      // Buscar dados em paralelo para otimizar performance
      const [homeStats, awayStats, standings, headToHead, homeForm, awayForm] =
        await Promise.allSettled([
          ApiFootballService.getTeamStatistics(homeTeamId, season, leagueId),
          ApiFootballService.getTeamStatistics(awayTeamId, season, leagueId),
          ApiFootballService.getStandings(leagueId, season),
          ApiFootballService.getHeadToHead(homeTeamId, awayTeamId),
          ApiFootballService.getTeamForm(homeTeamId, leagueId, season, 5),
          ApiFootballService.getTeamForm(awayTeamId, leagueId, season, 5),
        ]);

      // Verificar qualidade dos dados
      const dataQuality = {
        hasForm:
          homeForm.status === "fulfilled" && awayForm.status === "fulfilled",
        hasStats:
          homeStats.status === "fulfilled" && awayStats.status === "fulfilled",
        hasH2H: headToHead.status === "fulfilled",
        hasStandings: standings.status === "fulfilled",
      };

      // Se não temos dados mínimos, retornar probabilidades neutras
      if (!dataQuality.hasStats) {
        return {
          homeWinProbability: 33.33,
          awayWinProbability: 33.33,
          drawProbability: 33.33,
          confidence: 0,
          dataQuality,
        };
      }

      const homeStatsData =
        homeStats.status === "fulfilled" ? homeStats.value : null;
      const awayStatsData =
        awayStats.status === "fulfilled" ? awayStats.value : null;
      const standingsData =
        standings.status === "fulfilled" ? standings.value : [];
      const h2hData = headToHead.status === "fulfilled" ? headToHead.value : [];

      if (!homeStatsData || !awayStatsData) {
        throw new Error("Não foi possível obter estatísticas dos times");
      }

      // Calcular probabilidades usando o estimador
      const homeWinProb = ProbabilityEstimator.calculateProbability(
        homeStatsData,
        awayStatsData,
        standingsData,
        h2hData,
        true // é time da casa
      );

      const awayWinProb = ProbabilityEstimator.calculateProbability(
        awayStatsData,
        homeStatsData,
        standingsData,
        h2hData,
        false // é time visitante
      );

      // Calcular probabilidade do empate baseada nas estatísticas
      const drawProb = this.calculateDrawProbability(
        homeStatsData,
        awayStatsData
      );

      // Normalizar para somar 100%
      const total = homeWinProb + awayWinProb + drawProb;
      const normalizedHome = (homeWinProb / total) * 100;
      const normalizedAway = (awayWinProb / total) * 100;
      const normalizedDraw = (drawProb / total) * 100;

      // Calcular confiança baseada na qualidade dos dados
      const confidence = this.calculateConfidence(dataQuality);

      return {
        homeWinProbability: Math.round(normalizedHome * 100) / 100,
        awayWinProbability: Math.round(normalizedAway * 100) / 100,
        drawProbability: Math.round(normalizedDraw * 100) / 100,
        confidence,
        dataQuality,
      };
    } catch (error) {
      console.error("Erro ao gerar probabilidades automáticas:", error);

      // Retornar probabilidades neutras em caso de erro
      return {
        homeWinProbability: 33.33,
        awayWinProbability: 33.33,
        drawProbability: 33.33,
        confidence: 0,
        dataQuality: {
          hasForm: false,
          hasStats: false,
          hasH2H: false,
          hasStandings: false,
        },
      };
    }
  }

  /**
   * Calcula a probabilidade de empate baseada nas estatísticas dos times
   */
  private static calculateDrawProbability(
    homeStats: TeamStatistics,
    awayStats: TeamStatistics
  ): number {
    // Média de empates dos dois times
    const homeDrawRate =
      homeStats.fixtures.draws.total / homeStats.fixtures.played.total || 0;
    const awayDrawRate =
      awayStats.fixtures.draws.total / awayStats.fixtures.played.total || 0;

    const avgDrawRate = (homeDrawRate + awayDrawRate) / 2;

    // Converter para percentual (base de 25% para empates)
    return Math.max(15, Math.min(40, avgDrawRate * 100 + 25));
  }

  /**
   * Calcula o nível de confiança baseado na qualidade dos dados disponíveis
   */
  private static calculateConfidence(dataQuality: {
    hasForm: boolean;
    hasStats: boolean;
    hasH2H: boolean;
    hasStandings: boolean;
  }): number {
    let confidence = 0;

    if (dataQuality.hasStats) confidence += 40; // Dados mais importantes
    if (dataQuality.hasForm) confidence += 25;
    if (dataQuality.hasStandings) confidence += 20;
    if (dataQuality.hasH2H) confidence += 15;

    return confidence;
  }

  /**
   * Gera probabilidades rápidas baseadas apenas em odds (quando dados completos não estão disponíveis)
   */
  static generateProbabilityFromOdds(
    homeOdd: number,
    drawOdd: number,
    awayOdd: number
  ): ProbabilityResult {
    const homeImplied = 100 / homeOdd;
    const drawImplied = 100 / drawOdd;
    const awayImplied = 100 / awayOdd;

    // Remover margin das casas de apostas (normalizar)
    const total = homeImplied + drawImplied + awayImplied;
    const margin = total - 100;

    const normalizedHome = homeImplied - (homeImplied / total) * margin;
    const normalizedDraw = drawImplied - (drawImplied / total) * margin;
    const normalizedAway = awayImplied - (awayImplied / total) * margin;

    return {
      homeWinProbability: Math.round(normalizedHome * 100) / 100,
      drawProbability: Math.round(normalizedDraw * 100) / 100,
      awayWinProbability: Math.round(normalizedAway * 100) / 100,
      confidence: 60, // Confiança média para dados baseados apenas em odds
      dataQuality: {
        hasForm: false,
        hasStats: false,
        hasH2H: false,
        hasStandings: false,
      },
    };
  }
}
