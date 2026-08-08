/**
 * dnaProcessor.js
 * Pure recipe logic for the Gene Bench — no world/event side effects.
 *
 * SLOT MAP (5-slot entity inventory):
 *   0 → Input A   1 → Input B
 *   2 → Output 1  3 → Output 2  4 → Output 3
 */

export const RECIPES = [
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
            { id: "dna:failed_syringe", amount: 2 },
            { id: null, amount: 0 },
            { id: null, amount: 0 }
        ],
        failChance: 0.35
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

    // Consume inputs last (after output slots confirmed empty)
    changes.push({ slot: 0, id: null, amount: 0 });
    changes.push({ slot: 1, id: null, amount: 0 });

    return changes;
}
