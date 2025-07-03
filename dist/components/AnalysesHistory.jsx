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
exports.default = AnalysesHistory;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function AnalysesHistory(_a) {
    var _this = this;
    var user = _a.user, onStatsUpdate = _a.onStatsUpdate;
    var _b = (0, react_1.useState)([]), analyses = _b[0], setAnalyses = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        loadAnalyses();
    }, [user]);
    var loadAnalyses = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('analyses')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setAnalyses(data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Erro ao carregar análises:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var deleteAnalysis = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Tem certeza que deseja excluir esta análise?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('analyses')
                            .delete()
                            .eq('id', id)];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setAnalyses(analyses.filter(function (a) { return a.id !== id; }));
                    onStatsUpdate();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erro ao excluir análise:', error_2);
                    alert('Erro ao excluir análise');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>);
    }
    if (analyses.length === 0) {
        return (<div className="text-center py-12">
                <lucide_react_1.BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma análise encontrada</h3>
                <p className="text-gray-500">Suas análises de apostas aparecerão aqui</p>
            </div>);
    }
    return (<div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Histórico de Análises</h3>
                <span className="text-sm text-gray-500">{analyses.length} análises</span>
            </div>

            <div className="space-y-3">
                {analyses.map(function (analysis) { return (<div key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-gray-900">
                                        {analysis.home_team} vs {analysis.away_team}
                                    </span>
                                    {analysis.is_value_bet && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                            <lucide_react_1.TrendingUp className="h-3 w-3 mr-1"/>
                                            Value Bet
                                        </span>)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Mercado:</span>
                                        <div className="font-medium">{analysis.market}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Odd:</span>
                                        <div className="font-medium">{analysis.odd_value}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Prob. Estimada:</span>
                                        <div className="font-medium">{(0, utils_1.formatPercentage)(analysis.estimated_probability)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">EV:</span>
                                        <div className={"font-medium ".concat(analysis.expected_value > 0 ? 'text-success-600' : 'text-danger-600')}>
                                            {analysis.expected_value > 0 ? '+' : ''}{(0, utils_1.formatPercentage)(analysis.expected_value * 100)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <lucide_react_1.Calendar className="h-3 w-3 mr-1"/>
                                        {(0, utils_1.formatDate)(analysis.created_at || '')}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={function () { return deleteAnalysis(analysis.id); }} className="text-danger-600 hover:text-danger-800 text-sm">
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>); })}
            </div>
        </div>);
}
