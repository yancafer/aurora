## 🗂️ Objetivo: Criar um dump diário de dados da API-Football

### ✅ Finalidade

Coletar e armazenar diariamente os dados de partidas do dia atual da API-Football com um limite de 100 requisições por dia, para uso em análises probabilísticas e previsões de apostas.

---

### ✅ Estratégia de uso das requisições

| Etapa                       | Endpoint                              | Requisições estimadas  |
| --------------------------- | ------------------------------------- | ---------------------- |
| 1. Obter jogos do dia       | `/fixtures?date=YYYY-MM-DD`           | 1                      |
| 2. Estatísticas de times    | `/teams/statistics?team=ID&league=ID` | 2 por jogo (home/away) |
| 3. (Opcional) Odds do jogo  | `/odds?fixture=ID`                    | +1 por jogo            |
| 4. (Opcional) H2H confronto | `/fixtures/headtohead?h2h=ID1-ID2`    | +1 por jogo            |

➡️ Com isso, é possível cobrir cerca de **25 jogos por dia com 2 times cada** (≈50 chamadas), e ainda usar as restantes para odds ou H2H se quiser.

---

### ✅ Estrutura recomendada do dump por jogo

```json
{
  "fixture": {
    "id": 123456,
    "date": "2025-07-06",
    "league": "Liga Pro",
    "teams": {
      "home": "Independiente del Valle",
      "away": "Barcelona SC"
    }
  },
  "teamStats": {
    "home": {
      "teamId": 1153,
      "avg_goals_for": 1.8,
      "avg_goals_against": 1.0,
      "win_rate": 60,
      "draw_rate": 25,
      "loss_rate": 15
    },
    "away": {
      "teamId": 1152,
      "avg_goals_for": 1.2,
      "avg_goals_against": 1.5,
      "win_rate": 40,
      "draw_rate": 35,
      "loss_rate": 25
    }
  },
  "odds": {
    "home": 1.85,
    "draw": 3.2,
    "away": 4.1
  },
  "headToHead": {
    "homeWins": 3,
    "awayWins": 2,
    "draws": 5
  }
}
```
