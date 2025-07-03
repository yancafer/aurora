"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface DiagnosticResult {
    test: string;
    status: "success" | "error" | "warning";
    message: string;
    details?: any;
}

export default function SystemDiagnostic() {
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostics = async () => {
        setIsRunning(true);
        setResults([]);

        const diagnostics: DiagnosticResult[] = [];

        // 1. Testar conexão com Supabase
        try {
            const { data, error } = await supabase
                .from("fixtures")
                .select("id")
                .limit(1);

            if (error) {
                diagnostics.push({
                    test: "Conexão Supabase",
                    status: "error",
                    message: "Erro ao conectar com Supabase",
                    details: error,
                });
            } else {
                diagnostics.push({
                    test: "Conexão Supabase",
                    status: "success",
                    message: "Conexão bem-sucedida",
                });
            }
        } catch (error) {
            diagnostics.push({
                test: "Conexão Supabase",
                status: "error",
                message: "Erro de configuração",
                details: error,
            });
        }

        // 2. Verificar tabelas necessárias
        const tables = ["fixtures", "odds", "team_statistics", "standings"];
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select("id")
                    .limit(1);

                if (error) {
                    diagnostics.push({
                        test: `Tabela ${table}`,
                        status: "error",
                        message: `Tabela ${table} não encontrada ou inacessível`,
                        details: error,
                    });
                } else {
                    diagnostics.push({
                        test: `Tabela ${table}`,
                        status: "success",
                        message: `Tabela ${table} OK`,
                    });
                }
            } catch (error) {
                diagnostics.push({
                    test: `Tabela ${table}`,
                    status: "error",
                    message: `Erro ao acessar tabela ${table}`,
                    details: error,
                });
            }
        }

        // 3. Verificar API de dump
        try {
            const response = await fetch("/api/dump?status=health");
            const data = await response.json();

            if (response.ok) {
                diagnostics.push({
                    test: "API de Dump",
                    status: "success",
                    message: "API de dump funcionando",
                    details: data,
                });
            } else {
                diagnostics.push({
                    test: "API de Dump",
                    status: "error",
                    message: "API de dump com problemas",
                    details: data,
                });
            }
        } catch (error) {
            diagnostics.push({
                test: "API de Dump",
                status: "error",
                message: "Erro ao acessar API de dump",
                details: error,
            });
        }

        // 4. Verificar dados existentes
        try {
            const { data: fixturesCount } = await supabase
                .from("fixtures")
                .select("id", { count: "exact" });

            const { data: oddsCount } = await supabase
                .from("odds")
                .select("id", { count: "exact" });

            diagnostics.push({
                test: "Dados no Banco",
                status: "success",
                message: `${fixturesCount?.length || 0} fixtures, ${oddsCount?.length || 0} odds no banco`,
            });
        } catch (error) {
            diagnostics.push({
                test: "Dados no Banco",
                status: "warning",
                message: "Não foi possível contar os dados",
                details: error,
            });
        }

        setResults(diagnostics);
        setIsRunning(false);
    };

    const getStatusIcon = (status: DiagnosticResult["status"]) => {
        switch (status) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
        }
    };

    const getStatusColor = (status: DiagnosticResult["status"]) => {
        switch (status) {
            case "success":
                return "text-green-600";
            case "error":
                return "text-red-600";
            case "warning":
                return "text-yellow-600";
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Diagnóstico do Sistema</h2>

            <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
            >
                {isRunning ? "Executando..." : "Executar Diagnóstico"}
            </button>

            {results.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold">Resultados:</h3>
                    {results.map((result, index) => (
                        <div key={index} className="border-l-4 border-gray-200 pl-4">
                            <div className="flex items-center gap-2">
                                <span>{getStatusIcon(result.status)}</span>
                                <span className="font-medium">{result.test}:</span>
                                <span className={getStatusColor(result.status)}>
                                    {result.message}
                                </span>
                            </div>
                            {result.details && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-gray-500">
                                        Ver detalhes
                                    </summary>
                                    <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                                        {JSON.stringify(result.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {results.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">Próximos Passos:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Se há erros de conexão: verifique as variáveis de ambiente</li>
                        <li>Se há tabelas faltando: execute as migrações no Supabase</li>
                        <li>Se a API de dump falha: verifique as configurações do servidor</li>
                        <li>Para problemas de dados: execute um dump manual para popular o banco</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
