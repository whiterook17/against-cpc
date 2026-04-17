<!-- src/lib/components/PenroseDiagram.svelte -->
<!-- Canvas 2D conformal diagram of Kerr wormhole spacetime. Svelte 5 runes. -->
<script lang="ts">
  import { computed } from '$lib/stores/computed.js';

  let canvas  = $state<HTMLCanvasElement | null>(null);
  const W = 400, H = 300;

  const regions = [
    { id: 'I',   label: 'Region I',  sub: 'Our universe',  x: 0.25, y: 0.5 },
    { id: 'II',  label: 'Region II', sub: 'Far universe',  x: 0.75, y: 0.5 },
    { id: 'T+',  label: 'i⁺',        sub: 'Future ∞',      x: 0.5,  y: 0.08 },
    { id: 'T-',  label: 'i⁻',        sub: 'Past ∞',        x: 0.5,  y: 0.92 },
  ];

  let hovered = $state<string | null>(null);

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { ergosphere_radius, stability_index } = $computed;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1628';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const rW = W * 0.38, rH = H * 0.38;

    // Region I — left diamond
    drawRegion(ctx, cx - rW * 0.5, cy, rW * 0.9, rH * 0.9, '#00c8c8', 0.06, hovered === 'I');
    // Region II — right diamond
    drawRegion(ctx, cx + rW * 0.5, cy, rW * 0.9, rH * 0.9, '#00c8c8', 0.06, hovered === 'II');

    // Throat band (shared boundary)
    ctx.fillStyle = 'rgba(160,112,224,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - rH * 0.9);
    ctx.lineTo(cx + 18, cy - rH * 0.9);
    ctx.lineTo(cx + 18, cy + rH * 0.9);
    ctx.lineTo(cx - 18, cy + rH * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a070e0';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THROAT', cx, cy + 4);

    // Ergosphere radius indicator
    if (ergosphere_radius > 0) {
      const ergR = Math.min(rH * 0.9, ergosphere_radius * 12);
      ctx.strokeStyle = 'rgba(64,208,128,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - ergR);
      ctx.lineTo(cx + 50, cy - ergR);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#40d080';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('R_erg', cx + 52, cy - ergR + 4);
    }

    // Region labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8daea';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('I', cx - rW * 0.5, cy - 8);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#6a8aaa';
    ctx.fillText('Our universe', cx - rW * 0.5, cy + 10);

    ctx.fillStyle = '#c8daea';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('II', cx + rW * 0.5, cy - 8);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#6a8aaa';
    ctx.fillText('Far universe', cx + rW * 0.5, cy + 10);

    // Infinities
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '10px monospace';
    ctx.fillText('i⁺', cx, 16);
    ctx.fillText('i⁻', cx, H - 8);
    ctx.fillText('i⁰', 12, cy + 4);
    ctx.fillText('i⁰', W - 14, cy + 4);

    // Null boundaries
    ctx.strokeStyle = '#2a3f5a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // J+ left
    ctx.beginPath(); ctx.moveTo(8, H * 0.05); ctx.lineTo(cx - rW * 0.5 - 4, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, H * 0.95); ctx.lineTo(cx - rW * 0.5 - 4, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = '#6a8aaa';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PENROSE DIAGRAM — KERR WORMHOLE', 8, H - 8);
  });

  function drawRegion(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    color: string, alpha: number, highlight: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.fillStyle = highlight
      ? `rgba(0,200,200,0.14)`
      : `rgba(0,200,200,${alpha})`;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
</script>

<div class="panel">
  <canvas
    bind:this={canvas}
    width={W}
    height={H}
    role="img"
    aria-label="Penrose conformal diagram showing the Kerr wormhole spacetime. Region I is our universe, Region II is the far universe, connected through the wormhole throat. The ergosphere radius boundary is shown as a dashed green line."
  ></canvas>
  <div class="legend">
    <span class="leg-item" style="color:var(--teal)">■ Exterior regions</span>
    <span class="leg-item" style="color:var(--purple)">■ Throat</span>
    <span class="leg-item" style="color:var(--green)">-- Ergosphere</span>
  </div>
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
  .legend {
    display: flex;
    gap: 16px;
    padding: 6px 12px;
    border-top: 1px solid var(--dim);
    flex-wrap: wrap;
  }
  .leg-item {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1px;
  }
</style>
