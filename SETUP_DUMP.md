# Configuração do Projeto Aurora - Análise de Apostas

## Problemas Identificados e Soluções

### 1. Variáveis de Ambiente Faltando

**Problema:** As variáveis de ambiente do Supabase não estão configuradas, causando erro `supabaseUrl is required.`

**Solução:**

1. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# API Football (se necessário)
RAPID_API_KEY=your-rapid-api-key

# Chave para autenticação da API de dump
DUMP_API_KEY=your-secret-dump-api-key
```

2. Substitua os valores pelos dados reais do seu projeto Supabase:
   - Acesse [Supabase Dashboard](https://app.supabase.com)
   - Vá em Settings > API
   - Copie a URL e as chaves necessárias

### 2. Tabelas Faltando no Banco de Dados

**Problema:** As tabelas `team_statistics` e `standings` não existem no schema do banco.

**Solução:**
Execute a migração `002_add_missing_tables.sql` no seu banco Supabase:

1. No Supabase Dashboard, vá em SQL Editor
2. Execute o conteúdo do arquivo `supabase/migrations/002_add_missing_tables.sql`

### 3. Como Testar se Está Funcionando

Após configurar as variáveis de ambiente:

```bash
# Testar conexão com Supabase
npx tsx src/scripts/test-supabase.ts

# Executar dump manual
npx tsx src/scripts/daily-dump.ts --force --date 2025-07-02
```

### 4. Como Executar via API

```bash
# Fazer uma requisição POST para a API de dump
curl -X POST http://localhost:3000/api/dump \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-dump-api-key" \
  -d '{
    "type": "manual",
    "date": "2025-07-02",
    "leagues": [39, 140],
    "forceUpdate": true
  }'
```

### 5. Checklist de Verificação

- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] Variáveis do Supabase preenchidas corretamente
- [ ] Migração `002_add_missing_tables.sql` executada
- [ ] Teste de conexão passou (`test-supabase.ts`)
- [ ] API Football configurada (se necessário)

### 6. Logs para Monitoramento

O sistema gera logs detalhados durante o dump:

- ✅ Sucesso nas operações
- ❌ Erros específicos
- 📊 Estatísticas de dados salvos
- 💾 Confirmação de salvamento no Supabase

### 7. Estrutura das Tabelas Criadas

**team_statistics:**

- `team_id`: ID do time
- `league_id`: ID da liga
- `season`: Temporada
- `statistics`: Dados em JSON

**standings:**

- `league_id`: ID da liga
- `season`: Temporada
- `standings`: Classificação em JSON
