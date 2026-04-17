<!-- src/routes/construct/parameter-lab/+page.svelte -->
<!-- Phase 6 — Parameter Laboratory. SSR off, DesktopRequired guard. Svelte 5 runes. -->
<script lang="ts">
  import { browser }       from '$app/environment';
  import { onMount }       from 'svelte';
  import DesktopRequired   from '$lib/components/DesktopRequired.svelte';
  import ParameterLabScene from './ParameterLabScene.svelte';

  // ── Axis / output options ─────────────────────────────────────────────────
  const PARAM_OPTIONS = [
    { key: 'a_over_M',     label: 'Spin a/M',        min: 0.0,  max: 0.99 },
    { key: 'a0',           label: 'Throat radius a₀', min: 0.1,  max: 5.0  },
    { key: 'M',            label: 'Mass M',            min: 0.1,  max: 10.0 },
    { key: 'sigma_throat', label: 'Surface tension σ', min: 0.01, max: 2.0  },
    { key: 'eta_s',        label: 'Viscosity η_s',     min: 0.01, max: 1.0  },
  ] as const;
  const OUTPUT_OPTIONS = [
    { key: 'kerr_factor',  label: 'Kerr suppression factor'  },
    { key: 'tau_required', label: 'Exotic matter τ required' },
    { key: 'f0',           label: 'Echo frequency f₀'        },
    { key: 'stability',    label: 'Stability index'           },
    { key: 'echo_count',   label: 'Observable echo count'    },
  ] as const;

  // ── State ─────────────────────────────────────────────────────────────────
  let xKey:          string  = $state('a_over_M');
  let yKey:          string  = $state('a0');
  let outputKey:     string  = $state('kerr_factor');
  let overlayKerr:   boolean = $state(false);
  let overlayCasimir:boolean = $state(false);
  let overlayLigo:   boolean = $state(false);
  let exportTrigger: number  = $state(0);

  const xRange = $derived(PARAM_OPTIONS.find(p => p.key === xKey) ?? PARAM_OPTIONS[0]);
  const yRange = $derived(PARAM_OPTIONS.find(p => p.key === yKey) ?? PARAM_OPTIONS[1]);

  // ── Share URL hash ────────────────────────────────────────────────────────
  function encodeState() {
    return btoa(JSON.stringify({ xKey, yKey, outputKey, overlayKerr, overlayCasimir, overlayLigo }));
  }

  $effect(() => {
    const _ = xKey + yKey + outputKey + String(overlayKerr) + String(overlayCasimir) + String(overlayLigo);
    if (browser) window.location.hash = encodeState();
  });

  onMount(() => {
    if (!browser) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const s = JSON.parse(atob(hash));
      if (s.xKey      && PARAM_OPTIONS.some(p => p.key === s.xKey))      xKey          = s.xKey;
      if (s.yKey      && PARAM_OPTIONS.some(p => p.key === s.yKey))      yKey          = s.yKey;
      if (s.outputKey && OUTPUT_OPTIONS.some(o => o.key === s.outputKey)) outputKey     = s.outputKey;
      if (typeof s.overlayKerr    === 'boolean') overlayKerr    = s.overlayKerr;
      if (typeof s.overlayCasimir === 'boolean') overlayCasimir = s.overlayCasimir;
      if (typeof s.overlayLigo    === 'boolean') overlayLigo    = s.overlayLigo;
    } catch { /* invalid hash — use defaults */ }
  });

  function onExport() { exportTrigger += 1; }
</script>

