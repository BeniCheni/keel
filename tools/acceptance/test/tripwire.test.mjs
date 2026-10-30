import { randomBytes } from "node:crypto";
import { expect, test } from "vitest";
import { cusipCheckDigit } from "../../tripwire/scan.mjs";
import { cleanRepo, commitAll, git, leaked, tripwire, write } from "./helpers.mjs";

function makeCusip() {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = randomBytes(8);
  let body = "";
  for (let i = 0; i < 8; i++) body += alphabet[bytes[i] % alphabet.length];
  return body + String(cusipCheckDigit(body));
}

function flipCusip(cusip) {
  return cusip.slice(0, 8) + (cusip[8] === "0" ? "1" : "0");
}

function keyword(kind) {
  if (kind === "account") return ["acc", "ount"].join("");
  if (kind === "acct") return ["ac", "ct"].join("");
  return ["a", "/", "c"].join("");
}

function ssn(separator) {
  return ["123", "45", "6789"].join(separator);
}

function address(parts) {
  return parts.join(" ");
}

function email(local) {
  return [local, "example.com"].join("@");
}

function add(repo, rel, data) {
  write(repo.root, rel, data);
  commitAll(repo.root, "add file");
}

test("cusip check digit matches the modulus-10 rule", () => {
  expect(cusipCheckDigit("0".repeat(8))).toBe(0);
  expect(cusipCheckDigit(`${"0".repeat(7)}1`)).toBe(8);
  expect(cusipCheckDigit(`1${"0".repeat(7)}`)).toBe(9);
  expect(cusipCheckDigit(`A${"0".repeat(7)}`)).toBe(9);
  expect(cusipCheckDigit(`0A${"0".repeat(6)}`)).toBe(8);
  expect(cusipCheckDigit(`0B${"0".repeat(6)}`)).toBe(6);
  expect(cusipCheckDigit(`Z${"0".repeat(7)}`)).toBe(2);
  expect(cusipCheckDigit(`a${"0".repeat(7)}`)).toBe(9);
});

