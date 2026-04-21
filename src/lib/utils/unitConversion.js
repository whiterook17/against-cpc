// src/lib/utils/unitConversion.js
// Pure utility — no Svelte reactivity. All values in geometric units (G = c = 1).

export function rgToKm(M_solar) {
  return 1.477 * M_solar;
}

export function rgToM(M_solar) {
  return rgToKm(M_solar) * 1000;
}

export function formatRgAsKm(rg_value, M_solar, decimals = 2) {
  const km = rg_value * rgToKm(M_solar);
  if (km < 0.01) return (km * 1000).toFixed(1) + ' m';
  if (km > 1000) return (km / 1000).toFixed(2) + ' × 10³ km';
  return km.toFixed(decimals) + ' km';
}

export function formatRgAsM(rg_value, M_solar, decimals = 1) {
  const m = rg_value * rgToM(M_solar);
  if (m > 1000) return formatRgAsKm(rg_value, M_solar);
  return m.toFixed(decimals) + ' m';
}

export function solarMassToKg(M_solar) {
  return M_solar * 1.989e30;
}

export function formatMassKg(M_solar) {
  return solarMassToKg(M_solar).toExponential(2) + ' kg';
}

export function geomTensionToSI(tau_geom, M_solar) {
  const TAU_FACTOR = 1.21e44;
  return tau_geom * TAU_FACTOR / (M_solar * M_solar);
}

export function formatTension(tau_SI) {
  if (tau_SI === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(tau_SI)));
  const mantissa = (tau_SI / Math.pow(10, exp)).toFixed(1);
  return `${mantissa} × 10^${exp} J/m²`;
}

export function feasibilityOrders(tau_SI) {
  const CASIMIR_MAX = 1e-3;
  if (tau_SI <= 0) return 0;
  return Math.log10(tau_SI / CASIMIR_MAX);
}

export function dualUnit(rg_value, M_solar, decimals = 2) {
  return `${rg_value.toFixed(decimals)} rg = ${formatRgAsKm(rg_value, M_solar, decimals)}`;
}
