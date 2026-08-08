/**
 * transformationHandler.js
 * Handles applying filled DNA syringes to spawn extinct mobs.
 *
 * HOW IT WORKS:
 *   1. Player uses (right-clicks) a filled syringe on the ground / in air
 *   2. The correct mob is spawned at the player's feet
 *   3. The syringe is consumed from the player's hand
 *
 * Add entries to SYRINGE_SPAWN_MAP to register more syringes.
 */

import { world, system, ItemStack } from "@minecraft/server";

/**
 * Maps syringe item id → entity typeId to spawn.
 */
const SYRINGE_SPAWN_MAP = {
  "dna:dodo_syringe":      "dna:dodo",
  "dna:dire_wolf_syringe": "dna:dire_wolf",
};

export function registerTransformationEvents() {
  world.beforeEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item   = ev.itemStack;
    if (!item) return;

    const spawnId = SYRINGE_SPAWN_MAP[item.typeId];
    if (!spawnId) return;

    // Cancel default item use behaviour
    ev.cancel = true;

    system.run(() => {
      // Spawn mob slightly in front of player
      const loc = {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z,
      };

      try {
        player.dimension.spawnEntity(spawnId, loc);
      } catch (e) {
        player.sendMessage(`§cFailed to spawn entity: ${e}`);
        return;
      }

      // Consume one syringe from mainhand
      const equip = player.getComponent("minecraft:equippable");
      if (!equip) return;
      const held = equip.getEquipment("Mainhand");
      if (!held) return;

      if (held.amount > 1) {
        const remaining = new ItemStack(held.typeId, held.amount - 1);
        equip.setEquipment("Mainhand", remaining);
      } else {
        equip.setEquipment("Mainhand", undefined);
      }

      player.sendMessage(`§bRevival successful! A ${spawnId.replace("dna:", "")} has been born.`);
    });
  });
}
