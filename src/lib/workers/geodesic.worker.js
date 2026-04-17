// src/lib/workers/geodesic.worker.js
// RK4 geodesic batch integrator — runs off the main thread.
// Receives INTEGRATE_GEODESICS, posts GEODESIC_PATHS.

import { integrateGeodesic } from '../physics/geodesic.js';

/**
 * Generate default initial conditions for n prograde quasi-circular
 * test particles at varying radii in the equatorial Kerr plane.
 */
function defaultInitialConditions(M, a, n) {
  const particles = [];
  for (let i = 0; i < n; i++) {
    const r0   = 3.0 + i * 0.8;             // r0 from 3 to 3+(n-1)×0.8 r_g
    const phi0 = (i / n) * Math.PI * 2;     // evenly distributed in angle

    // Approximate prograde circular-orbit conserved quantities for Kerr equatorial
    const sqrtMr = Math.sqrt(M * r0);
    const L = sqrtMr * (1 + a * Math.sqrt(M) / (r0 * Math.sqrt(r0)));
    const E = Math.sqrt(Math.max(0, 1 - 2 * M / r0 + a * a / (r0 * r0))) *
              (1 + M / (r0 * Math.sqrt(r0)));

    particles.push({ r0, phi0, rdot0: 0, L, E });
  }
  return particles;
}

self.onmessage = ({ data }) => {
  if (data.type !== 'INTEGRATE_GEODESICS') return;

  const { M, a_over_M, n_steps, dt, initial_conditions, n_particles } = data.payload;
  const a = a_over_M * M;
  const n = n_particles ?? 12;

  const conditions = (initial_conditions && initial_conditions.length > 0)
    ? initial_conditions
    : defaultInitialConditions(M, a, n);

  const actualN = conditions.length;

  // Allocate output: n particles × n_steps × 2 floats (x, y)
  const paths = new Float32Array(actualN * n_steps * 2);

  conditions.forEach(({ r0, phi0, rdot0, L, E }, i) => {
    const { xs, ys } = integrateGeodesic(r0, phi0, rdot0, L, E, M, a, n_steps, dt);
    for (let s = 0; s < xs.length; s++) {
      paths[(i * n_steps + s) * 2]     = xs[s];
      paths[(i * n_steps + s) * 2 + 1] = ys[s];
    }
  });

  self.postMessage(
    { type: 'GEODESIC_PATHS', payload: { paths, n: actualN, n_steps } },
    [paths.buffer]
  );
};
