import { fileURLToPath, URL } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // O pool padrão (forks) falha com "failed to find the runner" no Vitest 5 + Node 24 no Windows.
    pool: "vmThreads",
    // O build standalone copia os specs para .next/ e eles rodariam duplicados.
    exclude: [...configDefaults.exclude, ".next/**"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
