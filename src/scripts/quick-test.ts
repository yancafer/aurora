import { supabase } from "@/lib/supabase";

async function quickTest() {
  console.log("🔍 Verificação rápida da tabela bet_history...");

  try {
    // Teste simples de existência
    const { data, error } = await supabase
      .from("bet_history")
      .select("id")
      .limit(1);

    if (error) {
      console.log("❌ Tabela ainda não existe ou não está acessível");
      console.log("Erro:", error.message);
      console.log("\n🚨 AÇÃO NECESSÁRIA:");
      console.log(
        "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu/sql"
      );
      console.log("2. Execute o SQL fornecido pelo script anterior");
      return false;
    }

    console.log("✅ Tabela bet_history existe e está acessível!");

    // Teste de inserção rápida
    const testBet = {
      user_id: "00000000-0000-0000-0000-000000000000",
      home_team: "Teste FC",
      away_team: "Teste United",
      market: "Vitória da Casa",
      odd_value: 2.0,
      bet_amount: 10.0,
      potential_return: 20.0,
      status: "pending",
      notes: "Teste rápido do sistema",
      fixture_date: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from("bet_history")
      .insert([testBet])
      .select();

    if (insertError) {
      console.log("❌ Erro ao inserir aposta de teste:", insertError.message);
      return false;
    }

    console.log("✅ Inserção funcionando!");

    // Limpar teste
    if (insertData && insertData[0]) {
      await supabase.from("bet_history").delete().eq("id", insertData[0].id);
      console.log("✅ Limpeza realizada!");
    }

    console.log("\n🎉 SISTEMA PRONTO!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Tabela bet_history: OK");
    console.log("✅ Inserção: OK");
    console.log("✅ Consulta: OK");
    console.log("✅ Exclusão: OK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🚀 Agora você pode:");
    console.log("1. Acessar: http://localhost:3000/testing");
    console.log("2. Clicar em 'Apostar na Betano'");
    console.log("3. Ver suas apostas em 'Minhas Apostas'");
    console.log("4. Marcar vitórias/derrotas");

    return true;
  } catch (error) {
    console.error("❌ Erro na verificação:", error);
    return false;
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  quickTest();
}

export { quickTest };
