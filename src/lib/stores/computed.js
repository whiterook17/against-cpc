// src/lib/stores/computed.js
// Physics Worker output store + derived convenience stores.

import { writable, derived } from 'svelte/store';
import { params } from './params.js';
import {
  TAU_GEOM_TO_SI_PER_SOLAR_MASS,
  CASIMIR_LAB_MAX_SI,
} from '$lib/physics/constants.js';

// Raw output from physics Worker — updated every 8ms when simulator is active.
export const computed = writable({
  omega_throat:        0,
  kerr_factor:         1,
  tau_required:        0,
  f0:                  0,
  damping_regime:      'UNDERDAMPED',
  omega_d:             0,
  ergosphere_radius:   0,
  stability_index:     0,
  throat_displacement: 0,
  grid_displacements:  null,
  field_lines:         null,
});

/**
 * tau in SI units (J/m²), approximate for M = params.M solar masses.
 */
export const tau_SI = derived([computed, params], ([$c, $p]) => {
  return $c.tau_required * TAU_GEOM_TO_SI_PER_SOLAR_MASS * $p.M;
});

/**
 * Orders of magnitude gap between required τ and Casimir lab maximum.
 * Positive = τ_required is N orders of magnitude above lab capability.
 */
export const feasibility_gap_orders = derived(tau_SI, ($tau_SI) => {
  if ($tau_SI <= 0) return 0;
  return Math.log10($tau_SI / CASIMIR_LAB_MAX_SI);
});

/**
 * Echo interval Δt = π / ω_d in simulation time units.
 * Infinity when not underdamped.
 */
export const echo_interval = derived(computed, ($c) => {
  if ($c.damping_regime !== 'UNDERDAMPED' || $c.omega_d < 1e-10) return Infinity;
  return Math.PI / $c.omega_d;
});

/**
 * True when perturbation echoes would be observationally detectable:
 * underdamped regime + reasonable stability.
 */
export const echoes_detectable = derived(computed, ($c) => {
  return $c.damping_regime === 'UNDERDAMPED' && $c.stability_index > 0.3;
});
