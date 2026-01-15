/**
 * Encontrar o abrigo "ongato" que foi criado em 2026
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

async function findOngato() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  BUSCAR: Abrigo 'ongato' criado em 2026                        ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Buscar no Supabase (tabela shelters)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  Buscar 'ongato' na tabela shelters\n");

  const { data: sheltersOngato, error: ongatoError } = await supabase
    .from("shelters")
    .select("*")
    .ilike("name", "%ongato%");

  if (ongatoError) {
    console.error("❌ Erro:", ongatoError);
  } else {
    console.log(`Resultados encontrados: ${sheltersOngato?.length || 0}\n`);
    sheltersOngato?.forEach((s) => {
      console.log(`  Abrigo:`);
      console.log(`    Supabase ID: ${s.id}`);
      console.log(`    WP Post ID: ${s.wp_post_id}`);
      console.log(`    Nome: ${s.name}`);
      console.log(`    Estado: ${s.state}, Cidade: ${s.city}`);
      console.log(`    Tipo: ${s.shelter_type}`);
      console.log(`    Created At: ${s.created_at}`);
      console.log(`    Foundation Date: ${s.foundation_date}\n`);
    });
  }

  // 2. Buscar no WordPress legacy (wp_posts_raw)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  Buscar 'ongato' na tabela wp_posts_raw\n");

  const { data: wpOngato, error: wpOngatoError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .ilike("post_title", "%ongato%");

  if (wpOngatoError) {
    console.error("❌ Erro:", wpOngatoError);
  } else {
    console.log(`Resultados encontrados: ${wpOngato?.length || 0}\n`);
    wpOngato?.forEach((p) => {
      console.log(`  Post WP:`);
      console.log(`    ID: ${p.id}`);
      console.log(`    Título: ${p.post_title}`);
      console.log(`    Autor: ${p.post_author}`);
      console.log(`    Post Date: ${p.post_date}`);
      console.log(`    Status: ${p.post_status}\n`);
    });
  }

  // 3. Buscar todos os abrigos de 2026
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  TODOS os abrigos com created_at em 2026\n");

  const { data: all2026Shelters, error: all2026Error } = await supabase
    .from("shelters")
    .select("*")
    .gte("created_at", "2026-01-01")
    .lt("created_at", "2027-01-01")
    .order("created_at", { ascending: true });

  if (all2026Error) {
    console.error("❌ Erro:", all2026Error);
  } else {
    console.log(`Total de abrigos criados em 2026: ${all2026Shelters?.length || 0}\n`);
    all2026Shelters?.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.name}`);
      console.log(`     Supabase ID: ${s.id}`);
      console.log(`     WP Post ID: ${s.wp_post_id}`);
      console.log(`     Estado: ${s.state}, Cidade: ${s.city}`);
      console.log(`     Created At: ${s.created_at}\n`);
    });
  }

  // 4. Buscar no WordPress todos os posts de 2026
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  TODOS os posts wp_posts_raw tipo 'abrigo' de 2026\n");

  const { data: all2026WP, error: all2026WPError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .gte("post_date", "2026-01-01")
    .lt("post_date", "2027-01-01")
    .order("post_date", { ascending: true });

  if (all2026WPError) {
    console.error("❌ Erro:", all2026WPError);
  } else {
    console.log(`Total de posts WP 'abrigo' em 2026: ${all2026WP?.length || 0}\n`);
    all2026WP?.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.post_title}`);
      console.log(`     WP ID: ${p.id}`);
      console.log(`     Autor: ${p.post_author}`);
      console.log(`     Post Date: ${p.post_date}`);
      console.log(`     Status: ${p.post_status}\n`);
    });
  }

  // 5. Buscar por variações do nome
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("5️⃣  Buscar variações: 'gato', 'ONG', etc.\n");

  const searchTerms = ["gato", "ONG", "ong gato", "ong de gato"];

  for (const term of searchTerms) {
    const { data: results } = await supabase
      .from("shelters")
      .select("id, name, created_at")
      .ilike("name", `%${term}%`)
      .gte("created_at", "2026-01-01")
      .lt("created_at", "2027-01-01");

    if (results && results.length > 0) {
      console.log(`  Termo "${term}": ${results.length} resultado(s)`);
      results.forEach((r) => {
        console.log(`    - ${r.name} (created: ${r.created_at})`);
      });
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ BUSCA CONCLUÍDA!\n");
}

findOngato().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
