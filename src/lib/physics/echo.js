// src/lib/physics/echo.js
// GW echo spectrum functions. Pure JS — no browser APIs.

/**
 * Echo spectrum template Ĥ(f) — Eq. (9b).
 * Ĥ(f) = A0 · (f/f0)² · exp(−η_s·f/f0²) · [1 + (f/f0)²]⁻¹
 */
export function echoSpectrum(f, A0, f0, eta_s) {
  if (f0 <= 0 || f <= 0) return 0;
  const ratio = f / f0;
  return A0 * ratio ** 2 * Math.exp(-eta_s * f / (f0 ** 2)) / (1 + ratio ** 2);
}

/**
 * Compute echo spectrum over a frequency range.
 * Returns { freqs: Float32Array, amps: Float32Array } each of length nPoints.
 */
export function echoSpectrumArray(fMin, fMax, nPoints, A0, f0, eta_s) {
  const freqs = new Float32Array(nPoints);
  const amps  = new Float32Array(nPoints);
  for (let i = 0; i < nPoints; i++) {
    freqs[i] = fMin + (fMax - fMin) * i / (nPoints - 1);
    amps[i]  = echoSpectrum(freqs[i], A0, f0, eta_s);
  }
  return { freqs, amps };
}
