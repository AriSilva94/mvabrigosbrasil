/**
 * Testar parsing específico das dinâmicas de 2026
 * Ver por que os valores estão zerados
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

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

// Copiar funções do dataLoader para testar
function parseDate(date: string | null | undefined) {
  if (!date) return dayjs(Number.NaN);

  const direct = dayjs(date);
  if (direct.isValid()) return direct;

  const formats = [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss[Z]",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DD",
  ];

  for (const format of formats) {
    const parsed = dayjs(date, format, true);
    if (parsed.isValid()) return parsed;
  }

  return dayjs(Number.NaN);
}

function parseYear(date: string | null | undefined): number {
  const parsed = parseDate(date);
  return parsed.isValid() ? parsed.year() : 0;
}

function parseMonth(date: string | null | undefined): number {
  const parsed = parseDate(date);
  return parsed.isValid() ? parsed.month() + 1 : 1;
}

function parseMetaNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const normalized = String(value).replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

loadEnvFile();

async function testParse2026() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  TESTE: Parsing das dinâmicas de 2026                          ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Buscar dinâmicas de 2026
  const { data: dynamics, error } = await supabase
    .from("shelter_dynamics")
    .select("*")
    .gte("reference_date", "2026-01-01")
    .lt("reference_date", "2027-01-01");

  if (error) {
    console.error("❌ Erro:", error);
    return;
  }

  console.log(`Total de dinâmicas de 2026: ${dynamics?.length || 0}\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  dynamics?.forEach((dynamic, index) => {
    console.log(`📊 Dinâmica ${index + 1}: ${dynamic.id}\n`);

    console.log("   Dados brutos do banco:");
    console.log(`     shelter_id: ${dynamic.shelter_id}`);
    console.log(`     dynamic_type: ${dynamic.dynamic_type}`);
    console.log(`     kind: ${dynamic.kind}`);
    console.log(`     reference_date: ${dynamic.reference_date}`);
    console.log(`     reference_period: ${dynamic.reference_period}\n`);

    console.log("   Campos numéricos (brutos):");
    console.log(`     entradas_de_animais: ${dynamic.entradas_de_animais} (tipo: ${typeof dynamic.entradas_de_animais})`);
    console.log(`     entradas_de_gatos: ${dynamic.entradas_de_gatos} (tipo: ${typeof dynamic.entradas_de_gatos})`);
    console.log(`     adocoes_caes: ${dynamic.adocoes_caes} (tipo: ${typeof dynamic.adocoes_caes})`);
    console.log(`     adocoes_gatos: ${dynamic.adocoes_gatos} (tipo: ${typeof dynamic.adocoes_gatos})`);
    console.log(`     devolucoes_caes: ${dynamic.devolucoes_caes} (tipo: ${typeof dynamic.devolucoes_caes})`);
    console.log(`     devolucoes_gatos: ${dynamic.devolucoes_gatos} (tipo: ${typeof dynamic.devolucoes_gatos})`);
    console.log(`     eutanasias_caes: ${dynamic.eutanasias_caes} (tipo: ${typeof dynamic.eutanasias_caes})`);
    console.log(`     eutanasias_gatos: ${dynamic.eutanasias_gatos} (tipo: ${typeof dynamic.eutanasias_gatos})`);
    console.log(`     mortes_naturais_caes: ${dynamic.mortes_naturais_caes} (tipo: ${typeof dynamic.mortes_naturais_caes})`);
    console.log(`     mortes_naturais_gatos: ${dynamic.mortes_naturais_gatos} (tipo: ${typeof dynamic.mortes_naturais_gatos})\n`);

    // Testar parsing
    const year = parseYear(dynamic.reference_date);
    const month = parseMonth(dynamic.reference_date);

    console.log("   Após parseYear/parseMonth:");
    console.log(`     year: ${year}`);
    console.log(`     month: ${month}\n`);

    // Testar parseMetaNumber
    console.log("   Após parseMetaNumber:");
    console.log(`     entradas (cães): ${parseMetaNumber(dynamic.entradas_de_animais)}`);
    console.log(`     entradas (gatos): ${parseMetaNumber(dynamic.entradas_de_gatos)}`);
    console.log(`     adocoes (cães): ${parseMetaNumber(dynamic.adocoes_caes)}`);
    console.log(`     adocoes (gatos): ${parseMetaNumber(dynamic.adocoes_gatos)}\n`);

    // Verificar o objeto final que seria criado
    const movementRecord = {
      id: Math.abs(`${dynamic.shelter_id}-${dynamic.reference_period}-${dynamic.dynamic_type}`.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
      }, 0)),
      postType: dynamic.dynamic_type === "dinamica_lar" ? "dinamica_lar" : "dinamica",
      year,
      month,
      shelterId: null, // será preenchido depois
      metrics: {
        entradas: parseMetaNumber(dynamic.entradas_de_animais),
        entradasGatos: parseMetaNumber(dynamic.entradas_de_gatos),
        adocoes: parseMetaNumber(dynamic.adocoes_caes),
        adocoesGatos: parseMetaNumber(dynamic.adocoes_gatos),
        devolucoes: parseMetaNumber(dynamic.devolucoes_caes),
        devolucoesGatos: parseMetaNumber(dynamic.devolucoes_gatos),
        eutanasias: parseMetaNumber(dynamic.eutanasias_caes),
        eutanasiasGatos: parseMetaNumber(dynamic.eutanasias_gatos),
        mortesNaturais: parseMetaNumber(dynamic.mortes_naturais_caes),
        mortesNaturaisGatos: parseMetaNumber(dynamic.mortes_naturais_gatos),
      },
    };

    console.log("   MovementRecord final:");
    console.log(`     id: ${movementRecord.id}`);
    console.log(`     year: ${movementRecord.year}, month: ${movementRecord.month}`);
    console.log(`     metrics.entradas: ${movementRecord.metrics.entradas}`);
    console.log(`     metrics.entradasGatos: ${movementRecord.metrics.entradasGatos}`);
    console.log(`     metrics.adocoes: ${movementRecord.metrics.adocoes}`);
    console.log(`     metrics.adocoesGatos: ${movementRecord.metrics.adocoesGatos}\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  });

  console.log("✅ TESTE CONCLUÍDO!\n");
}

testParse2026().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
