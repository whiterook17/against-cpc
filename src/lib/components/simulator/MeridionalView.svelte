<!-- src/lib/components/simulator/MeridionalView.svelte -->
<!-- Side cross-section (r-z plane, φ=0): Flamm embedding, torus section, coupling zone, Casimir, throat. -->
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

  let canvas = $state<HTMLCanvasElement | null>(null);

  $effect(() => {
    if (!browser || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, $computed, $params);
  });

  const PAD = { l: 44, r: 16, t: 18, b: 36 };
  const R_MAX = 11;   // r_g shown on r-axis
  const Z_MAX = 5.5;  // r_g shown on z-axis (±)

  function toX(r: number, pw: number) { return PAD.l + (r / R_MAX) * pw; }
  function toY(z: number, ph: number) { return PAD.t + ph / 2 - (z / Z_MAX) * (ph / 2); }

  function draw(ctx: CanvasRenderingContext2D, comp: any, p: any) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, W, H);

    const pw = W - PAD.l - PAD.r;
    const ph = H - PAD.t - PAD.b;
    const zOrigin = PAD.t + ph / 2;

    // Axes
    ctx.strokeStyle = 'rgba(42, 63, 90, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t); ctx.lineTo(PAD.l, PAD.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.l, zOrigin); ctx.lineTo(PAD.l + pw, zOrigin); ctx.stroke();

    // r-axis tick marks and labels
    ctx.fillStyle = 'rgba(106, 138, 170, 0.7)';
    ctx.font = '10px "Share Tech Mono"';
    ctx.textAlign = 'center';
    [1, 2, 5, 10].forEach(r => {
      const x = toX(r, pw);
      ctx.beginPath(); ctx.moveTo(x, zOrigin - 3); ctx.lineTo(x, zOrigin + 3); ctx.stroke();
      ctx.fillText(`${r}`, x, zOrigin + 14);
    });
    ctx.textAlign = 'left';
    ctx.fillText('r/r_g', PAD.l + pw + 4, zOrigin + 4);

    // z-axis tick marks
    ctx.textAlign = 'right';
    [-4, -2, 2, 4].forEach(z => {
      if (Math.abs(z) > Z_MAX) return;
      const y = toY(z, ph);
      ctx.beginPath(); ctx.moveTo(PAD.l - 3, y); ctx.lineTo(PAD.l, y); ctx.stroke();
      ctx.fillText(`${z}`, PAD.l - 5, y + 4);
    });
    ctx.textAlign = 'right';
    ctx.fillText('z/r_g', PAD.l - 4, PAD.t + 12);

    // Vertical grid dashes
    ctx.strokeStyle = 'rgba(42, 63, 90, 0.28)';
    ctx.setLineDash([2, 5]);
    [1, 2, 5, 10].forEach(r => {
      const x = toX(r, pw);
      ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, PAD.t + ph); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Coupling zone shading (between throat and ergosphere)
    const R_erg = comp.ergosphere_radius ?? 0;
    const a_throat = (p.a0 ?? 1.2) + (comp.throat_displacement ?? 0);
    if (R_erg > a_throat) {
      ctx.fillStyle = 'rgba(232, 160, 32, 0.1)';
      const x0 = toX(a_throat, pw), x1 = toX(Math.min(R_erg, R_MAX), pw);
      ctx.fillRect(x0, PAD.t, x1 - x0, ph);
      ctx.strokeStyle = 'rgba(232, 160, 32, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, PAD.t); ctx.lineTo(x1, PAD.t + ph); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Flamm embedding curves (upper + lower)
    const drawEmbedding = () => {
      if (comp.grid_displacements) {
        const disp = comp.grid_displacements as Float32Array;
        // Take the midline slice (j = GRID_N/2) as the φ=0 cross-section
        const rMin = a_throat;
        const dr = (R_MAX - rMin) / (GRID_N - 1);
        const midJ = Math.floor(GRID_N / 2);
        ctx.strokeStyle = 'rgba(0, 200, 200, 0.65)';
        ctx.lineWidth = 2;
        for (const sign of [1, -1]) {
          ctx.beginPath();
          let first = true;
          for (let i = 0; i < GRID_N; i++) {
            const r = rMin + i * dr;
            const z = sign * disp[i * GRID_N + midJ] * 2.5;
            if (Math.abs(z) > Z_MAX || r > R_MAX) { first = true; continue; }
            const x = toX(r, pw), y = toY(z, ph);
            first ? (ctx.moveTo(x, y), first = false) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        // Analytical fallback: Flamm paraboloid z = 2√(r - r_s)
        const rs = Math.max(2 * (p.M ?? 1), a_throat * 0.9);
        ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
        ctx.lineWidth = 2;
        for (const sign of [1, -1]) {
          ctx.beginPath();
          let first = true;
          for (let i = 0; i <= 120; i++) {
            const r = a_throat + (R_MAX - a_throat) * i / 120;
            const z_val = sign * 2 * Math.sqrt(Math.max(0, r - rs));
            if (Math.abs(z_val) > Z_MAX) { first = true; continue; }
            const x = toX(r, pw), y = toY(z_val, ph);
            first ? (ctx.moveTo(x, y), first = false) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    };
    drawEmbedding();

    // Torus poloidal cross-sections (two small circles at R_torus, ±b above equatorial)
    const rt = p.R_torus ?? 5;
    if (rt < R_MAX) {
      const b_minor = 0.8; // poloidal half-width in r_g
      const circR = b_minor * (pw / R_MAX) * 0.75;
      const cx = toX(rt, pw);
      for (const sign of [1, -1]) {
        const cy = toY(sign * b_minor, ph);
        ctx.beginPath();
        ctx.arc(cx, cy, circR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 218, 234, 0.07)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 218, 234, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Casimir exotic layer (thin red band at throat)
    const casimir_w = 0.15;
    const cx0 = toX(Math.max(a_throat - casimir_w, 0), pw);
    const cx1 = toX(a_throat + casimir_w, pw);
    ctx.fillStyle = 'rgba(224, 80, 80, 0.22)';
    ctx.fillRect(cx0, PAD.t, cx1 - cx0, ph);

    // Throat region fill (left of throat)
    ctx.fillStyle = 'rgba(160, 112, 224, 0.12)';
    ctx.fillRect(PAD.l, PAD.t, toX(a_throat, pw) - PAD.l, ph);

    // Throat vertical line
    ctx.strokeStyle = 'rgba(160, 112, 224, 1)';
    ctx.lineWidth = 2.5;
    const tx = toX(a_throat, pw);
    ctx.beginPath(); ctx.moveTo(tx, PAD.t); ctx.lineTo(tx, PAD.t + ph); ctx.stroke();

    // Ergosphere vertical line
    if (R_erg > 0 && R_erg < R_MAX) {
      ctx.strokeStyle = 'rgba(64, 208, 128, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const ex = toX(R_erg, pw);
      ctx.beginPath(); ctx.moveTo(ex, PAD.t); ctx.lineTo(ex, PAD.t + ph); ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = 'rgba(106, 138, 170, 0.55)';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('MERIDIONAL PLANE  φ = 0', 8, H - 10);
  }

  const LABELS = $derived([
    { id: 'throat',   text: 'Throat',        left: '10%', top: '18%' },
    { id: 'casimir',  text: 'Casimir layer', left: '16%', top: '30%' },
    { id: 'coupling', text: 'Coupling zone', left: '42%', top: '10%' },
    { id: 'torus',    text: 'Torus section', left: '74%', top: '36%' },
  ]);
</script>

<div class="view-wrap">
  <div class="view-label">MERIDIONAL — r-z PLANE, φ = 0</div>
  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      width={W}
      height={H}
      aria-label="Meridional cross-section of the wormhole. Horizontal axis is radial distance, vertical axis is height. Shows Flamm embedding curves, torus cross-sections, coupling zone, Casimir layer, and throat."
    ></canvas>
    <AnnotationOverlay labels={LABELS} accent="gold" {onLabelClick} />
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
