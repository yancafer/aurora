# Requisitos da Aplicação: Verificador de Probabilidade para Apostas de Futebol

## 🌟 Objetivo

Criar uma aplicação web que:

* Liste partidas de futebol usando a API-Football
* Exiba odds e dados estatísticos relevantes
* Calcule a probabilidade implícita
* Gere uma probabilidade estimada automaticamente com base em dados
* Permita inserção manual de probabilidade estimada (opcional)
* Calcule e exiba o valor esperado (EV)
* Indique se a aposta tem valor positivo (value bet)
* Utilize um dump diário da API para eficiência
* Permita que o usuário registre suas apostas e resultados
* Armazene os dados no Supabase, com cada usuário tendo sua própria dashboard

---

## 💻 Stack Recomendada

| Camada          | Tecnologia sugerida                    | Motivo                                                         |
| --------------- | -------------------------------------- | -------------------------------------------------------------- |
| **Linguagem**   | TypeScript                             | Tipagem estática, robustez e uso em toda a stack               |
| **Frontend**    | React + TypeScript                     | Interface reativa, integração fácil com APIs                   |
| **Framework**   | Next.js (App Router)                   | SSR opcional, rotas organizadas, suporte nativo a autenticação |
| **Estilo**      | Tailwind CSS ou shadcn/ui              | Design rápido, moderno e responsivo                            |
| **Backend**     | Supabase (PostgreSQL + Auth + Storage) | Backend completo sem necessidade de servidor próprio           |
| **Scripts**     | Node.js (TypeScript)                   | Ideal para o dump diário da API                                |
| **Agendamento** | node-cron ou Vercel Cron               | Automatiza tarefas como o dump diário                          |

---

## 📄 Requisitos Funcionais

Cada requisito funcional abaixo representa uma funcionalidade essencial que a aplicação deve atender para permitir análise e registro eficiente de apostas esportivas.

### 1. Listagem de Partidas

Permite que o usuário visualize os jogos disponíveis no dia, com filtro por data e liga. Isso facilita a navegação entre partidas relevantes para análise.

* [ ] Buscar jogos por data e liga
* [ ] Exibir nome dos times, horário e status

### 2. Exibição de Odds

Exibe as odds disponíveis para os diferentes mercados de apostas (ex: 1X2, Over/Under, Ambas Marcam), permitindo a comparação e análise de possíveis escolhas.

* [ ] Mostrar odds por mercado (1X2, Over/Under, Ambas Marcam)
* [ ] Mostrar a casa de apostas correspondente

### 3. Probabilidade Implícita

Calcula a probabilidade implícita com base na odd informada pela casa de apostas. Essa probabilidade indica o que a casa acredita ser a chance de um evento ocorrer.

#### Como funciona:

A fórmula é:

```
Probabilidade Implícita (%) = 100 / Odd
```

Exemplo: Uma odd de 2.00 representa uma probabilidade implícita de 50% (100 / 2.00 = 50). Quanto menor a odd, maior a chance implícita atribuída pela casa de apostas.
Calcula a probabilidade implícita com base na odd informada pela casa de apostas. Essa probabilidade indica o que a casa acredita ser a chance de um evento ocorrer.

* [ ] Calcular com a fórmula `100 / odd`

### 4. Probabilidade Estimada do Usuário

Permite que o usuário insira manualmente sua própria estimativa de probabilidade com base em sua análise pessoal. Também oferece a geração automática baseada em dados estatísticos da API-Football.

#### Como funciona:

Essa é a chance **real** (na visão do usuário ou do sistema) de um evento ocorrer. Pode ser baseada em:

* Forma recente dos times
* Confrontos diretos
* Classificação
* Desfalques e fatores contextuais

Essa probabilidade é usada para comparar com a probabilidade implícita da odd e descobrir se há valor na aposta.
Permite que o usuário insira manualmente sua própria estimativa de probabilidade com base em sua análise pessoal. Também oferece a geração automática baseada em dados estatísticos da API-Football.

* [ ] Permitir inserção manual da probabilidade em %
* [ ] Permitir uso automático com base nos dados da API

### 5. Cálculo de Valor Esperado (EV)

Compara a probabilidade estimada com a odd para calcular o valor esperado da aposta. Essa métrica indica se a aposta tem valor positivo a longo prazo (value bet).

