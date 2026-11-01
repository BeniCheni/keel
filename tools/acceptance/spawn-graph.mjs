import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const HELPERS_REL = "tools/acceptance/test/helpers.mjs";
const CHILD_PROCESS = "node:child_process";
const TIMEOUT_EXPORT = "NESTED_RUN_TIMEOUT_MS";
const REGEX_KEYWORD = new Set([
  "return",
  "throw",
  "case",
  "typeof",
  "void",
  "delete",
  "await",
  "new",
  "in",
  "of",
  "yield",
  "else",
  "do",
]);
const REGEX_PUNCT = new Set([
  "(",
  "[",
  "{",
  ",",
  ";",
  ":",
  "=",
  "?",
  "!",
  "&",
  "|",
  "+",
  "-",
  "*",
  "%",
  "^",
  "~",
  "<",
  ">",
  "=>",
  "&&",
  "||",
  "==",
  "!=",
  "<=",
  ">=",
  "+=",
  "-=",
  "*=",
  "??",
  "?.",
  "===",
  "!==",
  "**",
]);
const TWO = new Set(["=>", "&&", "||", "==", "!=", "<=", ">=", "+=", "-=", "*=", "??", "?.", "++", "--", "**"]);
const CALL_SKIP = new Set(["if", "for", "while", "switch", "catch", "function", "with"]);

function isIdent(token, value) {
  return token?.type === "ident" && token.value === value;
}

function isPunct(token, value) {
  return token?.type === "punct" && token.value === value;
}

function posix(path) {
  return path.split(sep).join("/");
}

function slashIsRegex(prev) {
  if (!prev) return true;
  if (prev.type === "ident") return REGEX_KEYWORD.has(prev.value);
  if (prev.type === "punct") return REGEX_PUNCT.has(prev.value);
  return false;
}

function readRegex(text, i) {
  const start = i;
  i += 1;
  let inClass = false;
  while (i < text.length) {
    const c = text[i];
    if (c === "\n") throw new Error(`unterminated regex at ${start}`);
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (inClass) {
      if (c === "]") inClass = false;
      i += 1;
      continue;
    }
    if (c === "[") {
      inClass = true;
      i += 1;
      continue;
    }
    if (c === "/") {
      i += 1;
      while (i < text.length && /[a-zA-Z]/.test(text[i])) i += 1;
      return i;
    }
    i += 1;
  }
  throw new Error(`unterminated regex at ${start}`);
}

function skipString(text, i) {
  const q = text[i];
  i += 1;
  while (i < text.length && text[i] !== q) {
    i += text[i] === "\\" ? 2 : 1;
  }
  return Math.min(text.length, i + 1);
}

function findExprEnd(text, i) {
  let brace = 1;
  while (i < text.length && brace > 0) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i = Math.min(text.length, i + 2);
      continue;
    }
    if (c === "'" || c === '"') {
      i = skipString(text, i);
      continue;
    }
    if (c === "`") {
      i = skipTemplate(text, i);
      continue;
    }
    if (c === "{") brace += 1;
    else if (c === "}") {
      brace -= 1;
      if (brace === 0) return i;
    }
    i += 1;
  }
  throw new Error(`unterminated template expression at ${i}`);
}

function skipTemplate(text, i) {
  i += 1;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (text[i] === "`") return i + 1;
    if (text[i] === "$" && text[i + 1] === "{") {
      i = findExprEnd(text, i + 2) + 1;
      continue;
    }
    i += 1;
  }
  throw new Error("unterminated template");
}

