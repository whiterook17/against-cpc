<!-- src/lib/components/EchoSpectrumPanel.svelte -->
<!-- Canvas 2D echo spectrum plot. Updates when computed store changes. Svelte 5 runes. -->
<script lang="ts">
  import { computed } from '$lib/stores/computed.js';
  import { params }   from '$lib/stores/params.js';
  import { echoSpectrumArray } from '$lib/physics/echo.js';

  let canvas  = $state<HTMLCanvasElement | null>(null);
  const W = 400, H = 160;

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { f0 } = $computed;
    const { eta_s } = $params;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0d1628';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#2a3f5a';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * i / 4);
      ctx.lineTo(W, H * i / 4);
      ctx.stroke();
    }

    if (f0 <= 0) {
      ctx.fillStyle = '#6a8aaa';
      ctx.font = '11px monospace';
      ctx.fillText('f₀ = 0 — no echo regime', W / 2 - 80, H / 2);
      return;
    }

    // Compute spectrum
    const fMax = f0 * 6;
    const { freqs, amps } = echoSpectrumArray(0.001, fMax, 256, 1.0, f0, eta_s);

    // Normalise amplitudes
    let maxAmp = 0;
    for (let i = 0; i < amps.length; i++) if (amps[i] > maxAmp) maxAmp = amps[i];
    if (maxAmp === 0) return;

    const pad = { l: 36, r: 12, t: 12, b: 28 };
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;

    // Spectrum fill
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + ph);
    for (let i = 0; i < freqs.length; i++) {
      const x = pad.l + (freqs[i] / fMax) * pw;
      const y = pad.t + ph - (amps[i] / maxAmp) * ph;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.l + pw, pad.t + ph);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ph);
    grad.addColorStop(0,   'rgba(160, 112, 224, 0.7)');
    grad.addColorStop(1,   'rgba(160, 112, 224, 0.05)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Spectrum line
    ctx.beginPath();
    ctx.strokeStyle = '#a070e0';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < freqs.length; i++) {
      const x = pad.l + (freqs[i] / fMax) * pw;
      const y = pad.t + ph - (amps[i] / maxAmp) * ph;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // f0 marker
    const f0x = pad.l + (f0 / fMax) * pw;
    ctx.beginPath();
    ctx.strokeStyle = '#e8a020';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.moveTo(f0x, pad.t);
    ctx.lineTo(f0x, pad.t + ph);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e8a020';
    ctx.font = '10px monospace';
    ctx.fillText('f₀', f0x + 3, pad.t + 12);

    // Axes
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '9px monospace';
    ctx.fillText('0', pad.l - 8, pad.t + ph + 4);
    ctx.fillText('f', pad.l + pw + 4, pad.t + ph + 4);
    ctx.fillText('Â(f)', 2, pad.t + 8);

    // Label
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '9px monospace';
    ctx.fillText('ECHO SPECTRUM — Eq.(9b)', pad.l, H - 6);
  });
</script>

<div class="panel">
  <canvas
    bind:this={canvas}
    width={W}
    height={H}
    role="img"
    aria-label="Echo spectrum plot showing gravitational wave amplitude versus frequency. Peak at echo frequency f0, governed by Equation 9b."
  ></canvas>
</div>

<style>
  .panel {
    background: var(--deep);
    border: 1px solid var(--dim);
    border-radius: 3px;
    overflow: hidden;
  }
  canvas {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
