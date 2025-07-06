import DatabaseSetup from '@/components/DatabaseSetup';
import BettingSimulator from '@/components/BettingSimulator';

export default function TestingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🧪 Aurora - Sistema de Testes
        </h1>

        {/* Setup do Banco */}
        <div className="mb-12">
          <DatabaseSetup />
        </div>

        {/* Simulador de Apostas */}
        <div className="mb-12">
          <BettingSimulator />
        </div>
      </div>
    </div>
  );
}
