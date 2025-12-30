/**
 * Script de Comparação: Dados Legados vs Novos
 *
 * Compara os dados retornados pelo dataLoader legado (wp_posts_raw/wp_postmeta_raw)
 * com os dados retornados pelo novo dataLoader (shelters/shelter_dynamics)
 *
 * Objetivo: Garantir que a migração das tabelas não alterou nenhum dado exibido
 * na página /banco-de-dados
 *
 * Uso:
 *   npx tsx scripts/migrations/banco-de-dados/compare-data-sources.ts
 */

import * as fs from "fs";
import * as path from "path";
import { loadDatabaseDataset } from "../../src/lib/database/dataLoader";
import { loadDatabaseDatasetNew } from "../../src/lib/database/dataLoaderNew";
import type { DatabaseDataset, MovementRecord, ShelterRecord } from "../../src/types/database.types";

// ========================================
// CARREGAMENTO DE VARIÁVEIS DE AMBIENTE
// ========================================

function loadEnvFile() {
  const envPath = path.join(__dirname, "../../.env.local");

  if (!fs.existsSync(envPath)) {
    console.error("❌ Erro: Arquivo .env.local não encontrado na raiz do projeto");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent.split("\n");

  lines.forEach((line) => {
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

// ========================================
// UTILITÁRIOS DE COMPARAÇÃO
// ========================================

interface ComparisonResult {
  identical: boolean;
  differences: string[];
  stats: {
    legacy: {
      sheltersCount: number;
      movementsCount: number;
      yearsCount: number;
      statesCount: number;
    };
    new: {
      sheltersCount: number;
      movementsCount: number;
      yearsCount: number;
      statesCount: number;
    };
  };
}

function compareShelters(legacy: ShelterRecord[], newData: ShelterRecord[]): string[] {
  const differences: string[] = [];

  // Criar mapas por ID
  const legacyMap = new Map(legacy.map((s) => [s.id, s]));
  const newMap = new Map(newData.map((s) => [s.id, s]));

  // Verificar contagens
  if (legacy.length !== newData.length) {
    differences.push(
      `❌ Contagem de abrigos diferente: Legacy=${legacy.length}, Novo=${newData.length}`
    );
  }

  // Verificar IDs ausentes
  const legacyIds = new Set(legacy.map((s) => s.id));
  const newIds = new Set(newData.map((s) => s.id));

  const missingInNew = [...legacyIds].filter((id) => !newIds.has(id));
  const missingInLegacy = [...newIds].filter((id) => !legacyIds.has(id));

  if (missingInNew.length > 0) {
    differences.push(`❌ IDs ausentes no novo: ${missingInNew.slice(0, 10).join(", ")}${missingInNew.length > 10 ? "..." : ""}`);
  }

  if (missingInLegacy.length > 0) {
    differences.push(`❌ IDs ausentes no legado: ${missingInLegacy.slice(0, 10).join(", ")}${missingInLegacy.length > 10 ? "..." : ""}`);
  }

  // Comparar registros comuns
  const commonIds = [...legacyIds].filter((id) => newIds.has(id));
  let fieldDifferences = 0;

  for (const id of commonIds) {
    const legacyShelter = legacyMap.get(id)!;
    const newShelter = newMap.get(id)!;

    const shelterDiffs: string[] = [];

    if (legacyShelter.title !== newShelter.title) {
      shelterDiffs.push(`title: "${legacyShelter.title}" → "${newShelter.title}"`);
    }
    if (legacyShelter.year !== newShelter.year) {
      shelterDiffs.push(`year: ${legacyShelter.year} → ${newShelter.year}`);
    }
    if (legacyShelter.month !== newShelter.month) {
      shelterDiffs.push(`month: ${legacyShelter.month} → ${newShelter.month}`);
    }
    if (legacyShelter.state !== newShelter.state) {
      shelterDiffs.push(`state: "${legacyShelter.state}" → "${newShelter.state}"`);
    }
    if (legacyShelter.type !== newShelter.type) {
      shelterDiffs.push(`type: "${legacyShelter.type}" → "${newShelter.type}"`);
    }

    if (shelterDiffs.length > 0) {
      fieldDifferences++;
      if (fieldDifferences <= 10) {
        differences.push(`❌ Abrigo ID=${id}: ${shelterDiffs.join(", ")}`);
      }
    }
  }

  if (fieldDifferences > 10) {
    differences.push(`❌ ... e mais ${fieldDifferences - 10} abrigos com diferenças`);
  }

  return differences;
}

function compareMovements(legacy: MovementRecord[], newData: MovementRecord[]): string[] {
  const differences: string[] = [];

  // Criar mapas por ID
  const legacyMap = new Map(legacy.map((m) => [m.id, m]));
  const newMap = new Map(newData.map((m) => [m.id, m]));

  // Verificar contagens
  if (legacy.length !== newData.length) {
    differences.push(
      `❌ Contagem de movimentos diferente: Legacy=${legacy.length}, Novo=${newData.length}`
    );
  }

  // Verificar IDs ausentes
  const legacyIds = new Set(legacy.map((m) => m.id));
  const newIds = new Set(newData.map((m) => m.id));

  const missingInNew = [...legacyIds].filter((id) => !newIds.has(id));
  const missingInLegacy = [...newIds].filter((id) => !legacyIds.has(id));

  if (missingInNew.length > 0) {
    differences.push(`❌ IDs ausentes no novo: ${missingInNew.slice(0, 10).join(", ")}${missingInNew.length > 10 ? "..." : ""}`);
  }

  if (missingInLegacy.length > 0) {
    differences.push(`❌ IDs ausentes no legado: ${missingInLegacy.slice(0, 10).join(", ")}${missingInLegacy.length > 10 ? "..." : ""}`);
  }

  // Comparar registros comuns
  const commonIds = [...legacyIds].filter((id) => newIds.has(id));
  let fieldDifferences = 0;

  for (const id of commonIds) {
    const legacyMovement = legacyMap.get(id)!;
    const newMovement = newMap.get(id)!;

    const movementDiffs: string[] = [];

    if (legacyMovement.postType !== newMovement.postType) {
      movementDiffs.push(`postType: "${legacyMovement.postType}" → "${newMovement.postType}"`);
    }
    if (legacyMovement.year !== newMovement.year) {
      movementDiffs.push(`year: ${legacyMovement.year} → ${newMovement.year}`);
    }
    if (legacyMovement.month !== newMovement.month) {
      movementDiffs.push(`month: ${legacyMovement.month} → ${newMovement.month}`);
    }
    if (legacyMovement.shelterId !== newMovement.shelterId) {
      movementDiffs.push(`shelterId: ${legacyMovement.shelterId} → ${newMovement.shelterId}`);
    }
    if (legacyMovement.shelterState !== newMovement.shelterState) {
      movementDiffs.push(`shelterState: "${legacyMovement.shelterState}" → "${newMovement.shelterState}"`);
    }
    if (legacyMovement.shelterType !== newMovement.shelterType) {
      movementDiffs.push(`shelterType: "${legacyMovement.shelterType}" → "${newMovement.shelterType}"`);
    }

    // Comparar métricas
    const metricKeys: Array<keyof MovementRecord["metrics"]> = [
      "entradas",
      "entradasGatos",
      "adocoes",
      "adocoesGatos",
      "devolucoes",
      "devolucoesGatos",
      "eutanasias",
      "eutanasiasGatos",
      "mortesNaturais",
      "mortesNaturaisGatos",
      "retornoTutor",
      "retornoTutorGatos",
      "retornoLocal",
      "retornoLocalGatos",
    ];

    for (const key of metricKeys) {
      if (legacyMovement.metrics[key] !== newMovement.metrics[key]) {
        movementDiffs.push(
          `metrics.${key}: ${legacyMovement.metrics[key]} → ${newMovement.metrics[key]}`
        );
      }
    }

    if (movementDiffs.length > 0) {
      fieldDifferences++;
      if (fieldDifferences <= 10) {
        differences.push(`❌ Movimento ID=${id}: ${movementDiffs.join(", ")}`);
      }
    }
  }

  if (fieldDifferences > 10) {
    differences.push(`❌ ... e mais ${fieldDifferences - 10} movimentos com diferenças`);
  }

  return differences;
}

function compareArrays<T>(legacy: T[], newData: T[], label: string): string[] {
  const differences: string[] = [];

  if (legacy.length !== newData.length) {
    differences.push(
      `❌ Contagem de ${label} diferente: Legacy=${legacy.length}, Novo=${newData.length}`
    );
  }

  const legacySet = new Set(legacy);
  const newSet = new Set(newData);

  const missingInNew = legacy.filter((item) => !newSet.has(item));
  const missingInLegacy = newData.filter((item) => !legacySet.has(item));

  if (missingInNew.length > 0) {
    differences.push(`❌ ${label} ausentes no novo: ${missingInNew.join(", ")}`);
  }

  if (missingInLegacy.length > 0) {
    differences.push(`❌ ${label} ausentes no legado: ${missingInLegacy.join(", ")}`);
  }

  return differences;
}

function compareDatasets(legacy: DatabaseDataset, newData: DatabaseDataset): ComparisonResult {
  const differences: string[] = [];

  console.log("\n📊 Comparando Abrigos...");
  const shelterDiffs = compareShelters(legacy.shelters, newData.shelters);
  differences.push(...shelterDiffs);

  console.log("📊 Comparando Movimentos...");
  const movementDiffs = compareMovements(legacy.movements, newData.movements);
  differences.push(...movementDiffs);

  console.log("📊 Comparando Anos...");
  const yearDiffs = compareArrays(legacy.years, newData.years, "anos");
  differences.push(...yearDiffs);

  console.log("📊 Comparando Estados...");
  const stateDiffs = compareArrays(legacy.states, newData.states, "estados");
  differences.push(...stateDiffs);

  return {
    identical: differences.length === 0,
    differences,
    stats: {
      legacy: {
        sheltersCount: legacy.shelters.length,
        movementsCount: legacy.movements.length,
        yearsCount: legacy.years.length,
        statesCount: legacy.states.length,
      },
      new: {
        sheltersCount: newData.shelters.length,
        movementsCount: newData.movements.length,
        yearsCount: newData.years.length,
        statesCount: newData.states.length,
      },
    },
  };
}

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  COMPARAÇÃO: Dados Legados vs Novos                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📥 Carregando dados legados (wp_posts_raw + wp_postmeta_raw)...");
  const legacyData = await loadDatabaseDataset();
  console.log("✅ Dados legados carregados");

  console.log("\n📥 Carregando dados novos (shelters + shelter_dynamics)...");
  const newData = await loadDatabaseDatasetNew();
  console.log("✅ Dados novos carregados\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const result = compareDatasets(legacyData, newData);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 ESTATÍSTICAS:\n");

  console.log("LEGADO:");
  console.log(`  Abrigos:     ${result.stats.legacy.sheltersCount}`);
  console.log(`  Movimentos:  ${result.stats.legacy.movementsCount}`);
  console.log(`  Anos:        ${result.stats.legacy.yearsCount}`);
  console.log(`  Estados:     ${result.stats.legacy.statesCount}\n`);

  console.log("NOVO:");
  console.log(`  Abrigos:     ${result.stats.new.sheltersCount}`);
  console.log(`  Movimentos:  ${result.stats.new.movementsCount}`);
  console.log(`  Anos:        ${result.stats.new.yearsCount}`);
  console.log(`  Estados:     ${result.stats.new.statesCount}\n`);

  if (result.identical) {
    console.log("✅ SUCESSO! Os dados são IDÊNTICOS!\n");
    console.log("✅ É seguro migrar para o novo dataLoader.\n");
    process.exit(0);
  } else {
    console.log("❌ FALHA! Foram encontradas diferenças:\n");
    result.differences.forEach((diff) => console.log(`   ${diff}`));
    console.log("\n❌ Não migre até corrigir todas as diferenças.\n");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Erro ao executar comparação:", error);
  process.exit(1);
});
