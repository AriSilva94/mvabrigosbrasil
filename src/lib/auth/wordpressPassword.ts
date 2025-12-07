import crypto from "crypto";
import bcrypt from "bcryptjs";
// @ts-expect-error - pacote não fornece tipos
import { PasswordHash as PasswordHashImport } from "wordpress-hash-node";

type PasswordHashCtor = new (
  iterationCountLog2?: number,
  portableHashes?: boolean
) => {
  HashPassword(password: string): string | null;
  CheckPassword(password: string, storedHash: string): boolean;
};

const PasswordHash = PasswordHashImport as unknown as PasswordHashCtor;

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
      const phpass = new PasswordHash(8, true);
      return Boolean(phpass.CheckPassword(trimmedPassword, trimmedHash));
    }

    return false;
  } catch (error) {
    console.error("Erro ao validar senha do WordPress", error);
    return false;
  }
}
