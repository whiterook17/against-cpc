// src/lib/physics/geodesic.js
// Equatorial Kerr geodesic integrator (θ = π/2 throughout). Pure JS — no browser APIs.
// Uses RK4 (Runge-Kutta 4th order) for accuracy over long paths.

/**
 * Compute derivatives for equatorial Kerr geodesic equations.
 * State: (r, phi, rdot) with conserved L (angular momentum) and E (energy).
 */
function geodesicDerivs(r, phi, rdot, L, E, M, a) {
  const r2  = r * r;
  const D   = r2 - 2 * M * r + a * a;  // Δ(r)
  if (Math.abs(D) < 1e-10) {
    // At or inside horizon — stop integration
    return { drdt: 0, dphidt: 0, drdotdt: 0 };
  }

  // Effective radial potential V_r and its derivative
  const EaL   = E * (r2 + a * a) - L * a;
  const LamE  = L - a * E;
  const Vr    = (EaL / D) ** 2 - (r2 + LamE ** 2);
  // dV_r/dr (approximate — used for radial acceleration)
  const dVr_dr = -2 * M * EaL ** 2 * (2 * r * D - (r2 - 2 * M * r) * 2 * r) / (D ** 4)
                 + 2 * r * E ** 2 * 2 * r / (D ** 2)
                 - 2 * r;  // simplified equatorial

  const dphidt  = (L - a * E + a * EaL / D) / r2;
  const drdotdt = -0.5 * dVr_dr / r2;

  return { drdt: rdot, dphidt, drdotdt };
}

/**
 * Integrate an equatorial Kerr geodesic using RK4.
 * Returns { xs: Float32Array, ys: Float32Array } — Cartesian positions (x = r·cosφ, y = r·sinφ).
 * Integration stops early if the particle hits r < 0.05 (absorbed by throat).
 */
export function integrateGeodesic(r0, phi0, rdot0, L, E, M, a, nSteps, dt) {
  const xs = new Float32Array(nSteps);
  const ys = new Float32Array(nSteps);
  let r = r0, phi = phi0, rdot = rdot0;

  for (let i = 0; i < nSteps; i++) {
    xs[i] = r * Math.cos(phi);
    ys[i] = r * Math.sin(phi);

    if (r < 0.05) {
      // Fill remaining steps with last position
      for (let j = i + 1; j < nSteps; j++) { xs[j] = xs[i]; ys[j] = ys[i]; }
      break;
    }

    // RK4
    const k1 = geodesicDerivs(r,                    phi,                    rdot,                    L, E, M, a);
    const k2 = geodesicDerivs(r + k1.drdt    * dt/2, phi + k1.dphidt * dt/2, rdot + k1.drdotdt * dt/2, L, E, M, a);
    const k3 = geodesicDerivs(r + k2.drdt    * dt/2, phi + k2.dphidt * dt/2, rdot + k2.drdotdt * dt/2, L, E, M, a);
    const k4 = geodesicDerivs(r + k3.drdt    * dt,   phi + k3.dphidt * dt,   rdot + k3.drdotdt * dt,   L, E, M, a);

    r    += (dt / 6) * (k1.drdt    + 2*k2.drdt    + 2*k3.drdt    + k4.drdt);
    phi  += (dt / 6) * (k1.dphidt  + 2*k2.dphidt  + 2*k3.dphidt  + k4.dphidt);
    rdot += (dt / 6) * (k1.drdotdt + 2*k2.drdotdt + 2*k3.drdotdt + k4.drdotdt);
  }

  return { xs, ys };
}
