import { name, regen, seed, trees, version } from "../generators/terms/generate.mjs";
import {
  name as goldenName,
  regen as goldenRegen,
  seed as goldenSeed,
  trees as goldenTrees,
  version as goldenVersion,
} from "../generators/golden/generate.mjs";

/**
 * Each generator is { name, version, seed, trees, regen(root) }.
 * Output trees are what fixtures:trees prints.
 * The terms generator, version 2, owns fixtures/synthetic/terms.
 * The golden generator, version 1, owns fixtures/golden.
 */
export const generators = [
  { name, version, seed, trees, regen },
  { name: goldenName, version: goldenVersion, seed: goldenSeed, trees: goldenTrees, regen: goldenRegen },
];
