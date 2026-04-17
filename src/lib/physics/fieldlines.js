// src/lib/physics/fieldlines.js
// Frame-dragging field line positions. Pure JS — no browser APIs.

import { FIELD_LINE_COUNT, FIELD_LINE_POINTS } from './constants.js';
import { frameDragging } from './kerr.js';

/**
 * Compute (x, y) positions for `count` spiral field lines,
 * each with `points` points, animated by simTime.
 *
 * Returns Float32Array of length count × points × 2 (interleaved x, y).
 */
export function computeFieldLines(M, a, simTime, count = FIELD_LINE_COUNT, points = FIELD_LINE_POINTS) {
  const out = new Float32Array(count * points * 2);
  let idx = 0;

  for (let l = 0; l < count; l++) {
    // Each line starts at a different radius and initial phase
    const r0     = 1.2 + (l / count) * 9.0; // radii from 1.2 to 10.2 r_g
    const phase0 = (l / count) * Math.PI * 2;

    for (let p = 0; p < points; p++) {
      const t_frac = p / (points - 1);       // 0 → 1 along the line
      const r      = r0 + t_frac * 1.5;      // lines extend slightly outward

      // Frame-dragging rate at this radius (equatorial plane)
      const omega = frameDragging(r, Math.PI / 2, M, a);

      // Angular position: base phase + frame-drag drift + slow animation
      const phi = phase0 + omega * simTime * 0.12 + t_frac * Math.PI * 0.4;

      out[idx++] = r * Math.cos(phi); // x
      out[idx++] = r * Math.sin(phi); // y
    }
  }

  return out;
}
