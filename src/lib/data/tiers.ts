// Single source of truth for epistemic tier colours and labels.
// Import this wherever tier colours are needed — never hardcode tier styling elsewhere.

export const TIER_CONFIG = {
  1: {
    accent: 'var(--teal)',
    faint: 'var(--teal-faint)',
    label: 'TIER I — CONFIRMED FOUNDATION',
  },
  2: {
    accent: 'var(--gold)',
    faint: 'var(--gold-faint)',
    label: 'TIER II — WELL-MOTIVATED EXTRAPOLATION',
  },
  3: {
    accent: 'var(--purple)',
    faint: 'var(--purple-faint)',
    label: 'TIER III — CONJECTURAL BUT CONSISTENT',
  },
  4: {
    accent: 'var(--red)',
    faint: 'var(--red-faint)',
    label: 'TIER IV — EXPLICIT GAP',
  },
} as const satisfies Record<1 | 2 | 3 | 4, { accent: string; faint: string; label: string }>;

export type TierNumber = keyof typeof TIER_CONFIG;
