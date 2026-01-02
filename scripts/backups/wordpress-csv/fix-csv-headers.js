/**
 * Script: Corrigir Headers e Datas dos CSVs do WordPress
 *
 * Problemas corrigidos:
 *   1. Colunas em uppercase (ID → id)
 *   2. Datas inválidas do MySQL (0000-00-00 00:00:00 → NULL)
 *
 * Arquivos processados:
 *   - wp_users.csv (header + datas)
 *   - wp_posts.csv (header + datas)
 *
 * Uso:
 *   node fix-csv-headers.js
 */

const fs = require("fs");
const path = require("path");

const FILES_TO_FIX = [
  "wp_users.csv",
  "wp_posts.csv",
  "wp_postmeta.csv",
  "wp_usermeta.csv",
];

// Padrões de data inválida do MySQL
const INVALID_DATE_PATTERNS = [
  '"0000-00-00 00:00:00"',
  "0000-00-00 00:00:00",
  '"0000-00-00"',
  "0000-00-00",
];

function fixInvalidDates(line) {
  let fixed = line;

  // Substituir todas as datas inválidas por string vazia (NULL no CSV)
  for (const pattern of INVALID_DATE_PATTERNS) {
    // Se estiver entre aspas, substituir por aspas vazias ""
    if (pattern.startsWith('"')) {
      fixed = fixed.replaceAll(pattern, '""');
    } else {
      // Se não tiver aspas, substituir por vazio
      fixed = fixed.replaceAll(pattern, "");
    }
  }

  return fixed;
}

function fixMultilineValues(content) {
  // Esta função corrige valores que contêm quebras de linha dentro de campos com aspas
  // Problema: valores com \n dentro de "campo" quebram o CSV em múltiplas linhas

  const lines = [];
  let currentLine = "";
  let inQuotedField = false;
  let fieldStart = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      // Verifica se é aspas duplas (escape)
      if (nextChar === '"') {
        currentLine += '""';
        i++; // Pula a próxima aspas
        continue;
      }

      // Alterna estado de campo entre aspas
      inQuotedField = !inQuotedField;
      currentLine += char;
    } else if (char === "\n") {
      if (inQuotedField) {
        // Dentro de campo com aspas: substitui \n por espaço
        currentLine += " ";
      } else {
        // Fora de campo com aspas: é uma quebra de linha real
        lines.push(currentLine);
        currentLine = "";
      }
    } else if (char === "\r") {
      // Ignora \r se vier antes de \n
      if (nextChar !== "\n") {
        if (inQuotedField) {
          currentLine += " ";
        }
      }
    } else {
      currentLine += char;
    }
  }

  // Adiciona última linha se não estiver vazia
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

