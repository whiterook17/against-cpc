<!-- src/routes/construct/simulator/+page.svelte -->
<!-- Wormhole Simulator — Phase 5. SSR disabled (Three.js / Workers are browser-only). -->
<script lang="ts">
  import { browser } from '$app/environment';
  import DesktopRequired  from '$lib/components/DesktopRequired.svelte';
  import ParameterSlider  from '$lib/components/ParameterSlider.svelte';
  import ReadoutStrip     from '$lib/components/ReadoutStrip.svelte';
  import EchoSpectrumPanel from '$lib/components/EchoSpectrumPanel.svelte';
  import PenroseDiagram   from '$lib/components/PenroseDiagram.svelte';
  import SimulatorScene   from '$lib/three/SimulatorScene.svelte';

  import { loadPreset } from '$lib/stores/params.js';
  import { gsap }       from 'gsap';

  // Presets (matching presets.json spec)
  const presets = [
    { id: 'near-extremal',    label: 'Near-Extremal',      M: 1.0, a_over_M: 0.99, a0: 1.2, sigma_throat: 0.4,  eta_s: 0.12 },
    { id: 'moderate-spin',    label: 'Moderate Spin',      M: 1.0, a_over_M: 0.70, a0: 1.5, sigma_throat: 0.5,  eta_s: 0.15 },
    { id: 'static-reference', label: 'Static (a=0)',       M: 1.0, a_over_M: 0.0,  a0: 2.0, sigma_throat: 0.3,  eta_s: 0.20 },
    { id: 'milestone-1',      label: 'Milestone 1 Target', M: 2.5, a_over_M: 0.92, a0: 0.8, sigma_throat: 0.6,  eta_s: 0.10 },
    { id: 'planck-throat',    label: 'Planck Throat',      M: 0.1, a_over_M: 0.95, a0: 0.1, sigma_throat: 0.9,  eta_s: 0.05 },
  ] as const;

  // Slider config
  const sliderGroups = [
    {
      group: 'TORUS',
      sliders: [
        { key: 'M',        label: 'Mass M',        min: 0.1,  max: 10.0, step: 0.1,  unit: 'M☉',  description: 'Total mass of rotating torus. Sets depth of gravitational well.' },
        { key: 'a_over_M', label: 'Spin a/M',      min: 0.0,  max: 0.99, step: 0.01, unit: '',    description: 'Spin parameter ratio. At 0.99 → near-extremal. Kerr suppression → 0.' },
        { key: 'R_torus',  label: 'Torus radius R', min: 1.0,  max: 20.0, step: 0.5,  unit: 'r_g', description: 'Major radius of torus. Determines spatial extent of frame-dragging.' },
      ],
    },
    {
      group: 'THROAT',
      sliders: [
        { key: 'sigma_throat', label: 'Surface tension σ',      min: 0.01, max: 2.0,  step: 0.01, unit: '',    description: 'Surface energy density of exotic shell. Sets oscillation frequency f₀.' },
        { key: 'a0',           label: 'Throat radius a₀',       min: 0.1,  max: 5.0,  step: 0.05, unit: 'r_g', description: 'Equilibrium throat radius. Smaller → cheaper in rotation cost, expensive static.' },
        { key: 'eta_s',        label: 'Membrane viscosity η_s', min: 0.01, max: 1.0,  step: 0.01, unit: '',    description: 'Shear viscosity of throat membrane. Controls echo decay rate.' },
      ],
    },
  ];

  let activePreset = $state('near-extremal');
  let showPenrose  = $state(false);

  function selectPreset(id: string) {
    activePreset = id;
    const preset = presets.find(p => p.id === id);
    if (preset) loadPreset({ ...preset });
  }

  // Perturbation ref — wired to SimulatorScene's inner trigger
  let triggerPerturb: (() => void) | null = null;

  function setPerturbRef(fn: () => void) {
    triggerPerturb = fn;
  }

  function handlePerturb() {
    triggerPerturb?.();
  }

  function togglePenrose() {
    showPenrose = !showPenrose;
    if (showPenrose) {
      gsap.from('.penrose-wrap', { opacity: 0, y: 12, duration: 0.3, ease: 'power2.out' });
    }
  }
</script>

