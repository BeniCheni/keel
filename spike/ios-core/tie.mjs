export const TIE_FILE = "tie/minimal.yaml";

export function tieText(minimal) {
  const patterns = [
    /call:\n[\s\S]*?(?=premium:)/,
    /barrier:\n[\s\S]*?(?=economics:)/,
    /economics:\n[\s\S]*?(?=sources:)/,
  ];
  let text = minimal;
  for (const pattern of patterns) {
    const next = text.replace(pattern, "");
    if (next === text) throw new Error("tie edit did not apply");
    text = next;
  }
  return text;
}
