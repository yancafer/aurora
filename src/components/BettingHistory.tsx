'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Bet, Analysis } from '@/types'
import { Target, Trophy, Calendar, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface BettingHistoryProps {
    user: User
    onStatsUpdate: () => void
}

export default function BettingHistory({ user, onStatsUpdate }: BettingHistoryProps) {
    const [bets, setBets] = useState<Bet[]>([])
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)
    const [showBetModal, setShowBetModal] = useState(false)
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)

    useEffect(() => {
        loadData()
    }, [user])

    const loadData = async () => {
        try {
            const [betsResponse, analysesResponse] = await Promise.all([
                supabase
                    .from('bets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('analyses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
            ])

            if (betsResponse.error) throw betsResponse.error
            if (analysesResponse.error) throw analysesResponse.error

            setBets(betsResponse.data || [])
            setAnalyses(analysesResponse.data || [])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const getUnbettedAnalyses = () => {
        const bettedAnalysisIds = bets.map(bet => bet.analysis_id)
        return analyses.filter(analysis => !bettedAnalysisIds.includes(analysis.id!))
    }

    const createBet = (analysis: Analysis) => {
        setSelectedAnalysis(analysis)
        setShowBetModal(true)
    }

    const getStatusColor = (result: string) => {
        switch (result) {
            case 'win': return 'bg-success-100 text-success-800'
            case 'lose': return 'bg-danger-100 text-danger-800'
            default: return 'bg-yellow-100 text-yellow-800'
        }
    }

    const getStatusText = (result: string) => {
        switch (result) {
            case 'win': return 'Ganhou'
            case 'lose': return 'Perdeu'
            default: return 'Pendente'
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Análises sem apostas */}
            {getUnbettedAnalyses().length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Análises sem Apostas</h3>
                    <div className="space-y-2">
                        {getUnbettedAnalyses().slice(0, 3).map((analysis) => (
                            <div
                                key={analysis.id}
                                className="flex items-center justify-between bg-white p-3 rounded border"
                            >
                                <div>
                                    <span className="font-medium">
                                        {analysis.home_team} vs {analysis.away_team}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({analysis.market} - {analysis.odd_value})
                                    </span>
                                </div>
                                <button
                                    onClick={() => createBet(analysis)}
                                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                                >
                                    Registrar Aposta
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Histórico de Apostas */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Histórico de Apostas</h3>
                    <span className="text-sm text-gray-500">{bets.length} apostas</span>
                </div>

                {bets.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma aposta registrada</h3>
                        <p className="text-gray-500">Suas apostas aparecerão aqui após registrá-las</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bets.map((bet) => {
                            const analysis = analyses.find(a => a.id === bet.analysis_id)
                            return (
                                <div
                                    key={bet.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {analysis?.home_team} vs {analysis?.away_team}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.result || 'pending')}`}>
                                                    {getStatusText(bet.result || 'pending')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {bet.choice} - Odd: {bet.odd_value}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Stake</div>
                                            <div className="font-medium">{formatCurrency(bet.stake)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Retorno Potencial:</span>
                                            <div className="font-medium">{formatCurrency(bet.potential_return)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Resultado:</span>
                                            <div className={`font-medium ${bet.profit_loss && bet.profit_loss > 0 ? 'text-success-600' :
                                                    bet.profit_loss && bet.profit_loss < 0 ? 'text-danger-600' : 'text-gray-600'
                                                }`}>
                                                {bet.profit_loss ? formatCurrency(bet.profit_loss) : 'Pendente'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Data:</span>
                                            <div className="font-medium">{formatDate(bet.created_at || '')}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Mercado:</span>
                                            <div className="font-medium">{analysis?.market}</div>
                                        </div>
                                    </div>

                                    {bet.result === 'pending' && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <BetSettlement bet={bet} onUpdate={() => { loadData(); onStatsUpdate(); }} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Nova Aposta */}
            {showBetModal && selectedAnalysis && (
                <BetModal
                    analysis={selectedAnalysis}
                    user={user}
                    onClose={() => {
                        setShowBetModal(false)
                        setSelectedAnalysis(null)
                    }}
                    onSave={() => {
                        loadData()
                        onStatsUpdate()
                        setShowBetModal(false)
                        setSelectedAnalysis(null)
                    }}
                />
            )}
        </div>
    )
}

// Componente para liquidar aposta
function BetSettlement({ bet, onUpdate }: { bet: Bet; onUpdate: () => void }) {
    const [result, setResult] = useState<'win' | 'lose'>('win')
    const [saving, setSaving] = useState(false)

    const settleBet = async () => {
        setSaving(true)
        try {
            const profitLoss = result === 'win'
                ? bet.potential_return - bet.stake
                : -bet.stake

            const { error } = await supabase
                .from('bets')
                .update({
                    result,
                    profit_loss: profitLoss,
                    settled_at: new Date().toISOString()
                })
                .eq('id', bet.id)

            if (error) throw error

            onUpdate()
        } catch (error) {
            console.error('Erro ao liquidar aposta:', error)
            alert('Erro ao liquidar aposta')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Liquidar aposta:</span>
            <div className="flex space-x-2">
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="win"
                        checked={result === 'win'}
                        onChange={(e) => setResult(e.target.value as 'win')}
                        className="mr-1"
                    />
                    Ganhou
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="lose"
                        checked={result === 'lose'}
                        onChange={(e) => setResult(e.target.value as 'lose')}
                        className="mr-1"
                    />
                    Perdeu
                </label>
            </div>
            <button
                onClick={settleBet}
                disabled={saving}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50"
            >
                {saving ? 'Salvando...' : 'Confirmar'}
            </button>
        </div>
    )
}

// Modal para criar nova aposta
function BetModal({ analysis, user, onClose, onSave }: {
    analysis: Analysis
    user: User
    onClose: () => void
    onSave: () => void
}) {
    const [choice, setChoice] = useState('')
    const [stake, setStake] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    const potentialReturn = stake * analysis.odd_value

    const saveBet = async () => {
        if (!choice || stake <= 0) return

        setSaving(true)
        try {
            const betData = {
                user_id: user.id,
                analysis_id: analysis.id!,
                choice,
                stake,
                odd_value: analysis.odd_value,
                potential_return: potentialReturn,
                result: 'pending'
            }

            const { error } = await supabase
                .from('bets')
                .insert(betData)

            if (error) throw error

            onSave()
        } catch (error) {
            console.error('Erro ao salvar aposta:', error)
            alert('Erro ao salvar aposta')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Aposta</h3>

                <div className="space-y-4">
                    <div>
                        <span className="font-medium">
                            {analysis.home_team} vs {analysis.away_team}
                        </span>
                        <div className="text-sm text-gray-600">
                            {analysis.market} - Odd: {analysis.odd_value}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sua escolha
                        </label>
                        <input
                            type="text"
                            value={choice}
                            onChange={(e) => setChoice(e.target.value)}
                            placeholder="Ex: Vitória Mandante, Over 2.5, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor apostado (R$)
                        </label>
                        <input
                            type="number"
                            value={stake}
                            onChange={(e) => setStake(Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {stake > 0 && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-sm text-gray-600">Retorno potencial:</div>
                            <div className="text-lg font-medium text-gray-900">
                                {formatCurrency(potentialReturn)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={saveBet}
                        disabled={!choice || stake <= 0 || saving}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
