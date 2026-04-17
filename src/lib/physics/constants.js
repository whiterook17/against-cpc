// src/lib/physics/constants.js
// All values in geometric units (G = c = 1) unless noted.

export const G  = 1;
export const c  = 1;
export const k_B = 1;

export const DEFAULT_PARAMS = {
  M:            1.0,
  a_over_M:     0.85,
  R_torus:      8.0,
  a0:           1.2,
  sigma_throat: 0.40,
  eta_s:        0.15,
};

// Physics tick rate
export const PHYSICS_DT    = 0.008;        // seconds per tick (125 Hz)
export const PHYSICS_DT_MS = PHYSICS_DT * 1000;

// Grid resolution for displacement field (32×32 = 1024 vertices)
export const GRID_N = 32;

// Frame-dragging field line configuration
export const FIELD_LINE_COUNT  = 20;
export const FIELD_LINE_POINTS = 30;

// Conversion: geometric tau (dimensionless) → SI J/m² for M = 1 solar mass
// tau_SI = tau_geom × (c⁴/G) / r_g² ; r_g = GM/c² for M_sun ≈ 1477 m
export const TAU_GEOM_TO_SI_PER_SOLAR_MASS = 1.21e44;

// Casimir lab maximum negative energy density achievable (J/m², 2026 best)
export const CASIMIR_LAB_MAX_SI = 1e-3;
