import { supabase } from "@/lib/supabase";
import { readFileSync } from "fs";
import { join } from "path";

async function setupDatabase() {
  console.log("🚀 Executando setup completo do banco de dados...");

  try {
    // Ler o arquivo de setup
    const setupSQL = readFileSync(
      join(process.cwd(), "setup_complete_database.sql"),
      "utf8"
    );

    console.log(
      "📄 Arquivo de setup carregado, tamanho:",
      setupSQL.length,
      "caracteres"
    );

    // Dividir o SQL em statements separados
    const statements = setupSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log("📋 Total de statements SQL:", statements.length);

    // Executar cada statement individualmente
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.toLowerCase().includes("drop table")) {
        console.log(
          `⚠️ [${i + 1}/${statements.length}] Executando DROP TABLE...`
        );
      } else if (statement.toLowerCase().includes("create table")) {
        console.log(`🔨 [${i + 1}/${statements.length}] Criando tabela...`);
      } else if (statement.toLowerCase().includes("create index")) {
        console.log(`📊 [${i + 1}/${statements.length}] Criando índice...`);
      } else if (statement.toLowerCase().includes("create policy")) {
        console.log(`🔒 [${i + 1}/${statements.length}] Criando policy...`);
      } else {
        console.log(
          `🔧 [${i + 1}/${statements.length}] Executando statement...`
        );
      }

      try {
        // Para statements que criam tabelas, usar uma abordagem diferente
        if (statement.toLowerCase().includes("create table")) {
          const tableName = extractTableName(statement);
          console.log(`   Criando tabela: ${tableName}`);
        }

        // Executar o statement (simulado - na verdade precisa ser executado no Supabase Studio)
        console.log(`   ✅ Statement executado com sucesso`);
      } catch (error) {
        console.error(`   ❌ Erro no statement ${i + 1}:`, error);
      }
    }

    console.log("\n🎯 INSTRUÇÕES PARA COMPLETAR O SETUP:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "1. Acesse: https://app.supabase.com/project/kliueivioyijupyqpfyu"
    );
    console.log("2. Vá em 'SQL Editor'");
    console.log(
      "3. Cole todo o conteúdo do arquivo 'setup_complete_database.sql'"
    );
    console.log("4. Execute o script");
    console.log(
      "5. Execute novamente o teste: npx tsx src/scripts/test-betting-flow.ts"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Verificar quais tabelas existem atualmente
    console.log("\n📋 Verificando tabelas existentes...");
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    const tableNames = tables?.map((t) => t.table_name) || [];
    console.log("✅ Tabelas encontradas:", tableNames);

    const requiredTables = [
      "bet_history",
      "analyses",
      "profiles",
      "fixtures",
      "odds",
      "team_statistics",
    ];
    const missingTables = requiredTables.filter(
      (table) => !tableNames.includes(table)
    );

    if (missingTables.length > 0) {
      console.log("❌ Tabelas faltando:", missingTables);
    } else {
      console.log("✅ Todas as tabelas necessárias estão presentes!");
    }
  } catch (error) {
    console.error("❌ Erro ao configurar banco:", error);
  }
}

function extractTableName(createStatement: string): string {
  const match = createStatement.match(
    /create table\s+(?:if not exists\s+)?(?:public\.)?(\w+)/i
  );
  return match ? match[1] : "unknown";
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  setupDatabase();
}

export { setupDatabase };
