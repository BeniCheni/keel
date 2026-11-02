import { isAlias, isMap, isScalar, isSeq, type Document, type LineCounter, type Node } from "yaml";

export interface Pos {
  line: number;
  column: number;
}

export interface ScalarInfo {
  raw: string;
  value: unknown;
  pos: Pos;
}

export interface Site {
  path: string;
  pos: Pos;
}

export interface DocIndex {
  keys: Map<string, Pos>;
  values: Map<string, Pos>;
  scalars: Map<string, ScalarInfo>;
  duplicates: Site[];
  aliases: Site[];
  anchors: Site[];
  tags: Site[];
}

export function positionAt(counter: LineCounter, offset: number): Pos {
  const pos = counter.linePos(offset);
  return { line: pos.line, column: pos.col };
}

export function parentPath(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "";
  return path.slice(0, dot);
}

export function missingPos(path: string, index: DocIndex): Pos {
  const parent = parentPath(path);
  if (parent === "") return { line: 1, column: 1 };
  return index.keys.get(parent) ?? { line: 1, column: 1 };
}

export function nodePos(path: string, index: DocIndex): Pos {
  return index.values.get(path) ?? index.keys.get(path) ?? { line: 1, column: 1 };
}

interface Ranged {
  range?: [number, number, number] | null;
  tag?: string | null;
  srcToken?: unknown;
}

function hasRange(node: unknown): node is Ranged & { range: [number, number, number] } {
  return typeof node === "object" && node !== null && Array.isArray((node as Ranged).range);
}

export function indexDocument(doc: Document, text: string, counter: LineCounter): DocIndex {
  const index: DocIndex = {
    keys: new Map(),
    values: new Map(),
    scalars: new Map(),
    duplicates: [],
    aliases: [],
    anchors: [],
    tags: [],
  };
  if (doc.contents) walk(doc.contents, "", text, counter, index);
  collectAnchors(doc.contents, counter, index);
  return index;
}

function walk(node: Node, path: string, text: string, counter: LineCounter, index: DocIndex): void {
  const ranged = node as Ranged;
  if (typeof ranged.tag === "string" && hasRange(node)) {
    index.tags.push({ path, pos: positionAt(counter, node.range[0]) });
  }
  if (isAlias(node)) {
    if (hasRange(node)) index.aliases.push({ path, pos: positionAt(counter, node.range[0]) });
    return;
  }
  if (isMap(node)) {
    const seen = new Map<string, number>();
    for (const pair of node.items) {
      if (!pair.key || !isScalar(pair.key)) continue;
      const key = String(pair.key.value);
      const next = path === "" ? key : `${path}.${key}`;
      const keyPos = hasRange(pair.key) ? positionAt(counter, pair.key.range[0]) : { line: 1, column: 1 };
      if (typeof (pair.key as Ranged).tag === "string") index.tags.push({ path: next, pos: keyPos });
      index.keys.set(next, keyPos);
      const count = (seen.get(key) ?? 0) + 1;
      seen.set(key, count);
      if (count > 1) index.duplicates.push({ path: next, pos: keyPos });
      if (pair.value) walk(pair.value as Node, next, text, counter, index);
    }
    return;
  }
  if (isSeq(node)) {
    node.items.forEach((item, itemIndex) => {
      const next = `${path}[${itemIndex}]`;
      if (item && hasRange(item)) index.keys.set(next, positionAt(counter, item.range[0]));
      if (item) walk(item as Node, next, text, counter, index);
    });
    return;
  }
  if (isScalar(node) && hasRange(node)) {
    const pos = positionAt(counter, node.range[0]);
    const raw = text.slice(node.range[0], node.range[1]);
    index.values.set(path, pos);
    index.scalars.set(path, { raw, value: node.value, pos });
  }
}

function collectAnchors(node: unknown, counter: LineCounter, index: DocIndex): void {
  const seen = new WeakSet<object>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    const token = value as { type?: unknown; offset?: unknown; source?: unknown };
    if (token.type === "anchor" && typeof token.offset === "number") {
      index.anchors.push({ path: "", pos: positionAt(counter, token.offset) });
    }
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) {
        for (const item of child) visit(item);
      } else visit(child);
    }
  };
  const root = node as Ranged | null;
  visit(root?.srcToken);
}
