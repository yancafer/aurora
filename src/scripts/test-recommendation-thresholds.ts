import { recomendarAposta } from "../lib/bettingCalculations";

console.log("🧪 Testando diferentes limiares de recomendação de apostas...\n");

// Cenários de teste
const cenarios = [
  { ev: 0.05, desc: "EV positivo baixo" },
  { ev: -0.01, desc: "EV levemente negativo" },
  { ev: -0.03, desc: "EV negativo moderado" },
  { ev: -0.05, desc: "EV negativo alto" },
  { ev: -0.08, desc: "EV negativo limítrofe" },
  { ev: -0.12, desc: "EV negativo alto demais" },
  { ev: 0.1, desc: "EV positivo bom" },
  { ev: 0.15, desc: "EV positivo ótimo" },
];

cenarios.forEach(({ ev, desc }) => {
  // Criar valores de teste para diferentes mercados
  const valores = [
    { mercado: "1X2 - Vitória Mandante", valorEsperado: ev },
    { mercado: "Over 2.5 Gols", valorEsperado: ev - 0.02 },
    { mercado: "BTTS", valorEsperado: ev - 0.01 },
  ];

  const recomendacao = recomendarAposta(valores);
  console.log(`📊 ${desc}:`);
  console.log(`   EV: ${(ev * 100).toFixed(2)}%`);
  console.log(`   🎯 Recomendação: ${recomendacao}`);
  console.log("");
});

console.log("💡 Critério atual de recomendação:");
console.log("   - EV > -10% (aceita até -10% de valor esperado)");
console.log("   - Prioriza sempre o melhor EV disponível");
console.log("   - Recomenda fortemente se EV > +2%");
console.log("   - Considera se EV > 0%");
console.log("   - Sugere mesmo com EV negativo até -10%");
