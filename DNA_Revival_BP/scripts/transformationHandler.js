/**
 * transformationHandler.js
 * Using a filled DNA syringe spawns the matching extinct mob.
 */

import { world, system, ItemStack } from "@minecraft/server";

const SYRINGE_SPAWN_MAP = {
  "dna:dodo_syringe":      "dna:dodo",
  "dna:dire_wolf_syringe": "dna:dire_wolf",
  "dna:smilodon_syringe":  "dna:smilodon",
  "dna:dorudon_syringe":   "dna:dorudon",
  "dna:deer_syringe":      "dna:deer",
};

export function registerTransformationEvents() {
  world.beforeEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item   = ev.itemStack;
    if (!item) return;

    const spawnId = SYRINGE_SPAWN_MAP[item.typeId];
    if (!spawnId) return;

    ev.cancel = true;

    system.run(() => {
      try {
        player.dimension.spawnEntity(spawnId, player.location);
      } catch (e) {
        player.sendMessage(`§cFailed to spawn: ${e}`);
        return;
      }

      const equip = player.getComponent("minecraft:equippable");
      if (!equip) return;
      const held = equip.getEquipment("Mainhand");
      if (!held) return;

      if (held.amount > 1) {
        equip.setEquipment("Mainhand", new ItemStack(held.typeId, held.amount - 1));
      } else {
        equip.setEquipment("Mainhand", undefined);
      }

      const name = spawnId.replace("dna:", "").replace(/_/g, " ");
      player.sendMessage(`§bRevival successful! A ${name} has been born.`);
    });
  });
}
