'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Analysis } from '@/types'
import { BarChart3, TrendingUp, Calendar, Eye } from 'lucide-react'
import { formatDate, formatPercentage } from '@/lib/utils'

interface AnalysesHistoryProps {
    user: User
    onStatsUpdate: () => void
}

export default function AnalysesHistory({ user, onStatsUpdate }: AnalysesHistoryProps) {
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [generateMsg, setGenerateMsg] = useState<string | null>(null)

    // Filtros e paginação
    const [filterTeam, setFilterTeam] = useState('')
    const [filterMarket, setFilterMarket] = useState('')
    const [filterValueBet, setFilterValueBet] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 10

    // Filtros dinâmicos
    const uniqueTeams = Array.from(new Set(analyses.flatMap(a => [a.home_team, a.away_team]))).sort()
    const uniqueMarkets = Array.from(new Set(analyses.map(a => a.market))).sort()

    // Aplicar filtros
    const filteredAnalyses = analyses.filter(a =>
        (!filterTeam || a.home_team === filterTeam || a.away_team === filterTeam) &&
        (!filterMarket || a.market === filterMarket) &&
        (!filterValueBet || (filterValueBet === 'sim' ? a.is_value_bet : !a.is_value_bet))
    )
    const totalPages = Math.max(1, Math.ceil(filteredAnalyses.length / pageSize))
    const paginatedAnalyses = filteredAnalyses.slice((page - 1) * pageSize, page * pageSize)

    useEffect(() => {
        loadAnalyses()
    }, [user])

    const loadAnalyses = async () => {
        try {
            const { data, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAnalyses(data || [])
        } catch (error) {
            console.error('Erro ao carregar análises:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteAnalysis = async (id: string | number) => {
        if (!confirm('Tem certeza que deseja excluir esta análise?')) return

        try {
            const { error } = await supabase
                .from('analyses')
                .delete()
                .eq('id', id)

            if (error) throw error

            setAnalyses(analyses.filter(a => a.id !== id))
            onStatsUpdate()
        } catch (error) {
            console.error('Erro ao excluir análise:', error)
            alert('Erro ao excluir análise')
        }
    }

    const handleGenerateAnalyses = async () => {
        setGenerating(true)
        setGenerateMsg(null)
        try {
            const res = await fetch('/api/generate-analyses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            })
            const data = await res.json()
            if (res.ok) {
                setGenerateMsg('Análises geradas com sucesso!')
                loadAnalyses()
                onStatsUpdate()
            } else {
                setGenerateMsg(data.error || 'Erro ao gerar análises')
            }
        } catch (err) {
            setGenerateMsg('Erro ao gerar análises')
        } finally {
            setGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (analyses.length === 0) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma análise encontrada</h3>
                <p className="text-gray-500 mb-4">Suas análises de apostas aparecerão aqui</p>
                <button
                    onClick={handleGenerateAnalyses}
                    className="px-4 py-2 rounded bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-60"
                    disabled={generating}
                >
                    {generating ? 'Gerando...' : 'Gerar Análises'}
                </button>
                {generateMsg && (
                    <div className={`mt-2 text-sm ${generateMsg.includes('sucesso') ? 'text-success-600' : 'text-danger-600'}`}>{generateMsg}</div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-800">Histórico de Análises</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded">{filteredAnalyses.length} análises</span>
                    <button
                        onClick={handleGenerateAnalyses}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={generating}
                    >
                        {generating ? 'Gerando...' : 'Gerar Análises'}
                    </button>
                </div>
            </div>
            {generateMsg && (
                <div className={`text-sm mt-1 ${generateMsg.includes('sucesso') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>{generateMsg}</div>
            )}
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center bg-blue-50 p-3 rounded border border-blue-200 mb-2">
                <div>
                    <label className="block text-xs text-blue-700 mb-1 font-semibold">Time</label>
                    <select value={filterTeam} onChange={e => { setFilterTeam(e.target.value); setPage(1) }} className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400">
                        <option value="">Todos</option>
                        {uniqueTeams.map(team => <option key={team} value={team}>{team}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-blue-700 mb-1 font-semibold">Mercado</label>
                    <select value={filterMarket} onChange={e => { setFilterMarket(e.target.value); setPage(1) }} className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400">
                        <option value="">Todos</option>
                        {uniqueMarkets.map(market => <option key={market} value={market}>{market}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-blue-700 mb-1 font-semibold">Value Bet</label>
                    <select value={filterValueBet} onChange={e => { setFilterValueBet(e.target.value); setPage(1) }} className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400">
                        <option value="">Todos</option>
                        <option value="sim">Apenas Value Bet</option>
                        <option value="nao">Apenas Não Value</option>
                    </select>
                </div>
                <button onClick={() => { setFilterTeam(''); setFilterMarket(''); setFilterValueBet(''); setPage(1) }} className="text-xs text-blue-600 underline ml-2 font-semibold hover:text-blue-800">Limpar filtros</button>
            </div>
            {/* Lista paginada */}
            <div className="space-y-3">
                {paginatedAnalyses.map((analysis) => (
                    <div
                        key={analysis.id}
                        className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-semibold text-gray-900">
                                        {analysis.home_team} <span className="text-blue-600">vs</span> {analysis.away_team}
                                    </span>
                                    {analysis.is_value_bet && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-400 shadow-sm">
                                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                                            Value Bet
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700 font-semibold">Mercado:</span>
                                        <div className="font-medium text-gray-800">{analysis.market}</div>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-semibold">Odd:</span>
                                        <div className="font-medium text-gray-800">{analysis.odd_value}</div>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-semibold">Prob. Estimada:</span>
                                        <div className="font-medium text-gray-800">{typeof analysis.estimated_probability === 'number' ? formatPercentage(analysis.estimated_probability) : '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-semibold">EV:</span>
                                        <div className={`font-bold ${typeof analysis.expected_value === 'number' ? (analysis.expected_value > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                                            {typeof analysis.expected_value === 'number'
                                                ? `${analysis.expected_value > 0 ? '+' : ''}${formatPercentage(analysis.expected_value * 100)}`
                                                : '-'}
                                        </div>
                                    </div>
                                    {/* Novos indicadores */}
                                    {analysis.prob_1 !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Prob. Mandante:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.prob_1 === 'number' ? formatPercentage(analysis.prob_1) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.prob_x !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Prob. Empate:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.prob_x === 'number' ? formatPercentage(analysis.prob_x) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.prob_2 !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Prob. Visitante:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.prob_2 === 'number' ? formatPercentage(analysis.prob_2) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.prob_over25 !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Prob. Over 2.5:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.prob_over25 === 'number' ? formatPercentage(analysis.prob_over25) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.prob_btts !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Prob. BTTS:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.prob_btts === 'number' ? formatPercentage(analysis.prob_btts) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.xg_home !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">xG Mandante:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.xg_home === 'number' ? analysis.xg_home.toFixed(2) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.xg_away !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">xG Visitante:</span>
                                            <div className="font-medium text-gray-800">{typeof analysis.xg_away === 'number' ? analysis.xg_away.toFixed(2) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.poisson_home && Array.isArray(analysis.poisson_home) && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Poisson Mandante (0-2 gols):</span>
                                            <div className="font-medium text-gray-800">{analysis.poisson_home.map((p, i) => `${i}: ${formatPercentage(p)}`).join(' | ')}</div>
                                        </div>
                                    )}
                                    {analysis.poisson_away && Array.isArray(analysis.poisson_away) && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">Poisson Visitante (0-2 gols):</span>
                                            <div className="font-medium text-gray-800">{analysis.poisson_away.map((p, i) => `${i}: ${formatPercentage(p)}`).join(' | ')}</div>
                                        </div>
                                    )}
                                    {analysis.valor_esperado_1 !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">VE Mandante:</span>
                                            <div className={`font-medium ${typeof analysis.valor_esperado_1 === 'number' ? (analysis.valor_esperado_1 > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>{typeof analysis.valor_esperado_1 === 'number' ? (analysis.valor_esperado_1 > 0 ? '+' : '') + analysis.valor_esperado_1.toFixed(2) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.valor_esperado_x !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">VE Empate:</span>
                                            <div className={`font-medium ${typeof analysis.valor_esperado_x === 'number' ? (analysis.valor_esperado_x > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>{typeof analysis.valor_esperado_x === 'number' ? (analysis.valor_esperado_x > 0 ? '+' : '') + analysis.valor_esperado_x.toFixed(2) : '-'}</div>
                                        </div>
                                    )}
                                    {analysis.valor_esperado_2 !== undefined && (
                                        <div>
                                            <span className="text-blue-700 font-semibold">VE Visitante:</span>
                                            <div className={`font-medium ${typeof analysis.valor_esperado_2 === 'number' ? (analysis.valor_esperado_2 > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>{typeof analysis.valor_esperado_2 === 'number' ? (analysis.valor_esperado_2 > 0 ? '+' : '') + analysis.valor_esperado_2.toFixed(2) : '-'}</div>
                                        </div>
                                    )}
                                </div>
                                {/* Sugestão de aposta */}
                                {analysis.recomendacao && (
                                    <div className="mt-2 p-2 rounded bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 font-semibold shadow-sm">
                                        Sugestão: {analysis.recomendacao}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-100">
                                    <div className="flex items-center text-xs text-gray-600 gap-2">
                                        <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                                        {analysis.fixture_date ? formatDate(analysis.fixture_date) : formatDate(analysis.created_at || '')}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => deleteAnalysis(analysis.id!)}
                                            className="text-red-600 hover:text-red-800 text-sm font-semibold underline"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Paginação */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded border border-blue-300 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50">Anterior</button>
                <span className="text-sm font-semibold text-blue-800">Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded border border-blue-300 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50">Próxima</button>
            </div>
        </div>
    )
}
