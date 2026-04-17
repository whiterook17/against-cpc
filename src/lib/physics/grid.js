// src/lib/physics/grid.js
// Spacetime curvature grid displacement field for vertex shader. Pure JS — no browser APIs.

import { GRID_N } from './constants.js';
import { frameDragging } from './kerr.js';

/**
 * Compute a gridN×gridN array of y-displacements representing the
 * Flamm paraboloid embedding of the Kerr spatial slice.
 *
 * embed(r) = √(6M / r_eff) × 0.38  (downward depression)
 * Frame-drag twist adds slow azimuthal drift with simTime.
 *
 * Returns Float32Array of length gridN*gridN (row-major).
 */
export function computeGridDisplacements(M, a, simTime, gridN = GRID_N) {
  const N    = gridN;
  const out  = new Float32Array(N * N);
  const span = 22; // grid spans ±11 r_g

  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const x = (col / (N - 1) - 0.5) * span;
      const z = (row / (N - 1) - 0.5) * span;
      const r = Math.sqrt(x * x + z * z);
      const r_safe = Math.max(r, 0.15);

      // Frame-dragging azimuthal correction to effective radius
      const phi   = Math.atan2(z, x);
      const omega = frameDragging(r_safe, Math.PI / 2, M, a);
      const twist = omega * simTime * 0.08;
      const r_eff = r_safe * (1 - 0.15 * Math.cos(phi - twist) * (a / Math.max(M, 0.01)));

      // Flamm paraboloid
      const embed = Math.sqrt(Math.max(0, 6 * M / Math.max(r_eff, 0.01))) * 0.38;

      out[row * N + col] = -embed; // negative = downward depression
    }
  }

  return out;
}
