export function sameTwice(run: () => unknown): boolean {
  return JSON.stringify(run()) === JSON.stringify(run());
}
