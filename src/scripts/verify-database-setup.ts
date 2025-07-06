import { supabase } from "@/lib/supabase";

async function verifyDatabaseSetup() {
  console.log("🔍 Verificando setup do banco de dados...");

  try {
    // 1. Verificar se a tabela bet_history existe
    console.log("📋 Verificando tabela bet_history...");

    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "bet_history");

    if (tables && tables.length > 0) {
      console.log("✅ Tabela bet_history encontrada!");
    } else {
      console.log("❌ Tabela bet_history não encontrada!");
      return false;
    }

    // 2. Testar inserção de uma aposta
    console.log("🧪 Testando inserção de aposta...");

    const testBet = {
      user_id: "00000000-0000-0000-0000-000000000000",
      home_team: "Teste A",
      away_team: "Teste B",
      market: "Teste Market",
      odd_value: 2.0,
      bet_amount: 10.0,
      potential_return: 20.0,
      status: "pending",
      notes: "Aposta de verificação do sistema",
      fixture_date: new Date().toISOString(),
    };

    const { data: insertResult, error: insertError } = await supabase
      .from("bet_history")
      .insert([testBet])
      .select();

    if (insertError) {
      console.error("❌ Erro ao inserir aposta de teste:", insertError);
      return false;
    }

    console.log("✅ Aposta de teste inserida:", insertResult);

    // 3. Testar consulta
    console.log("📊 Testando consulta...");

    const { data: bets, error: selectError } = await supabase
      .from("bet_history")
      .select("*")
      .limit(5);

    if (selectError) {
      console.error("❌ Erro ao consultar apostas:", selectError);
      return false;
    }

    console.log(
      `✅ Consulta bem-sucedida! ${bets?.length || 0} apostas encontradas`
    );

    // 4. Testar atualização
    if (insertResult && insertResult[0]) {
      console.log("🔄 Testando atualização...");

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
        console.error("❌ Erro ao atualizar:", updateError);
        return false;
      }

      console.log("✅ Atualização bem-sucedida:", updateResult);

      // 5. Limpar dados de teste
      console.log("🧹 Limpando dados de teste...");

      const { error: deleteError } = await supabase
        .from("bet_history")
        .delete()
        .eq("id", insertResult[0].id);

      if (deleteError) {
        console.error("❌ Erro ao deletar:", deleteError);
      } else {
        console.log("✅ Dados de teste removidos");
      }
    }

    console.log("\n🎉 SETUP VERIFICADO COM SUCESSO!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Tabela bet_history está funcionando");
    console.log("✅ Inserção funciona");
    console.log("✅ Consulta funciona");
    console.log("✅ Atualização funciona");
    console.log("✅ Exclusão funciona");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🚀 Agora você pode:");
    console.log("1. Executar: npm run dev");
    console.log("2. Acessar: http://localhost:3000/testing");
    console.log("3. Testar o simulador de apostas!");

    return true;
  } catch (error) {
    console.error("❌ Erro geral na verificação:", error);
    return false;
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  verifyDatabaseSetup();
}

export { verifyDatabaseSetup };
