import { expect, test } from "vitest";
import { run, tempGit, write } from "./helpers.mjs";

function copy(root) {
  return run(process.execPath, ["tools/copy/cli.mjs", root]);
}

function boundary(root) {
  return run(process.execPath, ["tools/boundary/cli.mjs", root]);
}

function spec(suffix = "") {
  return "@" + "keel/montecarlo" + suffix;
}

function line(kind, suffix = "") {
  const imported = spec(suffix);
  if (kind === "static") return `im${""}port x from "${imported}";`;
  if (kind === "export") return `ex${""}port { x } from "${imported}";`;
  if (kind === "dynamic") return `im${""}port("${imported}");`;
  return `re${""}quire("${imported}");`;
}

test("copy lint flags each banned word in each scanned scope", () => {
  const repo = tempGit();
  try {
    write(repo.root, "README.md", "HOLD\n");
    write(repo.root, "DISCLAIMER.md", "buy\n");
    write(repo.root, "packages/ui/src/copy/labels.ts", "sell\n");
    write(repo.root, "packages/ui/src/copy/nested/deep.ts", "a Should\n");
    write(repo.root, "docs/extra.md", "should\n");
    const result = copy(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("copy\tREADME.md\t1");
    expect(result.stdout).toContain("copy\tDISCLAIMER.md\t1");
    expect(result.stdout).toContain("copy\tpackages/ui/src/copy/labels.ts\t1");
    expect(result.stdout).toContain("copy\tpackages/ui/src/copy/nested/deep.ts\t1");
    expect(result.stdout).not.toContain("docs/extra.md");
  } finally {
    repo.cleanup();
  }
});

test("copy lint ignores a banned word inside another word", () => {
  const repo = tempGit();
  try {
    write(repo.root, "README.md", "The monitor holds a buyer threshold.\n");
    write(repo.root, "DISCLAIMER.md", "selling and holding\n");
    const result = copy(repo.root);
    expect(result.status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("each import form outside the allowed paths fails", () => {
  for (const kind of ["static", "export", "dynamic", "require"]) {
    const repo = tempGit();
    try {
      write(repo.root, "packages/core/src/a.ts", `${line(kind)}\n`);
      const result = boundary(repo.root);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("boundary\tpackages/core/src/a.ts\t1");
    } finally {
      repo.cleanup();
    }
  }
});

test("literal calls with templates, import options, and comments cannot cross the boundary", () => {
  const imported = spec();
  const calls = [
    `im${""}port(\`${imported}\`);`,
    `im${""}port("${imported}", { with: { type: "json" } });`,
    `re${""}quire/* module */("${imported}");`,
  ];
  for (const source of calls) {
    const repo = tempGit();
    try {
      write(repo.root, "packages/core/src/a.ts", `${source}\n`);
      const result = boundary(repo.root);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("boundary\tpackages/core/src/a.ts\t1");
    } finally {
      repo.cleanup();
    }
  }
});

test("a subpath and a relative path into montecarlo fail", () => {
  const repo = tempGit();
  try {
    write(repo.root, "packages/core/src/a.ts", `${line("static", "/engine")}\n`);
    write(repo.root, "packages/core/src/b.ts", `im${""}port x from "${"../".repeat(2)}montecarlo/x";\n`);
    const result = boundary(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("boundary\tpackages/core/src/a.ts\t1");
    expect(result.stdout).toContain("boundary\tpackages/core/src/b.ts\t1");
  } finally {
    repo.cleanup();
  }
});

test("an import from an allowed path and a different package name pass", () => {
  const repo = tempGit();
  try {
    write(repo.root, "packages/ui/src/screens/scenario/view.ts", `${line("static")}\n`);
    write(repo.root, "packages/montecarlo/src/index.ts", `${line("dynamic")}\n`);
    write(repo.root, "packages/core/src/c.ts", `im${""}port x from "${spec("-extra")}";\n`);
    expect(boundary(repo.root).status).toBe(0);
    write(repo.root, "packages/ui/src/screens/other/view.ts", `${line("static")}\n`);
    const result = boundary(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("boundary\tpackages/ui/src/screens/other/view.ts\t1");
    expect(result.stdout).not.toContain("scenario/view.ts");
  } finally {
    repo.cleanup();
  }
});
