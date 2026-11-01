import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const HELPERS_REL = "tools/acceptance/test/helpers.mjs";
const CHILD_PROCESS_SPECS = new Set(["node:child_process", "child_process"]);
const LOADER_CALLS = new Set(["import", "require", "getBuiltinModule"]);
const INVOKERS = new Set(["call", "apply", "bind"]);
const VALUE_BEFORE = new Set(["(", ",", "{", "[", ":", "=", "?", "=>"]);
const VALUE_AFTER = new Set([")", ",", "}", "]", ";"]);
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

/** Reject known dynamic-execution APIs and opaque references to the builtin loader. */
function assertStaticExecution(tokens, file) {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const computed = token.type === "string" && isPunct(tokens[i - 1], "[") && isPunct(tokens[i + 1], "]");
    if (token.type !== "ident" && !computed) continue;
    if (token.value === "Function" || token.value === "eval") {
      throw new Error(`${file}: dynamic code execution is forbidden at ${token.start}`);
    }
    if (token.value !== "getBuiltinModule") continue;
    const direct = isIdent(tokens[i - 2], "process") && isPunct(tokens[i - 1], ".") &&
      isPunct(tokens[i + 1], "(") && tokens[i + 2]?.type === "string" && isPunct(tokens[i + 3], ")");
    if (!direct) throw new Error(`${file}: unrecognised builtin loader use at ${token.start}`);
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

/**
 * A reference to a name counts when it is called (`f()`, `f?.()`, `f.call()`), or used as a value
 * (an argument, an object value, an assignment, an arrow body), since a value that spawns is still
 * spawning once the callee runs it. A dynamic `import()`, `require()` or `getBuiltinModule()` of a
 * string specifier is recorded as a load of that module.
 */
function callsFrom(tokens) {
  const calls = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "ident") continue;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    if (isPunct(prev, ".") || isPunct(prev, "?.") || isIdent(prev, "function")) continue;
    if (LOADER_CALLS.has(token.value) && isPunct(next, "(") && tokens[i + 2]?.type === "string") {
      calls.push({ kind: "load", spec: tokens[i + 2].value });
      continue;
    }
    if (CALL_SKIP.has(token.value)) continue;
    const called = isPunct(next, "(") || (isPunct(next, "?.") && isPunct(tokens[i + 2], "("));
    const invoked =
      isPunct(next, ".") && tokens[i + 2]?.type === "ident" && INVOKERS.has(tokens[i + 2].value) && isPunct(tokens[i + 3], "(");
    const valued =
      (!prev || (prev.type === "punct" && VALUE_BEFORE.has(prev.value)) || isIdent(prev, "return")) &&
      (!next || (next.type === "punct" && VALUE_AFTER.has(next.value)));
    if (called || invoked) calls.push({ kind: "call", name: token.value });
    else if (valued) calls.push({ kind: "value", name: token.value });
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

function readClass(tokens, classIndex) {
  const name = tokens[classIndex + 1].value;
  let i = classIndex + 2;
  while (i < tokens.length && !isPunct(tokens[i], "{")) i += 1;
  const close = skipPair(tokens, i, "{", "}");
  return { name, calls: callsFrom(tokens.slice(i + 1, close)), close };
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
  const values = [];
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
      values.push(name);
      i += 1;
    } else if (isPunct(tokens[i], "(") || (tokens[i]?.type === "ident" && isPunct(tokens[i + 1], "=>"))) {
      const arrow = readArrow(tokens, i, name, exported);
      functions.push(arrow.fn);
      i = arrow.next;
    } else {
      const start = i;
      i = skipStatement(tokens, i);
      functions.push({ name, exported, calls: callsFrom(tokens.slice(start, i)) });
      values.push(name);
      break;
    }
    if (isPunct(tokens[i], ",")) {
      i += 1;
      continue;
    }
    break;
  }
  if (isPunct(tokens[i], ";")) i += 1;
  return { names, values, functions, timeoutMs, next: i };
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
  const values = [];
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
    return { functions, exportNames, values, reexports, timeoutMs, next: fn.close + 1 };
  }
  if (isIdent(tokens[i], "class") && tokens[i + 1]?.type === "ident") {
    const cls = readClass(tokens, i);
    exportNames.push(cls.name);
    functions.push({ name: cls.name, exported: true, calls: cls.calls });
    return { functions, exportNames, values, reexports, timeoutMs, next: cls.close + 1 };
  }
  if (isIdent(tokens[i], "const") || isIdent(tokens[i], "let") || isIdent(tokens[i], "var")) {
    const read = readConst(tokens, i, true);
    exportNames.push(...read.names);
    values.push(...read.values);
    functions.push(...read.functions);
    return { functions, exportNames, values, reexports, timeoutMs: read.timeoutMs, next: read.next };
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
      return { functions, exportNames, values, reexports, timeoutMs, next: finishSemi(tokens, i + 2) };
    }
    for (const item of read.specs) exportNames.push(item.local);
    return { functions, exportNames, values, reexports, timeoutMs, next: finishSemi(tokens, i) };
  }
  if (isPunct(tokens[i], "*")) {
    i += 1;
    if (isIdent(tokens[i], "as")) {
      const exported = tokens[i + 1].value;
      const spec = tokens[i + 3].value;
      exportNames.push(exported);
      reexports.push({ kind: "star-as", exported, spec });
      return { functions, exportNames, values, reexports, timeoutMs, next: finishSemi(tokens, i + 4) };
    }
    const spec = tokens[i + 1].value;
    reexports.push({ kind: "star", spec });
    return { functions, exportNames, values, reexports, timeoutMs, next: finishSemi(tokens, i + 2) };
  }
  if (isIdent(tokens[i], "default")) {
    exportNames.push("default");
    if (isIdent(tokens[i + 1], "function") || (isIdent(tokens[i + 1], "async") && isIdent(tokens[i + 2], "function"))) {
      const fnAt = isIdent(tokens[i + 1], "async") ? i + 2 : i + 1;
      const fn = readFunction(tokens, fnAt);
      functions.push({ name: fn.name ?? "default", exported: true, calls: fn.calls });
      return { functions, exportNames, values, reexports, timeoutMs, next: fn.close + 1 };
    }
    return { functions, exportNames, values, reexports, timeoutMs, next: skipStatement(tokens, i + 1) };
  }
  return { functions, exportNames, values, reexports, timeoutMs, next: skipStatement(tokens, i) };
}

