/**
 * Verificar estrutura das tabelas legadas do WordPress
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

async function checkTableStructure() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  VERIFICAÇÃO: Estrutura das Tabelas Legacy                     ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Verificar wp_posts_raw
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  Tabela: wp_posts_raw\n");

  const { data: posts, error: postsError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .limit(1);

  if (postsError) {
    console.error("❌ Erro:", postsError);
  } else if (posts && posts.length > 0) {
    console.log("Colunas disponíveis:");
    Object.keys(posts[0]).forEach((col) => console.log(`  - ${col}`));
    console.log();
  }

  // 2. Verificar wp_postmeta_raw
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  Tabela: wp_postmeta_raw\n");

  const { data: meta, error: metaError } = await supabase
    .from("wp_postmeta_raw")
    .select("*")
    .limit(1);

  if (metaError) {
    console.error("❌ Erro:", metaError);
  } else if (meta && meta.length > 0) {
    console.log("Colunas disponíveis:");
    Object.keys(meta[0]).forEach((col) => console.log(`  - ${col}`));
    console.log();
  }

  // 3. Buscar alguns abrigos para ver a estrutura
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  Sample de abrigos\n");

  const { data: sampleShelters, error: sampleError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .limit(3);

  if (sampleError) {
    console.error("❌ Erro:", sampleError);
  } else {
    console.log(`Total encontrados: ${sampleShelters?.length || 0}\n`);
    sampleShelters?.forEach((shelter, idx) => {
      console.log(`Abrigo ${idx + 1}:`);
      console.log(JSON.stringify(shelter, null, 2));
      console.log();
    });
  }

  // 4. Contar tipos de posts
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  Contagem por post_type\n");

  const postTypes = ["abrigo", "dinamica", "dinamica_lar", "voluntario", "vaga"];

  for (const type of postTypes) {
    const { count, error } = await supabase
      .from("wp_posts_raw")
      .select("*", { count: "exact", head: true })
      .eq("post_type", type);

    if (!error) {
      console.log(`  ${type}: ${count || 0} registros`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ VERIFICAÇÃO CONCLUÍDA!\n");
}

checkTableStructure().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
