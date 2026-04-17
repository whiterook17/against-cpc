// src/lib/workers/physics.worker.js
// Physics tick loop — runs entirely off the main thread.
// Receives UPDATE_PARAMS, posts COMPUTED_STATE every tick.

import {
  frameDragging, ergosphereRadius, kerrSuppression,
  exoticMatterTension, echoFrequency, dampingRegime,
  throatDisplacement,
} from '../physics/kerr.js';
import { stabilityIndex } from '../physics/throat.js';
import { computeGridDisplacements } from '../physics/grid.js';
import { computeFieldLines }        from '../physics/fieldlines.js';
import { PHYSICS_DT, PHYSICS_DT_MS } from '../physics/constants.js';

let params = {};
let simTime = 0;

self.onmessage = ({ data }) => {
  if (data.type === 'UPDATE_PARAMS') {
    params = data.payload;
    // Reset simTime if explicitly provided (e.g. on preset load)
    if (typeof data.payload.simTime === 'number') {
      simTime = data.payload.simTime;
    }
  }
};

setInterval(() => {
  const { M, a_over_M, a0, sigma_throat, eta_s } = params;

  // Skip until params are populated
  if (!M) return;

  const a = a_over_M * M;

  const omega_throat       = frameDragging(a0, Math.PI / 2, M, a);
  const kerr_factor        = kerrSuppression(a, M);
  const tau_required       = exoticMatterTension(a0, M, a);
  const f0                 = echoFrequency(sigma_throat, a0);
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  const R_erg              = ergosphereRadius(Math.PI / 2, M, a);
  const throat_disp        = throatDisplacement(simTime, 0.1, sigma_throat, a0, eta_s);
  const stability          = stabilityIndex(sigma_throat, a0, eta_s, kerr_factor);

  const grid_displacements = computeGridDisplacements(M, a, simTime);
  const field_lines        = computeFieldLines(M, a, simTime);

  self.postMessage(
    {
      type: 'COMPUTED_STATE',
      payload: {
        omega_throat,
        kerr_factor,
        tau_required,
        f0,
        damping_regime:      regime,
        omega_d,
        ergosphere_radius:   R_erg,
        stability_index:     stability,
        throat_displacement: throat_disp,
        grid_displacements,
        field_lines,
      },
    },
    // Transfer buffer ownership — zero-copy
    [grid_displacements.buffer, field_lines.buffer]
  );

  simTime += PHYSICS_DT;
}, PHYSICS_DT_MS);
