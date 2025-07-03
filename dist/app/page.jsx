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
exports.default = Home;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var Header_1 = __importDefault(require("@/components/Header"));
var Dashboard_1 = __importDefault(require("@/components/Dashboard"));
var AuthForm_1 = __importDefault(require("@/components/AuthForm"));
function Home() {
    var _this = this;
    var _a = (0, react_1.useState)(null), user = _a[0], setUser = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        // Verificar usuário logado
        var getUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase_1.supabase.auth.getUser()];
                    case 1:
                        user = (_a.sent()).data.user;
                        setUser(user);
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        getUser();
        // Escutar mudanças de autenticação
        var subscription = supabase_1.supabase.auth.onAuthStateChange(function (event, session) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setUser((session === null || session === void 0 ? void 0 : session.user) || null);
                setLoading(false);
                return [2 /*return*/];
            });
        }); }).data.subscription;
        return function () { return subscription.unsubscribe(); };
    }, []);
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
            <Header_1.default user={user}/>

            {user ? (<Dashboard_1.default user={user}/>) : (<div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="max-w-md w-full mx-4">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Aurora
                            </h1>
                            <p className="text-lg text-gray-600">
                                Analisador de Apostas Esportivas
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Calcule probabilidades, valor esperado e encontre value bets
                            </p>
                        </div>
                        <AuthForm_1.default />
                    </div>
                </div>)}
        </div>);
}
