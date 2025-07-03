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
exports.default = AuthForm;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
function AuthForm() {
    var _this = this;
    var _a = (0, react_1.useState)(true), isLogin = _a[0], setIsLogin = _a[1];
    var _b = (0, react_1.useState)(''), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(''), password = _c[0], setPassword = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(''), message = _e[0], setMessage = _e[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setMessage('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!isLogin) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase_1.supabase.auth.signInWithPassword({
                            email: email,
                            password: password
                        })];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setMessage('Login realizado com sucesso!');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, supabase_1.supabase.auth.signUp({
                        email: email,
                        password: password
                    })];
                case 4:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setMessage('Conta criada! Verifique seu email para confirmar.');
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    setMessage(error_1.message || 'Erro ao processar solicitação');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-6">
                <div className="flex border-b">
                    <button onClick={function () { return setIsLogin(true); }} className={"flex-1 py-2 px-4 text-center ".concat(isLogin
            ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
            : 'text-gray-500')}>
                        Entrar
                    </button>
                    <button onClick={function () { return setIsLogin(false); }} className={"flex-1 py-2 px-4 text-center ".concat(!isLogin
            ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
            : 'text-gray-500')}>
                        Cadastrar
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input type="email" id="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="seu@email.com"/>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                    </label>
                    <input type="password" id="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Mínimo 6 caracteres"/>
                </div>

                {message && (<div className={"p-3 rounded-md text-sm ".concat(message.includes('erro') || message.includes('Erro')
                ? 'bg-danger-50 text-danger-700 border border-danger-200'
                : 'bg-success-50 text-success-700 border border-success-200')}>
                        {message}
                    </div>)}

                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                </button>
            </form>
        </div>);
}