function parseModule(text, file) {
  let tokens;
  try {
    tokens = lex(text);
    assertBalanced(tokens, file);
    assertStaticExecution(tokens, file);
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  const namedImports = [];
  const namespaceImports = [];
  const reexports = [];
  const exportNames = new Set();
  const valueExports = new Set();
  const functions = [];
  const cpLocals = new Set();
  const cpNamespaces = new Set();
  let importsChildProcess = loadsChildProcess(tokens);
  let timeoutMs = null;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const prev = tokens[i - 1];
    if (isPunct(prev, ".")) continue;
    if (isIdent(token, "import") && !isPunct(tokens[i + 1], "(") && !isPunct(tokens[i + 1], ".")) {
      const read = readImport(tokens, i);
      if (CHILD_PROCESS_SPECS.has(read.spec)) importsChildProcess = true;
      if (read.namespace) {
        namespaceImports.push({ local: read.namespace, spec: read.spec });
        if (CHILD_PROCESS_SPECS.has(read.spec)) cpNamespaces.add(read.namespace);
      }
      if (read.defaultName) {
        namedImports.push({ local: read.defaultName, imported: "default", spec: read.spec });
        if (CHILD_PROCESS_SPECS.has(read.spec)) cpNamespaces.add(read.defaultName);
      }
      for (const spec of read.named) {
        namedImports.push({ local: spec.local, imported: spec.imported, spec: read.spec });
        if (CHILD_PROCESS_SPECS.has(read.spec)) cpLocals.add(spec.local);
      }
      i = read.next - 1;
      continue;
    }
    if (isIdent(token, "export")) {
      const read = readExport(tokens, i);
      for (const name of read.exportNames) exportNames.add(name);
      for (const name of read.values) valueExports.add(name);
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
      continue;
    }
    if (isIdent(token, "class") && tokens[i + 1]?.type === "ident" && !isIdent(prev, "export")) {
      const cls = readClass(tokens, i);
      functions.push({ name: cls.name, exported: false, calls: cls.calls });
      i = cls.close;
    }
  }
  return {
    tokens,
    namedImports,
    namespaceImports,
    reexports,
    exportNames,
    valueExports,
    functions,
    cpLocals,
    cpNamespaces,
    importsChildProcess,
    timeoutMs,
  };
}

