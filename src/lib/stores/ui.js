// src/lib/stores/ui.js
import { writable } from 'svelte/store';

// Engineering view toggles (persist across construct sub-pages)
export const showLabels    = writable(true);
export const showDims      = writable(true);
export const showEqs       = writable(true);
export const activeView    = writable('axial');       // 'axial' | 'longit' | 'cutaway'
export const isExploded    = writable(false);

// Layer visibility
export const layers = writable({
  torus:    true,
  coupling: true,
  casimir:  true,
  throat:   true,
});

// Simulator state
export const perturbationActive = writable(false);
export const perturbationTime   = writable(0);
export const showPenrose        = writable(false);
export const activePreset       = writable('near-extremal');

// Global nav
export const mobileNavOpen = writable(false);
