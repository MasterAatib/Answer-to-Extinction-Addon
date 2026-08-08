/**
 * bench.js
 * Handles spawning, despawning, and tick-processing
 * of the Gene Bench container entity.
 */

import { world, system, ItemStack } from "@minecraft/server";
import { BENCH_ENTITY_ID, BENCH_BLOCK_ID, BENCH_UI_TITLE } from "./constants.js";
import { tryProcessBench } from "./dnaProcessor.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBenchEntity(block) {
  return block.dimension.getEntities({
    type: BENCH_ENTITY_ID,
    location: { x: block.x + 0.5, y: block.y, z: block.z + 0.5 },
    maxDistance: 1,
  })[0] ?? null;
}

function spawnBenchEntity(block) {
  if (getBenchEntity(block)) return;
  const entity = block.dimension.spawnEntity(BENCH_ENTITY_ID, {
    x: block.x + 0.5,
    y: block.y,
    z: block.z + 0.5,
  });
  entity.nameTag = BENCH_UI_TITLE;
}

function dropAndRemoveBench(block) {
  const entity = getBenchEntity(block);
  if (!entity) return;
  const inv = entity.getComponent("minecraft:inventory");
  if (inv) {
    const drop = { x: block.x + 0.5, y: block.y + 1, z: block.z + 0.5 };
    for (let s = 0; s < inv.container.size; s++) {
      const item = inv.container.getItem(s);
      if (item) block.dimension.spawnItem(item, drop);
    }
  }
  entity.remove();
}

function applyChanges(changes, container) {
  for (const { slot, id, amount } of changes) {
    if (!id || amount === 0) {
      container.setItem(slot, undefined);
    } else {
      container.setItem(slot, new ItemStack(id, amount));
    }
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function registerBenchEvents() {
  world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
    if (block.typeId === BENCH_BLOCK_ID) {
      system.run(() => spawnBenchEntity(block));
    }
  });

  world.afterEvents.playerBreakBlock.subscribe(({ block, brokenBlockPermutation }) => {
    if (brokenBlockPermutation.type.id === BENCH_BLOCK_ID) {
      dropAndRemoveBench(block);
    }
  });

  // Process bench recipes every second (20 ticks)
  system.runInterval(() => {
    for (const dimId of ["overworld", "nether", "the_end"]) {
      let dim;
      try { dim = world.getDimension(dimId); } catch { continue; }
      for (const entity of dim.getEntities({ type: BENCH_ENTITY_ID })) {
        const inv = entity.getComponent("minecraft:inventory");
        if (!inv) continue;
        const changes = tryProcessBench(inv);
        if (changes) applyChanges(changes, inv.container);
      }
    }
  }, 20);
}
