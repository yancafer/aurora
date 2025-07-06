# 🌟 Aurora - Sistema de Análise de Apostas Esportivas

Sistema completo para análise, gestão e automação de apostas esportivas com integração de dados em tempo real.

## 🚀 Funcionalidades

- **📊 Análise de Apostas**: Sistema automatizado de análise baseado em dados estatísticos
- **📈 Histórico Completo**: Armazenamento e consulta de todas as apostas realizadas
- **🎯 Simulador de Apostas**: Interface para simular apostas da Betano
- **📱 Interface Moderna**: Dashboard responsivo construído com Next.js e Tailwind
- **🔒 Segurança**: Row Level Security (RLS) para proteção de dados
- **⚡ Tempo Real**: Integração com API Football para dados atualizados

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **APIs**: API Football (dados esportivos)
- **Scripts**: Node.js para automações

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Chave API Football (opcional)

## ⚙️ Setup Rápido

### 1. Configurar Banco de Dados

1. **Acesse o Supabase Studio**:

   ```
   https://app.supabase.com/project/kliueivioyijupyqpfyu/sql
   ```

2. **Execute o SQL de setup**:
   - Copie todo o conteúdo do arquivo `setup-bet-history.sql`
   - Cole no SQL Editor do Supabase
   - Execute o script

### 2. Verificar Setup

```bash
# Verificar se tudo foi configurado corretamente
npx tsx src/scripts/verify-database-setup.ts
```

### 3. Iniciar o Sistema

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 4. Testar Funcionalidades

Acesse: `http://localhost:3000/testing`

## 🧪 Testes Disponíveis

### Teste do Fluxo de Apostas

```bash
npx tsx src/scripts/test-betting-flow.ts
```

### Verificação do Banco

```bash
npx tsx src/scripts/verify-database-setup.ts
```

### Teste de Conexão

```bash
npx tsx src/scripts/test-supabase.ts
```

## 📱 Como Usar

### 1. Simulador de Apostas

- Acesse `/testing`
- Clique em "🎲 Apostar na Betano" para simular uma aposta
- A aposta será salva em "📋 Minhas Apostas"
- Use "✅ Marcar Vitória" ou "❌ Marcar Derrota" para atualizar resultados

### 2. API de Apostas

```javascript
import { supabase } from "@/lib/supabase";

// Criar nova aposta
const { data, error } = await supabase.from("bet_history").insert([
  {
    home_team: "Flamengo",
    away_team: "Palmeiras",
    market: "Vitória da Casa",
    odd_value: 2.3,
    bet_amount: 50.0,
    potential_return: 115.0,
    status: "pending",
  },
]);
```

## 🗂️ Estrutura do Projeto

```
aurora/
├── src/
│   ├── app/                 # Pages Next.js
│   │   ├── testing/         # Página de testes
│   │   └── api/             # API routes
│   ├── components/          # Componentes React
│   │   ├── BettingSimulator.tsx    # Simulador principal
│   │   ├── DatabaseSetup.tsx       # Setup do banco
│   │   └── ...
│   ├── scripts/             # Scripts de automação
│   │   ├── test-betting-flow.ts    # Teste completo
│   │   ├── verify-database-setup.ts # Verificação
│   │   └── ...
│   └── lib/                 # Configurações
│       └── supabase.ts      # Cliente Supabase
├── setup-bet-history.sql   # SQL para setup
└── package.json
```

## 📊 Esquema do Banco

### Tabela `bet_history`

```sql
- id (BIGSERIAL)             # ID único
- user_id (UUID)             # ID do usuário
- home_team (TEXT)           # Time da casa
- away_team (TEXT)           # Time visitante
- market (TEXT)              # Tipo de aposta
- odd_value (DECIMAL)        # Valor da odd
- bet_amount (DECIMAL)       # Valor apostado
- potential_return (DECIMAL) # Retorno potencial
- actual_result (TEXT)       # Resultado real
- status (TEXT)              # Status da aposta
- notes (TEXT)               # Observações
- fixture_date (TIMESTAMP)   # Data do jogo
- bet_placed_at (TIMESTAMP)  # Data da aposta
- settled_at (TIMESTAMP)     # Data de resolução
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                  # Servidor desenvolvimento
npm run build               # Build de produção
npm run lint                # Verificar código

# Scripts de dados
npm run dump:daily          # Dump diário de dados
npx tsx src/scripts/daily-dump.ts  # Executar dump manual

# Testes
npx tsx src/scripts/test-betting-flow.ts     # Teste completo
npx tsx src/scripts/verify-database-setup.ts # Verificar setup
```

## 🌐 URLs Importantes

- **App Local**: http://localhost:3000
- **Página de Testes**: http://localhost:3000/testing
- **Supabase Studio**: https://app.supabase.com/project/kliueivioyijupyqpfyu
- **SQL Editor**: https://app.supabase.com/project/kliueivioyijupyqpfyu/sql

## 🔒 Variáveis de Ambiente

O arquivo `.env` já está configurado com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kliueivioyijupyqpfyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RAPID_API_KEY=...
DUMP_API_KEY=...
```

## 🎯 Próximos Passos

1. ✅ Execute o setup do banco (`setup-bet-history.sql`)
2. ✅ Verifique se tudo funciona (`verify-database-setup.ts`)
3. ✅ Teste o simulador em `/testing`
4. 🚀 Comece a usar o sistema!

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o SQL foi executado no Supabase Studio
2. Execute `verify-database-setup.ts` para diagnosticar
3. Confira os logs no console do navegador

---

**🎉 Aurora está pronto para análise de apostas esportivas!**
