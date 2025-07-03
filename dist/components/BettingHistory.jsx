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
exports.default = BettingHistory;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function BettingHistory(_a) {
    var _this = this;
    var user = _a.user, onStatsUpdate = _a.onStatsUpdate;
    var _b = (0, react_1.useState)([]), bets = _b[0], setBets = _b[1];
    var _c = (0, react_1.useState)([]), analyses = _c[0], setAnalyses = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), showBetModal = _e[0], setShowBetModal = _e[1];
    var _f = (0, react_1.useState)(null), selectedAnalysis = _f[0], setSelectedAnalysis = _f[1];
    (0, react_1.useEffect)(function () {
        loadData();
    }, [user]);
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, betsResponse, analysesResponse, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, Promise.all([
                            supabase_1.supabase
                                .from('bets')
                                .select('*')
                                .eq('user_id', user.id)
                                .order('created_at', { ascending: false }),
                            supabase_1.supabase
                                .from('analyses')
                                .select('*')
                                .eq('user_id', user.id)
                                .order('created_at', { ascending: false })
                        ])];
                case 1:
                    _a = _b.sent(), betsResponse = _a[0], analysesResponse = _a[1];
                    if (betsResponse.error)
                        throw betsResponse.error;
                    if (analysesResponse.error)
                        throw analysesResponse.error;
                    setBets(betsResponse.data || []);
                    setAnalyses(analysesResponse.data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Erro ao carregar dados:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getUnbettedAnalyses = function () {
        var bettedAnalysisIds = bets.map(function (bet) { return bet.analysis_id; });
        return analyses.filter(function (analysis) { return !bettedAnalysisIds.includes(analysis.id); });
    };
    var createBet = function (analysis) {
        setSelectedAnalysis(analysis);
        setShowBetModal(true);
    };
    var getStatusColor = function (result) {
        switch (result) {
            case 'win': return 'bg-success-100 text-success-800';
            case 'lose': return 'bg-danger-100 text-danger-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    var getStatusText = function (result) {
        switch (result) {
            case 'win': return 'Ganhou';
            case 'lose': return 'Perdeu';
            default: return 'Pendente';
        }
    };
    if (loading) {
        return (<div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>);
    }
    return (<div className="space-y-6">
            {/* Análises sem apostas */}
            {getUnbettedAnalyses().length > 0 && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Análises sem Apostas</h3>
                    <div className="space-y-2">
                        {getUnbettedAnalyses().slice(0, 3).map(function (analysis) { return (<div key={analysis.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                    <span className="font-medium">
                                        {analysis.home_team} vs {analysis.away_team}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({analysis.market} - {analysis.odd_value})
                                    </span>
                                </div>
                                <button onClick={function () { return createBet(analysis); }} className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">
                                    Registrar Aposta
                                </button>
                            </div>); })}
                    </div>
                </div>)}

            {/* Histórico de Apostas */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Histórico de Apostas</h3>
                    <span className="text-sm text-gray-500">{bets.length} apostas</span>
                </div>

                {bets.length === 0 ? (<div className="text-center py-12">
                        <lucide_react_1.Target className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma aposta registrada</h3>
                        <p className="text-gray-500">Suas apostas aparecerão aqui após registrá-las</p>
                    </div>) : (<div className="space-y-3">
                        {bets.map(function (bet) {
                var analysis = analyses.find(function (a) { return a.id === bet.analysis_id; });
                return (<div key={bet.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {analysis === null || analysis === void 0 ? void 0 : analysis.home_team} vs {analysis === null || analysis === void 0 ? void 0 : analysis.away_team}
                                                </span>
                                                <span className={"px-2 py-1 rounded-full text-xs font-medium ".concat(getStatusColor(bet.result || 'pending'))}>
                                                    {getStatusText(bet.result || 'pending')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {bet.choice} - Odd: {bet.odd_value}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Stake</div>
                                            <div className="font-medium">{(0, utils_1.formatCurrency)(bet.stake)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Retorno Potencial:</span>
                                            <div className="font-medium">{(0, utils_1.formatCurrency)(bet.potential_return)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Resultado:</span>
                                            <div className={"font-medium ".concat(bet.profit_loss && bet.profit_loss > 0 ? 'text-success-600' :
                        bet.profit_loss && bet.profit_loss < 0 ? 'text-danger-600' : 'text-gray-600')}>
                                                {bet.profit_loss ? (0, utils_1.formatCurrency)(bet.profit_loss) : 'Pendente'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Data:</span>
                                            <div className="font-medium">{(0, utils_1.formatDate)(bet.created_at || '')}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Mercado:</span>
                                            <div className="font-medium">{analysis === null || analysis === void 0 ? void 0 : analysis.market}</div>
                                        </div>
                                    </div>

                                    {bet.result === 'pending' && (<div className="mt-3 pt-3 border-t border-gray-100">
                                            <BetSettlement bet={bet} onUpdate={function () { loadData(); onStatsUpdate(); }}/>
                                        </div>)}
                                </div>);
            })}
                    </div>)}
            </div>

            {/* Modal de Nova Aposta */}
            {showBetModal && selectedAnalysis && (<BetModal analysis={selectedAnalysis} user={user} onClose={function () {
                setShowBetModal(false);
                setSelectedAnalysis(null);
            }} onSave={function () {
                loadData();
                onStatsUpdate();
                setShowBetModal(false);
                setSelectedAnalysis(null);
            }}/>)}
        </div>);
}
// Componente para liquidar aposta
function BetSettlement(_a) {
    var _this = this;
    var bet = _a.bet, onUpdate = _a.onUpdate;
    var _b = (0, react_1.useState)('win'), result = _b[0], setResult = _b[1];
    var _c = (0, react_1.useState)(false), saving = _c[0], setSaving = _c[1];
    var settleBet = function () { return __awaiter(_this, void 0, void 0, function () {
        var profitLoss, error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    profitLoss = result === 'win'
                        ? bet.potential_return - bet.stake
                        : -bet.stake;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('bets')
                            .update({
                            result: result,
                            profit_loss: profitLoss,
                            settled_at: new Date().toISOString()
                        })
                            .eq('id', bet.id)];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    onUpdate();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erro ao liquidar aposta:', error_2);
                    alert('Erro ao liquidar aposta');
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Liquidar aposta:</span>
            <div className="flex space-x-2">
                <label className="flex items-center">
                    <input type="radio" value="win" checked={result === 'win'} onChange={function (e) { return setResult(e.target.value); }} className="mr-1"/>
                    Ganhou
                </label>
                <label className="flex items-center">
                    <input type="radio" value="lose" checked={result === 'lose'} onChange={function (e) { return setResult(e.target.value); }} className="mr-1"/>
                    Perdeu
                </label>
            </div>
            <button onClick={settleBet} disabled={saving} className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Confirmar'}
            </button>
        </div>);
}
// Modal para criar nova aposta
function BetModal(_a) {
    var _this = this;
    var analysis = _a.analysis, user = _a.user, onClose = _a.onClose, onSave = _a.onSave;
    var _b = (0, react_1.useState)(''), choice = _b[0], setChoice = _b[1];
    var _c = (0, react_1.useState)(0), stake = _c[0], setStake = _c[1];
    var _d = (0, react_1.useState)(false), saving = _d[0], setSaving = _d[1];
    var potentialReturn = stake * analysis.odd_value;
    var saveBet = function () { return __awaiter(_this, void 0, void 0, function () {
        var betData, error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!choice || stake <= 0)
                        return [2 /*return*/];
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    betData = {
                        user_id: user.id,
                        analysis_id: analysis.id,
                        choice: choice,
                        stake: stake,
                        odd_value: analysis.odd_value,
                        potential_return: potentialReturn,
                        result: 'pending'
                    };
                    return [4 /*yield*/, supabase_1.supabase
                            .from('bets')
                            .insert(betData)];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    onSave();
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Erro ao salvar aposta:', error_3);
                    alert('Erro ao salvar aposta');
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Aposta</h3>

                <div className="space-y-4">
                    <div>
                        <span className="font-medium">
                            {analysis.home_team} vs {analysis.away_team}
                        </span>
                        <div className="text-sm text-gray-600">
                            {analysis.market} - Odd: {analysis.odd_value}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sua escolha
                        </label>
                        <input type="text" value={choice} onChange={function (e) { return setChoice(e.target.value); }} placeholder="Ex: Vitória Mandante, Over 2.5, etc." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor apostado (R$)
                        </label>
                        <input type="number" value={stake} onChange={function (e) { return setStake(Number(e.target.value)); }} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>

                    {stake > 0 && (<div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm text-gray-600">Retorno potencial:</div>
                            <div className="text-lg font-medium text-gray-900">
                                {(0, utils_1.formatCurrency)(potentialReturn)}
                            </div>
                        </div>)}
                </div>

                <div className="flex space-x-3 mt-6">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={saveBet} disabled={!choice || stake <= 0 || saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>);
}
