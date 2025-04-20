/**
 * App wrapper for ComfyUI
 * Provides compatibility when the standard ComfyUI app isn't available
 */

/** @typedef {import('../../../web/scripts/app.js').ComfyApp} ComfyApp*/
import { app as _app } from '../../scripts/app.js';
/** @type {ComfyApp} */
export const app = _app;