function lex(text) {
  const tokens = [];
  let i = 0;
  let prev = null;
  const push = (token) => {
    tokens.push(token);
    prev = token;
  };
  while (i < text.length) {
    const startI = i;
    const c = text[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i = Math.min(text.length, i + 2);
      continue;
    }
    if (c === "/" && slashIsRegex(prev)) {
      const start = i;
      i = readRegex(text, i);
      push({ type: "regex", value: text.slice(start, i), start, end: i });
      continue;
    }
    if (c === "'" || c === '"') {
      const start = i;
      const q = c;
      i += 1;
      let value = "";
      while (i < text.length && text[i] !== q) {
        if (text[i] === "\\") {
          value += text[i + 1] ?? "";
          i += 2;
          continue;
        }
        value += text[i];
        i += 1;
      }
      i += 1;
      push({ type: "string", value, start, end: i });
      continue;
    }
    if (c === "`") {
      const start = i;
      i = lexTemplate(text, i, push);
      push({ type: "template", value: "", start, end: i });
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const start = i;
      i += 1;
      while (i < text.length && /[A-Za-z0-9_$]/.test(text[i])) i += 1;
      push({ type: "ident", value: text.slice(start, i), start, end: i });
      continue;
    }
    if (/[0-9]/.test(c)) {
      const start = i;
      i += 1;
      while (i < text.length && /[0-9_]/.test(text[i])) i += 1;
      push({ type: "number", value: text.slice(start, i), start, end: i });
      continue;
    }
    const three = text.slice(i, i + 3);
    if (three === "===" || three === "!==" || three === "...") {
      push({ type: "punct", value: three, start: i, end: i + 3 });
      i += 3;
      continue;
    }
    const two = text.slice(i, i + 2);
    if (TWO.has(two)) {
      push({ type: "punct", value: two, start: i, end: i + 2 });
      i += 2;
      continue;
    }
    push({ type: "punct", value: c, start: i, end: i + 1 });
    i += 1;
    if (i === startI) throw new Error(`lexer stuck at ${i}`);
  }
  return tokens;
}

function lexTemplate(text, i, push) {
  i += 1;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (text[i] === "`") return i + 1;
    if (text[i] === "$" && text[i + 1] === "{") {
      const exprStart = i + 2;
      const exprEnd = findExprEnd(text, exprStart);
      const expr = text.slice(exprStart, exprEnd);
      for (const token of lex(expr)) {
        push({ ...token, start: token.start + exprStart, end: token.end + exprStart });
      }
      i = exprEnd + 1;
      continue;
    }
    i += 1;
  }
  throw new Error("unterminated template");
}

function assertBalanced(tokens, file) {
  let brace = 0;
  let paren = 0;
  let bracket = 0;
  for (const token of tokens) {
    if (isPunct(token, "{")) brace += 1;
    else if (isPunct(token, "}")) brace -= 1;
    else if (isPunct(token, "(")) paren += 1;
    else if (isPunct(token, ")")) paren -= 1;
    else if (isPunct(token, "[")) bracket += 1;
    else if (isPunct(token, "]")) bracket -= 1;
    if (brace < 0 || paren < 0 || bracket < 0) {
      throw new Error(`${file}: unbalanced token at ${token.start}`);
    }
  }
  if (brace !== 0 || paren !== 0 || bracket !== 0) {
    throw new Error(`${file}: unclosed brace ${brace} paren ${paren} bracket ${bracket}`);
  }
}

