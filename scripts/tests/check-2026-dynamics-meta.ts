/**
 * Verificar TODOS os metadados das dinâmicas de 2026
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

async function check2026DynamicsMeta() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  METADADOS COMPLETOS: Dinâmicas de 2026                        ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Buscar dinâmicas de 2026 (filtrar por post_date)
  const { data: dynamics2026, error: dynamicsError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .in("post_type", ["dinamica", "dinamica_lar"])
    .eq("post_status", "publish")
    .gte("post_date", "2026-01-01")
    .lt("post_date", "2027-01-01")
    .order("post_date", { ascending: true });

  if (dynamicsError) {
    console.error("❌ Erro:", dynamicsError);
    return;
  }

  console.log(`Total de dinâmicas em 2026: ${dynamics2026?.length || 0}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 2. Para cada dinâmica, buscar TODOS os metadados
  if (dynamics2026) {
    for (const dynamic of dynamics2026) {
      console.log(`📊 Dinâmica ID ${dynamic.id} (${dynamic.post_type})`);
      console.log(`   Título: ${dynamic.post_title}`);
      console.log(`   Autor: ${dynamic.post_author}`);
      console.log(`   Data: ${dynamic.post_date}\n`);

      const { data: meta, error: metaError } = await supabase
        .from("wp_postmeta_raw")
        .select("meta_key, meta_value")
        .eq("post_id", dynamic.id)
        .order("meta_key", { ascending: true });

      if (metaError) {
        console.error("   ❌ Erro ao buscar metadados:", metaError);
      } else if (meta) {
        console.log("   Metadados:");
        meta.forEach((m) => {
          console.log(`     ${m.meta_key}: ${m.meta_value}`);
        });
      }

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
  }

  // 3. Buscar abrigos relacionados
  const authorIds = [...new Set(dynamics2026?.map((d) => d.post_author))];

  console.log("🏠 ABRIGOS RELACIONADOS\n");

  const { data: shelters, error: sheltersError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .in("post_author", authorIds);

  if (sheltersError) {
    console.error("❌ Erro:", sheltersError);
  } else if (shelters) {
    shelters.forEach((shelter) => {
      console.log(`Abrigo ID ${shelter.id}: ${shelter.post_title}`);
      console.log(`  Autor: ${shelter.post_author}`);
      console.log(`  Data cadastro: ${shelter.post_date}\n`);
    });
  }

  console.log("\n✅ VERIFICAÇÃO CONCLUÍDA!\n");
}

check2026DynamicsMeta().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
