import {
  calcProb1X2Improved,
  calcOver25Improved,
  calcBTTSImproved,
  calcValorEsperado,
  recomendarAposta,
} from "../lib/bettingCalculations";

// Função para gerar odds mais realistas baseadas em probabilidades
function generateRealisticOdds(prob: number, margin: number = 0.05): number {
  const adjustedProb = prob + margin;
  const clampedProb = Math.min(0.95, Math.max(0.05, adjustedProb));
  return 1 / clampedProb;
}

function calcExpectedValue(odd: number, prob: number) {
  return odd * prob - 1;
}

console.log("🧮 Testando os novos cálculos...\n");

// Cenário de teste: Flamengo vs Santos
const xgHome = 1.8; // xG esperado do Flamengo em casa
const xgAway = 1.2; // xG esperado do Santos fora

console.log(
  `📊 Cenário: Time Casa (xG: ${xgHome}) vs Time Visitante (xG: ${xgAway})`
);

// 1. Testar probabilidades 1X2 melhoradas
console.log("\n1️⃣ Probabilidades 1X2 (método melhorado):");
const prob1x2 = calcProb1X2Improved(xgHome, xgAway, 0.3);
console.log(`   Vitória Casa: ${(prob1x2.prob1 * 100).toFixed(1)}%`);
console.log(`   Empate: ${(prob1x2.probX * 100).toFixed(1)}%`);
console.log(`   Vitória Visitante: ${(prob1x2.prob2 * 100).toFixed(1)}%`);

// 2. Testar Over 2.5
console.log("\n2️⃣ Over 2.5 Gols (método melhorado):");
const probOver25 = calcOver25Improved(xgHome, xgAway);
console.log(`   Probabilidade Over 2.5: ${(probOver25 * 100).toFixed(1)}%`);

// 3. Testar BTTS
console.log("\n3️⃣ BTTS - Ambos Marcam (método melhorado):");
const probBTTS = calcBTTSImproved(xgHome, xgAway);
console.log(`   Probabilidade BTTS: ${(probBTTS * 100).toFixed(1)}%`);

// 4. Gerar odds realistas
console.log("\n4️⃣ Odds geradas (com margem de 5%):");
const odd1 = generateRealisticOdds(prob1x2.prob1, 0.05);
const oddX = generateRealisticOdds(prob1x2.probX, 0.05);
const odd2 = generateRealisticOdds(prob1x2.prob2, 0.05);
const oddOver25 = generateRealisticOdds(probOver25, 0.05);
const oddBTTS = generateRealisticOdds(probBTTS, 0.05);

console.log(`   Odd Vitória Casa: ${odd1.toFixed(2)}`);
console.log(`   Odd Empate: ${oddX.toFixed(2)}`);
console.log(`   Odd Vitória Visitante: ${odd2.toFixed(2)}`);
console.log(`   Odd Over 2.5: ${oddOver25.toFixed(2)}`);
console.log(`   Odd BTTS: ${oddBTTS.toFixed(2)}`);

// 5. Calcular valores esperados
console.log("\n5️⃣ Valores Esperados:");
const ev1 = calcExpectedValue(odd1, prob1x2.prob1);
const evX = calcExpectedValue(oddX, prob1x2.probX);
const ev2 = calcExpectedValue(odd2, prob1x2.prob2);
const evOver25 = calcExpectedValue(oddOver25, probOver25);
const evBTTS = calcExpectedValue(oddBTTS, probBTTS);

console.log(`   EV Vitória Casa: ${(ev1 * 100).toFixed(2)}%`);
console.log(`   EV Empate: ${(evX * 100).toFixed(2)}%`);
console.log(`   EV Vitória Visitante: ${(ev2 * 100).toFixed(2)}%`);
console.log(`   EV Over 2.5: ${(evOver25 * 100).toFixed(2)}%`);
console.log(`   EV BTTS: ${(evBTTS * 100).toFixed(2)}%`);

// 6. Recomendação
console.log("\n6️⃣ Recomendação:");
const recomendacao = recomendarAposta([
  { mercado: "Vitória Casa", valorEsperado: ev1 },
  { mercado: "Empate", valorEsperado: evX },
  { mercado: "Vitória Visitante", valorEsperado: ev2 },
  { mercado: "Over 2.5", valorEsperado: evOver25 },
  { mercado: "BTTS", valorEsperado: evBTTS },
]);

console.log(`   ${recomendacao}`);

// 7. Teste com cenário mais favorável
console.log("\n" + "=".repeat(50));
console.log("🎯 Teste com cenário mais favorável (odds de mercado):");

// Simular odds de mercado piores (com mais margem)
const oddMercado1 = 2.1; // Mercado oferece 2.10 para vitória casa
const oddMercadoOver25 = 1.85; // Mercado oferece 1.85 para Over 2.5

const evMercado1 = calcExpectedValue(oddMercado1, prob1x2.prob1);
const evMercadoOver25 = calcExpectedValue(oddMercadoOver25, probOver25);

console.log(
  `Odd de mercado Vitória Casa: ${oddMercado1} (EV: ${(
    evMercado1 * 100
  ).toFixed(2)}%)`
);
console.log(
  `Odd de mercado Over 2.5: ${oddMercadoOver25} (EV: ${(
    evMercadoOver25 * 100
  ).toFixed(2)}%)`
);

const recomendacaoMercado = recomendarAposta([
  { mercado: "Vitória Casa", valorEsperado: evMercado1 },
  { mercado: "Over 2.5", valorEsperado: evMercadoOver25 },
]);

console.log(`Recomendação com odds de mercado: ${recomendacaoMercado}`);

console.log("\n✅ Teste concluído!");
