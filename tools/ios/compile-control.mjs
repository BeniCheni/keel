import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

export function iphoneosSdk() {
  const version = spawnSync("xcrun", ["--sdk", "iphoneos", "--show-sdk-version"], { encoding: "utf8" });
  const path = spawnSync("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"], { encoding: "utf8" });
  if (version.status !== 0 || path.status !== 0) return null;
  const major = Number(version.stdout.trim().split(".")[0]);
  if (major < 27) return null;
  return path.stdout.trim();
}

export function compileControl(dir, name, body, sdkPath) {
  writeFileSync(join(dir, `${name}.swift`), body);
  const result = spawnSync(
    "swiftc",
    ["-sdk", sdkPath, "-target", "arm64-apple-ios27.0", "-module-cache-path", join(dir, "mc"), join(dir, `${name}.swift`), "-o", join(dir, name)],
    { encoding: "utf8", env: { ...process.env, CLANG_MODULE_CACHE_PATH: join(dir, "cc") } },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "swiftc failed");
  return join(dir, name);
}
