"use strict";
'use client';
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
exports.default = FixturesList;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function FixturesList(_a) {
    var _this = this;
    var user = _a.user, onSelectFixture = _a.onSelectFixture;
    var _b = (0, react_1.useState)([]), fixtures = _b[0], setFixtures = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(new Date().toISOString().split('T')[0]), selectedDate = _d[0], setSelectedDate = _d[1];
    var _e = (0, react_1.useState)(''), selectedLeague = _e[0], setSelectedLeague = _e[1];
    (0, react_1.useEffect)(function () {
        loadFixtures();
    }, [selectedDate, selectedLeague]);
    var loadFixtures = function () { return __awaiter(_this, void 0, void 0, function () {
        var query, _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    query = supabase_1.supabase
                        .from('fixtures')
                        .select('*')
                        .eq('date', selectedDate)
                        .order('timestamp', { ascending: true });
                    if (selectedLeague) {
                        query = query.eq('league->name', selectedLeague);
                    }
                    return [4 /*yield*/, query];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setFixtures(data || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Erro ao carregar partidas:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getUniqueLeagues = function () {
        var leagues = fixtures.map(function (f) { var _a; return (_a = f.league) === null || _a === void 0 ? void 0 : _a.name; }).filter(Boolean);
        return Array.from(new Set(leagues));
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'FT': return 'bg-gray-500';
            case 'LIVE': return 'bg-green-500';
            case 'HT': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };
    var getStatusText = function (status) {
        switch (status) {
            case 'FT': return 'Finalizado';
            case 'LIVE': return 'Ao Vivo';
            case 'HT': return 'Intervalo';
            case 'NS': return 'Não Iniciado';
            default: return status;
        }
    };
    return (<div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                    <lucide_react_1.Calendar className="h-5 w-5 text-gray-400"/>
                    <input type="date" value={selectedDate} onChange={function (e) { return setSelectedDate(e.target.value); }} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>

                <div className="flex items-center space-x-2">
                    <lucide_react_1.Search className="h-5 w-5 text-gray-400"/>
                    <select value={selectedLeague} onChange={function (e) { return setSelectedLeague(e.target.value); }} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todas as ligas</option>
                        {getUniqueLeagues().map(function (league) { return (<option key={league} value={league}>{league}</option>); })}
                    </select>
                </div>
            </div>

            {/* Lista de Partidas */}
            {loading ? (<div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>) : fixtures.length === 0 ? (<div className="text-center py-8">
                    <lucide_react_1.Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma partida encontrada</h3>
                    <p className="text-gray-500">Tente selecionar uma data diferente</p>
                </div>) : (<div className="space-y-4">
                    {fixtures.map(function (fixture) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                return (<div key={fixture.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={function () { return onSelectFixture === null || onSelectFixture === void 0 ? void 0 : onSelectFixture(fixture); }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className={"px-2 py-1 rounded-full text-xs font-medium text-white ".concat(getStatusColor(((_a = fixture.status) === null || _a === void 0 ? void 0 : _a.short) || ''))}>
                                        {getStatusText(((_b = fixture.status) === null || _b === void 0 ? void 0 : _b.short) || '')}
                                    </span>
                                    {((_c = fixture.status) === null || _c === void 0 ? void 0 : _c.elapsed) && (<span className="text-sm text-gray-500">{fixture.status.elapsed}'</span>)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <lucide_react_1.Clock className="h-4 w-4 mr-1"/>
                                    {(0, utils_1.formatTime)(new Date(fixture.timestamp * 1000))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            {((_e = (_d = fixture.teams) === null || _d === void 0 ? void 0 : _d.home) === null || _e === void 0 ? void 0 : _e.logo) && (<img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-6 h-6"/>)}
                                            <span className="font-medium">{(_g = (_f = fixture.teams) === null || _f === void 0 ? void 0 : _f.home) === null || _g === void 0 ? void 0 : _g.name}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {(_j = (_h = fixture.goals) === null || _h === void 0 ? void 0 : _h.home) !== null && _j !== void 0 ? _j : '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {((_l = (_k = fixture.teams) === null || _k === void 0 ? void 0 : _k.away) === null || _l === void 0 ? void 0 : _l.logo) && (<img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-6 h-6"/>)}
                                            <span className="font-medium">{(_o = (_m = fixture.teams) === null || _m === void 0 ? void 0 : _m.away) === null || _o === void 0 ? void 0 : _o.name}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {(_q = (_p = fixture.goals) === null || _p === void 0 ? void 0 : _p.away) !== null && _q !== void 0 ? _q : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    {((_r = fixture.league) === null || _r === void 0 ? void 0 : _r.flag) && (<img src={fixture.league.flag} alt={fixture.league.country} className="w-4 h-4 mr-1"/>)}
                                    <span>{(_s = fixture.league) === null || _s === void 0 ? void 0 : _s.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <lucide_react_1.MapPin className="h-4 w-4 mr-1"/>
                                    <span>{(_t = fixture.venue) === null || _t === void 0 ? void 0 : _t.name}</span>
                                </div>
                            </div>
                        </div>);
            })}
                </div>)}
        </div>);
}
