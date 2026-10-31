import { generators } from "./registry.mjs";

for (const generator of generators) generator.regen(process.cwd());
