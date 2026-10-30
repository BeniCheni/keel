import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

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