<svelte:head>
  <title>Parameter Lab — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Parameter Lab — Desktop Required">
  <div class="lab-page">

    <!-- Top bar -->
    <div class="lab-topbar">
      <div class="topbar-left">
        <a href="/construct" class="back-link">← Construct</a>
        <span class="page-title">PARAMETER LABORATORY</span>
        <span class="page-sub">2D sweep · Kerr spacetime · Click → Simulator</span>
      </div>
      <div class="topbar-right">
        <button class="export-btn" onclick={onExport} aria-label="Export colour map as PNG">
          [EXPORT PNG]
        </button>
      </div>
    </div>

    <!-- Controls row -->
    <div class="controls-row">
      <div class="control-group">
        <label class="ctrl-label" for="x-axis">X AXIS</label>
        <select id="x-axis" class="ctrl-select" bind:value={xKey}>
          {#each PARAM_OPTIONS as opt}
            <option value={opt.key} disabled={opt.key === yKey}>{opt.label}</option>
          {/each}
        </select>
      </div>
      <div class="control-group">
        <label class="ctrl-label" for="y-axis">Y AXIS</label>
        <select id="y-axis" class="ctrl-select" bind:value={yKey}>
          {#each PARAM_OPTIONS as opt}
            <option value={opt.key} disabled={opt.key === xKey}>{opt.label}</option>
          {/each}
        </select>
      </div>
      <div class="control-group">
        <label class="ctrl-label" for="output">OUTPUT</label>
        <select id="output" class="ctrl-select" bind:value={outputKey}>
          {#each OUTPUT_OPTIONS as opt}
            <option value={opt.key}>{opt.label}</option>
          {/each}
        </select>
      </div>
      <div class="range-display">
        <span class="range-label">x: [{xRange.min}, {xRange.max}]</span>
        <span class="range-label">y: [{yRange.min}, {yRange.max}]</span>
      </div>
    </div>

    <!-- Colour map -->
    {#if browser}
      <ParameterLabScene
        {xKey} {yKey} {outputKey}
        xMin={xRange.min} xMax={xRange.max}
        yMin={yRange.min} yMax={yRange.max}
        n={64}
        {overlayKerr} {overlayCasimir} {overlayLigo}
        {exportTrigger}
      />
    {/if}

    <!-- Overlay toggle pills -->
    <div class="overlay-row">
      <span class="overlay-label">OVERLAYS:</span>
      <button
        class="overlay-pill gold-pill"
        class:active={overlayKerr}
        onclick={() => overlayKerr = !overlayKerr}
        aria-pressed={overlayKerr}
      >Kerr extremal (a/M = 0.95)</button>
      <button
        class="overlay-pill red-pill"
        class:active={overlayCasimir}
        onclick={() => overlayCasimir = !overlayCasimir}
        aria-pressed={overlayCasimir}
      >Casimir feasibility (τ ≤ 10⁻³ J/m²)</button>
      <button
        class="overlay-pill teal-pill"
        class:active={overlayLigo}
        onclick={() => overlayLigo = !overlayLigo}
        aria-pressed={overlayLigo}
      >LIGO band (f₀ 0.05–5 Hz-eq)</button>
    </div>

    <!-- Constraints notice -->
    <div class="constraints-notice">
      <strong>Feasibility note:</strong>
      This map shows how parameters relate mathematically. The Casimir overlay marks where τ falls
      within current lab capability — a region physically unreachable for macroscopic wormholes.
      All Tier III and IV content is marked throughout the site.
    </div>

  </div>
</DesktopRequired>

<style>
  .lab-page {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 57px);
    background: var(--navy);
  }

  .lab-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 20px; background: var(--deep); border-bottom: 1px solid var(--dim);
    gap: 12px; flex-wrap: wrap;
  }
  .topbar-left  { display: flex; align-items: center; gap: 16px; }
  .back-link {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--sub); text-decoration: none;
  }
  .back-link:hover { color: var(--teal); }
  .page-title {
    font-family: var(--font-display); font-size: 12px; font-weight: 700;
    letter-spacing: 3px; color: var(--teal); text-transform: uppercase;
  }
  .page-sub { font-family: var(--font-mono); font-size: 10px; color: var(--sub); letter-spacing: 1px; }
  .export-btn {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--gold);
    background: none; border: 1px solid var(--gold); border-radius: 2px;
    padding: 5px 12px; cursor: pointer; transition: background 0.15s;
  }
  .export-btn:hover { background: rgba(232,160,32,0.1); }
  .export-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  .controls-row {
    display: flex; align-items: flex-end; gap: 20px;
    padding: 12px 20px; background: var(--deep); border-bottom: 1px solid var(--dim);
    flex-wrap: wrap;
  }
  .control-group { display: flex; flex-direction: column; gap: 4px; }
  .ctrl-label {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--sub);
  }
  .ctrl-select {
    font-family: var(--font-mono); font-size: 11px; color: var(--text);
    background: var(--panel); border: 1px solid var(--dim); border-radius: 2px;
    padding: 5px 10px; cursor: pointer; min-width: 190px; appearance: none;
  }
  .ctrl-select:focus { outline: 1px solid var(--teal); }
  .range-display { display: flex; flex-direction: column; gap: 3px; align-self: flex-end; padding-bottom: 3px; }
  .range-label { font-family: var(--font-mono); font-size: 10px; color: var(--sub); }

  .overlay-row {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: var(--deep); border-top: 1px solid var(--dim);
    flex-wrap: wrap;
  }
  .overlay-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--sub); }
  .overlay-pill {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    background: none; border-radius: 12px; padding: 4px 12px; cursor: pointer;
    opacity: 0.5; transition: opacity 0.15s, background 0.15s; border-width: 1px; border-style: solid;
  }
  .overlay-pill:hover  { opacity: 0.8; }
  .overlay-pill.active { opacity: 1; }
  .overlay-pill:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  .gold-pill  { color: var(--gold);   border-color: var(--gold);   }
  .gold-pill.active  { background: rgba(232,160,32,0.12); }
  .red-pill   { color: var(--red);    border-color: var(--red);    }
  .red-pill.active   { background: rgba(224, 64, 64, 0.12); }
  .teal-pill  { color: var(--teal);   border-color: var(--teal);   }
  .teal-pill.active  { background: rgba(0,200,200,0.12); }

  .constraints-notice {
    font-family: var(--font-body); font-size: 11px; color: var(--sub); line-height: 1.6;
    padding: 12px 20px; border-left: 3px solid var(--gold);
    background: rgba(232,160,32,0.04); margin-top: auto;
  }
  .constraints-notice strong {
    color: var(--gold); font-family: var(--font-mono);
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-right: 6px;
  }
</style>
