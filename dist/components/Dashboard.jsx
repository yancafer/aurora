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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var lucide_react_1 = require("lucide-react");
var FixturesList_1 = __importDefault(require("@/components/FixturesList"));
var AnalysesHistory_1 = __importDefault(require("@/components/AnalysesHistory"));
var BettingHistory_1 = __importDefault(require("@/components/BettingHistory"));
var BettingAnalysis_1 = __importDefault(require("@/components/BettingAnalysis"));
var DumpControl_1 = __importDefault(require("@/components/DumpControl"));
var SupabaseTestButton_1 = __importDefault(require("./SupabaseTestButton"));
function Dashboard(_a) {
    var _this = this;
    var user = _a.user;
    var _b = (0, react_1.useState)('fixtures'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(null), selectedFixture = _c[0], setSelectedFixture = _c[1];
    var _d = (0, react_1.useState)({
        totalAnalyses: 0,
        totalBets: 0,
        totalProfit: 0,
        winRate: 0
    }), stats = _d[0], setStats = _d[1];
    (0, react_1.useEffect)(function () {
        loadStats();
    }, [user]);
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, analysesResponse, betsResponse, analyses, bets, settledBets, wonBets, totalProfit, winRate, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            supabase_1.supabase
                                .from('analyses')
                                .select('*')
                                .eq('user_id', user.id),
                            supabase_1.supabase
                                .from('bets')
                                .select('*')
                                .eq('user_id', user.id)
                        ])];
                case 1:
                    _a = _b.sent(), analysesResponse = _a[0], betsResponse = _a[1];
                    analyses = analysesResponse.data || [];
                    bets = betsResponse.data || [];
                    settledBets = bets.filter(function (bet) { return bet.result !== 'pending'; });
                    wonBets = settledBets.filter(function (bet) { return bet.result === 'win'; });
                    totalProfit = settledBets.reduce(function (sum, bet) { return sum + (bet.profit_loss || 0); }, 0);
                    winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0;
                    setStats({
                        totalAnalyses: analyses.length,
                        totalBets: bets.length,
                        totalProfit: totalProfit,
                        winRate: winRate
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('Erro ao carregar estatísticas:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var tabs = [
        { id: 'fixtures', label: 'Partidas', icon: lucide_react_1.Calendar },
        { id: 'analyses', label: 'Análises', icon: lucide_react_1.BarChart3 },
        { id: 'bets', label: 'Apostas', icon: lucide_react_1.Target },
        { id: 'dump', label: 'Dados', icon: lucide_react_1.Database },
    ];
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <lucide_react_1.BarChart3 className="h-8 w-8 text-primary-600"/>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Análises</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <lucide_react_1.Target className="h-8 w-8 text-blue-600"/>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Apostas</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <lucide_react_1.Trophy className="h-8 w-8 text-success-600"/>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Taxa de Acerto</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className={"h-8 w-8 rounded-full flex items-center justify-center ".concat(stats.totalProfit >= 0 ? 'bg-success-100' : 'bg-danger-100')}>
                            <span className={"text-lg font-bold ".concat(stats.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600')}>
                                {stats.totalProfit >= 0 ? '+' : '-'}
                            </span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Lucro/Prejuízo</p>
                            <p className={"text-2xl font-bold ".concat(stats.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600')}>
                                R$ {Math.abs(stats.totalProfit).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <SupabaseTestButton_1.default />

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(function (tab) {
            var Icon = tab.icon;
            return (<button key={tab.id} onClick={function () {
                    setActiveTab(tab.id);
                    setSelectedFixture(null);
                }} className={"flex items-center py-4 px-1 border-b-2 font-medium text-sm ".concat(activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
                                    <Icon className="h-5 w-5 mr-2"/>
                                    {tab.label}
                                </button>);
        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'fixtures' && !selectedFixture && (<FixturesList_1.default user={user} onSelectFixture={setSelectedFixture}/>)}
                    {activeTab === 'fixtures' && selectedFixture && (<BettingAnalysis_1.default fixture={selectedFixture} user={user} onBack={function () { return setSelectedFixture(null); }}/>)}
                    {activeTab === 'analyses' && <AnalysesHistory_1.default user={user} onStatsUpdate={loadStats}/>}
                    {activeTab === 'bets' && <BettingHistory_1.default user={user} onStatsUpdate={loadStats}/>}
                    {activeTab === 'dump' && <DumpControl_1.default user={user}/>}
                </div>
            </div>
        </div>);
}
