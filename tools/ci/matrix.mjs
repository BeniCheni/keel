export const nodeLines = ["24", "26"];
export const oses = ["ubuntu-latest", "macos-latest"];

export function cellName(os, node) {
  return `cell (${os}, node ${node})`;
}

export function expectedCells() {
  const names = [];
  for (const os of oses) {
    for (const node of nodeLines) names.push(cellName(os, node));
  }
  return names;
}
