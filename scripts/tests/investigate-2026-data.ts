/**
 * Investigação de dados de 2026
 * Consulta tabelas legadas do WordPress para entender estrutura de dados
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

async function investigate2026Data() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  INVESTIGAÇÃO: Dados de 2026 (WordPress Legacy)                ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Verificar abrigos 647 e 972
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  ABRIGOS 647 e 972\n");

  const { data: shelters, error: sheltersError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .eq("post_type", "abrigo")
    .in("id", [647, 972]);

  if (sheltersError) {
    console.error("❌ Erro ao buscar abrigos:", sheltersError);
  } else {
    console.log(`Total de abrigos encontrados: ${shelters?.length || 0}\n`);
    shelters?.forEach((shelter) => {
      console.log(`Abrigo ID: ${shelter.id}`);
      console.log(`  Nome: ${shelter.post_title}`);
      console.log(`  Autor ID: ${shelter.post_author}`);
      console.log(`  Data: ${shelter.post_date}`);
      console.log(`  Status: ${shelter.post_status}\n`);
    });
  }

  // 2. Pegar os post_author IDs
  const authorIds = shelters?.map((s) => s.post_author) || [];
  console.log(`Author IDs dos abrigos: ${authorIds.join(", ")}\n`);

  // 3. Buscar TODAS as dinâmicas desses autores
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  DINÂMICAS dos autores\n");

  const { data: dynamics, error: dynamicsError } = await supabase
    .from("wp_posts_raw")
    .select("*")
    .in("post_type", ["dinamica", "dinamica_lar"])
    .in("post_author", authorIds)
    .eq("post_status", "publish")
    .order("post_date", { ascending: false });

  if (dynamicsError) {
    console.error("❌ Erro ao buscar dinâmicas:", dynamicsError);
  } else {
    console.log(`Total de dinâmicas encontradas: ${dynamics?.length || 0}\n`);

    // Mostrar apenas as primeiras 5 para não poluir
    dynamics?.slice(0, 5).forEach((dyn) => {
      console.log(`Dinâmica ID: ${dyn.id}`);
      console.log(`  Tipo: ${dyn.post_type}`);
      console.log(`  Autor ID: ${dyn.post_author}`);
      console.log(`  Data: ${dyn.post_date}`);
      console.log(`  Título: ${dyn.post_title}\n`);
    });

    if (dynamics && dynamics.length > 5) {
      console.log(`... e mais ${dynamics.length - 5} dinâmicas\n`);
    }
  }

  // 4. Buscar metadados das dinâmicas (sample de uma dinâmica)
  if (dynamics && dynamics.length > 0) {
    const sampleDynamicId = dynamics[0].id;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`3️⃣  METADADOS (sample da dinâmica ID ${sampleDynamicId})\n`);

    const { data: metaData, error: metaError } = await supabase
      .from("wp_postmeta_raw")
      .select("*")
      .eq("post_id", sampleDynamicId)
      .order("meta_key", { ascending: true });

    if (metaError) {
      console.error("❌ Erro ao buscar metadados:", metaError);
    } else {
      console.log(`Total de meta_keys: ${metaData?.length || 0}\n`);

      // Mostrar todos os meta_keys relacionados a ano/mês
      const relevantMetas = metaData?.filter(
        (m) =>
          m.meta_key?.includes("ano") ||
          m.meta_key?.includes("mes") ||
          m.meta_key?.includes("referente") ||
          m.meta_key?.includes("entradas") ||
          m.meta_key?.includes("adocoes") ||
          m.meta_key?.includes("saida")
      );

      console.log("Meta_keys relevantes encontrados:");
      relevantMetas?.forEach((meta) => {
        console.log(`  ${meta.meta_key}: ${meta.meta_value}`);
      });
      console.log();
    }
  }

  // 5. Buscar TODAS as meta_keys distintas de dinâmicas
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  META_KEYS DISTINTOS (todas as dinâmicas)\n");

  if (dynamics && dynamics.length > 0) {
    const dynamicIds = dynamics.map((d) => d.id);

    const { data: allMetaKeys, error: allMetaError } = await supabase
      .from("wp_postmeta_raw")
      .select("meta_key")
      .in("post_id", dynamicIds);

    if (allMetaError) {
      console.error("❌ Erro ao buscar meta_keys:", allMetaError);
    } else {
      const uniqueKeys = [...new Set(allMetaKeys?.map((m) => m.meta_key))].sort();
      console.log(`Total de meta_keys únicos: ${uniqueKeys.length}\n`);

      // Filtrar keys relacionadas a tempo e métricas
      const timeKeys = uniqueKeys.filter(
        (k) => k?.includes("ano") || k?.includes("mes") || k?.includes("referente")
      );
      const metricKeys = uniqueKeys.filter(
        (k) =>
          k?.includes("entrada") ||
          k?.includes("adoc") ||
          k?.includes("devoluc") ||
          k?.includes("eutanas") ||
          k?.includes("morte") ||
          k?.includes("retorno") ||
          k?.includes("saida")
      );

      console.log("Meta_keys de TEMPO:");
      timeKeys.forEach((k) => console.log(`  - ${k}`));

      console.log("\nMeta_keys de MÉTRICAS:");
      metricKeys.forEach((k) => console.log(`  - ${k}`));
      console.log();
    }
  }

  // 6. Buscar dinâmicas referentes a 2026
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("5️⃣  DINÂMICAS REFERENTES A 2026\n");

  if (dynamics && dynamics.length > 0) {
    const dynamicIds = dynamics.map((d) => d.id);

    // Buscar IDs que têm meta_key com valor 2026
    const { data: meta2026, error: meta2026Error } = await supabase
      .from("wp_postmeta_raw")
      .select("post_id, meta_key, meta_value")
      .in("post_id", dynamicIds)
      .or("meta_value.eq.2026,meta_value.eq.\"2026\"");

    if (meta2026Error) {
      console.error("❌ Erro ao buscar metas de 2026:", meta2026Error);
    } else {
      console.log(`Registros com valor 2026: ${meta2026?.length || 0}\n`);

      const uniquePostIds2026 = [...new Set(meta2026?.map((m) => m.post_id))];
      console.log(`Dinâmicas únicas com referência a 2026: ${uniquePostIds2026.length}\n`);

      // Para cada dinâmica de 2026, buscar todos os metadados
      for (const postId of uniquePostIds2026.slice(0, 3)) {
        const dynamic = dynamics.find((d) => d.id === postId);
        console.log(`\n📊 Dinâmica ID ${postId} (${dynamic?.post_type}):`);

        const { data: fullMeta } = await supabase
          .from("wp_postmeta_raw")
          .select("meta_key, meta_value")
          .eq("post_id", postId)
          .order("meta_key", { ascending: true });

        // Agrupar por categoria
        const timeMeta = fullMeta?.filter(
          (m) => m.meta_key?.includes("ano") || m.meta_key?.includes("mes") || m.meta_key?.includes("referente")
        );
        const metricMeta = fullMeta?.filter(
          (m) =>
            m.meta_key?.includes("entrada") ||
            m.meta_key?.includes("adoc") ||
            m.meta_key?.includes("saida")
        );

        console.log("\n  Tempo:");
        timeMeta?.forEach((m) => console.log(`    ${m.meta_key}: ${m.meta_value}`));

        console.log("\n  Métricas principais:");
        metricMeta?.slice(0, 10).forEach((m) => console.log(`    ${m.meta_key}: ${m.meta_value}`));
      }
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ INVESTIGAÇÃO CONCLUÍDA!\n");
}

investigate2026Data().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