test("flags a check-digit-valid CUSIP and hides the text", () => {
  const repo = cleanRepo();
  const secret = makeCusip();
  try {
    add(repo, "notes.txt", `see ${secret} today\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("cusip\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("does not flag a 9 character token with a bad check digit", () => {
  const repo = cleanRepo();
  const secret = flipCusip(makeCusip());
  try {
    add(repo, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(0);
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("does not flag a CUSIP glued inside a longer token", () => {
  const repo = cleanRepo();
  const secret = `X${makeCusip()}Y`;
  try {
    add(repo, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("flags a lowercase CUSIP after uppercasing", () => {
  const repo = cleanRepo();
  const secret = makeCusip().toLowerCase();
  try {
    add(repo, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("cusip\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("flags an ISIN whose embedded nine characters are a valid CUSIP", () => {
  const repo = cleanRepo();
  const secret = `US${makeCusip()}0`;
  try {
    add(repo, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("cusip\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("does not flag a 12 character token whose embedded nine fail the check digit", () => {
  const repo = cleanRepo();
  const secret = `US${flipCusip(makeCusip())}0`;
  try {
    add(repo, "notes.txt", `${secret}\n`);
    expect(tripwire(repo.root).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("flags three letters, a hyphen, and six digits", () => {
  const repo = cleanRepo();
  const secret = ["ABC", "123456"].join("-");
  try {
    add(repo, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("account\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("flags a digit token within 40 characters after an account keyword", () => {
  const repo = cleanRepo();
  const secret = `AB${"12".repeat(2)}CD`;
  try {
    add(repo, "notes.txt", `${keyword("account")} ${" ".repeat(30)}${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("account\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("does not flag a token that starts 40 characters after the keyword", () => {
  const repo = cleanRepo();
  const secret = `AB${"12".repeat(2)}CD`;
  try {
    add(repo, "notes.txt", `${keyword("acct")} ${" ".repeat(40)}${secret}\n`);
    expect(tripwire(repo.root).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("flags a masked run after an account keyword on the same line", () => {
  const repo = cleanRepo();
  const secret = `${"*".repeat(4)}1234`;
  try {
    add(repo, "notes.txt", `${keyword("a/c")} ${secret}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("account\tnotes.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("flags both hyphenated and spaced SSN forms", () => {
  const repo = cleanRepo();
  const hyphen = ssn("-");
  const spaced = ssn(" ");
  try {
    add(repo, "notes.txt", `${hyphen}\n${spaced}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("ssn\tnotes.txt\t1");
    expect(result.stdout).toContain("ssn\tnotes.txt\t2");
    expect(leaked(result, hyphen)).toBe(false);
    expect(leaked(result, spaced)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("flags a street address, a direction, and a unit", () => {
  const repo = cleanRepo();
  const plain = address(["123", "Main", "Street"]);
  const directed = address(["45", "North", "Oak", "Avenue"]);
  const unit = address(["9", "Main", "Street", "Apt", "4"]);
  try {
    add(repo, "notes.txt", `${plain}\n${directed}\n${unit}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("address\tnotes.txt\t1");
    expect(result.stdout).toContain("address\tnotes.txt\t2");
    expect(result.stdout).toContain("address\tnotes.txt\t3");
    expect(leaked(result, plain)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("does not flag a lowercase street line or a banned word inside another word", () => {
  const repo = cleanRepo();
  try {
    add(repo, "notes.txt", `${address(["123", "main", "street"])}\nhousehold threshold buyer\n`);
    expect(tripwire(repo.root).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("flags an email and ignores a noreply address", () => {
  const repo = cleanRepo();
  const secret = email("person");
  try {
    add(repo, "notes.txt", `${secret}\n${email("noreply")}\n`);
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("email\tnotes.txt\t1");
    expect(result.stdout).not.toContain("email\tnotes.txt\t2");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("flags price columns in csv and tsv, and skips a synthetic marker", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "bars.csv", `${["date", "close"].join(",")}\n`);
    write(repo.root, "bars.tsv", `${["date", "price"].join("\t")}\n`);
    write(repo.root, "safe.csv", `# synthetic: true\n${["date", "close"].join(",")}\n`);
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("price\tbars.csv\t1");
    expect(result.stdout).toContain("price\tbars.tsv\t1");
    expect(result.stdout).not.toContain("safe.csv");
  } finally {
    repo.cleanup();
  }
});

test("flags price keys at the first array level only", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "bars.json", JSON.stringify([{ close: 1 }]));
    write(repo.root, "nested.json", JSON.stringify({ bars: [{ high: 1 }] }));
    write(repo.root, "object.json", JSON.stringify({ close: 1 }));
    write(repo.root, "deep.json", JSON.stringify([{ nested: [{ close: 1 }] }]));
    write(repo.root, "marked.json", JSON.stringify({ synthetic: true, rows: [{ close: 1 }] }));
    write(repo.root, "stringy.json", JSON.stringify({ synthetic: "true", rows: [{ close: 1 }] }));
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.stdout).toContain("price\tbars.json\t1");
    expect(result.stdout).toContain("price\tnested.json\t1");
    expect(result.stdout).toContain("price\tstringy.json\t1");
    expect(result.stdout).not.toContain("object.json");
    expect(result.stdout).not.toContain("deep.json");
    expect(result.stdout).not.toContain("marked.json");
  } finally {
    repo.cleanup();
  }
});

test("flags tracked local-only paths and ignores anchored negatives", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "design/a.txt", "note\n");
    write(repo.root, "docs/design/a.txt", "note\n");
    write(repo.root, "terms/a.txt", "note\n");
    write(repo.root, "docs/terms/a.txt", "note\n");
    write(repo.root, ".keel-data/a.txt", "note\n");
    write(repo.root, "nested/.keel-data/a.txt", "note\n");
    write(repo.root, "book.pdf", "note\n");
    write(repo.root, "db.sqlite", "note\n");
    write(repo.root, "db.sqlite-journal", "note\n");
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    for (const path of ["design/a.txt", "terms/a.txt", ".keel-data/a.txt", "nested/.keel-data/a.txt", "book.pdf", "db.sqlite"]) {
      expect(result.stdout).toContain(`local-only\t${path}\t1`);
    }
    expect(result.stdout).not.toContain("docs/design/a.txt");
    expect(result.stdout).not.toContain("docs/terms/a.txt");
    expect(result.stdout).not.toContain("db.sqlite-journal");
  } finally {
    repo.cleanup();
  }
});

test("flags a non-utf8 file and a file with a NUL byte", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "bad.bin", Buffer.from([0xff, 0xfe]));
    write(repo.root, "nul.bin", Buffer.from([0x61, 0x00, 0x62]));
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("unscannable\tbad.bin\t1");
    expect(result.stdout).toContain("unscannable\tnul.bin\t1");
  } finally {
    repo.cleanup();
  }
});

test("does not flag an ordinary code sample", () => {
  const repo = cleanRepo();
  try {
    add(
      repo,
      "code.ts",
      ["const ledger = 1;", "function closePrice() { return 0; }", "const code = 'abc-12';", "const id = 'ab-12345';"].join("\n"),
    );
    expect(tripwire(repo.root).status).toBe(0);
  } finally {
    repo.cleanup();
  }
});

test("a populated allowlist of check-digit-valid values scans clean", () => {
  const repo = cleanRepo();
  const secret = makeCusip();
  try {
    write(repo.root, "fixtures/seed/a.txt", `${secret}\n`);
    write(repo.root, "tools/tripwire/allowlist.txt", `fixtures/seed/**\t${secret}\tseeded\n`);
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("an unlisted value added to the allowlist file is a hit", () => {
  const repo = cleanRepo();
  const listed = makeCusip();
  const extra = makeCusip();
  try {
    write(repo.root, "fixtures/seed/a.txt", `${listed}\n`);
    write(
      repo.root,
      "tools/tripwire/allowlist.txt",
      `fixtures/seed/**\t${listed}\tseeded\nfixtures/seed/**\tplain\tnote ${extra}\n`,
    );
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("cusip\ttools/tripwire/allowlist.txt\t2");
    expect(result.stdout).not.toContain("cusip\ttools/tripwire/allowlist.txt\t1");
    expect(result.stdout).not.toContain("fixtures/seed/a.txt");
    expect(leaked(result, listed)).toBe(false);
    expect(leaked(result, extra)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("an email inside a valid allowlist entry is still a hit", () => {
  const repo = cleanRepo();
  const secret = email("person");
  try {
    write(repo.root, "tools/tripwire/allowlist.txt", `fixtures/seed/**\t${secret}\tseeded\n`);
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("email\ttools/tripwire/allowlist.txt\t1");
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("an out-of-scope allowlist glob is a hit", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "tools/tripwire/allowlist.txt", `../outside/**\tplain\treason\nfixtures/../../etc/**\tplain\treason\n`);
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("allowlist\ttools/tripwire/allowlist.txt\t1");
    expect(result.stdout).toContain("allowlist\ttools/tripwire/allowlist.txt\t2");
  } finally {
    repo.cleanup();
  }
});

test("a malformed allowlist entry is a hit", () => {
  const repo = cleanRepo();
  try {
    write(repo.root, "tools/tripwire/allowlist.txt", "not a valid entry\n");
    commitAll(repo.root, "add file");
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("allowlist\ttools/tripwire/allowlist.txt\t1");
  } finally {
    repo.cleanup();
  }
});

test("flags a commit message and hides the text", () => {
  const repo = cleanRepo();
  const secret = makeCusip();
  try {
    const committed = git(repo.root, ["commit", "--allow-empty", "-m", secret]);
    expect(committed.status).toBe(0);
    const sha = git(repo.root, ["rev-parse", "HEAD"]).stdout.trim();
    const result = tripwire(repo.root);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`cusip\tcommit ${sha}\t1`);
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});

test("missing origin/main exits 2", () => {
  const repo = cleanRepo();
  try {
    const removed = git(repo.root, ["update-ref", "-d", "refs/remotes/origin/main"]);
    expect(removed.status).toBe(0);
    const result = tripwire(repo.root);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("origin/main unavailable");
  } finally {
    repo.cleanup();
  }
});

test("a directory that is not a git repo exits 2", () => {
  const repo = cleanRepo();
  try {
    const secret = makeCusip();
    write(repo.root, "notes.txt", `${secret}\n`);
    const result = tripwire(repo.root + "-missing");
    expect(result.status).toBe(2);
    expect(leaked(result, secret)).toBe(false);
  } finally {
    repo.cleanup();
  }
});
