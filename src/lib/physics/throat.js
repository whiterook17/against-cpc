// src/lib/physics/throat.js
// Throat surface and oscillator functions. Pure JS — no browser APIs.

import { dampingRegime, kerrSuppression } from './kerr.js';

/**
 * Surface pressure from Israel junction thin-shell approximation.
 * p_s = σ_throat / 2 (isotropic shell)
 */
export function surfacePressure(sigma_throat) {
  return sigma_throat / 2;
}

/**
 * Echo time interval: half-period of damped oscillator.
 * Δt = π / ω_d  (only finite when UNDERDAMPED)
 */
export function echoInterval(sigma_throat, a0, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  if (regime !== 'UNDERDAMPED' || omega_d < 1e-10) return Infinity;
  return Math.PI / omega_d;
}

/**
 * Number of observable echoes before amplitude drops below threshold.
 * n = floor( −ln(threshold) / (η_s · Δt) )
 */
export function echoCount(sigma_throat, a0, eta_s, threshold = 0.01) {
  const dt = echoInterval(sigma_throat, a0, eta_s);
  if (!isFinite(dt) || eta_s <= 0) return 0;
  return Math.floor(-Math.log(threshold) / (eta_s * dt));
}

/**
 * Stability index: 0 (unstable) → 1 (maximally stable).
 * Weighted combination of damping regime score and Kerr suppression.
 */
export function stabilityIndex(sigma_throat, a0, eta_s, kerr_factor) {
  const { regime } = dampingRegime(sigma_throat, a0, eta_s);
  const regime_score = regime === 'UNDERDAMPED' ? 0.9
                     : regime === 'CRITICAL'    ? 1.0
                     :                            0.5;
  const kerr_score = 1 - kerr_factor; // higher spin → lower cost → more stable
  return Math.min(1, regime_score * 0.6 + kerr_score * 0.4);
}

/**
 * Throat radius as a function of time after perturbation impulse.
 * a(t) = a0 + δa(t)
 */
export function throatRadiusAtTime(t, a0, delta_a0, sigma_throat, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  const decay = Math.exp(-eta_s * t);
  let displacement;
  if (regime === 'UNDERDAMPED') {
    displacement = delta_a0 * decay * Math.cos(omega_d * t);
  } else if (regime === 'OVERDAMPED') {
    displacement = delta_a0 * decay;
  } else {
    displacement = delta_a0 * decay * (1 + eta_s * t);
  }
  return a0 + displacement;
}
