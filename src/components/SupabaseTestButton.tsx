import { useState } from "react";
import { supabaseAdmin } from "../lib/supabase";

export default function SupabaseTestButton() {
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleTestInsert() {
        setLoading(true);
        setResult("");
        // Dados mockados para teste
        const testFixture = {
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
        const { data, error } = await supabaseAdmin.from("fixtures").upsert(testFixture, { onConflict: "api_fixture_id" });
        if (error) {
            setResult("❌ Erro: " + error.message);
        } else {
            setResult("✅ Sucesso! Resultado: " + JSON.stringify(data));
        }
        setLoading(false);
    }

    return (
        <div className="p-4 border rounded bg-gray-50">
            <button
                onClick={handleTestInsert}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                Testar Insert no Supabase
            </button>
            <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{result}</div>
        </div>
    );
}
