"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbabilityService = void 0;
var api_football_1 = require("./api-football");
var probability_estimator_1 = require("@/utils/probability-estimator");
var ProbabilityService = /** @class */ (function () {
    function ProbabilityService() {
    }
    /**
     * Gera probabilidades automáticas para uma partida baseada em dados da API-Football
     */
    ProbabilityService.generateAutomaticProbability = function (fixture_1) {
        return __awaiter(this, arguments, void 0, function (fixture, season) {
            var homeTeamId, awayTeamId, leagueId, _a, homeStats, awayStats, standings, headToHead, homeForm, awayForm, dataQuality, homeStatsData, awayStatsData, standingsData, h2hData, homeWinProb, awayWinProb, drawProb, total, normalizedHome, normalizedAway, normalizedDraw, confidence, error_1;
            if (season === void 0) { season = new Date().getFullYear(); }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        homeTeamId = fixture.teams.home.id;
                        awayTeamId = fixture.teams.away.id;
                        leagueId = fixture.league.id;
                        console.log("\uD83D\uDD04 Gerando probabilidades para ".concat(fixture.teams.home.name, " vs ").concat(fixture.teams.away.name));
                        return [4 /*yield*/, Promise.allSettled([
                                api_football_1.ApiFootballService.getTeamStatistics(homeTeamId, season, leagueId),
                                api_football_1.ApiFootballService.getTeamStatistics(awayTeamId, season, leagueId),
                                api_football_1.ApiFootballService.getStandings(leagueId, season),
                                api_football_1.ApiFootballService.getHeadToHead(homeTeamId, awayTeamId),
                                api_football_1.ApiFootballService.getTeamForm(homeTeamId, leagueId, season, 5),
                                api_football_1.ApiFootballService.getTeamForm(awayTeamId, leagueId, season, 5),
                            ])];
                    case 1:
                        _a = _b.sent(), homeStats = _a[0], awayStats = _a[1], standings = _a[2], headToHead = _a[3], homeForm = _a[4], awayForm = _a[5];
                        dataQuality = {
                            hasForm: homeForm.status === "fulfilled" && awayForm.status === "fulfilled",
                            hasStats: homeStats.status === "fulfilled" && awayStats.status === "fulfilled",
                            hasH2H: headToHead.status === "fulfilled",
                            hasStandings: standings.status === "fulfilled",
                        };
                        // Se não temos dados mínimos, retornar probabilidades neutras
                        if (!dataQuality.hasStats) {
                            return [2 /*return*/, {
                                    homeWinProbability: 33.33,
                                    awayWinProbability: 33.33,
                                    drawProbability: 33.33,
                                    confidence: 0,
                                    dataQuality: dataQuality,
                                }];
                        }
                        homeStatsData = homeStats.status === "fulfilled" ? homeStats.value : null;
                        awayStatsData = awayStats.status === "fulfilled" ? awayStats.value : null;
                        standingsData = standings.status === "fulfilled" ? standings.value : [];
                        h2hData = headToHead.status === "fulfilled" ? headToHead.value : [];
                        if (!homeStatsData || !awayStatsData) {
                            throw new Error("Não foi possível obter estatísticas dos times");
                        }
                        homeWinProb = probability_estimator_1.ProbabilityEstimator.calculateProbability(homeStatsData, awayStatsData, standingsData, h2hData, true // é time da casa
                        );
                        awayWinProb = probability_estimator_1.ProbabilityEstimator.calculateProbability(awayStatsData, homeStatsData, standingsData, h2hData, false // é time visitante
                        );
                        drawProb = this.calculateDrawProbability(homeStatsData, awayStatsData);
                        total = homeWinProb + awayWinProb + drawProb;
                        normalizedHome = (homeWinProb / total) * 100;
                        normalizedAway = (awayWinProb / total) * 100;
                        normalizedDraw = (drawProb / total) * 100;
                        confidence = this.calculateConfidence(dataQuality);
                        return [2 /*return*/, {
                                homeWinProbability: Math.round(normalizedHome * 100) / 100,
                                awayWinProbability: Math.round(normalizedAway * 100) / 100,
                                drawProbability: Math.round(normalizedDraw * 100) / 100,
                                confidence: confidence,
                                dataQuality: dataQuality,
                            }];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Erro ao gerar probabilidades automáticas:", error_1);
                        // Retornar probabilidades neutras em caso de erro
                        return [2 /*return*/, {
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
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calcula a probabilidade de empate baseada nas estatísticas dos times
     */
    ProbabilityService.calculateDrawProbability = function (homeStats, awayStats) {
        // Média de empates dos dois times
        var homeDrawRate = homeStats.fixtures.draws.total / homeStats.fixtures.played.total || 0;
        var awayDrawRate = awayStats.fixtures.draws.total / awayStats.fixtures.played.total || 0;
        var avgDrawRate = (homeDrawRate + awayDrawRate) / 2;
        // Converter para percentual (base de 25% para empates)
        return Math.max(15, Math.min(40, avgDrawRate * 100 + 25));
    };
    /**
     * Calcula o nível de confiança baseado na qualidade dos dados disponíveis
     */
    ProbabilityService.calculateConfidence = function (dataQuality) {
        var confidence = 0;
        if (dataQuality.hasStats)
            confidence += 40; // Dados mais importantes
        if (dataQuality.hasForm)
            confidence += 25;
        if (dataQuality.hasStandings)
            confidence += 20;
        if (dataQuality.hasH2H)
            confidence += 15;
        return confidence;
    };
    /**
     * Gera probabilidades rápidas baseadas apenas em odds (quando dados completos não estão disponíveis)
     */
    ProbabilityService.generateProbabilityFromOdds = function (homeOdd, drawOdd, awayOdd) {
        var homeImplied = 100 / homeOdd;
        var drawImplied = 100 / drawOdd;
        var awayImplied = 100 / awayOdd;
        // Remover margin das casas de apostas (normalizar)
        var total = homeImplied + drawImplied + awayImplied;
        var margin = total - 100;
        var normalizedHome = homeImplied - (homeImplied / total) * margin;
        var normalizedDraw = drawImplied - (drawImplied / total) * margin;
        var normalizedAway = awayImplied - (awayImplied / total) * margin;
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
    };
    return ProbabilityService;
}());
exports.ProbabilityService = ProbabilityService;
