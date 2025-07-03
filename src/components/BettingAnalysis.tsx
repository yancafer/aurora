'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Fixture, Odd, Analysis, BettingCalculation } from '@/types'
import { BettingCalculator } from '@/utils/betting-calculator'
import { ProbabilityService, ProbabilityResult } from '@/services/probability-service'
import { ArrowLeft, Calculator, TrendingUp, Brain, User as UserIcon, AlertCircle, Sparkles, RefreshCw } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'

interface BettingAnalysisProps {
    fixture: Fixture
    user: User
    onBack: () => void
}

export default function BettingAnalysis({ fixture, user, onBack }: BettingAnalysisProps) {
    const [odds, setOdds] = useState<Odd[]>([])
    const [selectedMarket, setSelectedMarket] = useState('')
    const [selectedOdd, setSelectedOdd] = useState<any>(null)
    const [estimatedProbability, setEstimatedProbability] = useState<number>(50)
    const [isManualEstimate, setIsManualEstimate] = useState(true)
    const [calculation, setCalculation] = useState<BettingCalculation | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [generatingProbability, setGeneratingProbability] = useState(false)
    const [autoProbability, setAutoProbability] = useState<ProbabilityResult | null>(null)

    useEffect(() => {
        loadOdds()
    }, [fixture])

    useEffect(() => {
        if (selectedOdd && estimatedProbability) {
            const calc = BettingCalculator.calculateBettingValues(
                parseFloat(selectedOdd.value),
                estimatedProbability
            )
            setCalculation(calc)
        }
    }, [selectedOdd, estimatedProbability])

    const loadOdds = async () => {
        try {
            const { data, error } = await supabase
                .from('odds')
                .select('*')
                .eq('api_fixture_id', fixture.id)

            if (error) throw error
            setOdds(data || [])

            // Selecionar primeiro mercado disponível
            if (data && data.length > 0) {
                const firstMarket = data[0].market_name
                setSelectedMarket(firstMarket)

                const firstOdd = data[0].values?.[0]
                if (firstOdd) {
                    setSelectedOdd(firstOdd)
                }
            }
        } catch (error) {
            console.error('Erro ao carregar odds:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateAutomaticProbability = async () => {
        setGeneratingProbability(true)
        try {
            const result = await ProbabilityService.generateAutomaticProbability(fixture)
            setAutoProbability(result)

            // Se o usuário não está usando estimativa manual, atualizar com o valor automático
            if (!isManualEstimate && selectedMarket) {
                updateProbabilityFromAuto(selectedMarket, result)
            }
        } catch (error) {
            console.error('Erro ao gerar probabilidade automática:', error)
        } finally {
            setGeneratingProbability(false)
        }
    }

    const updateProbabilityFromAuto = (market: string, result: ProbabilityResult) => {
        let probabilityValue = 50

        if (market.includes('Home') || market.includes('1')) {
            probabilityValue = result.homeWinProbability
        } else if (market.includes('Away') || market.includes('2')) {
            probabilityValue = result.awayWinProbability
        } else if (market.includes('Draw') || market.includes('X')) {
            probabilityValue = result.drawProbability
        }

        setEstimatedProbability(probabilityValue)
    }

    const handleMarketChange = (market: string, odd: any) => {
        setSelectedMarket(market)
        setSelectedOdd(odd)

        // Se temos probabilidade automática e não está usando manual, aplicar valor correspondente
        if (autoProbability && !isManualEstimate) {
            updateProbabilityFromAuto(market, autoProbability)
        }
    }

    const getAvailableMarkets = () => {
        const markets = odds.map((o: any) => o.market_name)
        return Array.from(new Set(markets))
    }

    const getOddsForMarket = () => {
        return odds.filter((o: any) => o.market_name === selectedMarket)
    }

    const saveAnalysis = async () => {
        if (!selectedOdd || !calculation) return

        setSaving(true)
        try {
            const { data, error } = await supabase.from('analyses').insert({
                user_id: user.id,
                fixture_id: fixture.id,
                api_fixture_id: fixture.id,
                home_team: fixture.teams?.home?.name || '',
                away_team: fixture.teams?.away?.name || '',
                market: selectedMarket,
                odd_value: parseFloat(selectedOdd.value),
                bookmaker: selectedOdd.bookmaker_name,
                implicit_probability: calculation.implicitProbability,
                estimated_probability: estimatedProbability,
                expected_value: calculation.expectedValue,
                is_value_bet: calculation.isValueBet,
                confidence: autoProbability?.confidence || 0,
                probability_source: isManualEstimate ? 'manual' : 'automatic',
                created_at: new Date().toISOString(),
            })

            if (error) throw error

            alert('Análise salva com sucesso!')
        } catch (error) {
            console.error('Erro ao salvar análise:', error)
            alert('Erro ao salvar análise')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Carregando dados...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Voltar
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Análise de Aposta
                            </h1>
                            <p className="text-gray-600">
                                {fixture.teams?.home?.name} vs {fixture.teams?.away?.name}
                            </p>
                        </div>
                        <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                {/* Probabilidade Automática */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                            Probabilidade Automática
                        </h2>
                        <button
                            onClick={generateAutomaticProbability}
                            disabled={generatingProbability}
                            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {generatingProbability ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Brain className="h-4 w-4 mr-2" />
                            )}
                            {generatingProbability ? 'Calculando...' : 'Gerar'}
                        </button>
                    </div>

                    {autoProbability && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Vitória Casa</div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatPercentage(autoProbability.homeWinProbability)}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Empate</div>
                                <div className="text-xl font-bold text-yellow-600">
                                    {formatPercentage(autoProbability.drawProbability)}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Vitória Fora</div>
                                <div className="text-xl font-bold text-red-600">
                                    {formatPercentage(autoProbability.awayWinProbability)}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Confiança</div>
                                <div className="text-xl font-bold text-blue-600">
                                    {autoProbability.confidence}%
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Seleção de Mercado */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Selecionar Mercado</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select
                            value={selectedMarket}
                            onChange={(e) => {
                                const market = e.target.value
                                const marketOdds = getOddsForMarket()
                                if (marketOdds.length > 0) {
                                    handleMarketChange(market, marketOdds[0].values?.[0])
                                }
                            }}
                            className="p-3 border rounded-lg"
                        >
                            <option value="">Selecione um mercado</option>
                            {getAvailableMarkets().map((market) => (
                                <option key={market} value={market}>
                                    {market}
                                </option>
                            ))}
                        </select>

                        {selectedMarket && getOddsForMarket().length > 0 && (
                            <select
                                value={selectedOdd?.value || ''}
                                onChange={(e) => {
                                    const oddValue = e.target.value
                                    const marketOdds = getOddsForMarket()
                                    const foundOdd = marketOdds[0]?.values?.find((v: any) => v.value === oddValue)
                                    if (foundOdd) {
                                        setSelectedOdd(foundOdd)
                                    }
                                }}
                                className="p-3 border rounded-lg"
                            >
                                <option value="">Selecione uma odd</option>
                                {getOddsForMarket()[0]?.values?.map((odd: any, index: number) => (
                                    <option key={index} value={odd.value}>
                                        {odd.value} - {odd.odd}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Estimativa de Probabilidade */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Probabilidade Estimada</h2>

                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={isManualEstimate}
                                onChange={() => setIsManualEstimate(true)}
                                className="mr-2"
                            />
                            <UserIcon className="h-4 w-4 mr-1" />
                            Manual
                        </label>

                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={!isManualEstimate}
                                onChange={() => {
                                    setIsManualEstimate(false)
                                    if (autoProbability && selectedMarket) {
                                        updateProbabilityFromAuto(selectedMarket, autoProbability)
                                    }
                                }}
                                className="mr-2"
                            />
                            <Brain className="h-4 w-4 mr-1" />
                            Automática
                        </label>
                    </div>

                    {isManualEstimate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sua estimativa (%)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="99"
                                value={estimatedProbability}
                                onChange={(e) => setEstimatedProbability(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>1%</span>
                                <span className="font-medium">{estimatedProbability}%</span>
                                <span>99%</span>
                            </div>
                        </div>
                    )}

                    {!isManualEstimate && !autoProbability && (
                        <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Gere primeiro a probabilidade automática acima
                        </div>
                    )}
                </div>

                {/* Resultado da Análise */}
                {calculation && selectedOdd && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            Resultado da Análise
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Odd Selecionada</div>
                                <div className="text-2xl font-bold">{selectedOdd.value}</div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Probabilidade Implícita</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatPercentage(calculation.implicitProbability)}
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${calculation.isValueBet ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                <div className="text-sm text-gray-600">Valor Esperado</div>
                                <div className={`text-2xl font-bold ${calculation.isValueBet ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {formatPercentage(calculation.expectedValue)}
                                </div>
                            </div>
                        </div>

                        <div className={`mt-4 p-4 rounded-lg flex items-center ${calculation.isValueBet
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                            }`}>
                            {calculation.isValueBet ? (
                                <>
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    <span className="font-semibold">VALUE BET!</span>
                                    <span className="ml-2">Esta aposta tem valor positivo a longo prazo.</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    <span className="font-semibold">SEM VALOR</span>
                                    <span className="ml-2">Esta aposta não tem valor positivo.</span>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={saveAnalysis}
                                disabled={saving}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Calculator className="h-4 w-4 mr-2" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Análise'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
