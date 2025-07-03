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
exports.default = SupabaseTestButton;
var react_1 = require("react");
var supabase_1 = require("../lib/supabase");
function SupabaseTestButton() {
    var _a = (0, react_1.useState)(""), result = _a[0], setResult = _a[1];
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    function handleTestInsert() {
        return __awaiter(this, void 0, void 0, function () {
            var testFixture, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setLoading(true);
                        setResult("");
                        testFixture = {
                            api_fixture_id: 999999,
                            date: new Date().toISOString().split("T")[0],
                            timestamp: Date.now(),
                            status: { long: "Not Started", short: "NS", elapsed: null },
                            venue: { id: 1, name: "Estádio Teste", city: "Cidade Teste" },
                            teams: { home: { id: 1, name: "Time A" }, away: { id: 2, name: "Time B" } },
                            goals: { home: null, away: null },
                            score: { halftime: null, fulltime: null, extratime: null, penalty: null },
                            league: { id: 1, name: "Liga Teste", country: "BR", season: 2025 },
                            updated_at: new Date().toISOString(),
                        };
                        return [4 /*yield*/, supabase_1.supabaseAdmin.from("fixtures").upsert(testFixture, { onConflict: "api_fixture_id" })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            setResult("❌ Erro: " + error.message);
                        }
                        else {
                            setResult("✅ Sucesso! Resultado: " + JSON.stringify(data));
                        }
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        });
    }
    return (<div className="p-4 border rounded bg-gray-50">
      <button onClick={handleTestInsert} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        Testar Insert no Supabase
      </button>
      <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{result}</div>
    </div>);
}
