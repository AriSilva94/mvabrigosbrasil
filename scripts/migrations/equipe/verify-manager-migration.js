/**
 * Script de validação: Verificar migração de gerentes
 *
 * Verifica se usuários com tipo_cadastro='gerente' foram migrados corretamente:
 * - Auth user criado com teamOnly=false
 * - Profile criado com is_team_only=false
 * - Vínculos em team_memberships com role='manager' para todos os abrigos
 *
 * Uso:
 *   node verify-manager-migration.js [email]
 *   node verify-manager-migration.js institutopremierpet@premierpet.com.br
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const [key, ...valueParts] = trimmed.split("=");
  const value = valueParts.join("=").trim();
  if (key && value) process.env[key] = value;
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erro: variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias (.env.local)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const emailArg = process.argv[2];

async function findManagersInLegacy() {
  console.log("\n🔍 Buscando gerentes no banco legado (wp_usermeta_raw)...\n");

  const { data: tipoCadastroData, error: tipoCadastroError } = await supabase
    .from("wp_usermeta_raw")
    .select("user_id, meta_value")
    .eq("meta_key", "tipo_cadastro");

  if (tipoCadastroError) {
    throw new Error(`Erro ao buscar tipo_cadastro: ${tipoCadastroError.message}`);
  }

  const managerUserIds = [];
  (tipoCadastroData || []).forEach(row => {
    if (row.meta_value?.toLowerCase() === 'gerente') {
      managerUserIds.push(row.user_id);
    }
  });

  console.log(`✅ Encontrados ${managerUserIds.length} usuários com tipo_cadastro='gerente'`);

  // Buscar dados dos usuários
  const { data: wpUsers, error: wpUsersError } = await supabase
    .from("wp_users_raw")
    .select("id, user_email, display_name")
    .in("id", managerUserIds);

  if (wpUsersError) {
    throw new Error(`Erro ao buscar wp_users: ${wpUsersError.message}`);
  }

  console.log("\nGerentes encontrados:");
  (wpUsers || []).forEach(user => {
    console.log(`   - ${user.user_email} (wp_user_id=${user.id}, nome=${user.display_name || 'N/A'})`);
  });

  return wpUsers || [];
}

async function verifyManager(email) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🔍 VERIFICANDO GERENTE: ${email}`);
  console.log("=".repeat(80));

  let hasErrors = false;

  // 1. Buscar wp_user_id do legado
  const { data: wpUser, error: wpUserError } = await supabase
    .from("wp_users_raw")
    .select("id, user_email, display_name")
    .eq("user_email", email)
    .maybeSingle();

  if (wpUserError || !wpUser) {
    console.log(`\n❌ ERRO: Usuário ${email} não encontrado em wp_users_raw`);
    return false;
  }

  const wpUserId = wpUser.id;
  console.log(`\n✅ Usuário encontrado no legado: wp_user_id=${wpUserId}, nome=${wpUser.display_name || 'N/A'}`);

  // 2. Verificar tipo_cadastro
  const { data: tipoCadastro, error: tipoCadastroError } = await supabase
    .from("wp_usermeta_raw")
    .select("meta_value")
    .eq("user_id", wpUserId)
    .eq("meta_key", "tipo_cadastro")
    .maybeSingle();

  if (tipoCadastroError || !tipoCadastro) {
    console.log(`\n⚠️  AVISO: tipo_cadastro não encontrado para wp_user_id=${wpUserId}`);
  } else if (tipoCadastro.meta_value?.toLowerCase() === 'gerente') {
    console.log(`✅ tipo_cadastro='gerente' confirmado`);
  } else {
    console.log(`\n❌ ERRO: tipo_cadastro='${tipoCadastro.meta_value}' (esperado 'gerente')`);
    hasErrors = true;
  }

  // 3. Buscar id_abrigo (pode ter múltiplos IDs separados por vírgula)
  const { data: idAbrigoData, error: idAbrigoError } = await supabase
    .from("wp_usermeta_raw")
    .select("meta_value")
    .eq("user_id", wpUserId)
    .in("meta_key", ["id_abrigo", "_id_abrigo"]);

  let expectedAbrigoIds = [];
  if (!idAbrigoError && idAbrigoData && idAbrigoData.length > 0) {
    const idAbrigoValue = idAbrigoData.find(row => row.meta_value)?.meta_value || "";

    // Explodir vírgulas
    if (idAbrigoValue.includes(",")) {
      expectedAbrigoIds = idAbrigoValue.split(",").map(id => id.trim()).filter(id => /^\d+$/.test(id)).map(id => parseInt(id, 10));
    } else if (/^\d+$/.test(idAbrigoValue.trim())) {
      expectedAbrigoIds = [parseInt(idAbrigoValue.trim(), 10)];
    }
  }

  console.log(`\nAbrigos esperados (do legado): ${expectedAbrigoIds.length} abrigos`);
  if (expectedAbrigoIds.length > 0) {
    // Buscar nomes dos abrigos
    const { data: sheltersData } = await supabase
      .from("wp_posts_raw")
      .select("id, post_title")
      .in("id", expectedAbrigoIds);

    const sheltersMap = new Map((sheltersData || []).map(s => [s.id, s.post_title]));
    expectedAbrigoIds.forEach(id => {
      console.log(`   - ${id}: ${sheltersMap.get(id) || 'N/A'}`);
    });
  }

  // 4. Verificar auth user
  console.log(`\n📋 Verificando auth user...`);

  let authUser = null;
  let page = 1;
  let found = false;

  while (!found) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      console.log(`\n❌ ERRO ao buscar auth users: ${error.message}`);
      hasErrors = true;
      break;
    }

    authUser = (data.users || []).find(u => u.email === email);
    if (authUser) {
      found = true;
    } else if ((data.users || []).length < 1000) {
      break;
    }
    page++;
  }

  if (!authUser) {
    console.log(`\n❌ ERRO: Auth user não encontrado para ${email}`);
    hasErrors = true;
    return !hasErrors;
  }

  console.log(`✅ Auth user encontrado: ${authUser.id}`);

  const metadata = authUser.user_metadata || {};
  console.log(`\nMetadata:`);
  console.log(`   - registerType: ${metadata.registerType || 'N/A'}`);
  console.log(`   - teamOnly: ${metadata.teamOnly !== undefined ? metadata.teamOnly : 'N/A'}`);
  console.log(`   - teamDisabled: ${metadata.teamDisabled !== undefined ? metadata.teamDisabled : 'N/A'}`);
  console.log(`   - creator_profile_id: ${metadata.creator_profile_id || 'N/A'}`);
  console.log(`   - legacyMigrated: ${metadata.legacyMigrated !== undefined ? metadata.legacyMigrated : 'N/A'}`);

  // Validar metadata
  if (metadata.teamOnly !== false) {
    console.log(`\n❌ ERRO: teamOnly deveria ser false, mas é ${metadata.teamOnly}`);
    hasErrors = true;
  } else {
    console.log(`✅ teamOnly=false (correto para gerente)`);
  }

  if (metadata.registerType !== 'gerente') {
    console.log(`\n❌ ERRO: registerType deveria ser 'gerente', mas é '${metadata.registerType}'`);
    hasErrors = true;
  } else {
    console.log(`✅ registerType='gerente' (correto)`);
  }

  // 5. Verificar profile
  console.log(`\n📋 Verificando profile...`);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, wp_user_id, is_team_only, origin")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.log(`\n❌ ERRO: Profile não encontrado para auth user ${authUser.id}`);
    hasErrors = true;
  } else {
    console.log(`✅ Profile encontrado:`);
    console.log(`   - id: ${profile.id}`);
    console.log(`   - email: ${profile.email}`);
    console.log(`   - wp_user_id: ${profile.wp_user_id}`);
    console.log(`   - is_team_only: ${profile.is_team_only}`);
    console.log(`   - origin: ${profile.origin}`);

    if (profile.wp_user_id !== wpUserId) {
      console.log(`\n❌ ERRO: wp_user_id no profile (${profile.wp_user_id}) diferente do esperado (${wpUserId})`);
      hasErrors = true;
    } else {
      console.log(`✅ wp_user_id correto`);
    }

    if (profile.is_team_only !== false) {
      console.log(`\n❌ ERRO: is_team_only deveria ser false, mas é ${profile.is_team_only}`);
      hasErrors = true;
    } else {
      console.log(`✅ is_team_only=false (correto para gerente)`);
    }
  }

  // 6. Verificar vínculos em team_memberships
  console.log(`\n📋 Verificando vínculos em team_memberships...`);

  const { data: memberships, error: membershipsError } = await supabase
    .from("team_memberships")
    .select("id, abrigo_post_id, role, status, owner_wp_user_id, member_wp_user_id")
    .eq("member_wp_user_id", wpUserId);

  if (membershipsError) {
    console.log(`\n❌ ERRO ao buscar team_memberships: ${membershipsError.message}`);
    hasErrors = true;
  } else if (!memberships || memberships.length === 0) {
    console.log(`\n❌ ERRO: Nenhum vínculo encontrado em team_memberships`);
    hasErrors = true;
  } else {
    console.log(`\n✅ Encontrados ${memberships.length} vínculos`);

    const foundAbrigoIds = memberships.map(m => m.abrigo_post_id);

    // Buscar nomes dos abrigos
    const { data: sheltersData } = await supabase
      .from("shelters")
      .select("wp_post_id, name")
      .in("wp_post_id", foundAbrigoIds);

    const sheltersMap = new Map((sheltersData || []).map(s => [s.wp_post_id, s.name]));

    memberships.forEach(m => {
      const shelterName = sheltersMap.get(m.abrigo_post_id) || 'N/A';
      console.log(`\n   Vínculo ${m.id}:`);
      console.log(`      - abrigo_post_id: ${m.abrigo_post_id} (${shelterName})`);
      console.log(`      - role: ${m.role}`);
      console.log(`      - status: ${m.status}`);
      console.log(`      - owner_wp_user_id: ${m.owner_wp_user_id}`);
      console.log(`      - member_wp_user_id: ${m.member_wp_user_id}`);

      if (m.role !== 'manager') {
        console.log(`      ⚠️  AVISO: role deveria ser 'manager', mas é '${m.role}'`);
      }

      if (m.status !== 'active') {
        console.log(`      ⚠️  AVISO: status deveria ser 'active', mas é '${m.status}'`);
      }
    });

    // Comparar com abrigos esperados
    const missingAbrigos = expectedAbrigoIds.filter(id => !foundAbrigoIds.includes(id));
    const extraAbrigos = foundAbrigoIds.filter(id => !expectedAbrigoIds.includes(id));

    if (missingAbrigos.length > 0) {
      console.log(`\n❌ ERRO: Abrigos esperados mas não encontrados: ${missingAbrigos.join(', ')}`);
      hasErrors = true;
    }

    if (extraAbrigos.length > 0) {
      console.log(`\n⚠️  AVISO: Abrigos encontrados mas não esperados: ${extraAbrigos.join(', ')}`);
    }

    if (missingAbrigos.length === 0 && extraAbrigos.length === 0) {
      console.log(`\n✅ Todos os ${expectedAbrigoIds.length} abrigos esperados têm vínculos corretos`);
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  if (hasErrors) {
    console.log(`❌ VALIDAÇÃO FALHOU - Foram encontrados erros`);
  } else {
    console.log(`✅ VALIDAÇÃO PASSOU - Gerente migrado corretamente`);
  }
  console.log("=".repeat(80) + "\n");

  return !hasErrors;
}

async function main() {
  console.log("\n== Validação de Migração de Gerentes ==\n");

  if (emailArg) {
    // Verificar um gerente específico
    await verifyManager(emailArg);
  } else {
    // Verificar todos os gerentes
    const managers = await findManagersInLegacy();

    if (managers.length === 0) {
      console.log("\n⚠️  Nenhum gerente encontrado no banco legado");
      return;
    }

    console.log(`\n📋 Verificando ${managers.length} gerentes...\n`);

    let passed = 0;
    let failed = 0;

    for (const manager of managers) {
      const result = await verifyManager(manager.user_email);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`   ✅ Passaram: ${passed}`);
    console.log(`   ❌ Falharam: ${failed}`);
    console.log(`   Total: ${managers.length}`);
    console.log("\n" + "=".repeat(80) + "\n");
  }
}

main().catch((err) => {
  console.error("❌ Erro na validação:", err.message);
  console.error(err.stack);
  process.exit(1);
});
