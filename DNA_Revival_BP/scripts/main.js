import { world, system, ItemStack } from "@minecraft/server";
import { tryProcessBench } from "./dnaProcessor.js";

const BENCH_ENTITY_ID = "dna:gene_bench_entity";
const BENCH_UI_TITLE  = "gui.gene_bench.ui";

function getEntity(block) {
  return block.dimension.getEntities({
    type: BENCH_ENTITY_ID,
    location: { x: block.x + 0.5, y: block.y, z: block.z + 0.5 },
    maxDistance: 1
  })[0] ?? null;
}

function spawnBenchEntity(block) {
  if (getEntity(block)) return;
  const entity = block.dimension.spawnEntity(BENCH_ENTITY_ID, {
    x: block.x + 0.5,
    y: block.y,
    z: block.z + 0.5
  });
  // nameTag drives $container_title in chest_screen.json
  // minecraft:nameable is NOT on the entity so this won't render as a label
  entity.nameTag = BENCH_UI_TITLE;
}

function dropAndRemove(block) {
  const entity = getEntity(block);
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

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("dna:experiment_bench_component", {

    onPlace({ block }) {
      system.run(() => spawnBenchEntity(block));
    },

    onPlayerDestroy({ block }) {
      dropAndRemove(block);
    }
  });
});

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
