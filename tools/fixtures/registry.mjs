import { name, regen, seed, trees, version } from "../generators/terms/generate.mjs";

/**
 * Each generator is { name, version, seed, trees, regen(root) }.
 * Output trees are what fixtures:trees prints.
 * The terms generator, version 1, owns fixtures/synthetic/terms.
 */
export const generators = [{ name, version, seed, trees, regen }];
