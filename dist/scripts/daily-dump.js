"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DailyDumpService = void 0;
var api_football_1 = require("../services/api-football");
var supabase_1 = require("../lib/supabase");
var DailyDumpService = /** @class */ (function () {
    function DailyDumpService() {
    }
    DailyDumpService.runDailyDump = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            var _a, date, _b, leagues, _c, forceUpdate, _d, includeOdds, _e, includeStats, _f, includeStandings, allFixtures, _i, leagues_1, leagueId, fixtures, error_1, _g, allFixtures_1, fixture, _h, allFixtures_2, fixture, odds, error_2, uniqueTeams, currentSeason, _j, uniqueTeams_1, team, stats, error_3, uniqueLeagues, currentSeason, _k, uniqueLeagues_1, leagueId, standings, error_4, summary, error_5;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _a = options.date, date = _a === void 0 ? new Date().toISOString().split("T")[0] : _a, _b = options.leagues, leagues = _b === void 0 ? this.DEFAULT_LEAGUES : _b, _c = options.forceUpdate, forceUpdate = _c === void 0 ? false : _c, _d = options.includeOdds, includeOdds = _d === void 0 ? true : _d, _e = options.includeStats, includeStats = _e === void 0 ? true : _e, _f = options.includeStandings, includeStandings = _f === void 0 ? true : _f;
                        console.log("🚀 Iniciando dump diário...");
                        console.log("\uD83D\uDCC5 Data: ".concat(date));
                        console.log("\uD83C\uDFC6 Ligas: ".concat(leagues.join(", ")));
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, 38, , 39]);
                        // 1. Buscar partidas do dia
                        console.log("📅 Buscando partidas...");
                        allFixtures = [];
                        _i = 0, leagues_1 = leagues;
                        _l.label = 2;
                    case 2:
                        if (!(_i < leagues_1.length)) return [3 /*break*/, 8];
                        leagueId = leagues_1[_i];
                        _l.label = 3;
                    case 3:
                        _l.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, api_football_1.ApiFootballService.getFixtures(date, leagueId)];
                    case 4:
                        fixtures = _l.sent();
                        allFixtures.push.apply(allFixtures, fixtures);
                        console.log("\u2705 Liga ".concat(leagueId, ": ").concat(fixtures.length, " partidas encontradas"));
                        // Delay para respeitar o limite de requisições
                        return [4 /*yield*/, this.delay(1000)];
                    case 5:
                        // Delay para respeitar o limite de requisições
                        _l.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _l.sent();
                        console.error("\u274C Erro ao buscar partidas da liga ".concat(leagueId, ":"), error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        console.log("\uD83D\uDCCA Total de partidas encontradas: ".concat(allFixtures.length));
                        // 2. Salvar partidas no Supabase
                        console.log("💾 Salvando partidas no banco de dados...");
                        _g = 0, allFixtures_1 = allFixtures;
                        _l.label = 9;
                    case 9:
                        if (!(_g < allFixtures_1.length)) return [3 /*break*/, 12];
                        fixture = allFixtures_1[_g];
                        return [4 /*yield*/, this.saveFixture(fixture, forceUpdate)];
                    case 10:
                        _l.sent();
                        _l.label = 11;
                    case 11:
                        _g++;
                        return [3 /*break*/, 9];
                    case 12:
                        if (!(includeOdds && allFixtures.length > 0)) return [3 /*break*/, 20];
                        console.log("🎯 Buscando odds...");
                        _h = 0, allFixtures_2 = allFixtures;
                        _l.label = 13;
                    case 13:
                        if (!(_h < allFixtures_2.length)) return [3 /*break*/, 20];
                        fixture = allFixtures_2[_h];
                        _l.label = 14;
                    case 14:
                        _l.trys.push([14, 18, , 19]);
                        return [4 /*yield*/, api_football_1.ApiFootballService.getAllOddsForFixture(fixture.id)];
                    case 15:
                        odds = _l.sent();
                        return [4 /*yield*/, this.saveOdds(fixture.id, odds, forceUpdate)];
                    case 16:
                        _l.sent();
                        console.log("\u2705 Odds salvas para a partida ".concat(fixture.id));
                        // Delay para respeitar o limite de requisições
                        return [4 /*yield*/, this.delay(2000)];
                    case 17:
                        // Delay para respeitar o limite de requisições
                        _l.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        error_2 = _l.sent();
                        console.error("\u274C Erro ao buscar odds da partida ".concat(fixture.id, ":"), error_2);
                        return [3 /*break*/, 19];
                    case 19:
                        _h++;
                        return [3 /*break*/, 13];
                    case 20:
                        if (!(includeStats && allFixtures.length > 0)) return [3 /*break*/, 28];
                        console.log("📈 Buscando estatísticas dos times...");
                        uniqueTeams = this.getUniqueTeams(allFixtures);
                        currentSeason = new Date().getFullYear();
                        _j = 0, uniqueTeams_1 = uniqueTeams;
                        _l.label = 21;
                    case 21:
                        if (!(_j < uniqueTeams_1.length)) return [3 /*break*/, 28];
                        team = uniqueTeams_1[_j];
                        _l.label = 22;
                    case 22:
                        _l.trys.push([22, 26, , 27]);
                        return [4 /*yield*/, api_football_1.ApiFootballService.getTeamStatistics(team.id, currentSeason, team.leagueId)];
                    case 23:
                        stats = _l.sent();
                        return [4 /*yield*/, this.saveTeamStatistics(team.id, team.leagueId, stats, forceUpdate)];
                    case 24:
                        _l.sent();
                        console.log("\u2705 Estat\u00EDsticas salvas para o time ".concat(team.name));
                        return [4 /*yield*/, this.delay(1500)];
                    case 25:
                        _l.sent();
                        return [3 /*break*/, 27];
                    case 26:
                        error_3 = _l.sent();
                        console.error("\u274C Erro ao buscar estat\u00EDsticas do time ".concat(team.name, ":"), error_3);
                        return [3 /*break*/, 27];
                    case 27:
                        _j++;
                        return [3 /*break*/, 21];
                    case 28:
                        if (!includeStandings) return [3 /*break*/, 36];
                        console.log("🏆 Buscando classificações...");
                        uniqueLeagues = Array.from(new Set(allFixtures.map(function (f) { return f.league.id; })));
                        currentSeason = new Date().getFullYear();
                        _k = 0, uniqueLeagues_1 = uniqueLeagues;
                        _l.label = 29;
                    case 29:
                        if (!(_k < uniqueLeagues_1.length)) return [3 /*break*/, 36];
                        leagueId = uniqueLeagues_1[_k];
                        _l.label = 30;
                    case 30:
                        _l.trys.push([30, 34, , 35]);
                        return [4 /*yield*/, api_football_1.ApiFootballService.getStandings(leagueId, currentSeason)];
                    case 31:
                        standings = _l.sent();
                        return [4 /*yield*/, this.saveStandings(leagueId, standings, forceUpdate)];
                    case 32:
                        _l.sent();
                        console.log("\u2705 Classifica\u00E7\u00E3o salva para a liga ".concat(leagueId));
                        return [4 /*yield*/, this.delay(1500)];
                    case 33:
                        _l.sent();
                        return [3 /*break*/, 35];
                    case 34:
                        error_4 = _l.sent();
                        console.error("\u274C Erro ao buscar classifica\u00E7\u00E3o da liga ".concat(leagueId, ":"), error_4);
                        return [3 /*break*/, 35];
                    case 35:
                        _k++;
                        return [3 /*break*/, 29];
                    case 36: return [4 /*yield*/, this.generateDumpSummary(date)];
                    case 37:
                        summary = _l.sent();
                        console.log("📋 Resumo do dump:");
                        console.log("   - Partidas: ".concat(summary.fixtures));
                        console.log("   - Odds: ".concat(summary.odds));
                        console.log("   - Times com estat\u00EDsticas: ".concat(summary.teamStats));
                        console.log("   - Classifica\u00E7\u00F5es: ".concat(summary.standings));
                        console.log("✅ Dump diário concluído com sucesso!");
                        return [3 /*break*/, 39];
                    case 38:
                        error_5 = _l.sent();
                        console.error("❌ Erro no dump diário:", error_5);
                        throw error_5;
                    case 39: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.saveFixture = function (fixture_1) {
        return __awaiter(this, arguments, void 0, function (fixture, forceUpdate) {
            var existingData, _a, _b, data, error, error_6;
            if (forceUpdate === void 0) { forceUpdate = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        if (!!forceUpdate) return [3 /*break*/, 2];
                        return [4 /*yield*/, supabase_1.supabaseAdmin
                                .from("fixtures")
                                .select("id")
                                .eq("api_fixture_id", fixture.id)
                                .single()];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = null;
                        _c.label = 3;
                    case 3:
                        existingData = _a;
                        if ((existingData === null || existingData === void 0 ? void 0 : existingData.data) && !forceUpdate) {
                            console.log("\u23ED\uFE0F Partida ".concat(fixture.id, " j\u00E1 existe no banco de dados"));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, supabase_1.supabaseAdmin.from("fixtures").upsert({
                                api_fixture_id: fixture.id,
                                date: fixture.fixture.date.split("T")[0],
                                timestamp: fixture.fixture.timestamp,
                                status: fixture.fixture.status,
                                venue: fixture.fixture.venue,
                                teams: fixture.teams,
                                goals: fixture.goals,
                                score: fixture.score,
                                league: fixture.league,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: "api_fixture_id",
                            })];
                    case 4:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 6];
                    case 5:
                        error_6 = _c.sent();
                        console.error("Erro ao salvar partida:", error_6);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.saveOdds = function (fixtureId_1, odds_1) {
        return __awaiter(this, arguments, void 0, function (fixtureId, odds, forceUpdate) {
            var existingOdds, _i, odds_2, odd, _a, _b, bookmaker, _c, _d, bet, _e, data, error, error_7;
            if (forceUpdate === void 0) { forceUpdate = false; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 11, , 12]);
                        if (!!forceUpdate) return [3 /*break*/, 2];
                        return [4 /*yield*/, supabase_1.supabaseAdmin
                                .from("odds")
                                .select("id")
                                .eq("api_fixture_id", fixtureId)
                                .limit(1)];
                    case 1:
                        existingOdds = _f.sent();
                        if (existingOdds.data && existingOdds.data.length > 0) {
                            console.log("\u23ED\uFE0F Odds da partida ".concat(fixtureId, " j\u00E1 existem no banco de dados"));
                            return [2 /*return*/];
                        }
                        _f.label = 2;
                    case 2:
                        _i = 0, odds_2 = odds;
                        _f.label = 3;
                    case 3:
                        if (!(_i < odds_2.length)) return [3 /*break*/, 10];
                        odd = odds_2[_i];
                        _a = 0, _b = odd.bookmakers || [];
                        _f.label = 4;
                    case 4:
                        if (!(_a < _b.length)) return [3 /*break*/, 9];
                        bookmaker = _b[_a];
                        _c = 0, _d = bookmaker.bets || [];
                        _f.label = 5;
                    case 5:
                        if (!(_c < _d.length)) return [3 /*break*/, 8];
                        bet = _d[_c];
                        return [4 /*yield*/, supabase_1.supabaseAdmin.from("odds").upsert({
                                api_fixture_id: fixtureId,
                                bookmaker_id: bookmaker.id,
                                bookmaker_name: bookmaker.name,
                                market_name: bet.name,
                                values: bet.values,
                                updated_at: new Date().toISOString(),
                            })];
                    case 6:
                        _e = _f.sent(), data = _e.data, error = _e.error;
                        if (error)
                            throw error;
                        _f.label = 7;
                    case 7:
                        _c++;
                        return [3 /*break*/, 5];
                    case 8:
                        _a++;
                        return [3 /*break*/, 4];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_7 = _f.sent();
                        console.error("Erro ao salvar odds:", error_7);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.getUniqueTeams = function (fixtures) {
        var teams = new Map();
        fixtures.forEach(function (fixture) {
            var homeTeam = {
                id: fixture.teams.home.id,
                name: fixture.teams.home.name,
                leagueId: fixture.league.id,
            };
            var awayTeam = {
                id: fixture.teams.away.id,
                name: fixture.teams.away.name,
                leagueId: fixture.league.id,
            };
            teams.set(homeTeam.id, homeTeam);
            teams.set(awayTeam.id, awayTeam);
        });
        return Array.from(teams.values());
    };
    DailyDumpService.saveTeamStatistics = function (teamId_1, leagueId_1, stats_1) {
        return __awaiter(this, arguments, void 0, function (teamId, leagueId, stats, forceUpdate) {
            var _a, data, error, error_8;
            if (forceUpdate === void 0) { forceUpdate = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabaseAdmin
                                .from("team_statistics")
                                .upsert({
                                team_id: teamId,
                                league_id: leagueId,
                                season: new Date().getFullYear(),
                                statistics: stats,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: "team_id,league_id,season",
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        console.error("Erro ao salvar estatísticas do time:", error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.saveStandings = function (leagueId_1, standings_1) {
        return __awaiter(this, arguments, void 0, function (leagueId, standings, forceUpdate) {
            var _a, data, error, error_9;
            if (forceUpdate === void 0) { forceUpdate = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabaseAdmin.from("standings").upsert({
                                league_id: leagueId,
                                season: new Date().getFullYear(),
                                standings: standings,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: "league_id,season",
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error("Erro ao salvar classificação:", error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.generateDumpSummary = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fixtures, odds, teamStats, standings, error_10;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                supabase_1.supabaseAdmin.from("fixtures").select("id").eq("date", date),
                                supabase_1.supabaseAdmin.from("odds").select("id"),
                                supabase_1.supabaseAdmin.from("team_statistics").select("id"),
                                supabase_1.supabaseAdmin.from("standings").select("id"),
                            ])];
                    case 1:
                        _a = _f.sent(), fixtures = _a[0], odds = _a[1], teamStats = _a[2], standings = _a[3];
                        return [2 /*return*/, {
                                fixtures: ((_b = fixtures.data) === null || _b === void 0 ? void 0 : _b.length) || 0,
                                odds: ((_c = odds.data) === null || _c === void 0 ? void 0 : _c.length) || 0,
                                teamStats: ((_d = teamStats.data) === null || _d === void 0 ? void 0 : _d.length) || 0,
                                standings: ((_e = standings.data) === null || _e === void 0 ? void 0 : _e.length) || 0,
                            }];
                    case 2:
                        error_10 = _f.sent();
                        console.error("Erro ao gerar resumo:", error_10);
                        return [2 /*return*/, { fixtures: 0, odds: 0, teamStats: 0, standings: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DailyDumpService.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /**
     * Execução manual com opções personalizadas
     */
    DailyDumpService.runManualDump = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                console.log("🔧 Executando dump manual...");
                return [2 /*return*/, this.runDailyDump(__assign(__assign({}, options), { forceUpdate: true }))];
            });
        });
    };
    /**
     * Dump rápido apenas com partidas e odds do dia
     */
    DailyDumpService.runQuickDump = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("⚡ Executando dump rápido...");
                return [2 /*return*/, this.runDailyDump({
                        date: date,
                        includeStats: false,
                        includeStandings: false,
                        forceUpdate: false,
                    })];
            });
        });
    };
    /**
     * Dump completo para uma liga específica
     */
    DailyDumpService.runLeagueDump = function (leagueId_1) {
        return __awaiter(this, arguments, void 0, function (leagueId, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                console.log("\uD83C\uDFC6 Executando dump da liga ".concat(leagueId, "..."));
                return [2 /*return*/, this.runDailyDump(__assign(__assign({}, options), { leagues: [leagueId], forceUpdate: true }))];
            });
        });
    };
    DailyDumpService.DEFAULT_LEAGUES = [
        39, // Premier League
        140, // La Liga
        78, // Bundesliga
        135, // Serie A
        61, // Ligue 1
        71, // Brasileirão
        2, // Champions League
        3, // UEFA Europa League
    ];
    return DailyDumpService;
}());
exports.DailyDumpService = DailyDumpService;
// Função para executar dump baseado em argumentos da linha de comando
function parseArguments() {
    var args = process.argv.slice(2);
    var options = {};
    for (var i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--date":
                options.date = args[++i];
                break;
            case "--league":
                var leagues = args[++i].split(",").map(Number);
                options.leagues = leagues;
                break;
            case "--force":
                options.forceUpdate = true;
                break;
            case "--no-odds":
                options.includeOdds = false;
                break;
            case "--no-stats":
                options.includeStats = false;
                break;
            case "--no-standings":
                options.includeStandings = false;
                break;
        }
    }
    return options;
}
// Execução manual
if (require.main === module) {
    var command = process.argv[2];
    var options = parseArguments();
    var promise = void 0;
    switch (command) {
        case "manual":
            promise = DailyDumpService.runManualDump(options);
            break;
        case "quick":
            promise = DailyDumpService.runQuickDump(options.date);
            break;
        case "league":
            var leagueId = parseInt(process.argv[3]);
            if (!leagueId) {
                console.error("❌ O ID da liga é obrigatório para o comando 'league'");
                process.exit(1);
            }
            promise = DailyDumpService.runLeagueDump(leagueId, options);
            break;
        default:
            promise = DailyDumpService.runDailyDump(options);
    }
    promise
        .then(function () {
        console.log("✅ Dump executado com sucesso!");
        process.exit(0);
    })
        .catch(function (error) {
        console.error("❌ Erro na execução:", error);
        process.exit(1);
    });
}