#### Como funciona:

A fórmula do EV é:

```
EV = (Odd * Probabilidade Estimada) - 1
```

Se EV > 0, significa que a aposta tem valor positivo. Por exemplo:

* Odd = 2.10
* Probabilidade estimada = 60% → 0.60
* EV = (2.10 \* 0.60) - 1 = 0.26 (ou 26%)

Isso representa um retorno esperado de 26% a longo prazo para esse tipo de aposta.
Compara a probabilidade estimada com a odd para calcular o valor esperado da aposta. Essa métrica indica se a aposta tem valor positivo a longo prazo (value bet).

* [ ] EV = `(odd * prob_estimada_decimal) - 1`
* [ ] Exibir EV em % e indicador de aposta de valor (ou não)

### 6. Geração Automática da Estimativa

Utiliza estatísticas como forma recente, desempenho em casa/fora, confrontos diretos e classificação na liga para calcular uma estimativa de probabilidade baseada em dados.

#### Como funciona:

Cada componente recebe um peso e contribui para a probabilidade final:

* Forma recente (últimos 5 jogos): 35%
* Desempenho como mandante/visitante: 30%
* Confrontos diretos (H2H): 20%
* Classificação na liga: 15%

Fórmula:

```
Probabilidade = (Forma * 0.35 + CasaFora * 0.30 + H2H * 0.20 + Rank * 0.15)
```

O resultado é a estimativa de chance de vitória do time analisado com base estatística.
Utiliza estatísticas como forma recente, desempenho em casa/fora, confrontos diretos e classificação na liga para calcular uma estimativa de probabilidade baseada em dados.

* [ ] Usar os seguintes dados da API-Football:

  * Forma recente (ult. 5 jogos)
  * Desempenho em casa/fora
  * Confrontos diretos (H2H)
  * Classificação na liga
* [ ] Aplicar pesos na fórmula:

  ```
  Probabilidade = (Forma * 0.35 + CasaFora * 0.30 + H2H * 0.20 + Rank * 0.15)
  ```

### 7. Histórico de Análises

Registra todas as análises realizadas pelo usuário, permitindo que ele consulte decisões passadas. Útil para revisão de estratégia e aprendizado contínuo.

* [ ] Listar análises feitas
* [ ] Armazenar no Supabase por usuário logado

### 8. Registro de Aposta e Resultado

Permite que o usuário registre qual foi sua escolha de aposta, o valor apostado, e se ganhou ou perdeu. Calcula automaticamente o lucro/prejuízo e armazena o resultado no Supabase.

* [ ] Marcar qual foi a escolha feita (ex: "Vitória Mandante")
* [ ] Inserir valor apostado
* [ ] Inserir resultado do jogo (ganhou/perdeu)
* [ ] Calcular lucro/prejuízo baseado na odd e valor
* [ ] Salvar no Supabase

---

## 🛠️ Requisitos Técnicos

### API

* [ ] Utiliza API-Football
* [ ] Endpoints:

  * `/fixtures`
  * `/odds`
  * `/teams/statistics`
  * `/standings`
  * `/fixtures/headtohead`

### Frontend

* [ ] React + TypeScript (Vite ou Next.js)
* [ ] Tailwind CSS ou shadcn/ui

### Backend / Banco de Dados

* [ ] Supabase

  * Autenticação de usuários
  * Tabelas separadas por usuário
  * Proteção por RLS (Row Level Security)
  * Armazenamento de:

    * Jogos do dia (fixtures)
    * Odds
    * Análises feitas
    * Apostas registradas

---

## 📆 Dump Diário (Agendado)

* [ ] Executado diariamente (ex: 04:00)
* [ ] Busca e salva:

  * Partidas do dia
  * Odds
  * Estatísticas dos times
  * Tabela da liga
  * Confrontos diretos
* [ ] Pode ser salvo como `.json` ou no Supabase
* [ ] A aplicação web lê apenas esse dump ao longo do dia

---

## 🎯 Futuro (Opcional)

* [ ] IA para sugerir apostas de valor
* [ ] Gráficos de performance
* [ ] Cálculo de ROI e taxa de acerto
* [ ] Integração com notificações ou Telegram
