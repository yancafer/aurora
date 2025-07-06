"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Bet {
  id?: number;
  home_team: string;
  away_team: string;
  market: string;
  odd_value: number;
  bet_amount: number;
  potential_return: number;
  status: 'pending' | 'win' | 'loss' | 'cancelled';
  actual_result?: string;
  notes?: string;
  fixture_date: string;
  bet_placed_at?: string;
  settled_at?: string;
}

export default function BettingSimulator() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Verificar usuário autenticado
  useEffect(() => {
    checkUser();
    loadBets();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadBets = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "00000000-0000-0000-0000-000000000000";

      const { data, error } = await supabase
        .from('bet_history')
        .select('*')
        .eq('user_id', userId)
        .order('bet_placed_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar apostas:', error);
        setBets([]);
      } else {
        setBets(data || []);
      }
    } catch (error) {
      console.error('Erro geral:', error);
      setBets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const placeBet = async (betData: Omit<Bet, 'id' | 'bet_placed_at'>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "00000000-0000-0000-0000-000000000000";

      const newBet = {
        ...betData,
        user_id: userId,
        bet_placed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('bet_history')
        .insert([newBet])
        .select();

      if (error) {
        console.error('Erro ao salvar aposta:', error);
        alert(`Erro ao salvar aposta: ${error.message}`);
      } else {
        console.log('✅ Aposta salva com sucesso:', data);
        alert('🎉 Aposta salva em "Minhas Apostas" com sucesso!');
        await loadBets(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro geral:', error);
      alert(`Erro geral: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBetResult = async (betId: number, result: 'win' | 'loss') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bet_history')
        .update({
          actual_result: result,
          status: result === 'win' ? 'win' : 'loss',
          settled_at: new Date().toISOString(),
        })
        .eq('id', betId)
        .select();

      if (error) {
        console.error('Erro ao atualizar aposta:', error);
        alert(`Erro ao atualizar: ${error.message}`);
      } else {
        console.log('✅ Aposta atualizada:', data);
        alert(`🎯 Aposta marcada como ${result === 'win' ? 'vitória' : 'derrota'}!`);
        await loadBets();
      }
    } catch (error) {
      console.error('Erro geral:', error);
      alert(`Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Exemplos de apostas para simular o "apostar na Betano"
  const sampleBets = [
    {
      home_team: "Flamengo",
      away_team: "Palmeiras",
      market: "Vitória da Casa",
      odd_value: 2.30,
      bet_amount: 50,
      potential_return: 115,
      status: 'pending' as const,
      notes: "Aposta no clássico - Flamengo em casa",
      fixture_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    },
    {
      home_team: "Santos",
      away_team: "Corinthians",
      market: "Mais de 2.5 Gols",
      odd_value: 1.85,
      bet_amount: 30,
      potential_return: 55.5,
      status: 'pending' as const,
      notes: "Clássico com tendência de gols",
      fixture_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Depois de amanhã
    },
    {
      home_team: "São Paulo",
      away_team: "Internacional",
      market: "Empate",
      odd_value: 3.20,
      bet_amount: 25,
      potential_return: 80,
      status: 'pending' as const,
      notes: "Apostando no empate - times equilibrados",
      fixture_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Daqui 3 dias
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">⚽ Simulador de Apostas - Aurora</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seção: Fazer Apostas */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Apostar na Betano (Simulado)</h2>
          <p className="text-gray-600 mb-4">
            Escolha uma das apostas abaixo para simular o processo de apostar:
          </p>

          <div className="space-y-4">
            {sampleBets.map((bet, index) => (
              <div key={index} className="border border-gray-100 rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">
                    {bet.home_team} vs {bet.away_team}
                  </h3>
                  <span className="text-lg font-bold text-green-600">
                    {bet.odd_value.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Mercado: {bet.market}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Aposta: R$ {bet.bet_amount.toFixed(2)} → Retorno: R$ {bet.potential_return.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {bet.notes}
                </p>
                <button
                  onClick={() => placeBet(bet)}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                  {isLoading ? '⏳ Apostando...' : '🎲 Apostar na Betano'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seção: Minhas Apostas */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📋 Minhas Apostas</h2>
            <button
              onClick={loadBets}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? '⏳' : '🔄 Atualizar'}
            </button>
          </div>

          {!user && (
            <div className="text-center text-gray-500 mb-4">
              ℹ️ Usuário não autenticado - usando ID genérico para teste
            </div>
          )}

          <div className="space-y-3">
            {bets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                📭 Nenhuma aposta encontrada.<br />
                <span className="text-sm">Faça uma aposta para começar!</span>
              </div>
            ) : (
              bets.map((bet) => (
                <div key={bet.id} className="border border-gray-100 rounded p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {bet.home_team} vs {bet.away_team}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${bet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bet.status === 'win' ? 'bg-green-100 text-green-800' :
                        bet.status === 'loss' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {bet.status === 'pending' ? '⏳ Pendente' :
                        bet.status === 'win' ? '✅ Vitória' :
                          bet.status === 'loss' ? '❌ Derrota' : bet.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    {bet.market} | Odd: {bet.odd_value.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    R$ {bet.bet_amount.toFixed(2)} → R$ {bet.potential_return?.toFixed(2)}
                  </p>

                  {bet.notes && (
                    <p className="text-xs text-gray-500 mb-2">{bet.notes}</p>
                  )}

                  <div className="text-xs text-gray-400 mb-2">
                    Apostado em: {new Date(bet.bet_placed_at || '').toLocaleString('pt-BR')}
                  </div>

                  {bet.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateBetResult(bet.id!, 'win')}
                        disabled={isLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm disabled:opacity-50"
                      >
                        ✅ Marcar Vitória
                      </button>
                      <button
                        onClick={() => updateBetResult(bet.id!, 'loss')}
                        disabled={isLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm disabled:opacity-50"
                      >
                        ❌ Marcar Derrota
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status da Conexão */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Status: {user ? `👤 Autenticado como ${user.email}` : '🔓 Não autenticado (usando ID de teste)'}
      </div>
    </div>
  );
}
