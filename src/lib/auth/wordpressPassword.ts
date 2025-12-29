import crypto from "crypto";
import bcrypt from "bcryptjs";

// Lazy import do PasswordHash para evitar problemas de inicialização
let PasswordHashClass: any = null;

function getPasswordHash() {
  if (!PasswordHashClass) {
    // wordpress-hash-node exporta diretamente a classe, não um objeto
    PasswordHashClass = require("wordpress-hash-node");
  }
  return PasswordHashClass;
}

/**
 * Gera um hash PHPass do WordPress para uma senha
 * Usado para atualizar senhas MD5 temporárias para o formato correto
 */
export function generateWordpressHash(password: string): string {
  try {
    const PasswordHash = getPasswordHash();
    const phpass = new PasswordHash(8, true);
    const hash = phpass.HashPassword(password);
    return hash ?? "";
  } catch (error) {
    console.error("Erro ao gerar hash WordPress", error);
    return "";
  }
}

/**
 * Verifica se um hash é MD5 temporário (32 caracteres hexadecimais)
 */
export function isMd5Hash(hash: string): boolean {
  const trimmed = hash.trim();
  return trimmed.length === 32 && /^[a-f0-9]+$/i.test(trimmed);
}

export async function verifyWordpressPassword(
  password: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash || !password) {
    return false;
  }

  const trimmedHash = hash.trim();
  const trimmedPassword = password.trim();

  const prepareWordpressPassword = (pwd: string) => {
    // Replica do fluxo WP 6.8 para hashes $wp$: stripslashes + htmlspecialchars (ENT_COMPAT),
    // seguido de HMAC-SHA384 com chave "wp-sha384", em base64.
    const withoutSlashes = pwd.replace(/\\(.)/g, "$1");
    const escaped = withoutSlashes
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const hmac = crypto
      .createHmac("sha384", "wp-sha384")
      .update(escaped)
      .digest();
    return Buffer.from(hmac).toString("base64");
  };

  try {
    if (trimmedHash.startsWith("$wp")) {
      const normalizedHash = trimmedHash.replace(/^\$wp/, "");
      const compatHash = normalizedHash.startsWith("$2y$")
        ? normalizedHash.replace("$2y$", "$2a$")
        : normalizedHash;

      const preparedPassword = prepareWordpressPassword(trimmedPassword);
      return bcrypt.compare(preparedPassword, compatHash);
    }

    if (trimmedHash.startsWith("$P") || trimmedHash.startsWith("$H")) {
      const PasswordHash = getPasswordHash();
      const phpass = new PasswordHash(8, true);
      return Boolean(phpass.CheckPassword(trimmedPassword, trimmedHash));
    }

    // Fallback: MD5 temporário (usado para reset de senha em testes/migração)
    // Se o hash tem 32 caracteres e são apenas hexadecimais, pode ser MD5
    if (trimmedHash.length === 32 && /^[a-f0-9]+$/i.test(trimmedHash)) {
      const md5Hash = crypto.createHash('md5').update(trimmedPassword).digest('hex');
      return md5Hash === trimmedHash.toLowerCase();
    }

    return false;
  } catch (error) {
    console.error("Erro ao validar senha do WordPress", error);
    return false;
  }
}
