/**
 * Debug: Por que os dados de 2026 estão errados na tela?
 * Compara dados reais do banco vs dados processados pelo sistema
 */

import * as fs from "fs";
import * as path from "path";
import { loadDatabaseDataset } from "@/lib/database/dataLoader";
import { computeOverview, ALL_STATES_VALUE } from "@/lib/database/aggregations";
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

async function debug2026Display() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  DEBUG: Por que dados de 2026 estão errados?                   ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ========================================
  // PARTE 1: DADOS DO SISTEMA (como está sendo exibido)
  // ========================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  DADOS DO SISTEMA (processados pelo dataLoader)\n");

  const dataset = await loadDatabaseDataset();

  // Filtrar dados de 2026
  const shelters2026 = dataset.shelters.filter((s) => s.year === 2026);
  const movements2026 = dataset.movements.filter((m) => m.year === 2026);

  console.log(`📊 Dataset carregado pelo sistema:`);
  console.log(`   Total de abrigos no dataset: ${dataset.shelters.length}`);
  console.log(`   Total de movimentos no dataset: ${dataset.movements.length}\n`);

  console.log(`📅 Dados de 2026 (filtrados):`);
  console.log(`   Abrigos com year=2026: ${shelters2026.length}`);
  console.log(`   Movimentos com year=2026: ${movements2026.length}\n`);

  if (shelters2026.length > 0) {
    console.log("   Abrigos de 2026:");
    shelters2026.forEach((s) => {
      console.log(`     - ID: ${s.id}, Nome: ${s.title}, Estado: ${s.state}, Tipo: ${s.type}`);
      console.log(`       Year: ${s.year}, Month: ${s.month}, PostDate: ${s.postDate}`);
    });
    console.log();
  }

  if (movements2026.length > 0) {
    console.log("   Primeiros 5 movimentos de 2026:");
    movements2026.slice(0, 5).forEach((m) => {
      console.log(`     - ID: ${m.id}, Tipo: ${m.postType}, Abrigo ID: ${m.shelterId}`);
      console.log(`       Year: ${m.year}, Month: ${m.month}`);
      console.log(`       Entradas: ${m.metrics.entradas}, Adoções: ${m.metrics.adocoes}`);
    });
    console.log();
  }

  // Calcular overview de 2026
  const overview2026 = computeOverview(dataset, 2026, ALL_STATES_VALUE);
  console.log("📈 Overview calculado para 2026:");
  console.log(`   Total de abrigos: ${overview2026.totalShelters}`);
  console.log(`   Públicos: ${overview2026.publicCount}`);
  console.log(`   Privados: ${overview2026.privateCount}`);
  console.log(`   Mistos: ${overview2026.mixedCount}`);
  console.log(`   LT/PI: ${overview2026.ltpiCount}\n`);

  // ========================================
  // PARTE 2: DADOS DO BANCO (verdade absoluta)
  // ========================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  DADOS DO BANCO (verdade absoluta)\n");

  // 2.1 Abrigos cadastrados em 2026 (post_date)
  const { data: sheltersRaw2026, error: sheltersError } = await supabase
    .from("shelters")
    .select("id, wp_post_id, name, state, shelter_type, created_at, foundation_date")
    .gte("created_at", "2026-01-01")
    .lt("created_at", "2027-01-01");

  if (sheltersError) {
    console.error("❌ Erro ao buscar abrigos:", sheltersError);
  } else {
    console.log(`🏠 Abrigos na tabela 'shelters' com created_at em 2026: ${sheltersRaw2026?.length || 0}`);
    sheltersRaw2026?.forEach((s) => {
      console.log(`   - ID: ${s.id}, WP Post ID: ${s.wp_post_id}`);
      console.log(`     Nome: ${s.name}`);
      console.log(`     Estado: ${s.state}, Tipo: ${s.shelter_type}`);
      console.log(`     Created At: ${s.created_at}`);
      console.log(`     Foundation Date: ${s.foundation_date}\n`);
    });
  }

  // 2.2 Dinâmicas de 2026 (reference_date ou created_at)
  const { data: dynamics2026, error: dynamicsError } = await supabase
    .from("shelter_dynamics")
    .select("*")
    .gte("reference_date", "2026-01-01")
    .lt("reference_date", "2027-01-01");

  if (dynamicsError) {
    console.error("❌ Erro ao buscar dinâmicas:", dynamicsError);
  } else {
    console.log(`📊 Dinâmicas na tabela 'shelter_dynamics' com reference_date em 2026: ${dynamics2026?.length || 0}`);
    dynamics2026?.forEach((d) => {
      console.log(`   - ID: ${d.id}, Shelter ID: ${d.shelter_id}`);
      console.log(`     Tipo: ${d.dynamic_type}, Kind: ${d.kind}`);
      console.log(`     Período: ${d.reference_period}, Data: ${d.reference_date}`);
      console.log(`     Entradas cães: ${d.entradas_de_animais}, gatos: ${d.entradas_de_gatos}`);
      console.log(`     Adoções cães: ${d.adocoes_caes}, gatos: ${d.adocoes_gatos}\n`);
    });
  }

  // 2.3 Verificar abrigos com WP Post ID 647 e 972
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  ABRIGOS 647 e 972 (mencionados pelo usuário)\n");

  const { data: specificShelters } = await supabase
    .from("shelters")
    .select("*")
    .in("wp_post_id", [647, 972]);

  if (specificShelters) {
    console.log(`🏠 Abrigos com wp_post_id 647 ou 972: ${specificShelters.length}`);
    specificShelters.forEach((s) => {
      console.log(`\n   Abrigo WP Post ID ${s.wp_post_id}:`);
      console.log(`     Supabase ID: ${s.id}`);
      console.log(`     Nome: ${s.name}`);
      console.log(`     Estado: ${s.state}, Tipo: ${s.shelter_type}`);
      console.log(`     Created At: ${s.created_at}`);
      console.log(`     Foundation Date: ${s.foundation_date}`);
    });
    console.log();

    // Verificar dinâmicas desses abrigos
    const shelterIds = specificShelters.map((s) => s.id);
    const { data: dynamicsOfSpecific } = await supabase
      .from("shelter_dynamics")
      .select("*")
      .in("shelter_id", shelterIds)
      .order("reference_date", { ascending: false });

    console.log(`📊 Dinâmicas desses abrigos: ${dynamicsOfSpecific?.length || 0}\n`);

    // Agrupar por ano
    const byYear = new Map<number, number>();
    dynamicsOfSpecific?.forEach((d) => {
      if (d.reference_date) {
        const year = new Date(d.reference_date).getFullYear();
        byYear.set(year, (byYear.get(year) || 0) + 1);
      }
    });

    console.log("   Distribuição por ano:");
    Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([year, count]) => {
        console.log(`     ${year}: ${count} dinâmicas`);
      });

    // Mostrar dinâmicas de 2026
    const dynamics2026Specific = dynamicsOfSpecific?.filter((d) => {
      if (!d.reference_date) return false;
      const year = new Date(d.reference_date).getFullYear();
      return year === 2026;
    });

    console.log(`\n   Dinâmicas de 2026 desses abrigos: ${dynamics2026Specific?.length || 0}`);
    dynamics2026Specific?.forEach((d) => {
      console.log(`\n     Dinâmica ${d.id}:`);
      console.log(`       Abrigo: ${d.shelter_id}`);
      console.log(`       Tipo: ${d.dynamic_type}, Período: ${d.reference_period}`);
      console.log(`       Entradas: ${d.entradas_de_animais} cães, ${d.entradas_de_gatos} gatos`);
      console.log(`       Adoções: ${d.adocoes_caes} cães, ${d.adocoes_gatos} gatos`);
    });
  }

  // ========================================
  // PARTE 4: COMPARAÇÃO E DIAGNÓSTICO
  // ========================================
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  DIAGNÓSTICO\n");

  console.log("🔍 Comparação:");
  console.log(`   Sistema mostra: ${shelters2026.length} abrigos em 2026`);
  console.log(`   Banco tem: ${sheltersRaw2026?.length || 0} abrigos criados em 2026\n`);

  console.log(`   Sistema mostra: ${movements2026.length} movimentos em 2026`);
  console.log(`   Banco tem: ${dynamics2026?.length || 0} dinâmicas com referência a 2026\n`);

  // Verificar diferença
  if (shelters2026.length !== (sheltersRaw2026?.length || 0)) {
    console.log("⚠️  PROBLEMA IDENTIFICADO:");
    console.log("   O dataLoader está usando 'created_at' (post_date) para filtrar abrigos por ano.");
    console.log("   Mas os abrigos 647 e 972 foram criados em 2022 e 2023!");
    console.log("   Eles só têm DINÂMICAS em 2026, mas não foram cadastrados em 2026.\n");

    console.log("💡 SOLUÇÃO:");
    console.log("   A contagem de abrigos deve ser baseada nos abrigos que TÊM dinâmicas");
    console.log("   no ano selecionado, não nos abrigos cadastrados naquele ano.\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEBUG CONCLUÍDO!\n");
}

debug2026Display().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
