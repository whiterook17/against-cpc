<!-- src/routes/construct/parameter-lab/ParameterLabScene.svelte -->
<!-- 2D sweep canvas — renders colour map, overlays, hover tooltip. Svelte 5 runes. -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto }    from '$app/navigation';
  import { loadPreset } from '$lib/stores/params.js';
  import {
    DEFAULT_PARAMS,
    TAU_GEOM_TO_SI_PER_SOLAR_MASS,
    CASIMIR_LAB_MAX_SI,
  } from '$lib/physics/constants.js';
  import {
    exoticMatterTension, echoFrequency, kerrSuppression,
  } from '$lib/physics/kerr.js';
  import { stabilityIndex, echoCount } from '$lib/physics/throat.js';

  interface Props {
    xKey:          string;
    yKey:          string;
    outputKey:     string;
    xMin:          number;
    xMax:          number;
    yMin:          number;
    yMax:          number;
    n?:            number;
    overlayKerr:   boolean;
    overlayCasimir:boolean;
    overlayLigo:   boolean;
    exportTrigger: number; // bump to trigger PNG download
  }
  let {
    xKey, yKey, outputKey,
    xMin, xMax, yMin, yMax,
    n = 64,
    overlayKerr, overlayCasimir, overlayLigo,
    exportTrigger,
  }: Props = $props();

  const PARAM_OPTIONS = [
    { key: 'a_over_M',     label: 'Spin a/M',        min: 0.0,  max: 0.99 },
    { key: 'a0',           label: 'Throat radius a₀', min: 0.1,  max: 5.0  },
    { key: 'M',            label: 'Mass M',            min: 0.1,  max: 10.0 },
    { key: 'sigma_throat', label: 'Surface tension σ', min: 0.01, max: 2.0  },
    { key: 'eta_s',        label: 'Viscosity η_s',     min: 0.01, max: 1.0  },
  ];
  const OUTPUT_OPTIONS = [
    { key: 'kerr_factor',  label: 'Kerr suppression factor',  logScale: false },
    { key: 'tau_required', label: 'Exotic matter τ required', logScale: true  },
    { key: 'f0',           label: 'Echo frequency f₀',        logScale: false },
    { key: 'stability',    label: 'Stability index',           logScale: false },
    { key: 'echo_count',   label: 'Observable echo count',    logScale: false },
  ];

  // ── Canvas ────────────────────────────────────────────────────────────────
  let canvas = $state<HTMLCanvasElement | null>(null);
  const CW = 640, CH = 480;
  const PAD = { l: 52, r: 16, t: 20, b: 44 };
  const pw = () => CW - PAD.l - PAD.r;
  const ph = () => CH - PAD.t - PAD.b;
  const cw = () => pw() / n;
  const ch_ = () => ph() / n;

  // ── Sweep state ───────────────────────────────────────────────────────────
  type SweepResult = {
    grid: Float32Array;
    xKey: string; yKey: string; outputKey: string;
    xMin: number; xMax: number; yMin: number; yMax: number;
    min: number; max: number; n: number;
  };
  let sweepResult = $state<SweepResult | null>(null);
  let sweeping    = $state(false);
  let hoverCell   = $state<{ col: number; row: number } | null>(null);

  // worker is $state so the sweep $effect tracks it and re-fires when it's initialised
  let worker = $state<Worker | null>(null);

  // ── Colour helpers ────────────────────────────────────────────────────────
  function lerp3(
    a: [number,number,number],
    b: [number,number,number],
    t: number,
  ): string {
    const r = Math.round(a[0] + (b[0]-a[0])*t);
    const g = Math.round(a[1] + (b[1]-a[1])*t);
    const bv= Math.round(a[2] + (b[2]-a[2])*t);
    return `rgb(${r},${g},${bv})`;
  }
  function colourForT(t: number): string {
    const navy: [number,number,number] = [11,  17,  32 ];
    const teal: [number,number,number] = [0,   200, 200];
    const gold: [number,number,number] = [232, 160, 32 ];
    return t < 0.5 ? lerp3(navy, teal, t*2) : lerp3(teal, gold, (t-0.5)*2);
  }
  function normalise(v: number, lo: number, hi: number, log: boolean): number {
    if (log) {
      const a = Math.log10(Math.max(lo, 1e-30));
      const b = Math.log10(Math.max(hi, 1e-30));
      if (b===a) return 0.5;
      return Math.max(0, Math.min(1, (Math.log10(Math.max(v,1e-30))-a)/(b-a)));
    }
    if (hi===lo) return 0.5;
    return Math.max(0, Math.min(1, (v-lo)/(hi-lo)));
  }

  // ── Canvas ↔ param coordinate conversion ─────────────────────────────────
  function paramToCanvas(xv: number, yv: number) {
    return {
      cx: PAD.l + ((xv-xMin)/(xMax-xMin)) * pw(),
      cy: PAD.t + ((yMax-yv)/(yMax-yMin)) * ph(),
    };
  }

  // ── Overlay iso-contour ───────────────────────────────────────────────────
  function drawIsoContour(
    ctx: CanvasRenderingContext2D,
    sr: SweepResult,
    condition: (xv: number, yv: number) => boolean,
    colour: string,
    dash: number[],
  ) {
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash(dash);
    const cwidth = cw(), cheight = ch_();
    for (let row = 0; row < n-1; row++) {
      for (let col = 0; col < n-1; col++) {
        const x0 = xMin + (col/(n-1))     * (xMax-xMin);
        const x1 = xMin + ((col+1)/(n-1)) * (xMax-xMin);
        const y0 = yMax - (row/(n-1))     * (yMax-yMin);
        const y1 = yMax - ((row+1)/(n-1)) * (yMax-yMin);
        const tl = condition(x0,y0), tr = condition(x1,y0);
        const bl = condition(x0,y1), br = condition(x1,y1);
        if (tl!==tr || tl!==bl || tl!==br) {
          const cx_ = PAD.l + col*cwidth  + cwidth/2;
          const cy_ = PAD.t + row*cheight + cheight/2;
          ctx.beginPath();
          ctx.arc(cx_, cy_, 1.8, 0, Math.PI*2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // ── Axes ──────────────────────────────────────────────────────────────────
  function drawAxes(ctx: CanvasRenderingContext2D) {
    const xLbl = PARAM_OPTIONS.find(p=>p.key===xKey)?.label ?? xKey;
    const yLbl = PARAM_OPTIONS.find(p=>p.key===yKey)?.label ?? yKey;

    ctx.strokeStyle = '#2a3f5a';
    ctx.lineWidth   = 1;
    ctx.strokeRect(PAD.l, PAD.t, pw(), ph());

    ctx.fillStyle = '#6a8aaa';
    ctx.font      = '10px monospace';
    ctx.textAlign = 'center';
    for (let i=0; i<=4; i++) {
      const v = xMin + (i/4)*(xMax-xMin);
      ctx.fillText(v.toFixed(2), PAD.l+(i/4)*pw(), CH-PAD.b+14);
    }
    ctx.fillStyle  = '#c8daea';
    ctx.font       = '11px monospace';
    ctx.fillText(xLbl, PAD.l+pw()/2, CH-5);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6a8aaa';
    ctx.font      = '10px monospace';
    for (let i=0; i<=4; i++) {
      const v = yMin + (i/4)*(yMax-yMin);
      const cy_ = PAD.t + ph() - (i/4)*ph();
      ctx.fillText(v.toFixed(2), PAD.l-6, cy_+3);
    }
    ctx.save();
    ctx.translate(13, PAD.t+ph()/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8daea';
    ctx.font      = '11px monospace';
    ctx.fillText(yLbl, 0, 0);
    ctx.restore();
  }

  // ── Overlays ──────────────────────────────────────────────────────────────
  function drawOverlays(ctx: CanvasRenderingContext2D, sr: SweepResult) {
    if (overlayKerr) {
      const t = 0.95;
      if (sr.xKey==='a_over_M' && t>=xMin && t<=xMax) {
        const {cx} = paramToCanvas(t, yMin);
        ctx.save();
        ctx.strokeStyle='#e8a020'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx,PAD.t); ctx.lineTo(cx,PAD.t+ph()); ctx.stroke();
        ctx.fillStyle='#e8a020'; ctx.font='9px monospace'; ctx.textAlign='left';
        ctx.fillText('extremal',cx+3,PAD.t+11);
        ctx.restore();
      } else if (sr.yKey==='a_over_M' && t>=yMin && t<=yMax) {
        const {cy} = paramToCanvas(xMin, t);
        ctx.save();
        ctx.strokeStyle='#e8a020'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(PAD.l,cy); ctx.lineTo(PAD.l+pw(),cy); ctx.stroke();
        ctx.fillStyle='#e8a020'; ctx.font='9px monospace'; ctx.textAlign='right';
        ctx.fillText('extremal',PAD.l+pw()-4,cy-4);
        ctx.restore();
      }
    }
    if (overlayCasimir) {
      drawIsoContour(ctx, sr, (xv,yv) => {
        const p={...DEFAULT_PARAMS,[sr.xKey]:xv,[sr.yKey]:yv};
        const a=p.a_over_M*p.M;
        return exoticMatterTension(p.a0,p.M,a)*TAU_GEOM_TO_SI_PER_SOLAR_MASS*p.M <= CASIMIR_LAB_MAX_SI;
      }, '#e04040', [5,3]);
    }
    if (overlayLigo) {
      drawIsoContour(ctx, sr, (xv,yv) => {
        const p={...DEFAULT_PARAMS,[sr.xKey]:xv,[sr.yKey]:yv};
        const f0=echoFrequency(p.sigma_throat,p.a0);
        return f0>=0.05 && f0<=5.0;
      }, '#00c8c8', [3,3]);
    }
  }

  // ── Hover tooltip ─────────────────────────────────────────────────────────
  function drawHover(ctx: CanvasRenderingContext2D, sr: SweepResult, hc: {col:number;row:number}) {
    const cwidth=cw(), cheight=ch_();
    const cx_=PAD.l+hc.col*cwidth+cwidth/2;
    const cy_=PAD.t+hc.row*cheight+cheight/2;
    // Crosshair
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(cx_,PAD.t); ctx.lineTo(cx_,PAD.t+ph());
    ctx.moveTo(PAD.l,cy_); ctx.lineTo(PAD.l+pw(),cy_);
    ctx.stroke(); ctx.setLineDash([]);
    // Cell highlight
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5;
    ctx.strokeRect(PAD.l+hc.col*cwidth, PAD.t+hc.row*cheight, cwidth, cheight);
    ctx.restore();

    const xv = xMin+(hc.col/(sr.n-1))*(xMax-xMin);
    const yv = yMax-(hc.row/(sr.n-1))*(yMax-yMin);
    const val= sr.grid[hc.row*sr.n+hc.col];
    const xLbl=PARAM_OPTIONS.find(p=>p.key===sr.xKey)?.label??sr.xKey;
    const yLbl=PARAM_OPTIONS.find(p=>p.key===sr.yKey)?.label??sr.yKey;
    const oLbl=OUTPUT_OPTIONS.find(o=>o.key===sr.outputKey)?.label??sr.outputKey;
    const lines=[
      `${xLbl}: ${xv.toFixed(3)}`,
      `${yLbl}: ${yv.toFixed(3)}`,
      `${oLbl}: ${val.toExponential(3)}`,
      '[CLICK → load in simulator]',
    ];
    const tipW=240, tipH=lines.length*16+14;
    let tx=cx_+12, ty=cy_-tipH/2;
    if (tx+tipW>CW-4) tx=cx_-tipW-12;
    if (ty<4) ty=4;
    if (ty+tipH>CH-4) ty=CH-tipH-4;

    ctx.fillStyle='rgba(11,17,32,0.93)';
    ctx.strokeStyle='#2a3f5a'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.rect(tx,ty,tipW,tipH);
    ctx.fill(); ctx.stroke();

    ctx.font='10px monospace'; ctx.textAlign='left';
    lines.forEach((line,i) => {
      ctx.fillStyle = i===lines.length-1 ? '#a070e0' : '#c8daea';
      ctx.fillText(line, tx+8, ty+14+i*16);
    });
  }

  // ── Master draw call ──────────────────────────────────────────────────────
  function redraw(sr: SweepResult|null, hc: {col:number;row:number}|null) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,CW,CH);
    ctx.fillStyle='#0b1120'; ctx.fillRect(0,0,CW,CH);

    if (sr) {
      const logScale=OUTPUT_OPTIONS.find(o=>o.key===sr.outputKey)?.logScale??false;
      const cwidth=cw(), cheight=ch_();
      for (let row=0;row<sr.n;row++) {
        for (let col=0;col<sr.n;col++) {
          const t=normalise(sr.grid[row*sr.n+col],sr.min,sr.max,logScale);
          ctx.fillStyle=colourForT(t);
          ctx.fillRect(PAD.l+col*cwidth,PAD.t+row*cheight,cwidth+0.5,cheight+0.5);
        }
      }
      drawOverlays(ctx,sr);
      if (hc) drawHover(ctx,sr,hc);
    } else {
      ctx.fillStyle='#1a2940'; ctx.fillRect(PAD.l,PAD.t,pw(),ph());
    }
    drawAxes(ctx);
  }

  $effect(() => { redraw(sweepResult, hoverCell); });

  // Re-draw when overlays toggle without re-sweeping
  $effect(() => {
    const _ok=overlayKerr, _oc=overlayCasimir, _ol=overlayLigo;
    redraw(sweepResult, hoverCell);
  });

  // Trigger new sweep when any axis/output changes, or when worker becomes available
  $effect(() => {
    const _xk=xKey,_yk=yKey,_ok=outputKey;
    const _x0=xMin,_x1=xMax,_y0=yMin,_y1=yMax;
    const w=worker; // tracked — effect re-runs when worker is set
    if (!browser || !w) return;
    sweeping=true; sweepResult=null; hoverCell=null;
    w.postMessage({ type:'RUN_SWEEP', payload:{xKey:_xk,yKey:_yk,xMin:_x0,xMax:_x1,yMin:_y0,yMax:_y1,outputKey:_ok,n} });
  });

  // Export PNG
  $effect(() => {
    const _trigger=exportTrigger;
    if (_trigger===0||!canvas||!sweepResult) return;
    const sr=sweepResult;
    const offscreen=document.createElement('canvas');
    offscreen.width=CW; offscreen.height=CH;
    const octx=offscreen.getContext('2d')!;
    const logScale=OUTPUT_OPTIONS.find(o=>o.key===sr.outputKey)?.logScale??false;
    octx.fillStyle='#0b1120'; octx.fillRect(0,0,CW,CH);
    const cwidth=cw(), cheight=ch_();
    for (let row=0;row<sr.n;row++) {
      for (let col=0;col<sr.n;col++) {
        const t=normalise(sr.grid[row*sr.n+col],sr.min,sr.max,logScale);
        octx.fillStyle=colourForT(t);
        octx.fillRect(PAD.l+col*cwidth,PAD.t+row*cheight,cwidth+0.5,cheight+0.5);
      }
    }
    drawOverlays(octx,sr);
    drawAxes(octx);
    const oLbl=OUTPUT_OPTIONS.find(o=>o.key===sr.outputKey)?.label??sr.outputKey;
    octx.fillStyle='#c8daea'; octx.font='bold 11px monospace'; octx.textAlign='center';
    octx.fillText(`Output: ${oLbl}`,PAD.l+pw()/2,13);
    const link=document.createElement('a');
    link.download=`param-lab-${sr.xKey}-${sr.yKey}-${sr.outputKey}.png`;
    link.href=offscreen.toDataURL('image/png');
    link.click();
  });

  // ── Mouse ─────────────────────────────────────────────────────────────────
  function onMouseMove(e: MouseEvent) {
    if (!canvas||!sweepResult){hoverCell=null;return;}
    const rect=canvas.getBoundingClientRect();
    const sx=CW/rect.width, sy=CH/rect.height;
    const px_=(e.clientX-rect.left)*sx-PAD.l;
    const py_=(e.clientY-rect.top)*sy-PAD.t;
    if (px_<0||py_<0||px_>pw()||py_>ph()){hoverCell=null;return;}
    hoverCell={col:Math.min(n-1,Math.floor(px_/cw())),row:Math.min(n-1,Math.floor(py_/ch_()))};
  }
  function onMouseLeave(){hoverCell=null;}
  function onClick(){
    if (!sweepResult||!hoverCell) return;
    const sr=sweepResult, hc=hoverCell;
    const xv=xMin+(hc.col/(sr.n-1))*(xMax-xMin);
    const yv=yMax-(hc.row/(sr.n-1))*(yMax-yMin);
    loadPreset({...DEFAULT_PARAMS,[sr.xKey]:xv,[sr.yKey]:yv});
    goto('/construct/simulator');
  }

  onMount(() => {
    if (!browser) return;
    // Relative path from src/routes/construct/parameter-lab/ to src/lib/workers/
    const w=new Worker(
      new URL('../../../lib/workers/sweep.worker.js',import.meta.url),
      {type:'module'},
    );
    w.onmessage=({data})=>{
      if (data.type!=='SWEEP_RESULT') return;
      sweepResult=data.payload as SweepResult;
      sweeping=false;
    };
    worker=w; // triggers the sweep $effect
  });

  onDestroy(()=>{worker?.terminate();worker=null;});
</script>

<div class="scene-wrap">
  {#if sweeping}
    <div class="sweep-indicator">computing…</div>
  {/if}
  <canvas
    bind:this={canvas}
    width={CW}
    height={CH}
    class="map-canvas"
    class:hovering={hoverCell !== null}
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
    onclick={onClick}
    role="img"
    aria-label="2D parameter sweep colour map. Hover to inspect values, click to load those parameters in the wormhole simulator."
  ></canvas>
</div>

<style>
  .scene-wrap { position: relative; width: 100%; display: flex; justify-content: center; background: var(--deep); }
  .map-canvas { display: block; width: 100%; max-width: 800px; height: auto; cursor: crosshair; }
  .map-canvas.hovering { cursor: pointer; }
  .sweep-indicator {
    position: absolute; top: 12px; right: 16px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--teal); pointer-events: none; z-index: 2;
  }
</style>
