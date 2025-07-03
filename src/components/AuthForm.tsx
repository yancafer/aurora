'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                if (error) throw error
                setMessage('Login realizado com sucesso!')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password
                })
                if (error) throw error
                setMessage('Conta criada! Verifique seu email para confirmar.')
            }
        } catch (error: any) {
            setMessage(error.message || 'Erro ao processar solicitação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-6">
                <div className="flex border-b">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 px-4 text-center ${isLogin
                                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                                : 'text-gray-500'
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 px-4 text-center ${!isLogin
                                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                                : 'text-gray-500'
                            }`}
                    >
                        Cadastrar
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.includes('erro') || message.includes('Erro')
                            ? 'bg-danger-50 text-danger-700 border border-danger-200'
                            : 'bg-success-50 text-success-700 border border-success-200'
                        }`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                </button>
            </form>
        </div>
    )
}
