/**
 * Sanitiza conteúdo de texto removendo qualquer HTML/script injection.
 * Múltiplas passadas para prevenir bypass com tags malformadas.
 *
 * Uso: chat de texto puro — nenhum HTML é permitido.
 */
export function sanitizeTextContent(input: string): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input;

  // 1. Remover tags HTML completas
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // 2. Remover < e > soltos (tags malformadas / incompletas)
  sanitized = sanitized.replace(/[<>]/g, "");

  // 3. Decodificar entities HTML comuns que poderiam esconder tags
  sanitized = sanitized
    .replace(/&lt;/gi, "")
    .replace(/&gt;/gi, "")
    .replace(/&#0*60;?/g, "")
    .replace(/&#0*62;?/g, "")
    .replace(/&#x0*3c;?/gi, "")
    .replace(/&#x0*3e;?/gi, "");

  // 4. Remover qualquer < ou > remanescente após decode
  sanitized = sanitized.replace(/[<>]/g, "");

  return sanitized.trim();
}
