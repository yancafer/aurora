"use strict";
'use client';
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DumpControl;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function DumpControl(_a) {
    var _this = this;
    var user = _a.user;
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), lastDumpResult = _c[0], setLastDumpResult = _c[1];
    var _d = (0, react_1.useState)(new Date().toISOString().split('T')[0]), selectedDate = _d[0], setSelectedDate = _d[1];
    var _e = (0, react_1.useState)([39, 140, 78, 135, 61, 71]), selectedLeagues = _e[0], setSelectedLeagues = _e[1];
    var _f = (0, react_1.useState)({
        includeOdds: true,
        includeStats: true,
        includeStandings: true,
        forceUpdate: false,
    }), dumpOptions = _f[0], setDumpOptions = _f[1];
    var leagues = [
        { id: 39, name: 'Premier League' },
        { id: 140, name: 'La Liga' },
        { id: 78, name: 'Bundesliga' },
        { id: 135, name: 'Serie A' },
        { id: 61, name: 'Ligue 1' },
        { id: 71, name: 'Brasileirão' },
        { id: 2, name: 'Champions League' },
        { id: 3, name: 'Europa League' },
    ];
    var executeDump = function (type) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/dump', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(process.env.NEXT_PUBLIC_DUMP_API_KEY),
                            },
                            body: JSON.stringify(__assign({ type: type, date: selectedDate, leagues: selectedLeagues }, dumpOptions)),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (response.ok) {
                        setLastDumpResult({
                            success: true,
                            message: result.message,
                            timestamp: new Date().toLocaleString(),
                            type: type,
                        });
                    }
                    else {
                        setLastDumpResult({
                            success: false,
                            message: result.error || 'Erro desconhecido',
                            timestamp: new Date().toLocaleString(),
                            type: type,
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    setLastDumpResult({
                        success: false,
                        message: error_1 instanceof Error ? error_1.message : 'Erro de conexão',
                        timestamp: new Date().toLocaleString(),
                        type: type,
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var toggleLeague = function (leagueId) {
        setSelectedLeagues(function (prev) {
            return prev.includes(leagueId)
                ? prev.filter(function (id) { return id !== leagueId; })
                : __spreadArray(__spreadArray([], prev, true), [leagueId], false);
        });
    };
    return (<div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <lucide_react_1.Database className="h-6 w-6 text-blue-600 mr-2"/>
                    Controle de Dump
                </h2>
                <lucide_react_1.Settings className="h-5 w-5 text-gray-400"/>
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Data e Ligas */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <lucide_react_1.Calendar className="h-4 w-4 inline mr-1"/>
                            Data
                        </label>
                        <input type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <lucide_react_1.Trophy className="h-4 w-4 inline mr-1"/>
                            Ligas Selecionadas
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {leagues.map(function (league) { return (<label key={league.id} className="flex items-center">
                                    <input type="checkbox" checked={selectedLeagues.includes(league.id)} onChange={function () { return toggleLeague(league.id); }} className="mr-2"/>
                                    <span className="text-sm">{league.name}</span>
                                </label>); })}
                        </div>
                    </div>
                </div>

                {/* Opções de Dump */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <lucide_react_1.Settings className="h-4 w-4 inline mr-1"/>
                            Opções de Dados
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input type="checkbox" checked={dumpOptions.includeOdds} onChange={function (e) { return setDumpOptions(function (prev) { return (__assign(__assign({}, prev), { includeOdds: e.target.checked })); }); }} className="mr-2"/>
                                <span className="text-sm">Incluir Odds</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={dumpOptions.includeStats} onChange={function (e) { return setDumpOptions(function (prev) { return (__assign(__assign({}, prev), { includeStats: e.target.checked })); }); }} className="mr-2"/>
                                <span className="text-sm">Incluir Estatísticas</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={dumpOptions.includeStandings} onChange={function (e) { return setDumpOptions(function (prev) { return (__assign(__assign({}, prev), { includeStandings: e.target.checked })); }); }} className="mr-2"/>
                                <span className="text-sm">Incluir Classificações</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" checked={dumpOptions.forceUpdate} onChange={function (e) { return setDumpOptions(function (prev) { return (__assign(__assign({}, prev), { forceUpdate: e.target.checked })); }); }} className="mr-2"/>
                                <span className="text-sm">Forçar Atualização</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-800">
                            <strong>Ligas selecionadas:</strong> {selectedLeagues.length}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                            {selectedLeagues.length === 0 ? 'Nenhuma liga selecionada' :
            "".concat(leagues.filter(function (l) { return selectedLeagues.includes(l.id); }).map(function (l) { return l.name; }).join(', '))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <button onClick={function () { return executeDump('quick'); }} disabled={loading} className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loading ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Download className="h-4 w-4 mr-2"/>)}
                    Dump Rápido
                </button>

                <button onClick={function () { return executeDump('manual'); }} disabled={loading} className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Settings className="h-4 w-4 mr-2"/>)}
                    Dump Manual
                </button>

                <button onClick={function () { return executeDump('daily'); }} disabled={loading} className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                    {loading ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Calendar className="h-4 w-4 mr-2"/>)}
                    Dump Diário
                </button>

                <button onClick={function () { return executeDump('league'); }} disabled={loading || selectedLeagues.length === 0} className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                    {loading ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Trophy className="h-4 w-4 mr-2"/>)}
                    Por Liga
                </button>
            </div>

            {/* Descrições dos Tipos de Dump */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Tipos de Dump</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li><strong>Rápido:</strong> Apenas partidas e odds</li>
                        <li><strong>Manual:</strong> Dump completo personalizado</li>
                        <li><strong>Diário:</strong> Dump padrão automático</li>
                        <li><strong>Por Liga:</strong> Foco em ligas específicas</li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Opções Disponíveis</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li><strong>Odds:</strong> Mercados de apostas</li>
                        <li><strong>Estatísticas:</strong> Desempenho dos times</li>
                        <li><strong>Classificações:</strong> Tabelas das ligas</li>
                        <li><strong>Forçar:</strong> Sobrescrever dados existentes</li>
                    </ul>
                </div>
            </div>

            {/* Resultado do Último Dump */}
            {lastDumpResult && (<div className={"p-4 rounded-lg border-l-4 ".concat(lastDumpResult.success
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400')}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={"font-medium ".concat(lastDumpResult.success ? 'text-green-800' : 'text-red-800')}>
                                {lastDumpResult.success ? '✅ Sucesso' : '❌ Erro'}
                            </h3>
                            <p className={"text-sm ".concat(lastDumpResult.success ? 'text-green-600' : 'text-red-600')}>
                                {lastDumpResult.message}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">
                                Tipo: {lastDumpResult.type}
                            </div>
                            <div className="text-xs text-gray-500">
                                {lastDumpResult.timestamp}
                            </div>
                        </div>
                    </div>
                </div>)}
        </div>);
}
