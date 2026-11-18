import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { parseAllowlist } from "../allowlist.mjs";
import { sourceHits } from "../source-check.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "../../acceptance/test/helpers.mjs";

const allow = parseAllowlist("module\tFoundation\tThe store.\n");

test("the source check fails each banned form and an import that is not allowed", () => {
  const forms = [
    "import Foundation\nlet x = Data(contentsOf : url)\n",
    "import Foundation\nlet x = Darwin.socket\n",
    "import Foundation\nvar b = [1]\nb.append(contentsOf: [2])\n",
    "import PDFKit\n",
    "import Foundation\nlet x = URLSession.shared\n",
    "import Foundation\nlet x = NWConnection(host: \"a\", port: 1)\n",
    "import Foundation\nlet x = URL( string: \"a\")\n",
    "import  Network\n",
  ];
  for (const body of forms) {
    const root = mkdtempSync(join(tmpdir(), "keel-ios-"));
    mkdirSync(join(root, "apps/ios"), { recursive: true });
    writeFileSync(join(root, "apps/ios/Plant.swift"), body);
    expect(sourceHits(root, allow).length).toBeGreaterThan(0);
  }
}, NESTED_RUN_TIMEOUT_MS);

test("the repo source check passes", () => {
  const result = run(process.execPath, ["tools/ios/source-check.mjs", repoRoot]);
  expect(result.status).toBe(0);
  expect(result.stdout).toBe("");
}, NESTED_RUN_TIMEOUT_MS);
