import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { loadAllowlist } from "../allowlist.mjs";
import { RULES, binarySurface, evaluateBinary } from "../binary-check.mjs";
import { compileControl, iphoneosSdk } from "../compile-control.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot } from "../../acceptance/test/helpers.mjs";

const programs = {
  socket: ["Foundation", "_ = socket(0, 0, 0)"],
  connect: ["Foundation", "var a = sockaddr(); _ = connect(0, &a, socklen_t(MemoryLayout<sockaddr>.size))"],
  getaddrinfo: ["Foundation", "var r: UnsafeMutablePointer<addrinfo>?; _ = getaddrinfo(nil, nil, nil, &r)"],
  pdfnourl: ["PDFKit", "_ = PDFDocument()"],
  components: ["Foundation", "_ = URLComponents(url: URL(fileURLWithPath: \"synthetic\"), resolvingAgainstBaseURL: false)"],
  listdir: ["Foundation", "_ = try? FileManager.default.contentsOfDirectory(at: URL(fileURLWithPath: \"synthetic\"), includingPropertiesForKeys: nil)"],
  string: ["Foundation", "_ = try? String(contentsOf: URL(fileURLWithPath: \"synthetic\"), encoding: .utf8)"],
  nsdata: ["Foundation", "_ = NSData(contentsOf: URL(fileURLWithPath: \"synthetic\"))"],
  stream: ["Foundation", "_ = InputStream(url: URL(fileURLWithPath: \"synthetic\"))"],
  urlsession: ["Foundation", "_ = URLSession.shared"],
  data: ["Foundation", "_ = try? Data(contentsOf: URL(fileURLWithPath: \"synthetic\"))"],
  pdfurl: ["PDFKit", "_ = PDFDocument(url: URL(fileURLWithPath: \"synthetic\"))"],
  attr: ["UIKit", "_ = try? NSAttributedString(url: URL(fileURLWithPath: \"synthetic\"), options: [:], documentAttributes: nil)"],
  openurl: ["UIKit", "UIApplication.shared.open(URL(fileURLWithPath: \"synthetic\"))"],
  allowed: ["Foundation", "var b: [UInt8] = [1]\nb.append(contentsOf: [2])\nif let h = try? FileHandle(forReadingFrom: URL(fileURLWithPath: \"synthetic\")) { _ = try? h.readToEnd() }\nprint(b)"],
};

test("each binary rule fails its own control", () => {
  const sdkPath = iphoneosSdk();
  if (!sdkPath) return;
  const dir = mkdtempSync(join(tmpdir(), "keel-bin-"));
  const allow = loadAllowlist(repoRoot);
  const bins = {};
  for (const [name, [module, body]] of Object.entries(programs)) {
    bins[name] = compileControl(dir, name, `import ${module}\n${body}\n`, sdkPath);
  }
  const alone = {
    socket: "named",
    connect: "named",
    getaddrinfo: "named",
    pdfnourl: "framework",
    components: "urlSymbol",
    listdir: "urlSelector",
  };
  for (const [name, rule] of Object.entries(alone)) {
    const result = evaluateBinary(bins[name], allow);
    expect(result.status).toBe(1);
    expect(result.counts[rule]).toBeGreaterThan(0);
    const dropped = evaluateBinary(bins[name], allow, RULES.filter((item) => item !== rule));
    expect(dropped.status).toBe(0);
  }
  const wrongBase = structuredClone(allow);
  for (const name of ["string", "nsdata", "stream"]) {
    const surface = binarySurface(bins[name]);
    expect(surface.ok).toBe(true);
    wrongBase.selectors.push(...surface.tokens.filter((token) => token.startsWith("initWithURL:") || token.includes("ContentsOfURL")));
    wrongBase.symbols.push("String.init(contentsOf:");
  }
  const isolated = { string: "contentsOf", nsdata: "contentsOfURL", stream: "initWithURL" };
  for (const [name, rule] of Object.entries(isolated)) {
    const result = evaluateBinary(bins[name], wrongBase);
    expect(result.status).toBe(1);
    expect(result.counts[rule]).toBeGreaterThan(0);
    const dropped = evaluateBinary(bins[name], wrongBase, RULES.filter((item) => item !== rule));
    expect(dropped.status).toBe(0);
  }
  for (const name of ["urlsession", "data", "pdfurl", "attr", "openurl"]) {
    expect(evaluateBinary(bins[name], allow).status).toBe(1);
  }
  expect(evaluateBinary(bins.allowed, allow).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);
