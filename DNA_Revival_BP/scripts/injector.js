/**
 * injector.js
 * DNA Sample Collection — hit a mob while holding an empty syringe
 * to extract a DNA sample from it.
 *
 * HOW IT WORKS:
 *   1. Player attacks any entity while holding dna:empty_syringe
 *   2. If the entity's typeId is in DNA_SAMPLE_MAP, the empty syringe
 *      in the player's main hand is replaced with the matching sample.
 *   3. A small cooldown (COOLDOWN_TICKS) prevents draining a full stack
 *      on rapid hits — one sample per cooldown window per player.
 *   4. If the entity is not in the map, nothing happens (syringe kept).
 */

import { world, system, ItemStack } from "@minecraft/server";
import { EMPTY_SYRINGE_ID, DNA_SAMPLE_MAP } from "./constants.js";

/** Ticks between allowed collections per player (prevents spam). */
const COOLDOWN_TICKS = 10;

/** Map of playerName → game tick when they last collected a sample. */
const cooldowns = new Map();

export function registerInjectorEvents() {
  world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    // Only care about player attackers
    if (damagingEntity.typeId !== "minecraft:player") return;

    const player = damagingEntity;

    // Cooldown check
    const now = system.currentTick;
    const last = cooldowns.get(player.name) ?? -Infinity;
    if (now - last < COOLDOWN_TICKS) return;

    // Player must be holding empty syringe in main hand
    const equip = player.getComponent("minecraft:equippable");
    if (!equip) return;
    const held = equip.getEquipment("Mainhand");
    if (!held || held.typeId !== EMPTY_SYRINGE_ID) return;

    // Mob must be in the DNA map
    const sampleId = DNA_SAMPLE_MAP[hitEntity.typeId];
    if (!sampleId) return;

    // Replace empty syringe with filled sample in mainhand
    equip.setEquipment("Mainhand", new ItemStack(sampleId, 1));
    cooldowns.set(player.name, now);

    // Feedback
    player.sendMessage(`§aDNA collected from ${hitEntity.typeId.replace("minecraft:", "").replace("dna:", "")}!`);

    // Optional: play a sound at the hit entity location
    hitEntity.dimension.playSound("random.orb", hitEntity.location, {
      volume: 0.6,
      pitch: 1.8,
    });
  });
}
