'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import AuthForm from '@/components/AuthForm'

export default function Home() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Verificar usuário logado
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }

        getUser()

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user || null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />

            {user ? (
                <Dashboard user={user} />
            ) : (
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="max-w-md w-full mx-4">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Aurora
                            </h1>
                            <p className="text-lg text-gray-600">
                                Analisador de Apostas Esportivas
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Calcule probabilidades, valor esperado e encontre value bets
                            </p>
                        </div>
                        <AuthForm />
                    </div>
                </div>
            )}
        </div>
    )
}
