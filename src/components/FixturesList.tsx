'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Fixture } from '@/types'
import { Calendar, Clock, MapPin, Search } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface FixturesListProps {
    user: User
    onSelectFixture?: (fixture: Fixture) => void
}

export default function FixturesList({ user, onSelectFixture }: FixturesListProps) {
    const [fixtures, setFixtures] = useState<Fixture[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedLeague, setSelectedLeague] = useState('')

    useEffect(() => {
        loadFixtures()
    }, [selectedDate, selectedLeague])

    const loadFixtures = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('fixtures')
                .select('*')
                .eq('date', selectedDate)
                .order('timestamp', { ascending: true })

            if (selectedLeague) {
                query = query.eq('league->name', selectedLeague)
            }

            const { data, error } = await query
            if (error) throw error

            setFixtures(data || [])
        } catch (error) {
            console.error('Erro ao carregar partidas:', error)
        } finally {
            setLoading(false)
        }
    }

    const getUniqueLeagues = () => {
        const leagues = fixtures.map(f => f.league?.name).filter(Boolean)
        return Array.from(new Set(leagues))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'FT': return 'bg-gray-500'
            case 'LIVE': return 'bg-green-500'
            case 'HT': return 'bg-yellow-500'
            default: return 'bg-blue-500'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'FT': return 'Finalizado'
            case 'LIVE': return 'Ao Vivo'
            case 'HT': return 'Intervalo'
            case 'NS': return 'Não Iniciado'
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <select
                        value={selectedLeague}
                        onChange={(e) => setSelectedLeague(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todas as ligas</option>
                        {getUniqueLeagues().map(league => (
                            <option key={league} value={league}>{league}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Partidas */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : fixtures.length === 0 ? (
                <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma partida encontrada</h3>
                    <p className="text-gray-500">Tente selecionar uma data diferente</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {fixtures.map((fixture) => (
                        <div
                            key={fixture.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onSelectFixture?.(fixture)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(fixture.status?.short || '')}`}>
                                        {getStatusText(fixture.status?.short || '')}
                                    </span>
                                    {fixture.status?.elapsed && (
                                        <span className="text-sm text-gray-500">{fixture.status.elapsed}'</span>
                                    )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatTime(new Date(fixture.timestamp * 1000))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            {fixture.teams?.home?.logo && (
                                                <img
                                                    src={fixture.teams.home.logo}
                                                    alt={fixture.teams.home.name}
                                                    className="w-6 h-6"
                                                />
                                            )}
                                            <span className="font-medium">{fixture.teams?.home?.name}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {fixture.goals?.home ?? '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {fixture.teams?.away?.logo && (
                                                <img
                                                    src={fixture.teams.away.logo}
                                                    alt={fixture.teams.away.name}
                                                    className="w-6 h-6"
                                                />
                                            )}
                                            <span className="font-medium">{fixture.teams?.away?.name}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {fixture.goals?.away ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    {fixture.league?.flag && (
                                        <img
                                            src={fixture.league.flag}
                                            alt={fixture.league.country}
                                            className="w-4 h-4 mr-1"
                                        />
                                    )}
                                    <span>{fixture.league?.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{fixture.venue?.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
