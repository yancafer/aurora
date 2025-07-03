'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { RefreshCw, Download, Settings, Calendar, Trophy, BarChart3, Database } from 'lucide-react'

interface DumpControlProps {
    user: User
}

export default function DumpControl({ user }: DumpControlProps) {
    const [loading, setLoading] = useState(false)
    const [lastDumpResult, setLastDumpResult] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedLeagues, setSelectedLeagues] = useState<number[]>([39, 140, 78, 135, 61, 71])
    const [dumpOptions, setDumpOptions] = useState({
        includeOdds: true,
        includeStats: true,
        includeStandings: true,
        forceUpdate: false,
    })

    const leagues = [
        { id: 39, name: 'Premier League' },
        { id: 140, name: 'La Liga' },
        { id: 78, name: 'Bundesliga' },
        { id: 135, name: 'Serie A' },
        { id: 61, name: 'Ligue 1' },
        { id: 71, name: 'Brasileirão' },
        { id: 2, name: 'Champions League' },
        { id: 3, name: 'Europa League' },
    ]

    const executeDump = async (type: 'daily' | 'manual' | 'quick' | 'league') => {
        setLoading(true)
        try {
            const body: any = {
                type,
                date: selectedDate,
                ...dumpOptions,
            };
            // Se nenhuma liga estiver selecionada, envie array vazio (dump global)
            if (selectedLeagues.length > 0) {
                body.leagues = selectedLeagues;
            } else {
                body.leagues = [];
            }
            const response = await fetch('/api/dump', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DUMP_API_KEY}`,
                },
                body: JSON.stringify(body),
            })

            const result = await response.json()

            if (response.ok) {
                setLastDumpResult({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toLocaleString(),
                    type,
                })
            } else {
                setLastDumpResult({
                    success: false,
                    message: result.error || 'Erro desconhecido',
                    timestamp: new Date().toLocaleString(),
                    type,
                })
            }
        } catch (error) {
            setLastDumpResult({
                success: false,
                message: error instanceof Error ? error.message : 'Erro de conexão',
                timestamp: new Date().toLocaleString(),
                type,
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleLeague = (leagueId: number) => {
        setSelectedLeagues(prev =>
            prev.includes(leagueId)
                ? prev.filter(id => id !== leagueId)
                : [...prev, leagueId]
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <Database className="h-6 w-6 text-blue-600 mr-2" />
                    Controle de Dump
                </h2>
                <Settings className="h-5 w-5 text-gray-400" />
            </div>

            {/* Configurações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Data e Ligas */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Data
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Trophy className="h-4 w-4 inline mr-1" />
                            Ligas Selecionadas
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {leagues.map((league) => (
                                <label key={league.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedLeagues.includes(league.id)}
                                        onChange={() => toggleLeague(league.id)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{league.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Opções de Dump */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Settings className="h-4 w-4 inline mr-1" />
                            Opções de Dados
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={dumpOptions.includeOdds}
                                    onChange={(e) => setDumpOptions(prev => ({ ...prev, includeOdds: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">Incluir Odds</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={dumpOptions.includeStats}
                                    onChange={(e) => setDumpOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">Incluir Estatísticas</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={dumpOptions.includeStandings}
                                    onChange={(e) => setDumpOptions(prev => ({ ...prev, includeStandings: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">Incluir Classificações</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={dumpOptions.forceUpdate}
                                    onChange={(e) => setDumpOptions(prev => ({ ...prev, forceUpdate: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">Forçar Atualização</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-800">
                            <strong>Ligas selecionadas:</strong> {selectedLeagues.length}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                            {selectedLeagues.length === 0
                                ? 'Nenhuma liga selecionada (dump global: todas as ligas)'
                                : `${leagues.filter(l => selectedLeagues.includes(l.id)).map(l => l.name).join(', ')}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={() => executeDump('quick')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Dump Rápido
                </button>

                <button
                    onClick={() => executeDump('manual')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Settings className="h-4 w-4 mr-2" />
                    )}
                    Dump Manual
                </button>

                <button
                    onClick={() => executeDump('daily')}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Dump Diário
                </button>

                <button
                    onClick={() => executeDump('league')}
                    disabled={loading || selectedLeagues.length === 0}
                    className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Trophy className="h-4 w-4 mr-2" />
                    )}
                    Por Liga
                </button>
            </div>

            {/* Descrições dos Tipos de Dump */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Tipos de Dump</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li><strong>Rápido:</strong> Apenas partidas e odds</li>
                        <li><strong>Manual:</strong> Dump completo personalizado</li>
                        <li><strong>Diário:</strong> Dump padrão automático</li>
                        <li><strong>Por Liga:</strong> Foco em ligas específicas</li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Opções Disponíveis</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li><strong>Odds:</strong> Mercados de apostas</li>
                        <li><strong>Estatísticas:</strong> Desempenho dos times</li>
                        <li><strong>Classificações:</strong> Tabelas das ligas</li>
                        <li><strong>Forçar:</strong> Sobrescrever dados existentes</li>
                    </ul>
                </div>
            </div>

            {/* Resultado do Último Dump */}
            {lastDumpResult && (
                <div className={`p-4 rounded-lg border-l-4 ${lastDumpResult.success
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-medium ${lastDumpResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {lastDumpResult.success ? '✅ Sucesso' : '❌ Erro'}
                            </h3>
                            <p className={`text-sm ${lastDumpResult.success ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {lastDumpResult.message}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">
                                Tipo: {lastDumpResult.type}
                            </div>
                            <div className="text-xs text-gray-500">
                                {lastDumpResult.timestamp}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
