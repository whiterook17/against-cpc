<!-- src/lib/components/simulator/EmbeddingView.svelte -->
<!-- Isometric Flamm paraboloid: 32×32 grid surface driven by physics worker grid_displacements. -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { params }   from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';
  import AnnotationOverlay from './AnnotationOverlay.svelte';

  interface Props {
    onLabelClick?: (id: string) => void;
  }
  let { onLabelClick }: Props = $props();

  const W = 512, H = 512;
  const GRID_N = 32;
  // Isometric projection constants
  const TILE  = 9.2;   // pixels per r_g in horizontal projection
  const ELEV  = 22;    // pixels per unit of grid displacement (vertical)
  const SPAN  = 11;    // grid spans ±11 r_g

  let canvas = $state<HTMLCanvasElement | null>(null);

  function isoProject(gx: number, gz: number, gy: number): { x: number; y: number } {
    return {
      x: W / 2 + (gx - gz) * TILE,
      y: H / 2 + (gx + gz) * TILE * 0.5 - gy * ELEV,
    };
  }

  $effect(() => {
    if (!browser || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, $computed, $params);
  });

  function draw(ctx: CanvasRenderingContext2D, comp: any, p: any) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, W, H);

    const step = (2 * SPAN) / (GRID_N - 1);

    // Build vertex lookup: verts[i][j] = { x, y } screen coords
    type V = { x: number; y: number };
    const verts: V[][] = [];
    const disp = comp.grid_displacements as Float32Array | null;

    for (let i = 0; i < GRID_N; i++) {
      verts[i] = [];
      for (let j = 0; j < GRID_N; j++) {
        const gx = -SPAN + i * step;
        const gz = -SPAN + j * step;
        let gy = 0;
        if (disp) {
          gy = disp[i * GRID_N + j];
        } else {
          // Flamm paraboloid fallback
          const r = Math.sqrt(gx * gx + gz * gz);
          const rs = 2 * (p.M ?? 1);
          gy = r > rs ? -2 * Math.sqrt(r - rs) : 0;
        }
        verts[i][j] = isoProject(gx, gz, gy);
      }
    }

    // Draw wireframe rows (constant i)
    for (let i = 0; i < GRID_N; i++) {
      const frac = i / (GRID_N - 1);
      const alpha = 0.08 + frac * (1 - frac) * 0.55;
      ctx.strokeStyle = `rgba(0, 200, 200, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let j = 0; j < GRID_N; j++) {
        const v = verts[i][j];
        j === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
      }
      ctx.stroke();
    }

    // Draw wireframe columns (constant j)
    for (let j = 0; j < GRID_N; j++) {
      const frac = j / (GRID_N - 1);
      const alpha = 0.08 + frac * (1 - frac) * 0.55;
      ctx.strokeStyle = `rgba(0, 200, 200, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i < GRID_N; i++) {
        const v = verts[i][j];
        i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
      }
      ctx.stroke();
    }

    // Torus ring on the embedding surface
    const rt = p.R_torus ?? 5;
    const SEGS = 60;
    ctx.strokeStyle = 'rgba(200, 218, 234, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= SEGS; k++) {
      const angle = (k / SEGS) * Math.PI * 2;
      const gx = rt * Math.cos(angle);
      const gz = rt * Math.sin(angle);
      // Bilinear interpolation of height from grid
      const fracI = ((gx + SPAN) / (2 * SPAN)) * (GRID_N - 1);
      const fracJ = ((gz + SPAN) / (2 * SPAN)) * (GRID_N - 1);
      const ii = Math.max(0, Math.min(GRID_N - 2, Math.floor(fracI)));
      const jj = Math.max(0, Math.min(GRID_N - 2, Math.floor(fracJ)));
      const ti = fracI - ii, tj = fracJ - jj;
      let gy = 0;
      if (disp) {
        gy = disp[ii * GRID_N + jj] * (1 - ti) * (1 - tj)
           + disp[(ii + 1) * GRID_N + jj] * ti * (1 - tj)
           + disp[ii * GRID_N + jj + 1] * (1 - ti) * tj
           + disp[(ii + 1) * GRID_N + jj + 1] * ti * tj;
      }
      const v = isoProject(gx, gz, gy);
      k === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
    }
    ctx.stroke();

    // Throat circle at central depression
    const at = (p.a0 ?? 1.2) + (comp.throat_displacement ?? 0);
    // Center height
    const centerH = disp ? disp[Math.floor(GRID_N / 2) * GRID_N + Math.floor(GRID_N / 2)] : 0;
    ctx.strokeStyle = 'rgba(160, 112, 224, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= SEGS; k++) {
      const angle = (k / SEGS) * Math.PI * 2;
      const gx = at * Math.cos(angle);
      const gz = at * Math.sin(angle);
      const v = isoProject(gx, gz, centerH);
      k === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
    }
    ctx.stroke();
    // Throat downward stem
    const vTop  = isoProject(0, 0, centerH);
    const vStem = isoProject(0, 0, centerH - 2.5);
    ctx.strokeStyle = 'rgba(160, 112, 224, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(vTop.x, vTop.y); ctx.lineTo(vStem.x, vStem.y); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(106, 138, 170, 0.55)';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('FLAMM EMBEDDING — KERR SPACETIME', 8, H - 10);
  }

  const LABELS = $derived([
    { id: 'torus',  text: 'Torus ring',    left: '50%', top: '12%' },
    { id: 'throat', text: 'Throat (Flamm)', left: '50%', top: '60%' },
  ]);
</script>

<div class="view-wrap">
  <div class="view-label">EMBEDDING — FLAMM PARABOLOID</div>
  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      width={W}
      height={H}
      aria-label="Isometric Flamm paraboloid embedding diagram. The equatorial spatial geometry is visualised as a curved surface. The central depression deepens with wormhole throat radius."
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