function loadsChildProcess(tokens) {
  for (let i = 0; i + 2 < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "ident" || !LOADER_CALLS.has(token.value) || !isPunct(tokens[i + 1], "(")) continue;
    if (tokens[i + 2].type === "string" && CHILD_PROCESS_SPECS.has(tokens[i + 2].value)) return true;
  }
  return false;
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
  // Only a complete timeout property is understood; nested, duplicate and computed values
  // cannot establish the timeout Vitest will receive.
  const shape = significant.length === 5 || (significant.length === 6 && isPunct(significant[4], ","));
  return shape && isPunct(significant[0], "{") && isIdent(significant[1], "timeout") &&
    isPunct(significant[2], ":") && isIdent(significant[3], localName) && isPunct(significant.at(-1), "}");
}

function argCalls(args) {
  return args.flatMap((arg) => callsFrom(arg));
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

/**
 * `test(...)`, `test.only(...)`, `test.concurrent(...)` and the curried forms `test.each(table)(...)`
 * and `test.skipIf(cond)(...)` all register a test; the last call in the chain is the test call.
 */
function testCallsIn(tokens, text, testLocals, timeoutLocal) {
  const calls = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type !== "ident" || !testLocals.has(tokens[i].value)) continue;
    if (isPunct(tokens[i - 1], ".")) continue;
    let j = i + 1;
    while (isPunct(tokens[j], ".") && tokens[j + 1]?.type === "ident") j += 2;
    if (!isPunct(tokens[j], "(")) continue;
    let parsed = parseCall(tokens, j);
    let closeIndex = tokens.indexOf(parsed.close);
    while (isPunct(tokens[closeIndex + 1], "(")) {
      parsed = parseCall(tokens, closeIndex + 1);
      closeIndex = tokens.indexOf(parsed.close);
    }
    calls.push({
      name: testTitle(parsed.args, text),
      line: lineAt(text, tokens[i].start),
      close: parsed.close.start,
      calls: argCalls(parsed.args),
      passesTimeout: argIsTimeout(parsed.args[2] ?? [], timeoutLocal) ||
        (isPunct(parsed.args[1]?.[0], "{") && argIsTimeout(parsed.args[1], timeoutLocal)),
    });
    i = closeIndex;
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
  if (CHILD_PROCESS_SPECS.has(spec)) return { kind: "cp" };
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
          ((call.kind === "call" || call.kind === "value") && mod.cpLocals.has(call.name)) ||
          (call.kind === "method" && mod.cpNamespaces.has(call.object)) ||
          (call.kind === "load" && CHILD_PROCESS_SPECS.has(call.spec));
        const via = (call.kind === "call" || call.kind === "value") && names.has(call.name) && spawning.has(call.name);
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

/** A module that loads child_process in any form spawns through every export, parsed or not. */
function moduleSpawns(target) {
  return Boolean(target) && !target.isHelpers && target.importsChildProcess;
}

function namedSpawns(binding) {
  if (binding?.kind !== "named" || !binding.target) return false;
  return moduleSpawns(binding.target) || binding.target.spawning.has(binding.imported);
}

function callsSpawning(calls, mod, spawningLocals) {
  for (const call of calls) {
    if (call.kind === "load") {
      if (CHILD_PROCESS_SPECS.has(call.spec)) return true;
      const target = mod.resolveModule(call.spec);
      if (target && (moduleSpawns(target) || target.spawning.size > 0)) return true;
    }
    if ((call.kind === "call" || call.kind === "value") && spawningLocals.has(call.name)) return true;
    if (call.kind === "call" && namedSpawns(mod.bindings.get(call.name))) return true;
    if (call.kind === "value") {
      const binding = mod.bindings.get(call.name);
      if (!binding?.target?.valueExports.has(binding.imported) && namedSpawns(binding)) return true;
    }
    if (call.kind === "method") {
      if (spawningLocals.has(call.object)) return true;
      const binding = mod.bindings.get(call.object);
      if (binding?.kind === "namespace" && (moduleSpawns(binding.target) || binding.target?.spawning.has(call.prop))) return true;
      if (binding?.kind === "named" && binding.target && moduleSpawns(binding.target) && binding.target.exportNames.size === 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Only direct, known namespace method calls are modelled. Reject other references rather than
 * guessing what destructuring, computed access, aliasing or forwarding will do at runtime.
 */
function assertNamespaceUses(mod) {
  const namespaces = new Map([...mod.bindings].filter(([, binding]) =>
    ((binding.kind === "namespace" || binding.imported === "default") && CHILD_PROCESS_SPECS.has(binding.spec)) ||
    (binding.kind === "namespace" && binding.target && (moduleSpawns(binding.target) || binding.target.spawning.size > 0))));
  if (namespaces.size === 0) return;
  for (let i = 0; i < mod.tokens.length; i += 1) {
    const token = mod.tokens[i];
    if (isIdent(token, "import") && !isPunct(mod.tokens[i + 1], "(") && !isPunct(mod.tokens[i + 1], ".")) {
      i = readImport(mod.tokens, i).next - 1;
      continue;
    }
    if (token.type !== "ident" || !namespaces.has(token.value)) continue;
    const binding = namespaces.get(token.value);
    const prop = mod.tokens[i + 2];
    const direct = isPunct(mod.tokens[i + 1], ".") && prop?.type === "ident" &&
      isPunct(mod.tokens[i + 3], "(") &&
      (CHILD_PROCESS_SPECS.has(binding.spec) || moduleSpawns(binding.target) || binding.target.exportNames.has(prop.value));
    if (!direct) throw new Error(`${mod.rel}: unrecognised spawning namespace use at ${token.start}`);
  }
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
    if (namedSpawns(binding)) return true;
    if (binding.kind === "namespace" && binding.target && (moduleSpawns(binding.target) || binding.target.spawning.size > 0)) {
      return true;
    }
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
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (error) {
      // A per-process temp file of a concurrent run can vanish between listing and reading.
      if (error?.code === "ENOENT") continue;
      throw error;
    }
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
      valueExports: new Set(mod.valueExports),
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
  const resolve = (fromAbs, spec) => {
    const resolved = resolveSpec(fromAbs, spec, known);
    // Ignore an unrelated disappearing temp file, but never erase an imported graph edge.
    const rel = posix(relative(root, join(dirname(fromAbs), spec)));
    if (resolved.kind === "missing" && rel.startsWith("tools/")) {
      throw new Error(`${posix(relative(root, fromAbs))}: missing module inside tools: ${spec}`);
    }
    return resolved;
  };
  for (const mod of mods.values()) {
    mod.resolveModule = (spec) => {
      const resolved = resolve(mod.abs, spec);
      return resolved.kind === "file" ? (mods.get(resolved.abs) ?? null) : null;
    };
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
    assertNamespaceUses(mod);
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
