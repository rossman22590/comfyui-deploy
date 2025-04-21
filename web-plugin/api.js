/**
 * API wrapper for ComfyUI
 * Provides compatibility when the standard ComfyUI API isn't available
 */

/** @typedef {import('../../../web/scripts/api.js').api} API*/
import { api as _api } from '/scripts/api.js';
/** @type {API} */
export const api = _api;
