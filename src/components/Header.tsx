'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'

interface HeaderProps {
    user: User | null
}

export default function Header({ user }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-600">Aurora</h1>
                        <span className="ml-2 text-sm text-gray-500">Beta</span>
                    </div>

                    {/* User Menu */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                <UserIcon size={20} />
                                <span className="hidden sm:block">{user.email}</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
