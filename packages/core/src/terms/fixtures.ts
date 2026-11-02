import manifest from "../../../../fixtures/synthetic/terms/manifest.json" with { type: "json" };

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: "?raw"; import: "default"; eager: true },
    ): Record<string, string>;
  }
}

const termFiles = import.meta.glob("../../../../fixtures/synthetic/terms/**/*.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const termsManifest = manifest;

export function textsIn(folder: "valid" | "invalid"): Map<string, string> {
  const found = new Map<string, string>();
  const marker = `/${folder}/`;
  for (const [path, text] of Object.entries(termFiles)) {
    const at = path.lastIndexOf(marker);
    if (at === -1) continue;
    found.set(path.slice(at + marker.length), text);
  }
  return found;
}

export function textOf(folder: "valid" | "invalid", name: string): string {
  const text = textsIn(folder).get(name);
  if (text === undefined) throw new Error(`missing fixture ${folder}/${name}`);
  return text;
}