<svelte:head>
  <title>Wormhole Simulator — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Simulator — Desktop Required">
  <div class="sim-page">

    <!-- Top bar -->
    <div class="sim-topbar">
      <div class="topbar-left">
        <a href="/construct" class="back-link">← Construct</a>
        <span class="page-title">WORMHOLE SIMULATOR</span>
        <span class="page-sub">Kerr spacetime · Real-time physics · Web Worker</span>
      </div>
      <div class="topbar-right">
        <span class="preset-label">PRESET:</span>
        {#each presets as preset}
          <button
            class="preset-btn"
            class:active={activePreset === preset.id}
            onclick={() => selectPreset(preset.id)}
            aria-pressed={activePreset === preset.id}
          >{preset.label}</button>
        {/each}
        <button class="penrose-toggle" onclick={togglePenrose} aria-pressed={showPenrose}>
          {showPenrose ? 'HIDE' : 'SHOW'} PENROSE
        </button>
      </div>
    </div>

    <!-- Readout strip -->
    <ReadoutStrip onPerturb={handlePerturb} />

    <!-- Main layout: canvas + sidebar -->
    <div class="sim-body">
      <div class="canvas-col">
        <!-- 3D scene -->
        <div class="canvas-wrap">
          {#if browser}
            <SimulatorScene perturbRef={setPerturbRef} />
          {/if}
        </div>

        <!-- Echo spectrum (below canvas) -->
        <div class="spectrum-wrap">
          <div class="panel-label">ECHO SPECTRUM</div>
          <EchoSpectrumPanel />
        </div>

        <!-- Penrose diagram (toggled) -->
        {#if showPenrose}
          <div class="penrose-wrap">
            <div class="panel-label">PENROSE DIAGRAM</div>
            <PenroseDiagram />
          </div>
        {/if}
      </div>

      <!-- Sidebar: sliders -->
      <div class="sidebar">
        {#each sliderGroups as group}
          <div class="slider-group">
            <div class="group-label">{group.group}</div>
            {#each group.sliders as sl}
              <ParameterSlider
                key={sl.key}
                label={sl.label}
                min={sl.min}
                max={sl.max}
                step={sl.step}
                unit={sl.unit}
                description={sl.description}
              />
            {/each}
          </div>
        {/each}

        <!-- Honest constraints notice -->
        <div class="constraints-notice">
          <strong>A note on feasibility:</strong>
          The τ required shown in the readout strip is a physically real constraint —
          at current technology, a macroscopic traversable wormhole is not buildable.
          The simulator demonstrates how parameters relate, not that the object is constructible.
          All Tier III and Tier IV content is marked throughout.
        </div>
      </div>
    </div>
  </div>
</DesktopRequired>

<style>
  .sim-page {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--navy);
    min-height: calc(100vh - 57px);
  }

  /* Top bar */
  .sim-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 20px;
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
  }
  .topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .back-link {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--sub);
    text-decoration: none;
  }
  .back-link:hover { color: var(--teal); }
  .page-title {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--teal);
    text-transform: uppercase;
  }
  .page-sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    letter-spacing: 1px;
  }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .preset-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--sub);
    text-transform: uppercase;
    margin-right: 4px;
  }
  .preset-btn {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--sub);
    background: none;
    border: 1px solid var(--dim);
    border-radius: 2px;
    padding: 4px 10px;
    cursor: pointer;
    text-transform: uppercase;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .preset-btn:hover  { color: var(--text); border-color: var(--sub); }
  .preset-btn.active { color: var(--teal); border-color: var(--teal); background: rgba(0,200,200,0.07); }
  .preset-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  .penrose-toggle {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--gold);
    background: none;
    border: 1px solid var(--gold);
    border-radius: 2px;
    padding: 4px 10px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.15s;
  }
  .penrose-toggle:hover   { background: rgba(232,160,32,0.1); }
  .penrose-toggle:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  /* Body layout */
  .sim-body {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 0;
    flex: 1;
  }

  .canvas-col {
    display: flex;
    flex-direction: column;
    gap: 0;
    border-right: 1px solid var(--dim);
  }

  .canvas-wrap {
    flex: 1;
    min-height: 480px;
    background: var(--navy);
  }

  .panel-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--sub);
    padding: 6px 12px 2px;
    background: var(--deep);
    border-top: 1px solid var(--dim);
  }

  .spectrum-wrap, .penrose-wrap {
    background: var(--deep);
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--panel);
    overflow-y: auto;
  }

  .slider-group {
    border-bottom: 1px solid var(--dim);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .group-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--teal);
    border-bottom: 1px solid var(--dim);
    padding-bottom: 6px;
  }

  .constraints-notice {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--sub);
    line-height: 1.6;
    padding: 16px;
    border-top: 1px solid var(--dim);
    border-left: 3px solid var(--gold);
    background: var(--gold-faint);
  }
  .constraints-notice strong {
    color: var(--gold);
    display: block;
    margin-bottom: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
</style>
