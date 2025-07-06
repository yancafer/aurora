'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Analysis } from '@/types'
import { BarChart3, TrendingUp, Calendar, Eye, DollarSign, Target, Award } from 'lucide-react'
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

    // Funções utilitárias
    const formatOdd = (value: number) => {
        return value.toFixed(2)
    }

    const formatProbability = (value: number) => {
        return `${(value * 100).toFixed(1)}%`
    }

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

    // Função para converter mercados para formato Betano
    const formatMarketForBetano = (market: string) => {
        switch (market) {
            case '1X2 - Vitória Casa':
            case '1X2 - Vitória Mandante':
                return '1 (Casa)'
            case '1X2 - Vitória Fora':
            case '1X2 - Vitória Visitante':
                return '2 (Fora)'
            case '1X2 - Empate':
                return 'X (Empate)'
            case 'Over 2.5 Gols':
                return 'Mais de 2.5 gols'
            case 'BTTS - Ambos Marcam':
                return 'Ambas equipes marcam: SIM'
            default:
                return market
        }
    }

    // Função para salvar aposta no histórico
    const saveToHistory = async (analysis: Analysis) => {
        try {
            const { error } = await supabase
                .from('bet_history')
                .insert([{
                    user_id: user.id,
                    analysis_id: analysis.id,
                    home_team: analysis.home_team,
                    away_team: analysis.away_team,
                    market: analysis.market,
                    odd_value: analysis.odd_value,
                    expected_value: analysis.expected_value,
                    estimated_probability: analysis.estimated_probability,
                    fixture_date: analysis.fixture_date,
                    bet_amount: 0, // Será editado pelo usuário depois
                    status: 'pending'
                }])

            if (error) throw error
            alert('Aposta salva no histórico! Você pode acompanhar na aba "Minhas Apostas".')
        } catch (error) {
            console.error('Erro ao salvar aposta:', error)
            alert('Erro ao salvar aposta no histórico')
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
                <h3 className="text-lg font-semibold text-gray-800">Análises de Apostas</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="border rounded px-3 py-2 text-sm">
                    <option value="">Todos os times</option>
                    {uniqueTeams.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
                <select value={filterMarket} onChange={(e) => setFilterMarket(e.target.value)} className="border rounded px-3 py-2 text-sm">
                    <option value="">Todos os mercados</option>
                    {uniqueMarkets.map(market => <option key={market} value={market}>{market}</option>)}
                </select>
                <select value={filterValueBet} onChange={(e) => setFilterValueBet(e.target.value)} className="border rounded px-3 py-2 text-sm">
                    <option value="">Todas as análises</option>
                    <option value="sim">Apenas Value Bets</option>
                    <option value="nao">Sem Value Bets</option>
                </select>
            </div>

            {/* Lista de análises */}
            <div className="space-y-4">
                {paginatedAnalyses.map((analysis, index) => (
                    <div key={analysis.id || index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {/* Header do card */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-gray-900">
                                    {analysis.home_team} vs {analysis.away_team}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {analysis.is_value_bet && (
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                            ✅ Value Bet
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-600">
                                        {analysis.fixture_date ? formatDate(analysis.fixture_date) : formatDate(analysis.created_at || '')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo principal */}
                        <div className="p-4">
                            {/* Informações principais */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-sm text-blue-600 font-semibold mb-1">Mercado</div>
                                    <div className="font-bold text-gray-900">{formatMarketForBetano(analysis.market || '')}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <div className="text-sm text-purple-600 font-semibold mb-1">Odd</div>
                                    <div className="font-bold text-gray-900 text-lg">{analysis.odd_value ? formatOdd(analysis.odd_value) : '-'}</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg">
                                    <div className="text-sm text-orange-600 font-semibold mb-1">Prob. Estimada</div>
                                    <div className="font-bold text-gray-900">
                                        {typeof analysis.estimated_probability === 'number' ? formatPercentage(analysis.estimated_probability) : '-'}
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${typeof analysis.expected_value === 'number' && analysis.expected_value > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className={`text-sm font-semibold mb-1 ${typeof analysis.expected_value === 'number' && analysis.expected_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Valor Esperado
                                    </div>
                                    <div className={`font-bold text-lg ${typeof analysis.expected_value === 'number' ? (analysis.expected_value > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}`}>
                                        {typeof analysis.expected_value === 'number'
                                            ? `${analysis.expected_value > 0 ? '+' : ''}${formatPercentage(analysis.expected_value * 100)}`
                                            : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Probabilidades detalhadas */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Probabilidades Calculadas</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    {analysis.prob_1 !== undefined && (
                                        <div>
                                            <span className="text-gray-600">Casa:</span>
                                            <span className="font-semibold ml-1">{formatPercentage(analysis.prob_1)}</span>
                                        </div>
                                    )}
                                    {analysis.prob_x !== undefined && (
                                        <div>
                                            <span className="text-gray-600">Empate:</span>
                                            <span className="font-semibold ml-1">{formatPercentage(analysis.prob_x)}</span>
                                        </div>
                                    )}
                                    {analysis.prob_2 !== undefined && (
                                        <div>
                                            <span className="text-gray-600">Fora:</span>
                                            <span className="font-semibold ml-1">{formatPercentage(analysis.prob_2)}</span>
                                        </div>
                                    )}
                                    {analysis.prob_over25 !== undefined && (
                                        <div>
                                            <span className="text-gray-600">Over 2.5:</span>
                                            <span className="font-semibold ml-1">{formatPercentage(analysis.prob_over25)}</span>
                                        </div>
                                    )}
                                    {analysis.prob_btts !== undefined && (
                                        <div>
                                            <span className="text-gray-600">BTTS:</span>
                                            <span className="font-semibold ml-1">{formatPercentage(analysis.prob_btts)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recomendação */}
                            {analysis.recomendacao && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                                    <div className="flex items-center">
                                        <Target className="h-5 w-5 text-yellow-600 mr-2" />
                                        <div>
                                            <div className="text-sm font-semibold text-yellow-800">Sugestão do Sistema</div>
                                            <div className="text-yellow-900">{analysis.recomendacao}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ações */}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => saveToHistory(analysis)}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        Apostar na Betano
                                    </button>
                                </div>
                                <button
                                    onClick={() => deleteAnalysis(analysis.id!)}
                                    className="text-red-600 hover:text-red-800 text-sm font-semibold underline"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginação */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded border border-blue-300 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="text-sm font-semibold text-blue-800">Página {page} de {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded border border-blue-300 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    )
}