function skipPair(tokens, i, open, close) {
  let depth = 0;
  for (let j = i; j < tokens.length; j += 1) {
    if (isPunct(tokens[j], open)) depth += 1;
    else if (isPunct(tokens[j], close)) {
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  throw new Error(`unclosed ${open} at ${tokens[i]?.start ?? i}`);
}

function callsFrom(tokens) {
  const calls = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const next = tokens[i + 1];
    if (token.type !== "ident" || !isPunct(next, "(")) continue;
    const prev = tokens[i - 1];
    if (isPunct(prev, ".") || isIdent(prev, "function") || isPunct(prev, "?.")) continue;
    if (CALL_SKIP.has(token.value)) continue;
    calls.push({ kind: "call", name: token.value });
  }
  for (let i = 0; i < tokens.length - 3; i += 1) {
    if (
      tokens[i].type === "ident" &&
      isPunct(tokens[i + 1], ".") &&
      tokens[i + 2].type === "ident" &&
      isPunct(tokens[i + 3], "(")
    ) {
      calls.push({ kind: "method", object: tokens[i].value, prop: tokens[i + 2].value });
    }
  }
  return calls;
}

function readFunction(tokens, fnIndex) {
  let i = fnIndex + 1;
  let name = null;
  if (tokens[i]?.type === "ident") {
    name = tokens[i].value;
    i += 1;
  }
  if (!isPunct(tokens[i], "(")) throw new Error(`function missing params at ${tokens[fnIndex].start}`);
  const paramsEnd = skipPair(tokens, i, "(", ")");
  i = paramsEnd + 1;
  if (!isPunct(tokens[i], "{")) throw new Error(`function missing body at ${tokens[fnIndex].start}`);
  const bodyEnd = skipPair(tokens, i, "{", "}");
  const body = tokens.slice(i + 1, bodyEnd);
  return { name, calls: callsFrom(body), close: bodyEnd };
}

function readNamed(tokens, openIndex) {
  const specs = [];
  let i = openIndex + 1;
  while (i < tokens.length && !isPunct(tokens[i], "}")) {
    if (isPunct(tokens[i], ",") || isIdent(tokens[i], "type")) {
      i += 1;
      continue;
    }
    if (tokens[i].type !== "ident") throw new Error(`bad specifier at ${tokens[i].start}`);
    const imported = tokens[i].value;
    i += 1;
    let local = imported;
    if (isIdent(tokens[i], "as")) {
      i += 1;
      local = tokens[i].value;
      i += 1;
    }
    specs.push({ imported, local });
  }
  if (!isPunct(tokens[i], "}")) throw new Error(`unclosed specifier at ${tokens[openIndex].start}`);
  return { specs, next: i + 1 };
}

function finishSemi(tokens, i) {
  if (isPunct(tokens[i], ";")) return i + 1;
  return i;
}

function readImport(tokens, i) {
  i += 1;
  const named = [];
  let namespace = null;
  let defaultName = null;
  if (tokens[i]?.type === "string") {
    const spec = tokens[i].value;
    return { spec, named, namespace, defaultName, next: finishSemi(tokens, i + 1) };
  }
  if (isIdent(tokens[i], "type") && !isPunct(tokens[i + 1], "{")) i += 1;
  if (isPunct(tokens[i], "*")) {
    i += 2;
    namespace = tokens[i].value;
    i += 1;
  } else if (tokens[i]?.type === "ident") {
    defaultName = tokens[i].value;
    i += 1;
    if (isPunct(tokens[i], ",")) i += 1;
  }
  if (isIdent(tokens[i], "type") && isPunct(tokens[i + 1], "{")) i += 1;
  if (isPunct(tokens[i], "{")) {
    const read = readNamed(tokens, i);
    for (const spec of read.specs) named.push({ imported: spec.imported, local: spec.local });
    i = read.next;
  }
  if (!isIdent(tokens[i], "from")) throw new Error(`import missing from at ${tokens[i]?.start ?? i}`);
  i += 1;
  if (tokens[i]?.type !== "string") throw new Error(`import missing specifier at ${tokens[i]?.start ?? i}`);
  const spec = tokens[i].value;
  return { spec, named, namespace, defaultName, next: finishSemi(tokens, i + 1) };
}

function skipStatement(tokens, i) {
  let brace = 0;
  let paren = 0;
  let bracket = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (isPunct(token, "{")) brace += 1;
    else if (isPunct(token, "}")) {
      brace -= 1;
      if (brace < 0) return i;
    } else if (isPunct(token, "(")) paren += 1;
    else if (isPunct(token, ")")) paren -= 1;
    else if (isPunct(token, "[")) bracket += 1;
    else if (isPunct(token, "]")) bracket -= 1;
    else if (isPunct(token, ";") && brace === 0 && paren === 0 && bracket === 0) return i + 1;
    i += 1;
  }
  return i;
}

function readConst(tokens, i, exported) {
  const functions = [];
  const names = [];
  let timeoutMs = null;
  i += 1;
  while (i < tokens.length) {
    if (tokens[i].type !== "ident") break;
    const name = tokens[i].value;
    names.push(name);
    i += 1;
    if (!isPunct(tokens[i], "=")) break;
    i += 1;
    if (isIdent(tokens[i], "async")) i += 1;
    if (isIdent(tokens[i], "function")) {
      const fn = readFunction(tokens, i);
      functions.push({ name, exported, calls: fn.calls });
      i = fn.close + 1;
    } else if (tokens[i]?.type === "number" && name === TIMEOUT_EXPORT) {
      timeoutMs = Number(tokens[i].value.replaceAll("_", ""));
      i += 1;
    } else if (isPunct(tokens[i], "(") || (tokens[i]?.type === "ident" && isPunct(tokens[i + 1], "=>"))) {
      const arrow = readArrow(tokens, i, name, exported);
      functions.push(arrow.fn);
      i = arrow.next;
    } else {
      i = skipStatement(tokens, i);
      break;
    }
    if (isPunct(tokens[i], ",")) {
      i += 1;
      continue;
    }
    break;
  }
  if (isPunct(tokens[i], ";")) i += 1;
  return { names, functions, timeoutMs, next: i };
}

