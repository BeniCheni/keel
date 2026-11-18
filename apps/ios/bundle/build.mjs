import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const bundleOut = join(repoRoot, "apps/ios/Keel/Resources/core.js");

const needle = "(left.path < right.path ? -1 : left.path > right.path ? 1 : 0)";
const replacement = "left.path.localeCompare(right.path)";

function dedupeLocaleComparePlugin() {
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

export async function buildBundle(root, options = {}) {
  const esbuild = createRequire(join(here, "package.json"))("esbuild");
  const plugins = [];
  if (options.dedupeLocaleCompare) plugins.push(dedupeLocaleComparePlugin());
  plugins.push(externalizeUnresolved());
  const entryDir = join(root, "packages/core/src");
  const planted = options.planted ?? "";
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
      bundle: true,
      platform: "neutral",
      format: "iife",
      globalName: "KeelCore",
      mainFields: ["module", "main"],
      logLevel: "silent",
      metafile: true,
      write: false,
      absWorkingDir: root,
      plugins,
      ...input,
    });
  } catch (error) {
    const text = error?.errors?.[0]?.text ?? error?.message ?? String(error);
    return { ok: false, error: text };
  }
  const text = result.outputFiles[0].text;
  return { ok: true, text, metafile: result.metafile, bytes: Buffer.byteLength(text) };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = process.argv[2] ? process.argv[2] : repoRoot;
  const dedupeLocaleCompare = process.env.KEEL_IOS_DEDUPE === "localeCompare";
  const built = await buildBundle(root, { dedupeLocaleCompare });
  if (!built.ok) {
    process.stderr.write(`build failed ${built.error}\n`);
    process.exit(1);
  }
  if (dedupeLocaleCompare) {
    const scratch = process.env.KEEL_IOS_BUNDLE_OUT;
    if (!scratch) {
      process.stderr.write("build failed scratch bundle has no output path\n");
      process.exit(1);
    }
    mkdirSync(dirname(scratch), { recursive: true });
    writeFileSync(scratch, built.text);
  } else {
    mkdirSync(dirname(bundleOut), { recursive: true });
    writeFileSync(bundleOut, built.text);
  }
  process.stdout.write(`bytes=${built.bytes}\n`);
}
