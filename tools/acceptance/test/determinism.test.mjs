import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { check, splitTrees, treesOf, verifyDeterminism, verifyRegistered } from "../../fixtures/check.mjs";
import { commitAll, git, repoRoot, run, tempGit, write } from "./helpers.mjs";

test("fixtures:trees prints fixtures when nothing is registered", () => {
  expect(treesOf([])).toEqual(["fixtures"]);
  const result = run("pnpm", ["-s", "fixtures:trees"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toBe("fixtures\n");
  expect(splitTrees(result.stdout)).toEqual(["fixtures"]);
  expect(splitTrees("\n")).toEqual([""]);
});

test("a clean regeneration exits 0", () => {
  const repo = tempGit();
  try {
    const generators = [
      {
        name: "demo",
        version: 1,
        seed: "s",
        trees: ["fixtures/demo"],
        regen(root) {
          write(root, "fixtures/demo/out.txt", "synthetic\n");
        },
      },
    ];
    verifyRegistered(repo.root, generators);
    commitAll(repo.root, "add output");
    expect(verifyRegistered(repo.root, generators).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

function committedDemo() {
  const repo = tempGit();
  write(repo.root, "fixtures/demo/out.txt", "synthetic\n");
  commitAll(repo.root, "add output");
  const generators = [
    {
      name: "demo",
      version: 1,
      seed: "s",
      trees: ["fixtures/demo"],
      regen() {},
    },
  ];
  return { repo, generators };
}

test("a tracked edit fails the determinism check", () => {
  const { repo, generators } = committedDemo();
  try {
    write(repo.root, "fixtures/demo/out.txt", "edited\n");
    expect(verifyRegistered(repo.root, generators).status).not.toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("a deletion fails the determinism check", () => {
  const { repo, generators } = committedDemo();
  try {
    git(repo.root, ["rm", "fixtures/demo/out.txt"]);
    expect(verifyRegistered(repo.root, generators).status).not.toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("a staged change fails while git diff --exit-code stays clean", () => {
  const { repo, generators } = committedDemo();
  try {
    write(repo.root, "fixtures/demo/out.txt", "staged\n");
    git(repo.root, ["add", "fixtures/demo/out.txt"]);
    const diff = git(repo.root, ["diff", "--exit-code", "--", "fixtures/demo"]);
    expect(diff.status).toBe(0);
    expect(verifyRegistered(repo.root, generators).status).not.toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("an untracked file fails while git diff --exit-code stays clean", () => {
  const { repo, generators } = committedDemo();
  try {
    write(repo.root, "fixtures/demo/extra.txt", "new\n");
    const diff = git(repo.root, ["diff", "--exit-code", "--", "fixtures/demo"]);
    expect(diff.status).toBe(0);
    expect(verifyRegistered(repo.root, generators).status).not.toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("dirt outside a registered tree is ignored, including a tree name with a space", () => {
  const repo = tempGit();
  try {
    const generators = [
      {
        name: "pair",
        version: 1,
        seed: "s",
        trees: ["fixtures/demo", "fixtures/my tree"],
        regen() {},
      },
    ];
    write(repo.root, "notes/outside.txt", "dirt\n");
    expect(verifyRegistered(repo.root, generators).status).toBe(0);
    write(repo.root, "fixtures/my tree/a.txt", "dirt\n");
    expect(verifyRegistered(repo.root, generators).status).not.toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("a git failure outside a repository is nonzero", () => {
  const dir = mkdtempSync(join(tmpdir(), "keel-nogit-"));
  try {
    expect(check(dir, ["fixtures"]).status).toBe(128);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an empty path from the registry fails with git's status", () => {
  const repo = tempGit();
  try {
    expect(check(repo.root, [""]).status).toBe(128);
    expect(check(repo.root, splitTrees("\n")).status).toBe(128);
  } finally {
    repo.cleanup();
  }
});

test("a failing fixtures:regen fails the determinism check even when the tree is clean", () => {
  const repo = tempGit();
  try {
    write(
      repo.root,
      "package.json",
      JSON.stringify({
        name: "keel-regen-probe",
        private: true,
        scripts: { "fixtures:regen": 'node -e "process.exit(3)"', "fixtures:trees": "echo fixtures" },
      }),
    );
    commitAll(repo.root, "add package");
    const result = verifyDeterminism(repo.root);
    expect(result.status).not.toBe(0);
    expect(check(repo.root, ["fixtures"]).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("the production determinism check is clean on this repo", () => {
  const result = verifyDeterminism(repoRoot);
  expect(result.status).toBe(0);
});
