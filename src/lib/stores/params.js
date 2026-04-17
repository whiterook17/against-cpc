// src/lib/stores/params.js
// Single source of truth for all physics slider parameters.

import { writable } from 'svelte/store';
import { DEFAULT_PARAMS } from '$lib/physics/constants.js';

// The writable store — subscribed to by ParameterSlider components and Worker reactivity.
export const params = writable({ ...DEFAULT_PARAMS });

/**
 * Load a preset object into the store.
 * Merges with DEFAULT_PARAMS so partial presets are safe.
 */
export function loadPreset(preset) {
  params.set({ ...DEFAULT_PARAMS, ...preset });
}

/**
 * Encode current params to a base64 URL-safe string for sharing.
 * Usage: /construct/parameter-lab#{encoded}
 */
export function encodeParamsToHash(p) {
  return btoa(JSON.stringify(p));
}

/**
 * Decode a base64 hash and load the params into the store.
 * Falls back to defaults on parse error.
 */
export function loadFromHash(hash) {
  try {
    const decoded = JSON.parse(atob(hash));
    params.set({ ...DEFAULT_PARAMS, ...decoded });
  } catch {
    console.warn('[params] Invalid parameter hash — using defaults');
    params.set({ ...DEFAULT_PARAMS });
  }
}