function readArrow(tokens, i, name, exported) {
  if (isPunct(tokens[i], "(")) i = skipPair(tokens, i, "(", ")") + 1;
  else i += 1;
  if (!isPunct(tokens[i], "=>")) throw new Error(`arrow missing => at ${tokens[i]?.start ?? i}`);
  i += 1;
  if (isPunct(tokens[i], "{")) {
    const bodyEnd = skipPair(tokens, i, "{", "}");
    return { fn: { name, exported, calls: callsFrom(tokens.slice(i + 1, bodyEnd)) }, next: bodyEnd + 1 };
  }
  const start = i;
  const end = skipStatement(tokens, i);
  return { fn: { name, exported, calls: callsFrom(tokens.slice(start, end)) }, next: end };
}

function readExport(tokens, i) {
  const functions = [];
  const exportNames = [];
  const reexports = [];
  let timeoutMs = null;
  i += 1;
  if (isIdent(tokens[i], "async") && isIdent(tokens[i + 1], "function")) i += 1;
  if (isIdent(tokens[i], "function")) {
    const fn = readFunction(tokens, i);
    if (fn.name) {
      exportNames.push(fn.name);
      functions.push({ name: fn.name, exported: true, calls: fn.calls });
    }
    return { functions, exportNames, reexports, timeoutMs, next: fn.close + 1 };
  }
  if (isIdent(tokens[i], "const") || isIdent(tokens[i], "let") || isIdent(tokens[i], "var")) {
    const read = readConst(tokens, i, true);
    exportNames.push(...read.names);
    functions.push(...read.functions);
    return { functions, exportNames, reexports, timeoutMs: read.timeoutMs, next: read.next };
  }
  if (isPunct(tokens[i], "{")) {
    const read = readNamed(tokens, i);
    i = read.next;
    const spec = isIdent(tokens[i], "from") ? tokens[i + 1] : null;
    if (spec?.type === "string") {
      for (const item of read.specs) {
        exportNames.push(item.local);
        reexports.push({ kind: "named", exported: item.local, imported: item.imported, spec: spec.value });
      }
      return { functions, exportNames, reexports, timeoutMs, next: finishSemi(tokens, i + 2) };
    }
    for (const item of read.specs) exportNames.push(item.local);
    return { functions, exportNames, reexports, timeoutMs, next: finishSemi(tokens, i) };
  }
  if (isPunct(tokens[i], "*")) {
    i += 1;
    if (isIdent(tokens[i], "as")) {
      const exported = tokens[i + 1].value;
      const spec = tokens[i + 3].value;
      exportNames.push(exported);
      reexports.push({ kind: "star-as", exported, spec });
      return { functions, exportNames, reexports, timeoutMs, next: finishSemi(tokens, i + 4) };
    }
    const spec = tokens[i + 1].value;
    reexports.push({ kind: "star", spec });
    return { functions, exportNames, reexports, timeoutMs, next: finishSemi(tokens, i + 2) };
  }
  if (isIdent(tokens[i], "default")) {
    exportNames.push("default");
    if (isIdent(tokens[i + 1], "function") || (isIdent(tokens[i + 1], "async") && isIdent(tokens[i + 2], "function"))) {
      const fnAt = isIdent(tokens[i + 1], "async") ? i + 2 : i + 1;
      const fn = readFunction(tokens, fnAt);
      functions.push({ name: fn.name ?? "default", exported: true, calls: fn.calls });
      return { functions, exportNames, reexports, timeoutMs, next: fn.close + 1 };
    }
    return { functions, exportNames, reexports, timeoutMs, next: skipStatement(tokens, i + 1) };
  }
  return { functions, exportNames, reexports, timeoutMs, next: skipStatement(tokens, i) };
}

