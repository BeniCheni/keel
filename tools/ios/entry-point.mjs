import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function isInvokedDirectly(moduleURL) {
  const entry = process.argv[1];
  // When Node runs inline code, argv[1] can be an argument instead of a file.
  return Boolean(entry && existsSync(entry) && realpathSync(entry) === realpathSync(fileURLToPath(moduleURL)));
}
