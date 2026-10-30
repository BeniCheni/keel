import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const guard = fileURLToPath(new URL("../../tools/network/guard-setup.mjs", import.meta.url));

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    passWithNoTests: false,
    setupFiles: [guard],
  },
});
