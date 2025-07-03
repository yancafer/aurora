import { TeamStatistics, Standing, Fixture } from "@/types";

export class ProbabilityEstimator {
  /**
   * Calcula a probabilidade estimada baseada em dados estatísticos
   * Fórmula: (Forma * 0.35 + CasaFora * 0.30 + H2H * 0.20 + Rank * 0.15)
   */
  static calculateProbability(
    homeTeamStats: TeamStatistics,
    awayTeamStats: TeamStatistics,
    standings: Standing[],
    headToHead: Fixture[],
    isHomeTeam: boolean = true
  ): number {
    const formScore = this.calculateFormScore(
      isHomeTeam ? homeTeamStats : awayTeamStats
    );

    const homeAwayScore = this.calculateHomeAwayScore(
      isHomeTeam ? homeTeamStats : awayTeamStats,
      isHomeTeam
    );

    const h2hScore = this.calculateH2HScore(
      headToHead,
      isHomeTeam ? homeTeamStats.team.id : awayTeamStats.team.id
    );

    const rankingScore = this.calculateRankingScore(
      standings,
      isHomeTeam ? homeTeamStats.team.id : awayTeamStats.team.id
    );

    // Aplicar pesos conforme especificado
    const probability =
      formScore * 0.35 +
      homeAwayScore * 0.3 +
      h2hScore * 0.2 +
      rankingScore * 0.15;

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Calcula score baseado na forma recente (últimos 5 jogos)
   */
  private static calculateFormScore(teamStats: TeamStatistics): number {
    const form = teamStats.form || "";
    const recentForm = form.slice(-5); // Últimos 5 jogos

    let points = 0;
    for (const result of recentForm) {
      if (result === "W") points += 3;
      else if (result === "D") points += 1;
    }

    // Máximo possível: 15 pontos (5 vitórias)
    return (points / 15) * 100;
  }

  /**
   * Calcula score baseado no desempenho como mandante/visitante
   */
  private static calculateHomeAwayScore(
    teamStats: TeamStatistics,
    isHome: boolean
  ): number {
    const fixtures = isHome
      ? teamStats.fixtures.wins.home
      : teamStats.fixtures.wins.away;
    const totalPlayed = isHome
      ? teamStats.fixtures.played.home
      : teamStats.fixtures.played.away;

    if (totalPlayed === 0) return 50; // Valor neutro se não há dados

    return (fixtures / totalPlayed) * 100;
  }

  /**
   * Calcula score baseado nos confrontos diretos
   */
  private static calculateH2HScore(
    headToHead: Fixture[],
    teamId: number
  ): number {
    if (headToHead.length === 0) return 50; // Valor neutro se não há dados

    let wins = 0;
    for (const fixture of headToHead) {
      const homeWin =
        fixture.teams.home.id === teamId && fixture.teams.home.winner;
      const awayWin =
        fixture.teams.away.id === teamId && fixture.teams.away.winner;

      if (homeWin || awayWin) wins++;
    }

    return (wins / headToHead.length) * 100;
  }

  /**
   * Calcula score baseado na classificação na liga
   */
  private static calculateRankingScore(
    standings: Standing[],
    teamId: number
  ): number {
    const teamStanding = standings.find((s) => s.team.id === teamId);
    if (!teamStanding) return 50; // Valor neutro se não encontrar

    const totalTeams = standings.length;
    const position = teamStanding.rank;

    // Quanto melhor a posição, maior o score
    return ((totalTeams - position + 1) / totalTeams) * 100;
  }
}
