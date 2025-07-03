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
exports.default = BettingAnalysis;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var betting_calculator_1 = require("@/utils/betting-calculator");
var probability_service_1 = require("@/services/probability-service");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function BettingAnalysis(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f, _g;
    var fixture = _a.fixture, user = _a.user, onBack = _a.onBack;
    var _h = (0, react_1.useState)([]), odds = _h[0], setOdds = _h[1];
    var _j = (0, react_1.useState)(''), selectedMarket = _j[0], setSelectedMarket = _j[1];
    var _k = (0, react_1.useState)(null), selectedOdd = _k[0], setSelectedOdd = _k[1];
    var _l = (0, react_1.useState)(50), estimatedProbability = _l[0], setEstimatedProbability = _l[1];
    var _m = (0, react_1.useState)(true), isManualEstimate = _m[0], setIsManualEstimate = _m[1];
    var _o = (0, react_1.useState)(null), calculation = _o[0], setCalculation = _o[1];
    var _p = (0, react_1.useState)(true), loading = _p[0], setLoading = _p[1];
    var _q = (0, react_1.useState)(false), saving = _q[0], setSaving = _q[1];
    var _r = (0, react_1.useState)(false), generatingProbability = _r[0], setGeneratingProbability = _r[1];
    var _s = (0, react_1.useState)(null), autoProbability = _s[0], setAutoProbability = _s[1];
    (0, react_1.useEffect)(function () {
        loadOdds();
    }, [fixture]);
    (0, react_1.useEffect)(function () {
        if (selectedOdd && estimatedProbability) {
            var calc = betting_calculator_1.BettingCalculator.calculateBettingValues(parseFloat(selectedOdd.value), estimatedProbability);
            setCalculation(calc);
        }
    }, [selectedOdd, estimatedProbability]);
    var loadOdds = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, firstMarket, firstOdd, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('odds')
                            .select('*')
                            .eq('api_fixture_id', fixture.id)];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setOdds(data || []);
                    // Selecionar primeiro mercado disponível
                    if (data && data.length > 0) {
                        firstMarket = data[0].market_name;
                        setSelectedMarket(firstMarket);
                        firstOdd = (_b = data[0].values) === null || _b === void 0 ? void 0 : _b[0];
                        if (firstOdd) {
                            setSelectedOdd(firstOdd);
                        }
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _c.sent();
                    console.error('Erro ao carregar odds:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var generateAutomaticProbability = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setGeneratingProbability(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, probability_service_1.ProbabilityService.generateAutomaticProbability(fixture)];
                case 2:
                    result = _a.sent();
                    setAutoProbability(result);
                    // Se o usuário não está usando estimativa manual, atualizar com o valor automático
                    if (!isManualEstimate && selectedMarket) {
                        updateProbabilityFromAuto(selectedMarket, result);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erro ao gerar probabilidade automática:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setGeneratingProbability(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var updateProbabilityFromAuto = function (market, result) {
        var probabilityValue = 50;
        if (market.includes('Home') || market.includes('1')) {
            probabilityValue = result.homeWinProbability;
        }
        else if (market.includes('Away') || market.includes('2')) {
            probabilityValue = result.awayWinProbability;
        }
        else if (market.includes('Draw') || market.includes('X')) {
            probabilityValue = result.drawProbability;
        }
        setEstimatedProbability(probabilityValue);
    };
    var handleMarketChange = function (market, odd) {
        setSelectedMarket(market);
        setSelectedOdd(odd);
        // Se temos probabilidade automática e não está usando manual, aplicar valor correspondente
        if (autoProbability && !isManualEstimate) {
            updateProbabilityFromAuto(market, autoProbability);
        }
    };
    var getAvailableMarkets = function () {
        var markets = odds.map(function (o) { return o.market_name; });
        return Array.from(new Set(markets));
    };
    var getOddsForMarket = function () {
        return odds.filter(function (o) { return o.market_name === selectedMarket; });
    };
    var saveAnalysis = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_3;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!selectedOdd || !calculation)
                        return [2 /*return*/];
                    setSaving(true);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, supabase_1.supabase.from('analyses').insert({
                            user_id: user.id,
                            fixture_id: fixture.id,
                            api_fixture_id: fixture.id,
                            home_team: ((_c = (_b = fixture.teams) === null || _b === void 0 ? void 0 : _b.home) === null || _c === void 0 ? void 0 : _c.name) || '',
                            away_team: ((_e = (_d = fixture.teams) === null || _d === void 0 ? void 0 : _d.away) === null || _e === void 0 ? void 0 : _e.name) || '',
                            market: selectedMarket,
                            odd_value: parseFloat(selectedOdd.value),
                            bookmaker: selectedOdd.bookmaker_name,
                            implicit_probability: calculation.implicitProbability,
                            estimated_probability: estimatedProbability,
                            expected_value: calculation.expectedValue,
                            is_value_bet: calculation.isValueBet,
                            confidence: (autoProbability === null || autoProbability === void 0 ? void 0 : autoProbability.confidence) || 0,
                            probability_source: isManualEstimate ? 'manual' : 'automatic',
                            created_at: new Date().toISOString(),
                        })];
                case 2:
                    _a = _f.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    alert('Análise salva com sucesso!');
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _f.sent();
                    console.error('Erro ao salvar análise:', error_3);
                    alert('Erro ao salvar análise');
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin text-blue-600"/>
                        <span className="ml-2">Carregando dados...</span>
                    </div>
                </div>
            </div>);
    }
    return (<div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
                                <lucide_react_1.ArrowLeft className="h-4 w-4 mr-1"/>
                                Voltar
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Análise de Aposta
                            </h1>
                            <p className="text-gray-600">
                                {(_c = (_b = fixture.teams) === null || _b === void 0 ? void 0 : _b.home) === null || _c === void 0 ? void 0 : _c.name} vs {(_e = (_d = fixture.teams) === null || _d === void 0 ? void 0 : _d.away) === null || _e === void 0 ? void 0 : _e.name}
                            </p>
                        </div>
                        <lucide_react_1.Calculator className="h-8 w-8 text-blue-600"/>
                    </div>
                </div>

                {/* Probabilidade Automática */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <lucide_react_1.Sparkles className="h-5 w-5 text-purple-600 mr-2"/>
                            Probabilidade Automática
                        </h2>
                        <button onClick={generateAutomaticProbability} disabled={generatingProbability} className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                            {generatingProbability ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Brain className="h-4 w-4 mr-2"/>)}
                            {generatingProbability ? 'Calculando...' : 'Gerar'}
                        </button>
                    </div>

                    {autoProbability && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Vitória Casa</div>
                                <div className="text-xl font-bold text-green-600">
                                    {(0, utils_1.formatPercentage)(autoProbability.homeWinProbability)}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Empate</div>
                                <div className="text-xl font-bold text-yellow-600">
                                    {(0, utils_1.formatPercentage)(autoProbability.drawProbability)}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Vitória Fora</div>
                                <div className="text-xl font-bold text-red-600">
                                    {(0, utils_1.formatPercentage)(autoProbability.awayWinProbability)}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Confiança</div>
                                <div className="text-xl font-bold text-blue-600">
                                    {autoProbability.confidence}%
                                </div>
                            </div>
                        </div>)}
                </div>

                {/* Seleção de Mercado */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Selecionar Mercado</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select value={selectedMarket} onChange={function (e) {
            var _a;
            var market = e.target.value;
            var marketOdds = getOddsForMarket();
            if (marketOdds.length > 0) {
                handleMarketChange(market, (_a = marketOdds[0].values) === null || _a === void 0 ? void 0 : _a[0]);
            }
        }} className="p-3 border rounded-lg">
                            <option value="">Selecione um mercado</option>
                            {getAvailableMarkets().map(function (market) { return (<option key={market} value={market}>
                                    {market}
                                </option>); })}
                        </select>

                        {selectedMarket && getOddsForMarket().length > 0 && (<select value={(selectedOdd === null || selectedOdd === void 0 ? void 0 : selectedOdd.value) || ''} onChange={function (e) {
                var _a, _b;
                var oddValue = e.target.value;
                var marketOdds = getOddsForMarket();
                var foundOdd = (_b = (_a = marketOdds[0]) === null || _a === void 0 ? void 0 : _a.values) === null || _b === void 0 ? void 0 : _b.find(function (v) { return v.value === oddValue; });
                if (foundOdd) {
                    setSelectedOdd(foundOdd);
                }
            }} className="p-3 border rounded-lg">
                                <option value="">Selecione uma odd</option>
                                {(_g = (_f = getOddsForMarket()[0]) === null || _f === void 0 ? void 0 : _f.values) === null || _g === void 0 ? void 0 : _g.map(function (odd, index) { return (<option key={index} value={odd.value}>
                                        {odd.value} - {odd.odd}
                                    </option>); })}
                            </select>)}
                    </div>
                </div>

                {/* Estimativa de Probabilidade */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Probabilidade Estimada</h2>

                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center">
                            <input type="radio" checked={isManualEstimate} onChange={function () { return setIsManualEstimate(true); }} className="mr-2"/>
                            <lucide_react_1.User className="h-4 w-4 mr-1"/>
                            Manual
                        </label>

                        <label className="flex items-center">
                            <input type="radio" checked={!isManualEstimate} onChange={function () {
            setIsManualEstimate(false);
            if (autoProbability && selectedMarket) {
                updateProbabilityFromAuto(selectedMarket, autoProbability);
            }
        }} className="mr-2"/>
                            <lucide_react_1.Brain className="h-4 w-4 mr-1"/>
                            Automática
                        </label>
                    </div>

                    {isManualEstimate && (<div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sua estimativa (%)
                            </label>
                            <input type="range" min="1" max="99" value={estimatedProbability} onChange={function (e) { return setEstimatedProbability(Number(e.target.value)); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>1%</span>
                                <span className="font-medium">{estimatedProbability}%</span>
                                <span>99%</span>
                            </div>
                        </div>)}

                    {!isManualEstimate && !autoProbability && (<div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                            <lucide_react_1.AlertCircle className="h-4 w-4 mr-2"/>
                            Gere primeiro a probabilidade automática acima
                        </div>)}
                </div>

                {/* Resultado da Análise */}
                {calculation && selectedOdd && (<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600 mr-2"/>
                            Resultado da Análise
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Odd Selecionada</div>
                                <div className="text-2xl font-bold">{selectedOdd.value}</div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Probabilidade Implícita</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {(0, utils_1.formatPercentage)(calculation.implicitProbability)}
                                </div>
                            </div>

                            <div className={"p-4 rounded-lg ".concat(calculation.isValueBet ? 'bg-green-50' : 'bg-red-50')}>
                                <div className="text-sm text-gray-600">Valor Esperado</div>
                                <div className={"text-2xl font-bold ".concat(calculation.isValueBet ? 'text-green-600' : 'text-red-600')}>
                                    {(0, utils_1.formatPercentage)(calculation.expectedValue)}
                                </div>
                            </div>
                        </div>

                        <div className={"mt-4 p-4 rounded-lg flex items-center ".concat(calculation.isValueBet
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800')}>
                            {calculation.isValueBet ? (<>
                                    <lucide_react_1.TrendingUp className="h-5 w-5 mr-2"/>
                                    <span className="font-semibold">VALUE BET!</span>
                                    <span className="ml-2">Esta aposta tem valor positivo a longo prazo.</span>
                                </>) : (<>
                                    <lucide_react_1.AlertCircle className="h-5 w-5 mr-2"/>
                                    <span className="font-semibold">SEM VALOR</span>
                                    <span className="ml-2">Esta aposta não tem valor positivo.</span>
                                </>)}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button onClick={saveAnalysis} disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
                                {saving ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin mr-2"/>) : (<lucide_react_1.Calculator className="h-4 w-4 mr-2"/>)}
                                {saving ? 'Salvando...' : 'Salvar Análise'}
                            </button>
                        </div>
                    </div>)}
            </div>
        </div>);
}
