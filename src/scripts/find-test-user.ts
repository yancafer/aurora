import { supabaseAdmin } from "../lib/supabase";

async function findOrCreateTestUser() {
  console.log("👤 Buscando ou criando usuário de teste...\n");

  try {
    // 1. Verificar se já existe algum perfil
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .limit(1);

    if (profilesError) {
      console.error("❌ Erro ao buscar perfis:", profilesError);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log(`✅ Usuário encontrado: ${profiles[0].email}`);
      console.log(`📝 User ID: ${profiles[0].id}`);
      return profiles[0].id;
    }

    // 2. Se não há perfis, criar um usuário de teste
    console.log("📝 Criando usuário de teste...");

    const testUserId = "00000000-0000-0000-0000-000000000001"; // UUID de teste

    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      id: testUserId,
      email: "teste@aurora.com",
      full_name: "Usuário de Teste",
    });

    if (insertError) {
      console.error("❌ Erro ao criar usuário de teste:", insertError);
      return;
    }

    console.log(`✅ Usuário de teste criado: teste@aurora.com`);
    console.log(`📝 User ID: ${testUserId}`);
    return testUserId;
  } catch (error) {
    console.error("❌ Erro geral:", error);
  }
}

findOrCreateTestUser().then((userId) => {
  if (userId) {
    console.log("\n🚀 Para gerar análises de teste, execute:");
    console.log(
      `npx tsx src/scripts/generate-analyses.ts 2025-07-02 ${userId}`
    );
  }
});