function parseModule(text, file) {
  let tokens;
  try {
    tokens = lex(text);
    assertBalanced(tokens, file);
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  const namedImports = [];
  const namespaceImports = [];
  const reexports = [];
  const exportNames = new Set();
  const functions = [];
  const cpLocals = new Set();
  const cpNamespaces = new Set();
  let importsChildProcess = false;
  let timeoutMs = null;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const prev = tokens[i - 1];
    if (isPunct(prev, ".")) continue;
    if (isIdent(token, "import") && !isPunct(tokens[i + 1], "(") && !isPunct(tokens[i + 1], ".")) {
      const read = readImport(tokens, i);
      if (read.spec === CHILD_PROCESS) importsChildProcess = true;
      if (read.namespace) {
        namespaceImports.push({ local: read.namespace, spec: read.spec });
        if (read.spec === CHILD_PROCESS) cpNamespaces.add(read.namespace);
      }
      if (read.defaultName) {
        namedImports.push({ local: read.defaultName, imported: "default", spec: read.spec });
        if (read.spec === CHILD_PROCESS) cpNamespaces.add(read.defaultName);
      }
      for (const spec of read.named) {
        namedImports.push({ local: spec.local, imported: spec.imported, spec: read.spec });
        if (read.spec === CHILD_PROCESS) cpLocals.add(spec.local);
      }
      i = read.next - 1;
      continue;
    }
    if (isIdent(token, "export")) {
      const read = readExport(tokens, i);
      for (const name of read.exportNames) exportNames.add(name);
      functions.push(...read.functions);
      reexports.push(...read.reexports);
      if (read.timeoutMs !== null) timeoutMs = read.timeoutMs;
      i = read.next - 1;
      continue;
    }
    if (
      (isIdent(token, "const") || isIdent(token, "let") || isIdent(token, "var")) &&
      !isIdent(prev, "export")
    ) {
      const read = readConst(tokens, i, false);
      functions.push(...read.functions);
      if (read.timeoutMs !== null) timeoutMs = read.timeoutMs;
      i = read.next - 1;
      continue;
    }
    if (isIdent(token, "function") && (tokens[i + 1]?.type === "ident" || isPunct(tokens[i + 1], "("))) {
      const fn = readFunction(tokens, i);
      if (fn.name) functions.push({ name: fn.name, exported: false, calls: fn.calls });
      i = fn.close;
    }
  }
  return {
    tokens,
    namedImports,
    namespaceImports,
    reexports,
    exportNames,
    functions,
    cpLocals,
    cpNamespaces,
    importsChildProcess,
    timeoutMs,
  };
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

function testTitle(args, text) {
  const first = args[0] ?? [];
  if (first.length === 1 && first[0].type === "string") return first[0].value;
  if (first.some((token) => token.type === "template")) return `<template>:${lineAt(text, first[0]?.start ?? 0)}`;
  return `<expr>:${lineAt(text, first[0]?.start ?? 0)}`;
}

function argIsTimeout(arg, localName) {
  if (!localName) return false;
  const significant = arg.filter((token) => token.type !== "template" || token.value !== "");
  if (significant.length === 1 && significant[0].type === "ident" && significant[0].value === localName) return true;
  if (!isPunct(significant[0], "{")) return false;
  const text = significant.map((token) => token.value).join(" ");
  return new RegExp(`\\btimeout\\s*:\\s*${localName}\\b`).test(text);
}

function callbackCalls(args) {
  const fn = args.find((arg) => arg.some((token) => isPunct(token, "=>") || isIdent(token, "function")));
  return fn ? callsFrom(fn) : [];
}

function parseCall(tokens, openIndex) {
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  const args = [];
  let argStart = openIndex + 1;
  for (let i = openIndex; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (isPunct(token, "(")) paren += 1;
    else if (isPunct(token, ")")) {
      paren -= 1;
      if (paren === 0 && brace === 0 && bracket === 0) {
        args.push(tokens.slice(argStart, i));
        return { args, close: token };
      }
    } else if (isPunct(token, "{")) brace += 1;
    else if (isPunct(token, "}")) brace -= 1;
    else if (isPunct(token, "[")) bracket += 1;
    else if (isPunct(token, "]")) bracket -= 1;
    else if (isPunct(token, ",") && paren === 1 && brace === 0 && bracket === 0) {
      args.push(tokens.slice(argStart, i));
      argStart = i + 1;
    }
  }
  throw new Error(`unclosed call at ${tokens[openIndex].start}`);
}

function testCallsIn(tokens, text, testLocals, timeoutLocal) {
  const calls = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type !== "ident" || !testLocals.has(tokens[i].value)) continue;
    if (isPunct(tokens[i - 1], ".") || !isPunct(tokens[i + 1], "(")) continue;
    const parsed = parseCall(tokens, i + 1);
    calls.push({
      name: testTitle(parsed.args, text),
      line: lineAt(text, tokens[i].start),
      close: parsed.close.start,
      calls: callbackCalls(parsed.args),
      passesTimeout: parsed.args.some((arg) => argIsTimeout(arg, timeoutLocal)),
    });
    i = tokens.indexOf(parsed.close);
  }
  return calls;
}

