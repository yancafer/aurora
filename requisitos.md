# 📊 Cálculos Probabilísticos com Dados da API-Football

Com os dados coletados diariamente (fixtures + estatísticas dos times), é possível calcular **diversos indicadores probabilísticos** úteis para análises esportivas, apostas ou visualizações.

---

## ✅ 1. Probabilidade de Vitória / Empate (1X2)

### Fórmulas básicas (baseadas em % de resultados passados):

```ts
ProbVitóriaMandante = vitóriasMandante / totalJogosMandante
ProbEmpate = empatesMandante / totalJogosMandante
ProbVitóriaVisitante = vitóriasVisitante / totalJogosVisitante
```

> Use os dados de `statistics.fixtures.wins`, `draws` e `loses` para **casa** e **fora**.

---

## ✅ 2. Probabilidade de Gols (Over/Under)

### Exemplo: Over 2.5 gols
```ts
Over25 = (jogos com +2.5 gols) / totalJogos
```

> Você pode estimar isso a partir da **média de gols feitos + sofridos** por jogo (home/away) e aplicar em uma distribuição Poisson (veja mais abaixo).

---

## ✅ 3. Ambas Marcam (BTTS - Both Teams To Score)

Se os dois times têm:
- Média de gols marcados alta
- Média de gols sofridos alta

...então é provável que **ambos marquem**.

### Estimativa:
```ts
BTTS = ProbTime1Marca * ProbTime2Marca
```

Use as médias de gols **marcados por jogo** (home e away) para estimar essas probabilidades.

---

## ✅ 4. Expectativa de Gols (xG estimado)

### Cálculo:
```ts
expGolsTime = médiaGolsMarcadosTime + médiaGolsSofridosAdversário
```

Por exemplo:
```ts
expGolsMandante = home.avg_goals_for + away.avg_goals_against
```

> Você pode usar esse valor como `λ` (lambda) para o próximo cálculo com Poisson.

---

## ✅ 5. Distribuição de Poisson (probabilidade de placar exato)

### Fórmula da distribuição de Poisson:
```ts
P(k, λ) = (λ^k * e^-λ) / k!
```

- `k` = número de gols
- `λ` = expectativa de gols (expGolsTime)
- `e` = número de Euler (~2.718)

### Exemplo:
Probabilidade de o mandante fazer exatamente 2 gols:
```ts
P(2, expGolsMandante)
```

> Usando isso para **mandante** e **visitante**, você pode estimar as **probabilidades de placares exatos** (como 1x0, 2x1, etc).

---

## ✅ 6. Análise Head-to-Head (H2H)

Se você tiver confrontos diretos anteriores entre os dois times, pode calcular:
- Taxa de vitórias do mandante
- Taxa de empates
- Média de gols no confronto

> Exemplo:
```ts
ProbVitóriaMandante_H2H = vitóriasMandanteH2H / totalConfrontos
```

---

## ✅ 7. Cruzamento com Odds (Valuation)

Compare a **probabilidade estimada** com a **odds da casa de aposta** para encontrar apostas de valor:

```ts
ValorEsperado = (ProbabilidadeEstimada * Odd) - (1 - ProbabilidadeEstimada)
```

> Se `ValorEsperado > 0`, pode indicar uma aposta de valor positivo (value bet).

---

## 🛠️ Fontes dos Dados na API-Football

| Informação                     | Origem no JSON                          |
|--------------------------------|------------------------------------------|
| Jogos do dia                   | `fixtures`                              |
| Estatísticas por time          | `teams/statistics`                      |
| Média de gols marcados         | `goals.for.average.home/away`          |
| Média de gols sofridos         | `goals.against.average.home/away`      |
| Jogos vencidos / empatados     | `fixtures.wins.home/away`, etc         |
| Placar por tempo               | `goals.for.minute`                     |
| Odds (opcional)                | `odds.response.bookmakers.markets`     |
| Confronto direto (opcional)    | `headtohead`                            |

---

## 🧠 Dicas

- Normalize os dados por temporada e por tipo de mando (casa/fora)
- Use `Poisson` para prever placares exatos e total de gols
- Use `xG` estimado para gerar heatmaps ou alertas de apostas
- Armazene os dados no Supabase para uso em dashboards e análises futuras
