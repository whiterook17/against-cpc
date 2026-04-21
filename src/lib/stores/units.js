// src/lib/stores/units.js
// Global unit preference — 'rg' (geometric) or 'si' (metric).

import { writable } from 'svelte/store';

export const unitMode = writable('rg');

export function toggleUnits() {
  unitMode.update(m => m === 'rg' ? 'si' : 'rg');
}
