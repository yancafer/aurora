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

    const deleteAnalysis = async (id: string) => {
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
                <p className="text-gray-500">Suas análises de apostas aparecerão aqui</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Histórico de Análises</h3>
                <span className="text-sm text-gray-500">{analyses.length} análises</span>
            </div>

            <div className="space-y-3">
                {analyses.map((analysis) => (
                    <div
                        key={analysis.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-gray-900">
                                        {analysis.home_team} vs {analysis.away_team}
                                    </span>
                                    {analysis.is_value_bet && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Value Bet
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Mercado:</span>
                                        <div className="font-medium">{analysis.market}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Odd:</span>
                                        <div className="font-medium">{analysis.odd_value}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Prob. Estimada:</span>
                                        <div className="font-medium">{formatPercentage(analysis.estimated_probability)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">EV:</span>
                                        <div className={`font-medium ${analysis.expected_value > 0 ? 'text-success-600' : 'text-danger-600'
                                            }`}>
                                            {analysis.expected_value > 0 ? '+' : ''}{formatPercentage(analysis.expected_value * 100)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatDate(analysis.created_at || '')}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => deleteAnalysis(analysis.id!)}
                                            className="text-danger-600 hover:text-danger-800 text-sm"
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
        </div>
    )
}
