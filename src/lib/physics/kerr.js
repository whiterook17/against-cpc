// src/lib/physics/kerr.js
// Core Kerr metric functions. Pure JS — no browser APIs.

/**
 * Boyer–Lindquist Σ (sigma) function.
 * Σ = r² + a²cos²θ
 */
export function sigma_BL(r, theta, a) {
  return r * r + a * a * Math.cos(theta) ** 2;
}

/**
 * Boyer–Lindquist Δ (delta) function.
 * Δ = r² − 2Mr + a²
 */
export function delta(r, M, a) {
  return r * r - 2 * M * r + a * a;
}

/**
 * Frame-dragging angular velocity ω(r,θ) from the Kerr metric.
 * ω = 2Mar / [ (r²+a²)Σ + 2Ma²r·sin²θ ]
 */
export function frameDragging(r, theta, M, a) {
  if (a === 0) return 0;
  const s   = sigma_BL(r, theta, a);
  const sin2 = Math.sin(theta) ** 2;
  const num = 2 * M * a * r;
  const den = (r * r + a * a) * s + 2 * M * a * a * r * sin2;
  if (den === 0) return 0;
  return num / den;
}

/**
 * Ergosphere outer radius at polar angle θ.
 * R_erg = M + √(M² − a²cos²θ)
 */
export function ergosphereRadius(theta, M, a) {
  return M + Math.sqrt(Math.max(0, M * M - a * a * Math.cos(theta) ** 2));
}

/**
 * Kerr suppression factor: √(1 − a²/M²).
 * → 0 at extremal spin, → 1 at zero spin.
 */
export function kerrSuppression(a, M) {
  if (M === 0) return 1;
  return Math.sqrt(Math.max(0, 1 - (a / M) ** 2));
}

/**
 * Required exotic matter tension at throat radius a0 in Kerr geometry.
 * |τ|_Kerr ~ (c²/G) · a0⁻² · √(1 − a²/M²)
 * In geometric units G = c = 1.
 */
export function exoticMatterTension(a0, M, a) {
  return Math.pow(Math.max(a0, 1e-6), -2) * kerrSuppression(a, M);
}

/**
 * Echo frequency f0 = √(σ_throat / a0²) / 2π
 */
export function echoFrequency(sigma_throat, a0) {
  return Math.sqrt(sigma_throat / Math.max(a0 * a0, 1e-12)) / (2 * Math.PI);
}

/**
 * Damping regime of the throat oscillator (Eq. 6.3).
 * ω0² = σ_throat / a0²;  discriminant = ω0² − η_s²
 * Returns { regime: 'UNDERDAMPED'|'OVERDAMPED'|'CRITICAL', omega_d }
 */
export function dampingRegime(sigma_throat, a0, eta_s) {
  const omega0sq = sigma_throat / Math.max(a0 * a0, 1e-12);
  const disc     = omega0sq - eta_s * eta_s;
  if (disc >  1e-10) return { regime: 'UNDERDAMPED', omega_d: Math.sqrt(disc) };
  if (disc < -1e-10) return { regime: 'OVERDAMPED',  omega_d: 0 };
  return              { regime: 'CRITICAL',           omega_d: 0 };
}

/**
 * Throat displacement δa(t) — solution of damped harmonic oscillator (Eq. 6.3).
 * Initial conditions: δa(0) = delta_a0, δȧ(0) = 0.
 */
export function throatDisplacement(t, delta_a0, sigma_throat, a0, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  const decay = Math.exp(-eta_s * t);
  if (regime === 'UNDERDAMPED') return delta_a0 * decay * Math.cos(omega_d * t);
  if (regime === 'OVERDAMPED')  return delta_a0 * decay;
  return delta_a0 * decay * (1 + eta_s * t); // critical
}
