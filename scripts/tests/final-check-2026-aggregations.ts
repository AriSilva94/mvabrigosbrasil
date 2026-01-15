/**
 * Verificação final: O que os gráficos deveriam mostrar em 2026
 */

import * as fs from "fs";
import * as path from "path";
import { loadDatabaseDataset } from "@/lib/database/dataLoader";
import {
  computeOverview,
  computeMonthlyAnimalFlow,
  ALL_STATES_VALUE,
} from "@/lib/database/aggregations";

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

async function finalCheck2026() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  VERIFICAÇÃO FINAL: O que deve aparecer em 2026?               ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const dataset = await loadDatabaseDataset();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  DADOS BRUTOS DO DATASET\n");

  const movements2026 = dataset.movements.filter((m) => m.year === 2026);

  console.log(`Total de movimentos em 2026: ${movements2026.length}\n`);

  console.log("Detalhamento dos movimentos:");
  movements2026.forEach((m, idx) => {
    console.log(`\n  Movimento ${idx + 1}:`);
    console.log(`    ID: ${m.id}`);
    console.log(`    Tipo: ${m.postType}`);
    console.log(`    Abrigo ID: ${m.shelterId}`);
    console.log(`    Estado: ${m.shelterState}, Tipo: ${m.shelterType}`);
    console.log(`    Ano/Mês: ${m.year}/${m.month}`);
    console.log(`\n    Métricas:`);
    console.log(`      Entradas cães: ${m.metrics.entradas}`);
    console.log(`      Entradas gatos: ${m.metrics.entradasGatos}`);
    console.log(`      Adoções cães: ${m.metrics.adocoes}`);
    console.log(`      Adoções gatos: ${m.metrics.adocoesGatos}`);
    console.log(`      Devoluções cães: ${m.metrics.devolucoes}`);
    console.log(`      Devoluções gatos: ${m.metrics.devolucoesGatos}`);
    console.log(`      Eutanásias cães: ${m.metrics.eutanasias}`);
    console.log(`      Eutanásias gatos: ${m.metrics.eutanasiasGatos}`);
    console.log(`      Mortes naturais cães: ${m.metrics.mortesNaturais}`);
    console.log(`      Mortes naturais gatos: ${m.metrics.mortesNaturaisGatos}`);
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2️⃣  OVERVIEW (computeOverview)\n");

  const overview = computeOverview(dataset, 2026, ALL_STATES_VALUE);

  console.log("📊 Resultado da função computeOverview:");
  console.log(`   Total de abrigos: ${overview.totalShelters}`);
  console.log(`   Públicos: ${overview.publicCount}`);
  console.log(`   Privados: ${overview.privateCount}`);
  console.log(`   Mistos: ${overview.mixedCount}`);
  console.log(`   LT/PI: ${overview.ltpiCount}\n`);

  console.log("✅ ESPERADO:");
  console.log("   Total de abrigos: 2");
  console.log("   (Fofoletes de Bigodes - Privado + Adoce uma Vida - LT-PI)\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3️⃣  FLUXO MENSAL (computeMonthlyAnimalFlow)\n");

  const monthlyFlow = computeMonthlyAnimalFlow(dataset, 2026, ALL_STATES_VALUE);

  console.log("📈 Resultado da função computeMonthlyAnimalFlow:\n");
  console.log("Mês | Entradas | Adoções | Devoluções | Eutanásias | Mortes | Retorno Tutor | Retorno Local");
  console.log("----|----------|---------|------------|------------|--------|---------------|---------------");

  monthlyFlow.forEach((m) => {
    if (
      m.entradas > 0 ||
      m.adocoes > 0 ||
      m.devolucoes > 0 ||
      m.eutanasias > 0 ||
      m.mortesNaturais > 0 ||
      m.retornoTutor > 0 ||
      m.retornoLocal > 0
    ) {
      console.log(
        `${m.label.padEnd(3)} | ${String(m.entradas).padStart(8)} | ${String(m.adocoes).padStart(7)} | ${String(m.devolucoes).padStart(10)} | ${String(m.eutanasias).padStart(10)} | ${String(m.mortesNaturais).padStart(6)} | ${String(m.retornoTutor).padStart(13)} | ${String(m.retornoLocal).padStart(13)}`
      );
    }
  });

  console.log("\n✅ ESPERADO para JAN/2026:");
  console.log("   Entradas: 2 (2 gatos, 0 cães)");
  console.log("   Adoções: 4 (4 gatos, 0 cães)");
  console.log("   Demais: 0\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4️⃣  CÁLCULO MANUAL (para validação)\n");

  console.log("Somando manualmente os dados dos movimentos de JAN/2026:\n");

  let totalEntradas = 0;
  let totalEntradasGatos = 0;
  let totalAdocoes = 0;
  let totalAdocoesGatos = 0;

  movements2026
    .filter((m) => m.month === 1)
    .forEach((m) => {
      totalEntradas += m.metrics.entradas;
      totalEntradasGatos += m.metrics.entradasGatos;
      totalAdocoes += m.metrics.adocoes;
      totalAdocoesGatos += m.metrics.adocoesGatos;

      console.log(`  ${m.postType} (Abrigo ${m.shelterId}):`);
      console.log(`    Cães: ${m.metrics.entradas} entradas, ${m.metrics.adocoes} adoções`);
      console.log(`    Gatos: ${m.metrics.entradasGatos} entradas, ${m.metrics.adocoesGatos} adoções`);
    });

  console.log(`\n  TOTAIS:`);
  console.log(`    Entradas cães: ${totalEntradas}`);
  console.log(`    Entradas gatos: ${totalEntradasGatos}`);
  console.log(`    Entradas TOTAL: ${totalEntradas + totalEntradasGatos}`);
  console.log(`    Adoções cães: ${totalAdocoes}`);
  console.log(`    Adoções gatos: ${totalAdocoesGatos}`);
  console.log(`    Adoções TOTAL: ${totalAdocoes + totalAdocoesGatos}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("5️⃣  CONCLUSÃO\n");

  const jan2026 = monthlyFlow[0]; // Janeiro é índice 0

  console.log("🔍 COMPARAÇÃO:");
  console.log(
    `   Sistema calcula: ${jan2026.entradas} entradas, ${jan2026.adocoes} adoções`
  );
  console.log(
    `   Esperado: ${totalEntradas + totalEntradasGatos} entradas, ${totalAdocoes + totalAdocoesGatos} adoções\n`
  );

  if (
    jan2026.entradas === totalEntradas + totalEntradasGatos &&
    jan2026.adocoes === totalAdocoes + totalAdocoesGatos
  ) {
    console.log("✅ SISTEMA ESTÁ CORRETO!");
    console.log("   As funções de agregação estão calculando os valores corretamente.");
    console.log("   Se a tela mostra valores diferentes, o problema está nos componentes React.\n");
  } else {
    console.log("❌ SISTEMA ESTÁ ERRADO!");
    console.log("   As funções de agregação NÃO estão calculando corretamente.");
    console.log("   Há um bug no código de agregação.\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ VERIFICAÇÃO CONCLUÍDA!\n");
}

finalCheck2026().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