function fixCsvFile(filePath) {
  const baseName = path.basename(filePath);
  console.log(`\n📄 Processando: ${path.basename(filePath)}`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Arquivo não encontrado, pulando...`);
    return { fixed: false, stats: null };
  }

  // Ler arquivo
  let content = fs.readFileSync(filePath, "utf8");
  const originalLineCount = content.split("\n").length;

  // ========================================
  // 1. Corrigir valores multilinha (quebras dentro de campos)
  // ========================================
  console.log(`   🔍 Corrigindo valores multilinha...`);
  const fixedContent = fixMultilineValues(content);
  const multilineFixed = fixedContent !== content;

  if (multilineFixed) {
    const newLineCount = fixedContent.split("\n").length;
    const linesJoined = originalLineCount - newLineCount;
    console.log(
      `   🔧 Multilinha: ${linesJoined} quebras de linha incorretas corrigidas`
    );
    content = fixedContent;
  } else {
    console.log(`   ✅ Multilinha: nenhum problema encontrado`);
  }

  let lines = content.split("\n");

  if (lines.length === 0) {
    console.log(`   ⚠️  Arquivo vazio, pulando...`);
    return { fixed: false, stats: null };
  }

  let headerFixed = false;
  let datesFixed = 0;
  let anyChange = multilineFixed;
  let backslashesEscaped = 0;
  let rowsRemoved = 0;

  // ========================================
  // 0. (Somente wp_usermeta) Remover metadados irrelevantes problemáticos
  // ========================================
  if (baseName === "wp_usermeta.csv") {
    const blacklistKeys = new Set(["wp_yoast_notifications"]);
    const filtered = [lines[0]]; // keep header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      // meta_key é a 3a coluna; evitar split ingênuo por vírgula devido a valores com vírgula.
      // Aqui como meta_key não contém vírgula, podemos localizar por aspas.
      const parts = line.split('"');
      // estrutura esperada: "umeta_id","user_id","meta_key","meta_value"
      const metaKey = parts[5] ?? "";
      if (blacklistKeys.has(metaKey)) {
        rowsRemoved++;
        anyChange = true;
        continue;
      }
      filtered.push(line);
    }
    if (rowsRemoved > 0) {
      console.log(
        `   🔧 Removidas ${rowsRemoved} linhas de meta_key blacklist (ex.: wp_yoast_notifications)`
      );
    }
    lines = filtered;
  }

  // ========================================
  // 2. Corrigir header (primeira linha)
  // ========================================
  const originalHeader = lines[0];
  // Corrigir "ID" (com ou sem aspas) para "id"
  const fixedHeader = originalHeader.replace(/^"?ID"?(,|$)/, '"id"$1');

  if (originalHeader !== fixedHeader) {
    console.log(`   🔧 Header: "ID" → "id"`);
    lines[0] = fixedHeader;
    headerFixed = true;
    anyChange = true;
  } else {
    console.log(`   ✅ Header: já está correto`);
  }

  // ========================================
  // 3b. (Somente wp_usermeta) Escapar backslashes
  // ========================================
  if (baseName === "wp_usermeta.csv") {
    console.log(
      `   🔍 Escapando backslashes em meta_value (compatibilidade import UI Supabase)...`
    );
    // CSV -> JSON -> E'...': precisamos que um '\' real vire '\\\\' no arquivo
    // para sobreviver às duas camadas de escape.
    const BACKSLASH_ESCAPED = /\\/g;
    for (let i = 1; i < lines.length; i++) {
      const original = lines[i];
      const fixed = original.replace(BACKSLASH_ESCAPED, "\\\\\\\\");
      if (original !== fixed) {
        lines[i] = fixed;
        backslashesEscaped++;
        anyChange = true;
      }
    }
    if (backslashesEscaped > 0) {
      console.log(`   🔧 Backslashes: ${backslashesEscaped} linhas alteradas`);
    } else {
      console.log(`   ✅ Backslashes: nenhuma alteração necessária`);
    }
  }

  // ========================================
  // 3. Corrigir datas inválidas
  // ========================================
  console.log(`   🔍 Verificando datas inválidas...`);

  for (let i = 1; i < lines.length; i++) {
    const original = lines[i];
    const fixed = fixInvalidDates(original);

    if (original !== fixed) {
      lines[i] = fixed;
      datesFixed++;
      anyChange = true;
    }
  }

  if (datesFixed > 0) {
    console.log(
      `   🔧 Datas: ${datesFixed} linhas com datas inválidas corrigidas`
    );
  } else {
    console.log(`   ✅ Datas: nenhuma data inválida encontrada`);
  }

  // ========================================
  // 4. Salvar se houve mudanças
  // ========================================
  if (!anyChange) {
    console.log(`   ✅ Arquivo já está totalmente correto!`);
    return {
      fixed: false,
      stats: { headerFixed, datesFixed, multilineFixed: 0 },
    };
  }

  // Escrever arquivo corrigido diretamente (sem backup)
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log(`   ✅ Arquivo corrigido e salvo!`);

  const multilineCount = multilineFixed ? originalLineCount - lines.length : 0;
  return {
    fixed: true,
    stats: { headerFixed, datesFixed, multilineFixed: multilineCount },
  };
}

function main() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗"
  );
  console.log("║  Corrigir Headers e Datas dos CSVs do WordPress          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const scriptDir = __dirname;
  let totalFixed = 0;
  let totalHeadersFixed = 0;
  let totalDatesFixed = 0;
  let totalMultilineFixed = 0;

  for (const fileName of FILES_TO_FIX) {
    const filePath = path.join(scriptDir, fileName);
    const result = fixCsvFile(filePath);

    if (result.fixed) {
      totalFixed++;
      if (result.stats.headerFixed) totalHeadersFixed++;
      totalDatesFixed += result.stats.datesFixed;
      totalMultilineFixed += result.stats.multilineFixed;
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 RESUMO:\n");
  console.log(`   Arquivos processados:     ${FILES_TO_FIX.length}`);
  console.log(`   Arquivos modificados:     ${totalFixed}`);
  console.log(`   Headers corrigidos:       ${totalHeadersFixed}`);
  console.log(`   Linhas com datas fix:     ${totalDatesFixed}`);
  console.log(`   Quebras multilinha fix:   ${totalMultilineFixed}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ Arquivos prontos para importar no Supabase!\n");
  console.log("📌 Próximos passos:");
  console.log("   1. No Supabase, vá em Table Editor");
  console.log("   2. Importe os CSVs:");
  console.log("      • wp_users.csv → wp_users_raw");
  console.log("      • wp_posts.csv → wp_posts_raw");
  console.log("      • wp_postmeta.csv → wp_postmeta_raw");
  console.log("      • wp_usermeta.csv → wp_usermeta_raw");
  console.log("   3. Execute os scripts de migração\n");

  process.exit(0);
}

main();
