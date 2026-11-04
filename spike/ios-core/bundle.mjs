import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const MARK = {
  process: "__KEEL_MARK_process__",
  globalThis: "__KEEL_MARK_globalThis__",
  global: "__KEEL_MARK_global__",
  self: "__KEEL_MARK_self__",
  window: "__KEEL_MARK_window__",
};

const shared = {
  bundle: true,
  platform: "neutral",
  format: "iife",
  globalName: "KeelCore",
  mainFields: ["module", "main"],
  logLevel: "silent",
  metafile: true,
  write: false,
};

function standalonePlugin(root) {
  const fromCore = createRequire(join(root, "packages/core/package.json"));
  const Ajv = fromCore("ajv/dist/2020.js").default;
  const standaloneCode = fromCore("ajv/dist/standalone").default;
  const schema = JSON.parse(readFileSync(join(root, "schemas/mln-terms/0.1.json"), "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: true, code: { source: true, esm: true } });
  const generated = standaloneCode(ajv, ajv.compile(schema));
  const termsDir = join(root, "packages/core/src/terms");
  return {
    name: "standalone",
    setup(build) {
      build.onResolve({ filter: /^generated-validator$/ }, (args) => ({
        path: args.path,
        namespace: "gen",
      }));
      build.onLoad({ filter: /.*/, namespace: "gen" }, () => ({
        contents: generated,
        loader: "js",
        resolveDir: termsDir,
      }));
      build.onLoad({ filter: /schema-map\.ts$/ }, (args) => {
        const src = readFileSync(args.path, "utf8");
        const out = src
          .replace('import Ajv from "ajv/dist/2020.js";', 'import validate from "generated-validator";')
          .replace(/import schema from [^\n]+\n/, "")
          .replace(/const ajv = new Ajv\([^\n]+\n/, "")
          .replace(/const validate = ajv\.compile\(schema\);\n/, "");
        if (out === src) throw new Error("the standalone swap did not apply");
        return { contents: out, loader: "ts", resolveDir: termsDir };
      });
    },
  };
}

function dedupeLocaleComparePlugin() {
  const needle = "(left.path < right.path ? -1 : left.path > right.path ? 1 : 0)";
  const replacement = "left.path.localeCompare(right.path)";
  return {
    name: "dedupe-localecompare",
    setup(build) {
      build.onLoad({ filter: /\/load\.ts$/ }, (args) => {
        const src = readFileSync(args.path, "utf8");
        if (!src.includes(needle)) throw new Error("the dedupe swap did not apply");
        return { contents: src.replace(needle, replacement), loader: "ts" };
      });
    },
  };
}

function externalizeUnresolved() {
  return {
    name: "externalize-unresolved",
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (args.pluginData?.resolving) return null;
        if (args.namespace === "gen") return null;
        if (args.path.startsWith(".") || args.path.startsWith("/") || args.path.startsWith("\0")) return null;
        const result = await build.resolve(args.path, {
          resolveDir: args.resolveDir,
          kind: args.kind,
          namespace: args.namespace,
          pluginData: { resolving: true },
        });
        if (result.errors.length > 0) return { path: args.path, external: true };
        return result;
      });
    },
  };
}

export function coreDir(root) {
  return join(root, "packages/core/src");
}

export async function bundleVariant(root, variant, options = {}) {
  const esbuild = createRequire(join(root, "spike/ios-core/package.json"))("esbuild");
  const plugins = [];
  if (variant === "standalone") plugins.push(standalonePlugin(root));
  if (options.dedupeLocaleCompare) plugins.push(dedupeLocaleComparePlugin());
  plugins.push(externalizeUnresolved());
  const planted = options.planted ?? "";
  const entryDir = coreDir(root);
  const input = planted
    ? {
        stdin: {
          contents: `${planted}\nexport * from "./index.ts";\n`,
          resolveDir: entryDir,
          loader: "ts",
          sourcefile: "entry.ts",
        },
      }
    : { entryPoints: [join(entryDir, "index.ts")] };
  let result;
  try {
    result = await esbuild.build({
      ...shared,
      ...input,
      absWorkingDir: root,
      define: options.define,
      plugins,
    });
  } catch (error) {
    const text = error?.errors?.[0]?.text ?? error?.message ?? String(error);
    return { ok: false, error: text };
  }
  const text = result.outputFiles[0].text;
  const meta = result.metafile;
  const output = Object.values(meta.outputs)[0];
  const external = (output?.imports ?? []).filter((item) => item.external);
  return { ok: true, text, external, bytes: Buffer.byteLength(text) };
}

export function flagsFor(bundle) {
  const flags = [];
  for (const item of bundle.external) {
    if (item.path.startsWith("node:")) flags.push({ reason: "node", path: item.path });
    else flags.push({ reason: "require", path: item.path, kind: item.kind ?? "" });
  }
  for (const [name, mark] of Object.entries(MARK)) {
    if (bundle.text.includes(mark)) flags.push({ reason: "mark", name });
  }
  if (/typeof require\b/.test(bundle.text)) flags.push({ reason: "typeof-require" });
  if (bundle.text.includes("montecarlo")) flags.push({ reason: "montecarlo" });
  return flags;
}

export async function inspectVariant(root, variant, planted = "") {
  const marked = await bundleVariant(root, variant, { planted, define: { ...MARK } });
  if (!marked.ok) return { ok: false, error: marked.error, flags: [{ reason: "build", detail: marked.error }] };
  return { ok: true, flags: flagsFor(marked), bytes: marked.bytes };
}
