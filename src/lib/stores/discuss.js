// src/lib/stores/discuss.js
// Discussion page state — active category filter and gap filter.

import { writable, derived } from 'svelte/store';

export const CATEGORIES = [
  'ALL',
  'MATHEMATICAL GAP',
  'ENGINEERING',
  'OBSERVATIONAL',
  'THEORETICAL',
  'CORRECTION',
  'GENERAL',
];

// Currently active category tab
export const activeCategory = writable('ALL');

// Currently active gap filter (null = show all)
export const activeGap = writable(null);

// All loaded comments (populated from comments.json on mount)
export const allComments = writable([]);

/**
 * Derived filtered comment list.
 * Applies activeCategory and activeGap filters.
 */
export const filteredComments = derived(
  [allComments, activeCategory, activeGap],
  ([$all, $cat, $gap]) => {
    return $all.filter((c) => {
      const catMatch = $cat === 'ALL' || c.category === $cat;
      const gapMatch = $gap === null  || c.gap_ref === $gap;
      return catMatch && gapMatch;
    });
  },
);
