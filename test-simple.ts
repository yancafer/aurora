import { supabase } from "@/lib/supabase";

async function testBetHistory() {
  console.log("🧪 Testando sistema de apostas...");

  try {
    // Teste simples de inserção
    const testBet = {
      user_id: "00000000-0000-0000-0000-000000000000",
      home_team: "Flamengo",
      away_team: "Palmeiras",
      market: "Vitória da Casa",
      odd_value: 2.3,
      bet_amount: 50.0,
      potential_return: 115.0,
      status: "pending",
      notes: "Aposta de teste",
      fixture_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("bet_history")
      .insert([testBet])
      .select();

    if (error) {
      console.error("❌ Erro:", error);
      return false;
    }

    console.log("✅ Aposta inserida:", data);

    // Limpar teste
    if (data && data[0]) {
      await supabase.from("bet_history").delete().eq("id", data[0].id);
      console.log("✅ Teste limpo");
    }

    console.log("🎉 Sistema de apostas funcionando!");
    return true;
  } catch (error) {
    console.error("❌ Erro geral:", error);
    return false;
  }
}

testBetHistory();
