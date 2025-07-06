'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { testBettingFlow } from '@/scripts/test-betting-flow'
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function BettingSystemTest() {
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState<'success' | 'error' | null>(null)
    const [message, setMessage] = useState('')

    const runTest = async () => {
        setTesting(true)
        setResult(null)
        setMessage('')

        try {
            // Redirecionar console.log para capturar mensagens
            const originalLog = console.log
            const originalError = console.error
            const logs: string[] = []

            console.log = (...args) => {
                logs.push(args.join(' '))
                originalLog(...args)
            }

            console.error = (...args) => {
                logs.push('ERROR: ' + args.join(' '))
                originalError(...args)
            }

            await testBettingFlow()

            // Restaurar console
            console.log = originalLog
            console.error = originalError

            setResult('success')
            setMessage(logs.join('\n'))

        } catch (error) {
            setResult('error')
            setMessage(`Erro no teste: ${error}`)
            console.error('Erro no teste:', error)
        } finally {
            setTesting(false)
        }
    }

    const checkTables = async () => {
        try {
            const { data, error } = await supabase
                .from('bet_history')
                .select('count')
                .limit(1)

            if (error) {
                setResult('error')
                setMessage(`Erro ao verificar tabela bet_history: ${error.message}`)
            } else {
                setResult('success')
                setMessage('✅ Tabela bet_history está acessível')
            }
        } catch (error) {
            setResult('error')
            setMessage(`Erro na verificação: ${error}`)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Teste do Sistema de Apostas
            </h3>

            <p className="text-gray-600 mb-4">
                Use este componente para testar se o sistema de apostas está funcionando corretamente.
            </p>

            <div className="space-y-3">
                <button
                    onClick={checkTables}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {testing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verificar Tabelas
                </button>

                <button
                    onClick={runTest}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {testing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Executar Teste Completo
                </button>
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {result === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${result === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {result === 'success' ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                        </span>
                    </div>

                    <pre className={`text-sm whitespace-pre-wrap ${result === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {message}
                    </pre>
                </div>
            )}
        </div>
    )
}
