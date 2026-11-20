import { mkdtempSync, rmSync } from "node:fs";
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
  currentDirectory: ["Foundation", "_ = FileManager.default.currentDirectoryPath"],
  returnedURL: ["Foundation", "_ = URLComponents().url"],
  gethostbyname: ["Foundation", '_ = gethostbyname("example.invalid")'],
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

const passOnePrograms = {
  gethostbyname: '_ = gethostbyname("example.invalid")',
  swiftStreams: 'var i: InputStream?; var o: OutputStream?\nStream.getStreamsToHost(withName: "example.invalid", port: 80, inputStream: &i, outputStream: &o)\ni?.open()',
  cfStreams: 'var r: Unmanaged<CFReadStream>?; var wr: Unmanaged<CFWriteStream>?\nCFStreamCreatePairWithSocketToHost(nil, "example.invalid" as CFString, 80, &r, &wr)',
  urlLines: 'var c = URLComponents(); c.scheme = "https"; c.host = "example.invalid"\nif let u = c.url { Task { for try await _ in u.lines {} } }',
  urlResourceBytes: 'var c = URLComponents(); c.scheme = "https"; c.host = "example.invalid"\nif let u = c.url { Task { for try await _ in u.resourceBytes {} } }',
};

const sdkPath = iphoneosSdk();
const sdkRequired = process.env.KEEL_IOS_CONTROLS === "required";

// Without an iOS 27 SDK the controls cannot compile. That reads as skipped, never as passed,
// and the swift job sets KEEL_IOS_CONTROLS=required so that a missing SDK fails there.
test.skipIf(!sdkPath && !sdkRequired)("each binary rule fails its own control", ({ onTestFinished }) => {
  if (!sdkPath) throw new Error("ios-controls: no iOS SDK at 27.0 or later was found, and KEEL_IOS_CONTROLS is required");
  const dir = mkdtempSync(join(tmpdir(), "keel-bin-"));
  onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
  const allow = loadAllowlist(repoRoot);
  const bins = {};
  for (const [name, [module, body]] of Object.entries(programs)) {
    bins[name] = compileControl(dir, name, `import ${module}\n${body}\n`, sdkPath);
  }
  const isolated = {
    socket: ["named"],
    connect: ["named"],
    getaddrinfo: ["named"],
    pdfnourl: ["framework", "PDFKit"],
    components: ["urlSymbol", "URLComponents.init(url:"],
    returnedURL: ["urlSymbol", "URLComponents.url.getter"],
    listdir: ["selector", "contentsOfDirectoryAtURL:"],
    currentDirectory: ["selector", "currentDirectoryPath"],
    gethostbyname: ["undefinedSymbol", "_gethostbyname"],
    string: ["contentsOf"],
    nsdata: ["contentsOfURL"],
    stream: ["initWithURL"],
  };
  for (const [name, [rule, blocked]] of Object.entries(isolated)) {
    const surface = binarySurface(bins[name]);
    expect(surface.ok, surface.error ?? name).toBe(true);
    // This list is intentionally wrong for the unconditional rules. Give the
    // binary every entry except the one the control is testing.
    const scratch = {
      frameworks: surface.frameworks.filter((value) => rule !== "framework" || value !== blocked),
      selectors: surface.selectors.filter((value) => rule !== "selector" || !value.startsWith(blocked)),
      symbols: surface.urlSymbols.filter((value) => rule !== "urlSymbol" || !value.includes(blocked)),
      undefinedSymbols: surface.undefinedSymbols.filter((value) => rule !== "undefinedSymbol" || value !== blocked),
    };
    const result = evaluateBinary(bins[name], scratch);
    expect(result.status, name).toBe(1);
    expect(result.counts[rule], name).toBeGreaterThan(0);
    const dropped = evaluateBinary(bins[name], scratch, RULES.filter((item) => item !== rule));
    expect(dropped.status, name).toBe(0);
  }
  // With the allowlist as committed, each of those controls still fails, and its own rule is
  // among the rules that fire. An entry that approved one of them would pass unnoticed otherwise.
  for (const [name, [rule]] of Object.entries(isolated)) {
    const result = evaluateBinary(bins[name], allow);
    expect(result.status, name).toBe(1);
    expect(result.counts[rule], name).toBeGreaterThan(0);
  }
  for (const name of ["urlsession", "data", "pdfurl", "attr", "openurl"]) {
    expect(evaluateBinary(bins[name], allow).status).toBe(1);
  }
  for (const name of ["urlsession", "data"]) {
    expect(evaluateBinary(bins[name], allow).counts.named, name).toBeGreaterThan(0);
  }
  expect(evaluateBinary(bins.allowed, allow).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

for (const [name, body] of Object.entries(passOnePrograms)) {
  test.skipIf(!sdkPath && !sdkRequired)("rejects Pass 1's " + name + " control", ({ onTestFinished }) => {
    if (!sdkPath) throw new Error("ios-controls: no required iOS SDK at 27.0 or later");
    const dir = mkdtempSync(join(tmpdir(), "keel-bin-"));
    onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
    const bin = compileControl(dir, name, "import Foundation\n" + body + "\n", sdkPath);
    expect(evaluateBinary(bin, loadAllowlist(repoRoot)).status).toBe(1);
  }, NESTED_RUN_TIMEOUT_MS);
}

const expandedCases = [
  ["currentDirectory", "selector"],
  ["returnedURL", "urlSymbol"],
  ["gethostbyname", "undefinedSymbol"],
];

for (const [name, rule] of expandedCases) {
  test.skipIf(!sdkPath && !sdkRequired)("rejects an unlisted " + rule + " in " + name, ({ onTestFinished }) => {
    if (!sdkPath) throw new Error("ios-controls: no required iOS SDK at 27.0 or later");
    const dir = mkdtempSync(join(tmpdir(), "keel-bin-"));
    onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
    const [module, body] = programs[name];
    const bin = compileControl(dir, name, "import " + module + "\n" + body + "\n", sdkPath);
    const result = evaluateBinary(bin, loadAllowlist(repoRoot));
    expect(result.status).toBe(1);
    expect(result.counts[rule]).toBeGreaterThan(0);
  }, NESTED_RUN_TIMEOUT_MS);
}
