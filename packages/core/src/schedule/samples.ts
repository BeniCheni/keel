import { loadTerms } from "../terms/load.ts";
import { textOf } from "../terms/fixtures.ts";
import type { Terms } from "../terms/types.ts";

function loadedTerms(name: string): Terms {
  const loaded = loadTerms(textOf("valid", name), name);
  if (!loaded.ok) throw new Error("fixture did not load");
  return loaded.terms;
}

export function loadMinimal(): Terms {
  return loadedTerms("minimal.yaml");
}

export function loadExample(): Terms {
  return loadedTerms("example-autocall.yaml");
}
