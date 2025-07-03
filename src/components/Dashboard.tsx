'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Calendar, BarChart3, Trophy, Target, Database } from 'lucide-react'
import { Fixture } from '@/types'
import FixturesList from '@/components/FixturesList'
import AnalysesHistory from '@/components/AnalysesHistory'
import BettingHistory from '@/components/BettingHistory'
import BettingAnalysis from '@/components/BettingAnalysis'
import DumpControl from '@/components/DumpControl'
import SupabaseTestButton from './SupabaseTestButton'

interface DashboardProps {
    user: User
}

type ActiveTab = 'fixtures' | 'analyses' | 'bets' | 'stats' | 'dump'

export default function Dashboard({ user }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('fixtures')
    const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
    const [stats, setStats] = useState({
        totalAnalyses: 0,
        totalBets: 0,
        totalProfit: 0,
        winRate: 0
    })

    useEffect(() => {
        loadStats()
    }, [user])

    const loadStats = async () => {
        try {
            // Carregar estatísticas do usuário
            const [analysesResponse, betsResponse] = await Promise.all([
                supabase
                    .from('analyses')
                    .select('*')
                    .eq('user_id', user.id),
                supabase
                    .from('bets')
                    .select('*')
                    .eq('user_id', user.id)
            ])

            const analyses = analysesResponse.data || []
            const bets = betsResponse.data || []

            const settledBets = bets.filter(bet => bet.result !== 'pending')
            const wonBets = settledBets.filter(bet => bet.result === 'win')
            const totalProfit = settledBets.reduce((sum, bet) => sum + (bet.profit_loss || 0), 0)
            const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0

            setStats({
                totalAnalyses: analyses.length,
                totalBets: bets.length,
                totalProfit,
                winRate
            })
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error)
        }
    }

    const tabs = [
        { id: 'fixtures' as ActiveTab, label: 'Partidas', icon: Calendar },
        { id: 'analyses' as ActiveTab, label: 'Análises', icon: BarChart3 },
        { id: 'bets' as ActiveTab, label: 'Apostas', icon: Target },
        { id: 'dump' as ActiveTab, label: 'Dados', icon: Database },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-primary-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Análises</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <Target className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Apostas</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalBets}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <Trophy className="h-8 w-8 text-success-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Taxa de Acerto</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stats.totalProfit >= 0 ? 'bg-success-100' : 'bg-danger-100'
                            }`}>
                            <span className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'
                                }`}>
                                {stats.totalProfit >= 0 ? '+' : '-'}
                            </span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Lucro/Prejuízo</p>
                            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'
                                }`}>
                                R$ {Math.abs(stats.totalProfit).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <SupabaseTestButton/>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id)
                                        setSelectedFixture(null)
                                    }}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'fixtures' && !selectedFixture && (
                        <FixturesList
                            user={user}
                            onSelectFixture={setSelectedFixture}
                        />
                    )}
                    {activeTab === 'fixtures' && selectedFixture && (
                        <BettingAnalysis
                            fixture={selectedFixture}
                            user={user}
                            onBack={() => setSelectedFixture(null)}
                        />
                    )}
                    {activeTab === 'analyses' && <AnalysesHistory user={user} onStatsUpdate={loadStats} />}
                    {activeTab === 'bets' && <BettingHistory user={user} onStatsUpdate={loadStats} />}
                    {activeTab === 'dump' && <DumpControl user={user} />}
                </div>
            </div>
        </div>
    )
}
