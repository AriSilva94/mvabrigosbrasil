/**
 * Verificar se o abrigo "Ongato" criado em 14/01/2026 está no Supabase
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  const envPath = path.join(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Erro: Arquivo .env.local não encontrado");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim();
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

async function checkOngato() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  VERIFICAR: Abrigo 'Ongato' (14/01/2026) no Supabase           ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Data exata: 2026-01-14
  const targetDate = "2026-01-14";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  Buscar em wp_posts_raw (tabela legada)\n");

  // Buscar posts de 14/01/2026
  const { data: wpPosts, error: wpError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .gte("post_date", `${targetDate} 00:00:00`)
    .lt("post_date", "2026-01-15 00:00:00")
    .order("post_date", { ascending: true });

  if (wpError) {
    console.error("❌ Erro:", wpError);
  } else {
    console.log(`Posts tipo 'abrigo' em 14/01/2026: ${wpPosts?.length || 0}\n`);

    if (wpPosts && wpPosts.length > 0) {
      wpPosts.forEach((p) => {
        console.log(`  Post ID: ${p.id}`);
        console.log(`    Título: ${p.post_title}`);
        console.log(`    Data: ${p.post_date}`);
        console.log(`    Status: ${p.post_status}`);
        console.log(`    Autor: ${p.post_author}\n`);
      });
    } else {
      console.log("  ❌ NENHUM post encontrado em 14/01/2026!");
      console.log("  Isso significa que a tabela wp_posts_raw está DESATUALIZADA.\n");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  Buscar em shelters (tabela migrada)\n");

  const { data: shelters, error: sheltersError } = await supabase
    .from("shelters")
    .select("*")
    .gte("created_at", `${targetDate} 00:00:00`)
    .lt("created_at", "2026-01-15 00:00:00")
    .order("created_at", { ascending: true });

  if (sheltersError) {
    console.error("❌ Erro:", sheltersError);
  } else {
    console.log(`Abrigos na tabela 'shelters' em 14/01/2026: ${shelters?.length || 0}\n`);

    if (shelters && shelters.length > 0) {
      shelters.forEach((s) => {
        console.log(`  Abrigo:`);
        console.log(`    Supabase ID: ${s.id}`);
        console.log(`    WP Post ID: ${s.wp_post_id}`);
        console.log(`    Nome: ${s.name}`);
        console.log(`    Created At: ${s.created_at}\n`);
      });
    } else {
      console.log("  ❌ NENHUM abrigo encontrado em 14/01/2026!\n");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  Buscar posts criados em JANEIRO/2026\n");

  const { data: jan2026Posts, error: janError } = await supabase
    .from("wp_posts_raw")
    .select("id, post_title, post_date, post_type")
    .eq("post_type", "abrigo")
    .gte("post_date", "2026-01-01")
    .lt("post_date", "2026-02-01")
    .order("post_date", { ascending: true });

  if (janError) {
    console.error("❌ Erro:", janError);
  } else {
    console.log(`Total de posts 'abrigo' em JANEIRO/2026: ${jan2026Posts?.length || 0}\n`);

    if (jan2026Posts && jan2026Posts.length > 0) {
      jan2026Posts.forEach((p) => {
        console.log(`  ${p.id} - ${p.post_title} (${p.post_date})`);
      });
    }
    console.log();
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  DIAGNÓSTICO\n");

  console.log("🔍 CONCLUSÃO:");

  if (!wpPosts || wpPosts.length === 0) {
    console.log("\n❌ O abrigo 'Ongato' NÃO ESTÁ na tabela wp_posts_raw!");
    console.log("\n💡 SOLUÇÃO:");
    console.log("   1. A tabela wp_posts_raw precisa ser ATUALIZADA com os dados do WordPress");
    console.log("   2. Você precisa rodar um script para importar os posts mais recentes");
    console.log("   3. Ou rodar novamente o backup/export do WordPress\n");

    console.log("📋 PASSOS:");
    console.log("   a) Exportar dados atualizados do WordPress (CSV ou SQL)");
    console.log("   b) Importar para wp_posts_raw no Supabase");
    console.log("   c) Rodar script de migração para popular a tabela 'shelters'\n");
  } else {
    console.log("\n✅ O abrigo 'Ongato' ESTÁ na tabela wp_posts_raw!");
    console.log("\n💡 Agora precisa:");
    console.log("   1. Rodar o script de migração para popular a tabela 'shelters'");
    console.log("   2. cd scripts/migrations/abrigos");
    console.log("   3. node migrate-shelters-wp-to-supabase.js\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ VERIFICAÇÃO CONCLUÍDA!\n");
}

checkOngato().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