function listFiles(dir) {
  const files = [];
  const visit = (current) => {
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.(mjs|cjs|js|ts)$/.test(entry.name)) files.push(path);
    }
  };
  visit(dir);
  return files;
}

function resolveSpec(fromAbs, spec, known) {
  if (spec === CHILD_PROCESS) return { kind: "cp" };
  if (!spec.startsWith(".")) return { kind: "external" };
  const base = join(dirname(fromAbs), spec);
  const candidates = [
    base,
    `${base}.mjs`,
    `${base}.js`,
    `${base}.cjs`,
    `${base}.ts`,
    join(base, "index.mjs"),
    join(base, "index.js"),
  ];
  for (const candidate of candidates) {
    if (known.has(candidate) || existsSync(candidate)) return { kind: "file", abs: candidate };
  }
  return { kind: "missing" };
}

function isHelpers(rel) {
  return rel === HELPERS_REL;
}

function underTest(rel) {
  return rel.split("/").includes("test");
}

function helperSpawning(mod) {
  const spawning = new Set();
  const names = new Set(mod.functions.map((fn) => fn.name));
  let changed = true;
  while (changed) {
    changed = false;
    for (const fn of mod.functions) {
      if (!fn.name || spawning.has(fn.name)) continue;
      for (const call of fn.calls) {
        const direct =
          (call.kind === "call" && mod.cpLocals.has(call.name)) ||
          (call.kind === "method" && mod.cpNamespaces.has(call.object));
        const via = call.kind === "call" && names.has(call.name) && spawning.has(call.name);
        if (direct || via) {
          spawning.add(fn.name);
          changed = true;
          break;
        }
      }
    }
  }
  return spawning;
}

function callsSpawning(calls, mod, spawningLocals) {
  for (const call of calls) {
    if (call.kind === "call" && spawningLocals.has(call.name)) return true;
    if (call.kind === "call") {
      const binding = mod.bindings.get(call.name);
      if (binding?.kind === "named" && binding.target?.spawning.has(binding.imported)) return true;
    }
    if (call.kind === "method") {
      const binding = mod.bindings.get(call.object);
      if (binding?.kind === "namespace" && binding.target?.spawning.has(call.prop)) return true;
    }
  }
  return false;
}

function localSpawning(mod) {
  const spawning = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const fn of mod.functions) {
      if (!fn.name || spawning.has(fn.name)) continue;
      if (callsSpawning(fn.calls, mod, spawning)) {
        spawning.add(fn.name);
        changed = true;
      }
    }
  }
  return spawning;
}

function infected(mod) {
  if (mod.importsChildProcess) return true;
  for (const binding of mod.bindings.values()) {
    if (binding.kind === "named" && binding.target?.spawning.has(binding.imported)) return true;
    if (binding.kind === "namespace" && binding.target && binding.target.spawning.size > 0) return true;
  }
  for (const reexport of mod.resolvedReexports) {
    const target = reexport.target;
    if (!target) continue;
    if (reexport.kind === "star" || reexport.kind === "star-as") {
      if (target.spawning.size > 0) return true;
    } else if (target.spawning.has(reexport.imported)) return true;
  }
  return false;
}

