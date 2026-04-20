<!-- src/lib/components/simulator/PenroseView.svelte -->
<!-- Conformal causal (Penrose) diagram: two diamond regions, throat band, light cones, infinities. -->
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
  let canvas = $state<HTMLCanvasElement | null>(null);

  $effect(() => {
    if (!browser || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, $computed, $params);
  });

  function drawDiamond(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    hw: number, hh: number,
    fillAlpha: number, strokeAlpha: number
  ) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 200, 200, ${fillAlpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(0, 200, 200, ${strokeAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function draw(ctx: CanvasRenderingContext2D, comp: any, p: any) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const THROAT_W = 22;         // half-width of throat band
    const D_HW = W * 0.215;      // diamond half-width
    const D_HH = H * 0.37;       // diamond half-height
    const D_OFF = D_HW * 1.18;   // offset from centre

    // Region I (left diamond)
    drawDiamond(ctx, cx - D_OFF, cy, D_HW, D_HH, 0.06, 0.35);
    // Region II (right diamond)
    drawDiamond(ctx, cx + D_OFF, cy, D_HW, D_HH, 0.06, 0.35);

    // Throat band (vertical strip connecting the two regions)
    ctx.fillStyle = 'rgba(160, 112, 224, 0.18)';
    ctx.fillRect(cx - THROAT_W, cy - D_HH, THROAT_W * 2, D_HH * 2);
    ctx.strokeStyle = 'rgba(160, 112, 224, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - THROAT_W, cy - D_HH); ctx.lineTo(cx - THROAT_W, cy + D_HH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + THROAT_W, cy - D_HH); ctx.lineTo(cx + THROAT_W, cy + D_HH); ctx.stroke();

    // Ergosphere horizontal markers (inside throat band)
    const R_erg = comp.ergosphere_radius ?? 0;
    if (R_erg > 0) {
      const ergH = Math.min(R_erg * 14, D_HH * 0.9);
      ctx.strokeStyle = 'rgba(64, 208, 128, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      for (const sign of [1, -1]) {
        const y = cy + sign * ergH;
        ctx.beginPath(); ctx.moveTo(cx - 70, y); ctx.lineTo(cx + 70, y); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(64, 208, 128, 0.6)';
      ctx.font = '8px "Share Tech Mono"';
      ctx.textAlign = 'left';
      ctx.fillText('R_erg', cx + THROAT_W + 4, cy - R_erg * 14 + 4);
    }

    // Chronology horizon band (near-extremal spin)
    if ((p.a_over_M ?? 0) > 0.9) {
      ctx.fillStyle = 'rgba(224, 80, 80, 0.07)';
      ctx.fillRect(cx - THROAT_W, cy - D_HH * 0.55, THROAT_W * 2, D_HH * 1.1);
      ctx.strokeStyle = 'rgba(224, 80, 80, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (const sign of [1, -1]) {
        const y = cy + sign * D_HH * 0.55;
        ctx.beginPath(); ctx.moveTo(cx - 55, y); ctx.lineTo(cx + 55, y); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(224, 80, 80, 0.65)';
      ctx.font = '8px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('CTC horizon', cx, cy - D_HH * 0.55 - 4);
    }

    // Light cones at key positions
    const CONE = 20;
    const cones = [
      { x: cx - D_OFF, y: cy },
      { x: cx + D_OFF, y: cy },
      { x: cx, y: cy - D_HH * 0.48 },
      { x: cx, y: cy + D_HH * 0.48 },
    ];
    ctx.strokeStyle = 'rgba(232, 160, 32, 0.55)';
    ctx.lineWidth = 1;
    cones.forEach(({ x, y }) => {
      // Future cone
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - CONE, y - CONE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CONE, y - CONE); ctx.stroke();
      // Past cone
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - CONE, y + CONE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CONE, y + CONE); ctx.stroke();
      ctx.fillStyle = 'rgba(232, 160, 32, 0.45)';
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Null boundaries (scri+/scri-)
    ctx.strokeStyle = 'rgba(42, 63, 90, 0.65)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const lEdge = cx - D_OFF - D_HW;
    const rEdge = cx + D_OFF + D_HW;
    // Left J+/J-
    ctx.beginPath(); ctx.moveTo(14, H * 0.05); ctx.lineTo(cx - D_OFF, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, H * 0.95); ctx.lineTo(cx - D_OFF, cy); ctx.stroke();
    // Right J+/J-
    ctx.beginPath(); ctx.moveTo(W - 14, H * 0.05); ctx.lineTo(cx + D_OFF, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 14, H * 0.95); ctx.lineTo(cx + D_OFF, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Labels: region names
    ctx.fillStyle = '#c8daea';
    ctx.font = 'bold 14px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('I',  cx - D_OFF, cy - 14);
    ctx.fillText('II', cx + D_OFF, cy - 14);
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '9px "Share Tech Mono"';
    ctx.fillText('Our universe', cx - D_OFF, cy + 10);
    ctx.fillText('Far universe', cx + D_OFF, cy + 10);

    // Causal infinities
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '12px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('i⁺', cx, 17);
    ctx.fillText('i⁻', cx, H - 8);
    ctx.textAlign = 'left';  ctx.fillText('i⁰', 4,     cy + 5);
    ctx.textAlign = 'right'; ctx.fillText('i⁰', W - 4,  cy + 5);
    ctx.textAlign = 'left';
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillText('ℐ⁺', 4, H * 0.10);
    ctx.fillText('ℐ⁻', 4, H * 0.93);

    // Throat label
    ctx.fillStyle = '#a070e0';
    ctx.font = 'bold 9px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('THROAT', cx, cy + 5);

    // Footer
    ctx.fillStyle = 'rgba(106, 138, 170, 0.55)';
    ctx.font = '9px "Share Tech Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('PENROSE — KERR WORMHOLE', 8, H - 10);
  }

  const LABELS = $derived([
    { id: 'ergosphere', text: 'Ergosphere', left: '22%', top: '32%' },
    { id: 'throat',     text: 'Throat',     left: '50%', top: '10%' },
  ]);
</script>

<div class="view-wrap">
  <div class="view-label">PENROSE — CAUSAL STRUCTURE</div>
  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      width={W}
      height={H}
      aria-label="Penrose conformal diagram. Two diamond-shaped exterior regions (our universe and far universe) are connected through the central throat band. Light cones are drawn at key points. Ergosphere indicated by dashed green lines."
    ></canvas>
    <AnnotationOverlay labels={LABELS} accent="purple" {onLabelClick} />
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
