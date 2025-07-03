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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var daily_dump_1 = require("@/scripts/daily-dump");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a, type, date, leagues, _b, forceUpdate, _c, includeOdds, _d, includeStats, _e, includeStandings, authHeader, result, _f, error_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _g.sent();
                    _a = body.type, type = _a === void 0 ? "daily" : _a, date = body.date, leagues = body.leagues, _b = body.forceUpdate, forceUpdate = _b === void 0 ? false : _b, _c = body.includeOdds, includeOdds = _c === void 0 ? true : _c, _d = body.includeStats, includeStats = _d === void 0 ? true : _d, _e = body.includeStandings, includeStandings = _e === void 0 ? true : _e;
                    authHeader = request.headers.get("authorization");
                    if (!authHeader || authHeader !== "Bearer ".concat(process.env.DUMP_API_KEY)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Não autorizado" }, { status: 401 })];
                    }
                    console.log("\uD83D\uDD04 Iniciando dump via API - Tipo: ".concat(type));
                    result = void 0;
                    _f = type;
                    switch (_f) {
                        case "manual": return [3 /*break*/, 2];
                        case "quick": return [3 /*break*/, 4];
                        case "league": return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, daily_dump_1.DailyDumpService.runManualDump({
                        date: date,
                        leagues: leagues,
                        forceUpdate: forceUpdate,
                        includeOdds: includeOdds,
                        includeStats: includeStats,
                        includeStandings: includeStandings,
                    })];
                case 3:
                    result = _g.sent();
                    return [3 /*break*/, 10];
                case 4: return [4 /*yield*/, daily_dump_1.DailyDumpService.runQuickDump(date)];
                case 5:
                    result = _g.sent();
                    return [3 /*break*/, 10];
                case 6:
                    if (!leagues || leagues.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "ID da liga é obrigatório para dump por liga" }, { status: 400 })];
                    }
                    return [4 /*yield*/, daily_dump_1.DailyDumpService.runLeagueDump(leagues[0], {
                            date: date,
                            forceUpdate: forceUpdate,
                            includeOdds: includeOdds,
                            includeStats: includeStats,
                            includeStandings: includeStandings,
                        })];
                case 7:
                    result = _g.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, daily_dump_1.DailyDumpService.runDailyDump({
                        date: date,
                        leagues: leagues,
                        forceUpdate: forceUpdate,
                        includeOdds: includeOdds,
                        includeStats: includeStats,
                        includeStandings: includeStandings,
                    })];
                case 9:
                    result = _g.sent();
                    _g.label = 10;
                case 10: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        message: "Dump ".concat(type, " executado com sucesso"),
                        timestamp: new Date().toISOString(),
                    })];
                case 11:
                    error_1 = _g.sent();
                    console.error("Erro no dump via API:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: "Erro interno do servidor",
                            message: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
                        }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, status;
        return __generator(this, function (_a) {
            searchParams = request.nextUrl.searchParams;
            status = searchParams.get("status");
            if (status === "health") {
                return [2 /*return*/, server_1.NextResponse.json({
                        status: "OK",
                        message: "API de dump funcionando",
                        timestamp: new Date().toISOString(),
                    })];
            }
            return [2 /*return*/, server_1.NextResponse.json({
                    message: "API de Dump Diário",
                    endpoints: {
                        "POST /api/dump": "Executar dump manual",
                        "GET /api/dump?status=health": "Verificar status da API",
                    },
                    types: ["daily", "manual", "quick", "league"],
                    example: {
                        type: "manual",
                        date: "2025-07-02",
                        leagues: [39, 140],
                        forceUpdate: true,
                        includeOdds: true,
                        includeStats: true,
                        includeStandings: true,
                    },
                })];
        });
    });
}
