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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFootballService = void 0;
var axios_1 = __importDefault(require("axios"));
var API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
var API_KEY = process.env.API_FOOTBALL_KEY;
var apiClient = axios_1.default.create({
    baseURL: API_FOOTBALL_BASE_URL,
    headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "v3.football.api-sports.io",
    },
});
var ApiFootballService = /** @class */ (function () {
    function ApiFootballService() {
    }
    ApiFootballService.getFixtures = function (date, league) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = { date: date };
                        if (league)
                            params.league = league;
                        return [4 /*yield*/, apiClient.get("/fixtures", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error fetching fixtures:", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getOdds = function (fixtureId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/odds", {
                                params: {
                                    fixture: fixtureId,
                                    bookmaker: "8", // Bet365
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error fetching odds:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getTeamStatistics = function (teamId, season, leagueId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/teams/statistics", {
                                params: {
                                    team: teamId,
                                    season: season,
                                    league: leagueId,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error fetching team statistics:", error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getStandings = function (leagueId, season) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/standings", {
                                params: {
                                    league: leagueId,
                                    season: season,
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, ((_b = (_a = response.data.response[0]) === null || _a === void 0 ? void 0 : _a.league) === null || _b === void 0 ? void 0 : _b.standings[0]) || []];
                    case 2:
                        error_4 = _c.sent();
                        console.error("Error fetching standings:", error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getHeadToHead = function (team1, team2) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/fixtures/headtohead", {
                                params: {
                                    h2h: "".concat(team1, "-").concat(team2),
                                    last: 10,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error fetching head to head:", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getFixturesByLeague = function (leagueId, season, from, to) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = {
                            league: leagueId,
                            season: season,
                        };
                        if (from)
                            params.from = from;
                        if (to)
                            params.to = to;
                        return [4 /*yield*/, apiClient.get("/fixtures", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error fetching fixtures by league:", error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getLeagues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/leagues")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error fetching leagues:", error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getTeamForm = function (teamId_1, leagueId_1, season_1) {
        return __awaiter(this, arguments, void 0, function (teamId, leagueId, season, last) {
            var response, error_8;
            if (last === void 0) { last = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/fixtures", {
                                params: {
                                    team: teamId,
                                    league: leagueId,
                                    season: season,
                                    last: last,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_8 = _a.sent();
                        console.error("Error fetching team form:", error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiFootballService.getAllOddsForFixture = function (fixtureId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, apiClient.get("/odds", {
                                params: {
                                    fixture: fixtureId,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.response];
                    case 2:
                        error_9 = _a.sent();
                        console.error("Error fetching all odds:", error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ApiFootballService;
}());
exports.ApiFootballService = ApiFootballService;
