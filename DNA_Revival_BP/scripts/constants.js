/**
 * constants.js
 * Shared identifiers used across all modules.
 */

export const BENCH_ENTITY_ID = "dna:gene_bench_entity";
export const BENCH_BLOCK_ID  = "dna:experiment_bench";
export const BENCH_UI_TITLE  = "gui.gene_bench.ui";

/**
 * Maps each mob type_family / entity typeId to the DNA sample item
 * that the empty syringe should fill when hitting that mob.
 *
 * Key   → entity typeId (what getEntities returns, e.g. "minecraft:wolf")
 * Value → item id of the filled sample syringe
 */
export const DNA_SAMPLE_MAP = {
  "minecraft:chicken": "dna:chicken_sample",
  "minecraft:wolf":    "dna:wolf_sample",
  "dna:dire_wolf":     "dna:wolf_sample",
  "dna:dodo":          "dna:chicken_sample",
};

/** The item the player must be holding to collect a DNA sample. */
export const EMPTY_SYRINGE_ID = "dna:empty_syringe";
