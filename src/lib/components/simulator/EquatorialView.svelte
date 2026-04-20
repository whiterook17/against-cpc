<!-- src/lib/components/simulator/EquatorialView.svelte -->
<!-- Top-down equatorial plane (θ=π/2): axes, torus, ergosphere, field lines, throat, geodesics. -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { params }   from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';
  import AnnotationOverlay from './AnnotationOverlay.svelte';

  interface Props {
    geodesicPaths?: Float32Array | null;
    nParticles?: number;
    nSteps?: number;
    onLabelClick?: (id: string) => void;
  }
  let { geodesicPaths = null, nParticles = 12, nSteps = 500, onLabelClick }: Props = $props();

  const W = 512, H = 512, TAU = Math.PI * 2;
  const SCALE = W / 22; // ±11 r_g spans the full canvas width

  let canvas = $state<HTMLCanvasElement | null>(null);

  $effect(() => {
    if (!browser || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, $computed, $params, geodesicPaths);
  });

  function draw(
    ctx: CanvasRenderingContext2D,
    comp: any,
    p: any,
    paths: Float32Array | null
  ) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);

    // Concentric reference circles at 1, 5, 10 r_g
    ctx.lineWidth = 1;
    [1, 5, 10].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r * SCALE, 0, TAU);
      ctx.strokeStyle = 'rgba(42, 63, 90, 0.55)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(106, 138, 170, 0.65)';
      ctx.font = '10px "Share Tech Mono"';
      ctx.textAlign = 'left';
      ctx.fillText(`${r} r_g`, r * SCALE + 3, -2);
    });
    // Cross-hair guide lines
    ctx.strokeStyle = 'rgba(42, 63, 90, 0.25)';
    ctx.setLineDash([2, 6]);
    ctx.beginPath(); ctx.moveTo(-W / 2, 0); ctx.lineTo(W / 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -H / 2); ctx.lineTo(0, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Ergosphere boundary
    const R_erg = comp.ergosphere_radius ?? 0;
    if (R_erg > 0) {
      const re = Math.min(R_erg * SCALE, W / 2 - 2);
      ctx.beginPath();
      ctx.arc(0, 0, re, 0, TAU);
      ctx.fillStyle = 'rgba(64, 208, 128, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(64, 208, 128, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Torus ring (annulus)
    const rt = (p.R_torus ?? 5) * SCALE;
    const thick = 1.2 * SCALE;
    ctx.beginPath();
    ctx.arc(0, 0, rt + thick, 0, TAU);
    ctx.arc(0, 0, Math.max(rt - thick, 2), 0, TAU, true);
    ctx.fillStyle = 'rgba(200, 218, 234, 0.06)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, rt, 0, TAU);
    ctx.strokeStyle = 'rgba(200, 218, 234, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Frame-dragging field lines from worker
    const fl = comp.field_lines as Float32Array | null;
    if (fl) {
      const count = 20, pts = 30;
      ctx.strokeStyle = 'rgba(0, 200, 200, 0.22)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        for (let j = 0; j < pts; j++) {
          const idx = (i * pts + j) * 2;
          const x = fl[idx] * SCALE, y = fl[idx + 1] * SCALE;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // Throat (pulsing circle)
    const ta = Math.max(((p.a0 ?? 1.2) + (comp.throat_displacement ?? 0)) * SCALE, 2);
    ctx.beginPath();
    ctx.arc(0, 0, ta, 0, TAU);
    ctx.fillStyle = 'rgba(160, 112, 224, 0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 112, 224, 1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Geodesic paths from geodesic worker
    if (paths && nParticles > 0) {
      ctx.strokeStyle = 'rgba(232, 160, 32, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nParticles; i++) {
        ctx.beginPath();
        for (let j = 0; j < nSteps; j++) {
          const idx = (i * nSteps + j) * 2;
          const x = paths[idx] * SCALE, y = paths[idx + 1] * SCALE;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // View label inside canvas
    ctx.restore();
    ctx.fillStyle = 'rgba(106, 138, 170, 0.55)';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('EQUATORIAL PLANE  θ = π/2', 8, H - 10);
  }

  const LABELS = $derived([
    { id: 'torus',       text: 'Torus',       left: '63%', top: '15%' },
    { id: 'ergosphere',  text: 'Ergosphere',  left: '67%', top: '58%' },
    { id: 'throat',      text: 'Throat',      left: '12%', top: '16%' },
    { id: 'field',       text: 'Field lines', left: '72%', top: '30%' },
  ]);
</script>

<div class="view-wrap">
  <div class="view-label">EQUATORIAL — θ = π/2</div>
  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      width={W}
      height={H}
      aria-label="Top-down equatorial view. Concentric rings mark 1, 5, 10 gravitational radii. Teal dashed ring is the ergosphere, purple disk is the throat, white ring is the torus."
    ></canvas>
    <AnnotationOverlay labels={LABELS} accent="teal" {onLabelClick} />
  </div>
</div>

<style>
  .view-wrap {
    display: flex;
    flex-direction: column;
    background: var(--navy);
    border: 1px solid var(--dim);
  }
  .view-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--sub);
    padding: 5px 10px;
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
    flex-shrink: 0;
  }
  .canvas-container {
    position: relative;
    flex: 1;
  }
  canvas {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
