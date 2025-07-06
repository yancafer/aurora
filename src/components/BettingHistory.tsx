'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Target, Trophy, Calendar, DollarSign, CheckCircle, XCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BetHistory {
    id?: number
    user_id: string
    analysis_id?: number
    home_team: string
    away_team: string
    market: string
    odd_value: number
    bet_amount: number
    potential_return?: number
    actual_result?: 'win' | 'loss' | 'void' | 'half_win' | 'half_loss'
    status: 'pending' | 'settled' | 'cancelled'
    notes?: string
    bet_placed_at?: string
    settled_at?: string
    fixture_date?: string
    created_at?: string
}

interface BettingHistoryProps {
    user: User
    onStatsUpdate: () => void
}

export default function BettingHistory({ user, onStatsUpdate }: BettingHistoryProps) {
    const [bets, setBets] = useState<BetHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [showBetModal, setShowBetModal] = useState(false)
    const [editingBet, setEditingBet] = useState<BetHistory | null>(null)

    // Filtros
    const [filterStatus, setFilterStatus] = useState('')
    const [filterResult, setFilterResult] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 10

    // Funções utilitárias
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatOdd = (value: number) => {
        return value.toFixed(2)
    }

    const formatPercentage = (value: number) => {
        return `${(value * 100).toFixed(1)}%`
    }

    // Form data
    const [betForm, setBetForm] = useState({
        home_team: '',
        away_team: '',
        market: '',
        odd_value: '',
        bet_amount: '',
        fixture_date: '',
        notes: ''
    })

    // Estatísticas
    const [stats, setStats] = useState({
        totalBets: 0,
        totalStaked: 0,
        totalReturns: 0,
        winRate: 0,
        profit: 0
    })

    useEffect(() => {
        loadBets()
    }, [user])

    useEffect(() => {
        calculateStats()
    }, [bets])

    const loadBets = async () => {
        try {
            const { data, error } = await supabase
                .from('bet_history')
                .select('*')
                .eq('user_id', user.id)
                .order('bet_placed_at', { ascending: false })

            if (error) throw error
            setBets(data || [])
        } catch (error) {
            console.error('Erro ao carregar apostas:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = () => {
        const settledBets = bets.filter(bet => bet.status === 'settled')
        const wonBets = settledBets.filter(bet => bet.actual_result === 'win')

        const totalStaked = settledBets.reduce((sum, bet) => sum + bet.bet_amount, 0)
        const totalReturns = wonBets.reduce((sum, bet) => sum + (bet.potential_return || 0), 0)

        setStats({
            totalBets: bets.length,
            totalStaked,
            totalReturns,
            winRate: settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0,
            profit: totalReturns - totalStaked
        })
    }

    const saveBet = async () => {
        try {
            const betData = {
                user_id: user.id,
                home_team: betForm.home_team,
                away_team: betForm.away_team,
                market: betForm.market,
                odd_value: parseFloat(betForm.odd_value),
                bet_amount: parseFloat(betForm.bet_amount),
                potential_return: parseFloat(betForm.bet_amount) * parseFloat(betForm.odd_value),
                fixture_date: betForm.fixture_date || null,
                notes: betForm.notes || null,
                status: 'pending'
            }

            let error
            if (editingBet) {
                const { error: updateError } = await supabase
                    .from('bet_history')
                    .update(betData)
                    .eq('id', editingBet.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('bet_history')
                    .insert([betData])
                error = insertError
            }

            if (error) throw error

            setBetForm({
                home_team: '',
                away_team: '',
                market: '',
                odd_value: '',
                bet_amount: '',
                fixture_date: '',
                notes: ''
            })
            setShowBetModal(false)
            setEditingBet(null)
            loadBets()
            onStatsUpdate()
        } catch (error) {
            console.error('Erro ao salvar aposta:', error)
            alert('Erro ao salvar aposta')
        }
    }

    const updateBetResult = async (betId: number, result: 'win' | 'loss' | 'void') => {
        try {
            const { error } = await supabase
                .from('bet_history')
                .update({
                    actual_result: result,
                    status: 'settled',
                    settled_at: new Date().toISOString()
                })
                .eq('id', betId)

            if (error) throw error
            loadBets()
            onStatsUpdate()
        } catch (error) {
            console.error('Erro ao atualizar resultado:', error)
            alert('Erro ao atualizar resultado da aposta')
        }
    }

    const deleteBet = async (betId: number) => {
        if (!confirm('Tem certeza que deseja excluir esta aposta?')) return

        try {
            const { error } = await supabase
                .from('bet_history')
                .delete()
                .eq('id', betId)

            if (error) throw error
            loadBets()
            onStatsUpdate()
        } catch (error) {
            console.error('Erro ao excluir aposta:', error)
            alert('Erro ao excluir aposta')
        }
    }

    const openEditModal = (bet: BetHistory) => {
        setEditingBet(bet)
        setBetForm({
            home_team: bet.home_team,
            away_team: bet.away_team,
            market: bet.market,
            odd_value: bet.odd_value.toString(),
            bet_amount: bet.bet_amount.toString(),
            fixture_date: bet.fixture_date ? bet.fixture_date.split('T')[0] : '',
            notes: bet.notes || ''
        })
        setShowBetModal(true)
    }

    // Aplicar filtros
    const filteredBets = bets.filter(bet => {
        return (!filterStatus || bet.status === filterStatus) &&
            (!filterResult || bet.actual_result === filterResult)
    })

    const totalPages = Math.max(1, Math.ceil(filteredBets.length / pageSize))
    const paginatedBets = filteredBets.slice((page - 1) * pageSize, page * pageSize)

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Minhas Apostas</h3>
                    <button
                        onClick={() => {
                            setEditingBet(null)
                            setBetForm({
                                home_team: '',
                                away_team: '',
                                market: '',
                                odd_value: '',
                                bet_amount: '',
                                fixture_date: '',
                                notes: ''
                            })
                            setShowBetModal(true)
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Aposta
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">Total de Apostas</div>
                        <div className="text-lg font-bold text-blue-600">{stats.totalBets}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">Total Apostado</div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalStaked)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">Total Retornos</div>
                        <div className="text-lg font-bold text-green-600">{formatCurrency(stats.totalReturns)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">Taxa de Acerto</div>
                        <div className="text-lg font-bold text-purple-600">{formatPercentage(stats.winRate / 100)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">Lucro/Prejuízo</div>
                        <div className={`text-lg font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.profit)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">Todos os status</option>
                    <option value="pending">Pendente</option>
                    <option value="settled">Finalizada</option>
                    <option value="cancelled">Cancelada</option>
                </select>
                <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">Todos os resultados</option>
                    <option value="win">Vitória</option>
                    <option value="loss">Derrota</option>
                    <option value="void">Anulada</option>
                </select>
            </div>

            {/* Lista de apostas */}
            {paginatedBets.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma aposta encontrada</h3>
                    <p className="text-gray-500 mb-4">Suas apostas aparecerão aqui</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedBets.map((bet) => (
                        <div key={bet.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {bet.home_team} vs {bet.away_team}
                                        </h4>
                                        <div className="text-sm text-gray-600">
                                            {bet.market} • Odd: {formatOdd(bet.odd_value)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {bet.status === 'pending' && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                <Clock className="h-3 w-3 inline mr-1" />
                                                Pendente
                                            </span>
                                        )}
                                        {bet.actual_result === 'win' && (
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                                Vitória
                                            </span>
                                        )}
                                        {bet.actual_result === 'loss' && (
                                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                <XCircle className="h-3 w-3 inline mr-1" />
                                                Derrota
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Valor Apostado</div>
                                        <div className="font-bold">{formatCurrency(bet.bet_amount)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Retorno Potencial</div>
                                        <div className="font-bold text-green-600">{formatCurrency(bet.potential_return || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Data do Jogo</div>
                                        <div className="font-bold">{bet.fixture_date ? formatDate(bet.fixture_date) : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Data da Aposta</div>
                                        <div className="font-bold">{formatDate(bet.bet_placed_at || bet.created_at || '')}</div>
                                    </div>
                                </div>

                                {bet.notes && (
                                    <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-3">
                                        <strong>Observações:</strong> {bet.notes}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        {bet.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateBetResult(bet.id!, 'win')}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    Marcar como Vitória
                                                </button>
                                                <button
                                                    onClick={() => updateBetResult(bet.id!, 'loss')}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                >
                                                    Marcar como Derrota
                                                </button>
                                                <button
                                                    onClick={() => updateBetResult(bet.id!, 'void')}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                                >
                                                    Anular
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openEditModal(bet)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteBet(bet.id!)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
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
            )}

            {/* Modal para adicionar/editar aposta */}
            {showBetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">
                            {editingBet ? 'Editar Aposta' : 'Nova Aposta'}
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Time da casa"
                                    value={betForm.home_team}
                                    onChange={(e) => setBetForm({ ...betForm, home_team: e.target.value })}
                                    className="border rounded px-3 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Time de fora"
                                    value={betForm.away_team}
                                    onChange={(e) => setBetForm({ ...betForm, away_team: e.target.value })}
                                    className="border rounded px-3 py-2"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Mercado (ex: Vitória da Casa)"
                                value={betForm.market}
                                onChange={(e) => setBetForm({ ...betForm, market: e.target.value })}
                                className="border rounded px-3 py-2 w-full"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Odd"
                                    value={betForm.odd_value}
                                    onChange={(e) => setBetForm({ ...betForm, odd_value: e.target.value })}
                                    className="border rounded px-3 py-2"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Valor (R$)"
                                    value={betForm.bet_amount}
                                    onChange={(e) => setBetForm({ ...betForm, bet_amount: e.target.value })}
                                    className="border rounded px-3 py-2"
                                />
                            </div>

                            <input
                                type="date"
                                placeholder="Data do jogo"
                                value={betForm.fixture_date}
                                onChange={(e) => setBetForm({ ...betForm, fixture_date: e.target.value })}
                                className="border rounded px-3 py-2 w-full"
                            />

                            <textarea
                                placeholder="Observações (opcional)"
                                value={betForm.notes}
                                onChange={(e) => setBetForm({ ...betForm, notes: e.target.value })}
                                className="border rounded px-3 py-2 w-full h-20"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowBetModal(false)
                                    setEditingBet(null)
                                }}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveBet}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={!betForm.home_team || !betForm.away_team || !betForm.market || !betForm.odd_value || !betForm.bet_amount}
                            >
                                {editingBet ? 'Atualizar' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
