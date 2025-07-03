"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbabilityEstimator = void 0;
var ProbabilityEstimator = /** @class */ (function () {
    function ProbabilityEstimator() {
    }
    /**
     * Calcula a probabilidade estimada baseada em dados estatísticos
     * Fórmula: (Forma * 0.35 + CasaFora * 0.30 + H2H * 0.20 + Rank * 0.15)
     */
    ProbabilityEstimator.calculateProbability = function (homeTeamStats, awayTeamStats, standings, headToHead, isHomeTeam) {
        if (isHomeTeam === void 0) { isHomeTeam = true; }
        var formScore = this.calculateFormScore(isHomeTeam ? homeTeamStats : awayTeamStats);
        var homeAwayScore = this.calculateHomeAwayScore(isHomeTeam ? homeTeamStats : awayTeamStats, isHomeTeam);
        var h2hScore = this.calculateH2HScore(headToHead, isHomeTeam ? homeTeamStats.team.id : awayTeamStats.team.id);
        var rankingScore = this.calculateRankingScore(standings, isHomeTeam ? homeTeamStats.team.id : awayTeamStats.team.id);
        // Aplicar pesos conforme especificado
        var probability = formScore * 0.35 +
            homeAwayScore * 0.3 +
            h2hScore * 0.2 +
            rankingScore * 0.15;
        return Math.max(0, Math.min(100, probability));
    };
    /**
     * Calcula score baseado na forma recente (últimos 5 jogos)
     */
    ProbabilityEstimator.calculateFormScore = function (teamStats) {
        var form = teamStats.form || "";
        var recentForm = form.slice(-5); // Últimos 5 jogos
        var points = 0;
        for (var _i = 0, recentForm_1 = recentForm; _i < recentForm_1.length; _i++) {
            var result = recentForm_1[_i];
            if (result === "W")
                points += 3;
            else if (result === "D")
                points += 1;
        }
        // Máximo possível: 15 pontos (5 vitórias)
        return (points / 15) * 100;
    };
    /**
     * Calcula score baseado no desempenho como mandante/visitante
     */
    ProbabilityEstimator.calculateHomeAwayScore = function (teamStats, isHome) {
        var fixtures = isHome
            ? teamStats.fixtures.wins.home
            : teamStats.fixtures.wins.away;
        var totalPlayed = isHome
            ? teamStats.fixtures.played.home
            : teamStats.fixtures.played.away;
        if (totalPlayed === 0)
            return 50; // Valor neutro se não há dados
        return (fixtures / totalPlayed) * 100;
    };
    /**
     * Calcula score baseado nos confrontos diretos
     */
    ProbabilityEstimator.calculateH2HScore = function (headToHead, teamId) {
        if (headToHead.length === 0)
            return 50; // Valor neutro se não há dados
        var wins = 0;
        for (var _i = 0, headToHead_1 = headToHead; _i < headToHead_1.length; _i++) {
            var fixture = headToHead_1[_i];
            var homeWin = fixture.teams.home.id === teamId && fixture.teams.home.winner;
            var awayWin = fixture.teams.away.id === teamId && fixture.teams.away.winner;
            if (homeWin || awayWin)
                wins++;
        }
        return (wins / headToHead.length) * 100;
    };
    /**
     * Calcula score baseado na classificação na liga
     */
    ProbabilityEstimator.calculateRankingScore = function (standings, teamId) {
        var teamStanding = standings.find(function (s) { return s.team.id === teamId; });
        if (!teamStanding)
            return 50; // Valor neutro se não encontrar
        var totalTeams = standings.length;
        var position = teamStanding.rank;
        // Quanto melhor a posição, maior o score
        return ((totalTeams - position + 1) / totalTeams) * 100;
    };
    return ProbabilityEstimator;
}());
exports.ProbabilityEstimator = ProbabilityEstimator;
