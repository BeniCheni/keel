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

test("each banned token fails by itself, so dropping one token fails here", () => {
  const withNetwork = parseAllowlist("module\tFoundation\tThe store.\nmodule\tNetwork\tListed here so that only the token can fail.\n");
  const forms = [
    ["URLSession", "import Foundation\nlet x = URLSession.shared\n"],
    ["NWConnection", "import Foundation\nlet x = NWConnection(host: \"a\", port: 1)\n"],
    ["NSURLConnection", "import Foundation\nlet x = NSURLConnection()\n"],
    ["CFNetwork", "import Foundation\nlet x = kCFNetworkProxiesHTTPEnable\n"],
    ["WKWebView", "import Foundation\nlet x = WKWebView()\n"],
    ["SFSafariViewController", "import Foundation\nlet x = SFSafariViewController.self\n"],
    ["importNetwork", "import Foundation\nimport  Network\n"],
    ["Darwin", "import Foundation\nlet x = Darwin.EOF\n"],
    ["socket", "import Foundation\nlet x = socket(0, 0, 0)\n"],
    ["contentsOf", "import Foundation\nlet x = Data(contentsOf : url)\n"],
    ["URL(string", "import Foundation\nlet x = URL( string: \"a\")\n"],
  ];
  for (const [token, body] of forms) {
    const root = mkdtempSync(join(tmpdir(), "keel-ios-"));
    mkdirSync(join(root, "apps/ios"), { recursive: true });
    writeFileSync(join(root, "apps/ios/Plant.swift"), body);
    expect(sourceHits(root, withNetwork), token).toEqual([{ file: "apps/ios/Plant.swift", rule: "token", detail: token }]);
  }
}, NESTED_RUN_TIMEOUT_MS);

test("the repo source check passes", () => {
  const result = run(process.execPath, ["tools/ios/source-check.mjs", repoRoot]);
  expect(result.status).toBe(0);
  expect(result.stdout).toBe("");
}, NESTED_RUN_TIMEOUT_MS);
