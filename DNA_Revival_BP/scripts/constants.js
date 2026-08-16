/**
 * constants.js
 * Shared identifiers used across all modules.
 */

export const BENCH_ENTITY_ID = "dna:gene_bench_entity";
export const BENCH_BLOCK_ID  = "dna:experiment_bench";
export const BENCH_UI_TITLE  = "gui.gene_bench.ui";

/**
 * Maps entity typeId → DNA sample item given when hitting with empty syringe.
 */
export const DNA_SAMPLE_MAP = {
  "minecraft:chicken": "dna:chicken_sample",
  "minecraft:wolf":    "dna:wolf_sample",
  "dna:dire_wolf":     "dna:wolf_sample",
  "dna:dodo":          "dna:chicken_sample",
  "dna:smilodon":      "dna:smilodon_sample",
  "dna:dorudon":       "dna:dorudon_sample",
  "dna:deer":          "dna:deer_sample",
};

/** The item the player must hold to collect a DNA sample. */
export const EMPTY_SYRINGE_ID = "dna:empty_syringe";
