// src/lib/workers/sweep.worker.js
// 2D parameter sweep — runs off the main thread.
// Receives RUN_SWEEP, posts SWEEP_RESULT.

import { DEFAULT_PARAMS } from '../physics/constants.js';
import {
  exoticMatterTension,
  echoFrequency,
  kerrSuppression,
} from '../physics/kerr.js';
import { stabilityIndex, echoCount } from '../physics/throat.js';

/**
 * Compute the requested scalar output for a parameter set.
 */
function computeOutput(p, outputKey) {
  const a = p.a_over_M * p.M;
  switch (outputKey) {
    case 'kerr_factor':
      return kerrSuppression(a, p.M);
    case 'tau_required':
      return exoticMatterTension(p.a0, p.M, a);
    case 'f0':
      return echoFrequency(p.sigma_throat, p.a0);
    case 'stability': {
      const kf = kerrSuppression(a, p.M);
      return stabilityIndex(p.sigma_throat, p.a0, p.eta_s, kf);
    }
    case 'echo_count':
      return echoCount(p.sigma_throat, p.a0, p.eta_s);
    default:
      return 0;
  }
}

self.onmessage = ({ data }) => {
  if (data.type !== 'RUN_SWEEP') return;

  const {
    xKey, yKey,
    xMin, xMax,
    yMin, yMax,
    outputKey,
    n = 64,
  } = data.payload;

  const grid = new Float32Array(n * n);
  let min =  Infinity;
  let max = -Infinity;

  for (let row = 0; row < n; row++) {
    // row 0 = yMax (top of canvas), row n-1 = yMin (bottom)
    const yVal = yMax - (row / (n - 1)) * (yMax - yMin);
    for (let col = 0; col < n; col++) {
      const xVal = xMin + (col / (n - 1)) * (xMax - xMin);
      const p = { ...DEFAULT_PARAMS, [xKey]: xVal, [yKey]: yVal };
      const raw = computeOutput(p, outputKey);
      const val = isFinite(raw) ? raw : 0;
      grid[row * n + col] = val;
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  // Avoid degenerate range
  if (min === max) { min = 0; max = Math.max(max, 1); }

  self.postMessage(
    {
      type: 'SWEEP_RESULT',
      payload: { grid, xKey, yKey, outputKey, xMin, xMax, yMin, yMax, min, max, n },
    },
    [grid.buffer],
  );
};
