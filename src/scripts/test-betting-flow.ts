import { supabase } from "@/lib/supabase";

async function testBettingFlow() {
  console.log("🧪 Iniciando teste do fluxo de apostas...");

  try {
    // 1. Verificar se as tabelas existem
    console.log("📋 Verificando tabelas...");

    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    const tableNames = tables?.map((t) => t.table_name) || [];
    console.log("✅ Tabelas encontradas:", tableNames);

    // 2. Verificar tabela bet_history
    const hasBetHistory = tableNames.includes("bet_history");
    console.log(
      hasBetHistory
        ? "✅ Tabela bet_history existe"
        : "❌ Tabela bet_history não encontrada"
    );

    if (!hasBetHistory) {
      console.error("❌ Teste falhou: tabela bet_history não existe");
      return;
    }

    // 3. Testar inserção de aposta de exemplo
    console.log("📝 Testando inserção de aposta...");

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log(
        "ℹ️ Usuário não autenticado, criando aposta de teste sem user_id"
      );
    }

    // Criar um user_id de teste se não houver usuário autenticado
    const testUserId = user.user?.id || "00000000-0000-0000-0000-000000000000";

    const testBet = {
      user_id: testUserId,
      home_team: "Flamengo",
      away_team: "Corinthians",
      market: "Vitória da Casa",
      odd_value: 2.1,
      bet_amount: 50.0,
      potential_return: 105.0,
      status: "pending",
      notes: "Aposta de teste - Sistema Aurora",
      fixture_date: new Date().toISOString(),
    };

    console.log("📊 Dados da aposta de teste:", testBet);

    const { data: insertResult, error: insertError } = await supabase
      .from("bet_history")
      .insert([testBet])
      .select();

    if (insertError) {
      console.error("❌ Erro ao inserir aposta:", insertError);
      return;
    }

    console.log("✅ Aposta inserida com sucesso:", insertResult);

    // 4. Testar consulta de apostas
    console.log("🔍 Testando consulta de apostas...");

    const { data: bets, error: selectError } = await supabase
      .from("bet_history")
      .select("*")
      .eq("user_id", testUserId);

    if (selectError) {
      console.error("❌ Erro ao consultar apostas:", selectError);
      return;
    }

    console.log("✅ Apostas encontradas:", bets?.length || 0);

    // 5. Testar atualização de resultado
    if (insertResult && insertResult[0]) {
      console.log("🔄 Testando atualização de resultado...");

      const { data: updateResult, error: updateError } = await supabase
        .from("bet_history")
        .update({
          actual_result: "win",
          status: "settled",
          settled_at: new Date().toISOString(),
        })
        .eq("id", insertResult[0].id)
        .select();

      if (updateError) {
        console.error("❌ Erro ao atualizar aposta:", updateError);
        return;
      }

      console.log("✅ Aposta atualizada com sucesso:", updateResult);
    }

    // 6. Testar limpeza (opcional)
    if (insertResult && insertResult[0]) {
      console.log("🧹 Limpando dados de teste...");

      const { error: deleteError } = await supabase
        .from("bet_history")
        .delete()
        .eq("id", insertResult[0].id);

      if (deleteError) {
        console.error("❌ Erro ao limpar dados de teste:", deleteError);
      } else {
        console.log("✅ Dados de teste limpos");
      }
    }

    console.log("🎉 Teste do fluxo de apostas concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro geral no teste:", error);
  }
}

// Executar teste se for chamado diretamente
if (typeof window === "undefined") {
  testBettingFlow();
}

export { testBettingFlow };
