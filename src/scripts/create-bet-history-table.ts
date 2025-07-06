import { supabase } from "@/lib/supabase";

async function createBetHistoryTable() {
  console.log("🛠️ Criando tabela bet_history...");

  try {
    // SQL para criar a tabela bet_history
    const createTableSQL = `
      -- Migration para criar tabela de histórico de apostas
      CREATE TABLE IF NOT EXISTS bet_history (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          analysis_id BIGINT,
          home_team TEXT NOT NULL,
          away_team TEXT NOT NULL,
          market TEXT NOT NULL,
          odd_value DECIMAL(10,2) NOT NULL,
          expected_value DECIMAL(10,4),
          estimated_probability DECIMAL(10,4),
          fixture_date TIMESTAMP,
          bet_amount DECIMAL(10,2) DEFAULT 0,
          potential_return DECIMAL(10,2),
          actual_result TEXT, -- 'win', 'loss', 'void', 'half_win', 'half_loss'
          status TEXT DEFAULT 'pending', -- 'pending', 'settled', 'cancelled'
          notes TEXT,
          bet_placed_at TIMESTAMP DEFAULT NOW(),
          settled_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (createError) {
      console.error("❌ Erro ao criar tabela:", createError);

      // Tentar método alternativo via query direto
      console.log("🔄 Tentando método alternativo...");

      const { error: altError } = await supabase
        .from("bet_history")
        .select("id")
        .limit(1);

      if (altError && altError.code === "42P01") {
        console.log(
          "📋 Tabela realmente não existe, vamos criá-la usando service role..."
        );

        // Usar service role para criar tabela
        const serviceSupabase = supabase;

        const createSQL = `
          CREATE TABLE IF NOT EXISTS public.bet_history (
              id BIGSERIAL PRIMARY KEY,
              user_id UUID NOT NULL,
              analysis_id BIGINT,
              home_team TEXT NOT NULL,
              away_team TEXT NOT NULL,
              market TEXT NOT NULL,
              odd_value DECIMAL(10,2) NOT NULL,
              expected_value DECIMAL(10,4),
              estimated_probability DECIMAL(10,4),
              fixture_date TIMESTAMP,
              bet_amount DECIMAL(10,2) DEFAULT 0,
              potential_return DECIMAL(10,2),
              actual_result TEXT,
              status TEXT DEFAULT 'pending',
              notes TEXT,
              bet_placed_at TIMESTAMP DEFAULT NOW(),
              settled_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
          );
        `;

        console.log("🔧 Executando SQL de criação...");
        console.log(
          "⚠️ ATENÇÃO: Execute este SQL manualmente no Supabase Studio:"
        );
        console.log("---");
        console.log(createSQL);
        console.log("---");

        // Tentar criar índices se a tabela existir
        console.log("📊 Criando índices...");
        const indexSQL = `
          CREATE INDEX IF NOT EXISTS idx_bet_history_user_id ON public.bet_history(user_id);
          CREATE INDEX IF NOT EXISTS idx_bet_history_status ON public.bet_history(status);
          CREATE INDEX IF NOT EXISTS idx_bet_history_fixture_date ON public.bet_history(fixture_date);
        `;

        console.log("📋 SQL para índices:");
        console.log(indexSQL);

        // Configurar RLS
        const rlsSQL = `
          ALTER TABLE public.bet_history ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Users can view own bet history" ON public.bet_history
              FOR SELECT USING (auth.uid() = user_id);
              
          CREATE POLICY IF NOT EXISTS "Users can insert own bet history" ON public.bet_history
              FOR INSERT WITH CHECK (auth.uid() = user_id);
              
          CREATE POLICY IF NOT EXISTS "Users can update own bet history" ON public.bet_history
              FOR UPDATE USING (auth.uid() = user_id);
              
          CREATE POLICY IF NOT EXISTS "Users can delete own bet history" ON public.bet_history
              FOR DELETE USING (auth.uid() = user_id);
        `;

        console.log("🔒 SQL para RLS:");
        console.log(rlsSQL);

        return;
      } else {
        console.log("✅ Tabela bet_history já existe!");
      }
    } else {
      console.log("✅ Tabela bet_history criada com sucesso!");
    }

    // Verificar se a tabela foi criada
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "bet_history");

    if (tables && tables.length > 0) {
      console.log("✅ Tabela bet_history confirmada no banco!");
    } else {
      console.log("❌ Tabela bet_history não foi encontrada após criação");
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

// Executar se chamado diretamente
if (typeof window === "undefined") {
  createBetHistoryTable();
}

export { createBetHistoryTable };
