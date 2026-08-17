/**
 * dnaProcessor.js
 * Pure recipe logic for the Gene Bench — no world/event side effects.
 *
 * SLOT MAP (5-slot entity inventory):
 *   0 → Input A   1 → Input B
 *   2 → Output 1  3 → Output 2  4 → Output 3
 */

export const RECIPES = [
  // Existing recipes
  {
    id: "chicken_to_dodo",
    inputA: "dna:chicken_sample",
    inputB: "dna:spirit_gem",
    outputs: [
      { id: "dna:dodo_syringe", amount: 1 },
      { id: null, amount: 0 },
      { id: null, amount: 0 }
    ],
    failChance: 0.25
  },
  {
    id: "wolf_to_dire_wolf",
    inputA: "dna:wolf_sample",
    inputB: "dna:spirit_gem",
    outputs: [
      { id: "dna:dire_wolf_syringe", amount: 1 },
      { id: null, amount: 0 },
      { id: null, amount: 0 }
    ],
    failChance: 0.35
  },
  {
    id: "dolphin_to_dorudon",
    inputA: "dna:dolphin_sample",
    inputB: "dna:spirit_gem",
    outputs: [
      { id: "dna:dorudon_syringe", amount: 1 },
      { id: null, amount: 0 },
      { id: null, amount: 0 }
    ],
    failChance: 0.25
  },
  {
    id: "goat_to_deer",
    inputA: "dna:goat_sample",
    inputB: "dna:cow_sample",  // intentionally different catalyst
    outputs: [
      { id: "dna:deer_syringe", amount: 1 },
      { id: null, amount: 0 },
      { id: null, amount: 0 }
    ],
    failChance: 0.20
  },
  {
    id: "cat_to_smilodon",
    inputA: "dna:cat_sample",
    inputB: "dna:spirit_gem",
    outputs: [
      { id: "dna:smilodon_syringe", amount: 1 },
      { id: null, amount: 0 },
      { id: null, amount: 0 }
    ],
    failChance: 0.30
  }
];

export function findRecipe(idA, idB) {
  for (const r of RECIPES) {
    if (
      (r.inputA === idA && r.inputB === idB) ||
      (r.inputA === idB && r.inputB === idA)
    )
      return r;
  }
  return null;
}

export function tryProcessBench(inv) {
  const container = inv.container;

  const slotA = container.getItem(0);
  const slotB = container.getItem(1);
  if (!slotA || !slotB) return null;

  const recipe = findRecipe(slotA.typeId, slotB.typeId);
  if (!recipe) return null;

  // All output slots must be empty before consuming inputs
  for (let s = 2; s <= 4; s++) {
    if (container.getItem(s)) return null;
  }

  const failed = Math.random() < recipe.failChance;
  const changes = [];

  if (failed) {
    changes.push({ slot: 2, id: "dna:failed_syringe", amount: 1 });
    changes.push({ slot: 3, id: null, amount: 0 });
    changes.push({ slot: 4, id: null, amount: 0 });
  } else {
    for (let i = 0; i < 3; i++) {
      const out = recipe.outputs[i] ?? { id: null, amount: 0 };
      changes.push({ slot: i + 2, id: out.id, amount: out.amount });
    }
  }

  // --- FIX: consume ONE from each input slot, not the whole stack ---
  const slotAItem = container.getItem(0);
  const slotBItem = container.getItem(1);

  if (slotAItem.amount > 1) {
    changes.push({ slot: 0, id: slotAItem.typeId, amount: slotAItem.amount - 1 });
  } else {
    changes.push({ slot: 0, id: null, amount: 0 });
  }

  if (slotBItem.amount > 1) {
    changes.push({ slot: 1, id: slotBItem.typeId, amount: slotBItem.amount - 1 });
  } else {
    changes.push({ slot: 1, id: null, amount: 0 });
  }

  return changes;
}