function build(root) {
  const tools = join(root, "tools");
  const files = listFiles(tools);
  const parsed = new Map();
  const texts = new Map();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    texts.set(file, text);
    parsed.set(file, parseModule(text, posix(relative(root, file))));
  }
  const known = new Set(parsed.keys());
  const mods = new Map();
  for (const [abs, mod] of parsed) {
    const rel = posix(relative(root, abs));
    mods.set(abs, {
      abs,
      rel,
      text: texts.get(abs),
      isHelpers: isHelpers(rel),
      importsChildProcess: mod.importsChildProcess,
      exportNames: new Set(mod.exportNames),
      spawning: new Set(),
      functions: mod.functions,
      cpLocals: mod.cpLocals,
      cpNamespaces: mod.cpNamespaces,
      namedImports: mod.namedImports,
      namespaceImports: mod.namespaceImports,
      reexports: mod.reexports,
      tokens: mod.tokens,
      timeoutMs: mod.timeoutMs,
      bindings: new Map(),
      resolvedReexports: [],
    });
  }
  const resolve = (fromAbs, spec) => resolveSpec(fromAbs, spec, known);
  for (const mod of mods.values()) {
    for (const item of mod.namedImports) {
      const resolved = resolve(mod.abs, item.spec);
      const target = resolved.kind === "file" ? mods.get(resolved.abs) : null;
      mod.bindings.set(item.local, { kind: "named", imported: item.imported, spec: item.spec, target });
    }
    for (const item of mod.namespaceImports) {
      const resolved = resolve(mod.abs, item.spec);
      const target = resolved.kind === "file" ? mods.get(resolved.abs) : null;
      mod.bindings.set(item.local, { kind: "namespace", spec: item.spec, target });
    }
    for (const item of mod.reexports) {
      const resolved = resolve(mod.abs, item.spec);
      mod.resolvedReexports.push({ ...item, target: resolved.kind === "file" ? mods.get(resolved.abs) : null });
    }
  }
  for (const mod of mods.values()) {
    if (!mod.isHelpers) continue;
    for (const name of helperSpawning(mod)) {
      if (mod.exportNames.has(name)) mod.spawning.add(name);
    }
  }
  for (const mod of mods.values()) {
    if (mod.isHelpers || !mod.importsChildProcess) continue;
    for (const name of mod.exportNames) mod.spawning.add(name);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const mod of mods.values()) {
      for (const reexport of mod.resolvedReexports) {
        if (reexport.kind !== "star" || !reexport.target) continue;
        for (const name of reexport.target.exportNames) {
          if (!mod.exportNames.has(name)) {
            mod.exportNames.add(name);
            changed = true;
          }
        }
      }
    }
    for (const mod of mods.values()) {
      if (mod.isHelpers || !infected(mod)) continue;
      for (const name of mod.exportNames) {
        if (!mod.spawning.has(name)) {
          mod.spawning.add(name);
          changed = true;
        }
      }
    }
  }
  const entryPoints = [];
  const forbidden = [];
  const missing = [];
  let nestedTimeoutMs = null;
  for (const mod of mods.values()) {
    if (mod.isHelpers && mod.timeoutMs !== null) nestedTimeoutMs = mod.timeoutMs;
    for (const symbol of mod.spawning) entryPoints.push({ file: mod.rel, symbol });
    if (mod.importsChildProcess && underTest(mod.rel) && !mod.isHelpers) forbidden.push(mod.rel);
    const timeoutBinding = [...mod.bindings.entries()].find(([, binding]) => {
      return binding.kind === "named" && binding.imported === TIMEOUT_EXPORT && binding.target?.isHelpers;
    });
    const testLocals = new Set(
      [...mod.bindings.entries()]
        .filter(([, binding]) => binding.spec === "vitest" && (binding.imported === "test" || binding.imported === "it"))
        .map(([local]) => local),
    );
    if (testLocals.size === 0) continue;
    let tests;
    try {
      tests = testCallsIn(mod.tokens, mod.text, testLocals, timeoutBinding?.[0] ?? null);
    } catch (error) {
      throw new Error(`${mod.rel}: ${error.message}`);
    }
    const locals = localSpawning(mod);
    for (const test of tests) {
      if (!callsSpawning(test.calls, mod, locals)) continue;
      if (!test.passesTimeout) missing.push({ file: mod.rel, name: test.name, line: test.line, close: test.close });
    }
  }
  entryPoints.sort((a, b) => a.file.localeCompare(b.file) || a.symbol.localeCompare(b.symbol));
  forbidden.sort();
  missing.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return { entryPoints, forbidden, missing, nestedTimeoutMs };
}

export function inspectTools(root) {
  const report = build(root);
  return {
    entryPoints: report.entryPoints,
    forbiddenChildProcessImports: report.forbidden,
    missingTimeouts: report.missing.map(({ file, name, line }) => ({ file, name, line })),
    nestedTimeoutMs: report.nestedTimeoutMs,
  };
}
