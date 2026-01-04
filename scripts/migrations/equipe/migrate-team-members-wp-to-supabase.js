/**
 * Migração de integrantes de equipe (WordPress -> Supabase)
 *
 * Lê vínculos em wp_usermeta_raw (meta_key id_abrigo/_id_abrigo),
 * resolve dono (post_author do abrigo) e integrante (user_id do meta),
 * cria/atualiza usuários/auth/profiles com metadata de equipe e
 * registra em team_memberships.
 *
 * Uso:
 *   node migrate-team-members-wp-to-supabase.js [--dry-run]
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
const isDryRun = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erro: variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias (.env.local)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function log(msg) {
  console.log(msg);
}

function genPassword() {
  return crypto.randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

async function fetchMetas() {
  const { data, error } = await supabase
    .from("wp_usermeta_raw")
    .select("user_id, meta_key, meta_value")
    .in("meta_key", ["id_abrigo", "_id_abrigo"]);

  if (error) throw new Error(`Erro ao ler wp_usermeta_raw: ${error.message}`);
  return data || [];
}

async function fetchTipoCadastro() {
  const { data, error } = await supabase
    .from("wp_usermeta_raw")
    .select("user_id, meta_value")
    .eq("meta_key", "tipo_cadastro");

  if (error) throw new Error(`Erro ao ler tipo_cadastro: ${error.message}`);

  // Criar um Map de user_id -> tipo_cadastro
  const tipoCadastroMap = new Map();
  (data || []).forEach(row => {
    if (row.meta_value) {
      tipoCadastroMap.set(row.user_id, row.meta_value);
    }
  });

  return tipoCadastroMap;
}

async function fetchPosts(ids) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("wp_posts_raw")
    .select("id, post_author, post_title")
    .in("id", ids);
  if (error) throw new Error(`Erro ao ler wp_posts_raw: ${error.message}`);
  return data || [];
}

async function fetchUsers(ids) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("wp_users_raw")
    .select("id, user_email, display_name")
    .in("id", ids);
  if (error) throw new Error(`Erro ao ler wp_users_raw: ${error.message}`);
  return data || [];
}

async function getProfileIdByWpUserId(ownerWpUserId, cache) {
  if (cache.has(ownerWpUserId)) return cache.get(ownerWpUserId);
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("wp_user_id", ownerWpUserId)
    .maybeSingle();
  if (error) {
    console.error("   ⚠️ erro ao buscar profile do owner", ownerWpUserId, error.message);
    cache.set(ownerWpUserId, null);
    return null;
  }
  const id = data?.id ?? null;
  cache.set(ownerWpUserId, id);
  return id;
}

async function loadAllAuthUsersIntoCache(cache) {
  log("📋 Carregando todos os usuários auth no cache...");

  try {
    let allUsers = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) {
        console.error("   ⚠️ erro ao listar auth users (página " + page + "):", error.message);
        break;
      }

      allUsers = allUsers.concat(data.users || []);
      hasMore = (data.users || []).length === 1000;
      page++;
    }

    // Armazenar no cache por email
    allUsers.forEach(user => {
      if (user.email) {
        cache.set(user.email.toLowerCase(), user);
      }
    });

    log(`   ✅ ${allUsers.length} usuários carregados no cache`);
  } catch (err) {
    console.error("   ⚠️ erro ao carregar auth users:", err.message);
  }
}

async function getAuthUserByEmail(email, cache) {
  // Cache já foi pré-carregado com todos os usuários
  return cache.get(email?.toLowerCase()) || null;
}

async function ensureAuthAndProfile(memberEmail, memberWpUserId, ownerProfileId, cachedAuth, isOwner = false, isManager = false) {
  const existingAuth = await getAuthUserByEmail(memberEmail, cachedAuth);
  let authUserId = existingAuth?.id ?? null;
  let profileId = null;

  // Donos: teamOnly = false (acesso completo)
  // Gerentes: teamOnly = false (acesso completo a múltiplos abrigos)
  // Integrantes: teamOnly = true (acesso limitado)
  const teamOnly = !isOwner && !isManager;

  if (!existingAuth && !isDryRun) {
    const password = genPassword();
    const { data, error } = await supabase.auth.admin.createUser({
      email: memberEmail,
      password,
      email_confirm: true,
      user_metadata: {
        registerType: isManager ? "gerente" : "abrigo",
        teamOnly: teamOnly,
        creator_profile_id: ownerProfileId ?? null,
        teamDisabled: false,
        legacyMigrated: true, // IMPORTANTE: marca como migrado para evitar conflito no login
      },
    });
    if (error || !data.user) {
      throw new Error(`Erro ao criar auth user ${memberEmail}: ${error?.message}`);
    }
    authUserId = data.user.id;
  }

  if (existingAuth && !isDryRun) {
    const meta = existingAuth.user_metadata || {};
    const newMeta = {
      ...meta,
      teamOnly: teamOnly,
      creator_profile_id: ownerProfileId ?? meta.creator_profile_id ?? null,
      teamDisabled: false,
      registerType: isManager ? "gerente" : (meta.registerType ?? "abrigo"),
      legacyMigrated: true, // IMPORTANTE: marca como migrado para evitar conflito no login
    };
    const { error: updErr } = await supabase.auth.admin.updateUserById(authUserId, {
      user_metadata: newMeta,
    });
    if (updErr) {
      throw new Error(`Erro ao atualizar metadata de ${memberEmail}: ${updErr.message}`);
    }
  }

  if (authUserId && !isDryRun) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: authUserId,
          email: memberEmail,
          wp_user_id: memberWpUserId,
          origin: "admin_created",
          is_team_only: teamOnly,
        },
        { onConflict: "id" }
      )
      .select("id")
      .maybeSingle();
    if (error) {
      throw new Error(`Erro ao upsert profile de ${memberEmail}: ${error.message}`);
    }
    profileId = data?.id ?? authUserId;
  }

  return { authUserId, profileId };
}

async function main() {
  log("\n== Migração de Integrantes (WP -> Supabase) ==");
  if (isDryRun) log("🟡 Modo DRY-RUN: nada será escrito.");

  const metas = await fetchMetas();
  const tipoCadastroMap = await fetchTipoCadastro();

  // Normalizar metas: explodir valores com vírgula em múltiplas linhas
  const normalizedMetas = [];
  metas.forEach((m) => {
    const value = (m.meta_value || "").trim();

    // Verificar se contém vírgula (múltiplos IDs)
    if (value.includes(",")) {
      const ids = value.split(",").map(id => id.trim()).filter(id => /^\d+$/.test(id));
      ids.forEach(id => {
        normalizedMetas.push({
          user_id: m.user_id,
          meta_key: m.meta_key,
          meta_value: id,
        });
      });
    } else if (/^\d+$/.test(value)) {
      // Valor único numérico
      normalizedMetas.push(m);
    }
    // Valores não numéricos sem vírgula são ignorados
  });

  const validMetas = normalizedMetas;
  const invalidMetas = metas.length - normalizedMetas.length;

  log(`📋 Metadados processados:`);
  log(`   Total bruto: ${metas.length}`);
  log(`   Normalizados (após explodir vírgulas): ${normalizedMetas.length}`);
  log(`   Ignorados (não numéricos): ${invalidMetas}`);

  const abrigoIds = [...new Set(validMetas.map((m) => parseInt(m.meta_value, 10)))];
  const memberWpIds = [...new Set(validMetas.map((m) => m.user_id))];

  const posts = await fetchPosts(abrigoIds);
  const postsMap = new Map(posts.map((p) => [p.id, p]));

  const ownerWpIds = [...new Set(posts.map((p) => p.post_author))];
  const wpUsers = await fetchUsers([...new Set([...memberWpIds, ...ownerWpIds])]);
  const wpUserById = new Map(wpUsers.map((u) => [u.id, u]));

  const ownerProfileCache = new Map();
  const authCache = new Map();

  // Pré-carregar todos os usuários auth no cache
  await loadAllAuthUsersIntoCache(authCache);

  // ========================================
  // ETAPA 1: CRIAR AUTH + PROFILE PARA TODOS OS DONOS
  // ========================================
  log(`\n🔑 Processando ${ownerWpIds.length} donos de abrigos...`);
  let ownersCreated = 0;
  let ownersExisting = 0;
  let ownerSelfLinksCreated = 0;

  for (const ownerWpUserId of ownerWpIds) {
    const ownerWpUser = wpUserById.get(ownerWpUserId);
    const ownerEmail = ownerWpUser?.user_email || null;

    if (!ownerEmail) {
      log(`   ⚠️ Dono wp_user_id=${ownerWpUserId} sem email, pulando...`);
      continue;
    }

    // Verificar se já existe profile
    let ownerProfileId = await getProfileIdByWpUserId(ownerWpUserId, ownerProfileCache);

    if (!ownerProfileId) {
      // Criar auth + profile para o dono
      if (!isDryRun) {
        log(`   Criando dono: ${ownerEmail} (wp_user_id=${ownerWpUserId})...`);
        const { authUserId, profileId } = await ensureAuthAndProfile(
          ownerEmail,
          ownerWpUserId,
          null, // dono não tem creator_profile_id
          authCache,
          true // isOwner = true (acesso completo, teamOnly = false)
        );

        log(`      authUserId: ${authUserId}, profileId: ${profileId}`);

        if (profileId) {
          ownerProfileCache.set(ownerWpUserId, profileId);
          ownerProfileId = profileId;
          ownersCreated++;
          log(`   ✅ Dono criado: ${ownerEmail} (${profileId})`);
        } else {
          log(`   ❌ ERRO: profileId null para ${ownerEmail}`);
        }
      } else {
        ownersCreated++;
      }
    } else {
      ownersExisting++;
      log(`   Profile já existe: ${ownerEmail} (${ownerProfileId})`);
    }

    // Vincular abrigos existentes ao profile do dono
    if (ownerProfileId && !isDryRun) {
      const { error: linkError } = await supabase
        .from("shelters")
        .update({ profile_id: ownerProfileId })
        .eq("wp_post_author", ownerWpUserId)
        .is("profile_id", null);

      if (linkError) {
        log(`   ⚠️ Erro ao vincular abrigos: ${linkError.message}`);
      }
    }

    // Criar vínculo do dono para seus próprios abrigos em team_memberships
    if (ownerProfileId && !isDryRun) {
      // Buscar todos os abrigos desse dono
      const ownerShelters = posts.filter(p => p.post_author === ownerWpUserId);

      for (const shelter of ownerShelters) {
        const { error } = await supabase.from("team_memberships").upsert(
          {
            owner_profile_id: ownerProfileId,
            owner_wp_user_id: ownerWpUserId,
            member_profile_id: ownerProfileId,
            member_wp_user_id: ownerWpUserId,
            member_email: ownerEmail,
            abrigo_post_id: shelter.id,
            role: "owner",
            status: "active",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "owner_wp_user_id,member_wp_user_id,abrigo_post_id",
          }
        );

        if (!error) {
          ownerSelfLinksCreated++;
        }
      }
    }
  }

  log(`   Resumo donos: ${ownersCreated} criados, ${ownersExisting} já existiam`);
  log(`   Vínculos owner→owner: ${ownerSelfLinksCreated} criados`);

  // ========================================
  // ETAPA 1.5: PROCESSAR GERENTES (tipo_cadastro = 'gerente')
  // ========================================
  log(`\n👔 Processando gerentes (tipo_cadastro='gerente')...`);

  // Encontrar todos os user_ids que são gerentes
  const managerUserIds = [];
  for (const [userId, tipoCadastro] of tipoCadastroMap.entries()) {
    if (tipoCadastro.toLowerCase() === 'gerente') {
      managerUserIds.push(userId);
    }
  }

  log(`   Encontrados ${managerUserIds.length} usuários com tipo_cadastro='gerente'`);

  let managersCreated = 0;
  let managersExisting = 0;
  let managerLinksCreated = 0;

  for (const managerWpUserId of managerUserIds) {
    const managerWpUser = wpUserById.get(managerWpUserId);
    const managerEmail = managerWpUser?.user_email || null;

    if (!managerEmail) {
      log(`   ⚠️ Gerente wp_user_id=${managerWpUserId} sem email, pulando...`);
      continue;
    }

    log(`\n   Processando gerente: ${managerEmail} (wp_user_id=${managerWpUserId})`);

    // Verificar se já existe profile
    let managerProfileId = await getProfileIdByWpUserId(managerWpUserId, ownerProfileCache);

    if (!managerProfileId) {
      // Criar auth + profile para o gerente
      if (!isDryRun) {
        log(`      Criando gerente...`);
        const { authUserId, profileId } = await ensureAuthAndProfile(
          managerEmail,
          managerWpUserId,
          null, // gerente não tem creator_profile_id
          authCache,
          false, // isOwner = false
          true   // isManager = true (acesso completo, teamOnly = false)
        );

        log(`      authUserId: ${authUserId}, profileId: ${profileId}`);

        if (profileId) {
          ownerProfileCache.set(managerWpUserId, profileId);
          managerProfileId = profileId;
          managersCreated++;
          log(`      ✅ Gerente criado: ${managerEmail} (${profileId})`);
        } else {
          log(`      ❌ ERRO: profileId null para ${managerEmail}`);
          continue;
        }
      } else {
        managersCreated++;
      }
    } else {
      managersExisting++;
      log(`      Profile já existe: ${managerEmail} (${managerProfileId})`);

      // Atualizar metadata para garantir que teamOnly = false e registerType = gerente
      if (!isDryRun) {
        const existingAuth = await getAuthUserByEmail(managerEmail, authCache);
        if (existingAuth?.id) {
          const meta = existingAuth.user_metadata || {};
          const newMeta = {
            ...meta,
            teamOnly: false,
            registerType: "gerente",
            legacyMigrated: true,
          };
          const { error: updMetaErr } = await supabase.auth.admin.updateUserById(existingAuth.id, {
            user_metadata: newMeta,
          });
          if (updMetaErr) {
            log(`      ⚠️ Erro ao atualizar metadata: ${updMetaErr.message}`);
          }

          // Atualizar profile para is_team_only = false
          const { error: updProfileErr } = await supabase
            .from("profiles")
            .update({ is_team_only: false })
            .eq("id", existingAuth.id);
          if (updProfileErr) {
            log(`      ⚠️ Erro ao atualizar profile: ${updProfileErr.message}`);
          }
        }
      }
    }

    // Buscar todos os abrigos desse gerente (dos metas normalizados)
    const managerAbrigoIds = validMetas
      .filter(m => m.user_id === managerWpUserId)
      .map(m => parseInt(m.meta_value, 10));

    log(`      Abrigos vinculados: ${managerAbrigoIds.length} (${managerAbrigoIds.join(', ')})`);

    // Criar vínculos de gerente para cada abrigo
    if (managerProfileId && !isDryRun) {
      for (const abrigoId of managerAbrigoIds) {
        const post = postsMap.get(abrigoId);
        if (!post) {
          log(`      ⚠️ Abrigo ${abrigoId} não encontrado em wp_posts_raw`);
          continue;
        }

        const ownerWpUserId = post.post_author;
        const ownerProfileId = await getProfileIdByWpUserId(ownerWpUserId, ownerProfileCache);

        const { error } = await supabase.from("team_memberships").upsert(
          {
            owner_profile_id: ownerProfileId,
            owner_wp_user_id: ownerWpUserId,
            member_profile_id: managerProfileId,
            member_wp_user_id: managerWpUserId,
            member_email: managerEmail,
            abrigo_post_id: abrigoId,
            role: "manager",
            status: ownerProfileId ? "active" : "pending_owner",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "owner_wp_user_id,member_wp_user_id,abrigo_post_id",
          }
        );

        if (!error) {
          managerLinksCreated++;
          log(`      ✅ Vínculo criado: abrigo ${abrigoId} (${post.post_title})`);
        } else {
          log(`      ❌ Erro ao criar vínculo para abrigo ${abrigoId}: ${error.message}`);
        }
      }
    }
  }

  log(`\n   Resumo gerentes: ${managersCreated} criados, ${managersExisting} já existiam`);
  log(`   Vínculos gerente→abrigo: ${managerLinksCreated} criados`);

  // ========================================
  // ETAPA 2: PROCESSAR INTEGRANTES E CRIAR VÍNCULOS
  // ========================================
  log(`\n👥 Processando ${validMetas.length} vínculos de integrantes...`);

  let processed = 0;
  let created = 0;
  let updated = 0;
  let pendingOwner = 0;
  let pendingMember = 0;
  let skippedMissingEmail = 0;
  let skippedManager = 0;
  let skippedOwner = 0;

  for (const meta of validMetas) {
    const abrigoId = parseInt(meta.meta_value, 10);
    const post = postsMap.get(abrigoId);
    const ownerWpUserId = post?.post_author ?? null;
    const memberWpUserId = meta.user_id;
    const memberWpUser = wpUserById.get(memberWpUserId);
    const memberEmail = memberWpUser?.user_email || null;

    if (!memberEmail) {
      skippedMissingEmail++;
      continue;
    }

    // Pular se for gerente (já processado na etapa 1.5)
    if (tipoCadastroMap.get(memberWpUserId)?.toLowerCase() === 'gerente') {
      skippedManager++;
      continue;
    }

    // Pular se for o próprio dono (já processado na etapa 1)
    if (memberWpUserId === ownerWpUserId) {
      skippedOwner++;
      continue;
    }

    const ownerProfileId = ownerWpUserId
      ? await getProfileIdByWpUserId(ownerWpUserId, ownerProfileCache)
      : null;

    let memberProfileId = null;
    let authUserId = null;

    if (!isDryRun) {
      const { authUserId: aId, profileId } = await ensureAuthAndProfile(
        memberEmail,
        memberWpUserId,
        ownerProfileId,
        authCache
      );
      authUserId = aId;
      memberProfileId = profileId;
    }

    let status = "active";
    if (!ownerProfileId) {
      status = "pending_owner";
      pendingOwner++;
    } else if (!memberProfileId) {
      status = "pending_member";
      pendingMember++;
    } else {
      updated++; // count as touched
    }

    if (!isDryRun) {
      const { error } = await supabase.from("team_memberships").upsert(
        {
          owner_profile_id: ownerProfileId,
          owner_wp_user_id: ownerWpUserId,
          member_profile_id: memberProfileId,
          member_wp_user_id: memberWpUserId,
          member_email: memberEmail,
          abrigo_post_id: abrigoId,
          status,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "owner_wp_user_id,member_wp_user_id,abrigo_post_id",
        }
      );
      if (error) {
        throw new Error(
          `Erro ao upsert team_memberships (${ownerWpUserId} -> ${memberWpUserId}): ${error.message}`
        );
      }
    }

    processed++;
    if (processed % 50 === 0) log(`   ...${processed} vínculos processados`);
  }

  log("\nResumo:");
  log(` - Vínculos lidos: ${metas.length}`);
  log(` - Vínculos válidos (numéricos): ${validMetas.length}`);
  log(` - Vínculos ignorados (não numéricos): ${invalidMetas}`);
  log(` - Processados: ${processed}`);
  log(` - Atualizados/ativos: ${updated}`);
  log(` - Pendente owner: ${pendingOwner}`);
  log(` - Pendente member: ${pendingMember}`);
  log(` - Ignorados por falta de email: ${skippedMissingEmail}`);
  log(` - Ignorados por serem gerentes: ${skippedManager}`);
  log(` - Ignorados por serem donos: ${skippedOwner}`);

  // Reconciliação final: preencher owner_profile_id quando o profile já existe
  log("\nReconciliação: preenchendo owner_profile_id e status quando profiles existem...");

  // 1) Atualizar em bloco owner_profile_id para quem já tem profile do dono
  const { data: pendingOwners, error: pendErr } = await supabase
    .from("team_memberships")
    .select("id, owner_wp_user_id, member_profile_id, member_email, owner_profile_id")
    .is("owner_profile_id", null);

  if (pendErr) {
    console.error("   ⚠️ erro ao buscar vínculos pendentes:", pendErr.message);
  } else if (pendingOwners && pendingOwners.length > 0) {
    let fixedOwners = 0;
    for (const row of pendingOwners) {
      const ownerProfileId = row.owner_wp_user_id
        ? await getProfileIdByWpUserId(row.owner_wp_user_id, ownerProfileCache)
        : null;
      if (!ownerProfileId) continue;
      const newStatus = row.member_profile_id ? "active" : "pending_member";
      if (!isDryRun) {
        const { error: updErr } = await supabase
          .from("team_memberships")
          .update({
            owner_profile_id: ownerProfileId,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        if (updErr) {
          console.error("   ⚠️ erro ao reconciliar owner_profile_id", row.id, updErr.message);
          continue;
        }
      }
      fixedOwners++;
    }
    log(`   ✅ Reconciliação de owners: ${fixedOwners} vínculos atualizados`);
  }

  // 2) Atualizar metadata dos membros para apontar para creator_profile_id
  // IMPORTANTE: Filtrar apenas role != 'manager' para não sobrescrever gerentes
  const { data: rowsForMeta, error: metaErr } = await supabase
    .from("team_memberships")
    .select("member_email, member_wp_user_id, owner_profile_id, role")
    .not("owner_profile_id", "is", null)
    .neq("role", "manager"); // Excluir gerentes

  if (metaErr) {
    console.error("   ⚠️ erro ao buscar vínculos para atualizar metadata:", metaErr.message);
  } else if (rowsForMeta && rowsForMeta.length > 0) {
    let updatedMeta = 0;
    for (const row of rowsForMeta) {
      if (!row.member_email || !row.owner_profile_id) continue;
      if (isDryRun) {
        updatedMeta++;
        continue;
      }

      // Verificar se o usuário é gerente (dupla verificação)
      const isManager = tipoCadastroMap.get(row.member_wp_user_id)?.toLowerCase() === 'gerente';
      if (isManager) {
        log(`   ⏭️  Pulando gerente ${row.member_email} na reconciliação de metadata`);
        continue;
      }

      const existingAuth = await getAuthUserByEmail(row.member_email, authCache);
      if (!existingAuth?.id) continue;

      // Se já tem registerType='gerente', não sobrescrever
      const meta = existingAuth.user_metadata || {};
      if (meta.registerType === 'gerente') {
        log(`   ⏭️  Pulando ${row.member_email} - já tem registerType='gerente'`);
        continue;
      }

      const newMeta = {
        ...meta,
        creator_profile_id: row.owner_profile_id,
        teamOnly: true,
        teamDisabled: false,
        registerType: meta.registerType ?? "abrigo",
      };
      const { error: updMetaErr } = await supabase.auth.admin.updateUserById(existingAuth.id, {
        user_metadata: newMeta,
      });
      if (updMetaErr) {
        console.error(
          `   ⚠️ erro ao atualizar metadata de ${row.member_email}: ${updMetaErr.message}`
        );
        continue;
      }
      updatedMeta++;
    }
    log(`   ✅ Reconciliação concluída: ${rowsForMeta.length} vínculos verificados, ${updatedMeta} metadatas atualizados`);
  } else {
    log("   ✅ Nenhum vínculo pendente para reconciliar");
  }

  log("\nConcluído.");
}

main().catch((err) => {
  console.error("❌ Erro na migração de integrantes:", err.message);
  process.exit(1);
});
