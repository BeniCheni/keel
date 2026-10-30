import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const guard = fileURLToPath(new URL("./network/guard-setup.mjs", import.meta.url));

export default defineConfig({
  test: {
    include: ["**/test/**/*.test.mjs", "**/test/**/*.test.ts"],
    passWithNoTests: false,
    setupFiles: [guard],
  },
});
