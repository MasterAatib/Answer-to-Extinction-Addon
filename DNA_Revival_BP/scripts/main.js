/**
 * main.js
 * Entry point — imports and registers all subsystems.
 * No logic lives here; this file only wires things together.
 */

import { registerBenchEvents }          from "./bench.js";
import { registerInjectorEvents }       from "./injector.js";
import { registerTransformationEvents } from "./transformationHandler.js";

registerBenchEvents();
registerInjectorEvents();
registerTransformationEvents();
