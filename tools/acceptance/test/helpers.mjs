import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

export const NESTED_RUN_TIMEOUT_MS = 180_000;

export function repoTempPath(directory, suffix) {
  return join(directory, `zz-${process.pid}-${randomBytes(8).toString("hex")}${suffix}`);
}

export function spawnCollect(command, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: opts.cwd ?? repoRoot,
      env: opts.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (status) => {
      if (settled) return;
      settled = true;
      resolve({ status, stdout, stderr });
    };
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", () => finish(1));
    child.on("close", (code) => finish(code ?? 1));
  });
}

const gitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: "keel-test",
  GIT_AUTHOR_EMAIL: "noreply@example.com",
  GIT_COMMITTER_NAME: "keel-test",
  GIT_COMMITTER_EMAIL: "noreply@example.com",
};

export function run(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    cwd: opts.cwd ?? repoRoot,
    env: opts.env ?? process.env,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export function write(root, rel, data) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
}

export function git(root, args) {
  return run("git", ["-c", "commit.gpgsign=false", ...args], { cwd: root, env: gitEnv });
}

export function tempGit() {
  const root = mkdtempSync(join(tmpdir(), "keel-"));
  const init = git(root, ["init", "-b", "main"]);
  if (init.status !== 0) throw new Error("git init failed");
  return {
    root,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export function commitAll(root, message) {
  const added = git(root, ["add", "-A"]);
  if (added.status !== 0) throw new Error("git add failed");
  const committed = git(root, ["commit", "-m", message]);
  if (committed.status !== 0) throw new Error("git commit failed");
}

export function pointOrigin(root) {
  const result = git(root, ["update-ref", "refs/remotes/origin/main", "HEAD"]);
  if (result.status !== 0) throw new Error("update-ref failed");
}

export function cleanRepo() {
  const repo = tempGit();
  write(repo.root, "tools/tripwire/allowlist.txt", "");
  write(repo.root, "tools/tripwire/vendors.txt", "");
  write(repo.root, "README.md", "clean\n");
  commitAll(repo.root, "init");
  pointOrigin(repo.root);
  return repo;
}

export function tripwire(root) {
  return run(process.execPath, ["tools/tripwire/cli.mjs", root]);
}

export function leaked(result, secret) {
  return result.stdout.includes(secret) || result.stderr.includes(secret);
}
