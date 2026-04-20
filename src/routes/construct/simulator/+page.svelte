<!-- src/routes/construct/simulator/+page.svelte -->
<!-- Phase 5 (revised): 4-panel Canvas 2D simulator. SSR disabled. Svelte 5 runes. -->
<script lang="ts">
  import { browser }   from '$app/environment';
  import { onDestroy } from 'svelte';

  import DesktopRequired from '$lib/components/DesktopRequired.svelte';
  import ParameterSlider from '$lib/components/ParameterSlider.svelte';
  import ReadoutStrip    from '$lib/components/ReadoutStrip.svelte';
  import EquatorialView  from '$lib/components/simulator/EquatorialView.svelte';
  import MeridionalView  from '$lib/components/simulator/MeridionalView.svelte';
  import EmbeddingView   from '$lib/components/simulator/EmbeddingView.svelte';
  import PenroseView     from '$lib/components/simulator/PenroseView.svelte';
  import ObjectInfoCard  from '$lib/components/simulator/ObjectInfoCard.svelte';

  import { params, loadPreset }  from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';

  // ── Presets ─────────────────────────────────────────────────────────────────
  const presets = [
    { id: 'near-extremal',    label: 'Near-Extremal',      M: 1.0, a_over_M: 0.99, a0: 1.2, sigma_throat: 0.4,  eta_s: 0.12 },
    { id: 'moderate-spin',    label: 'Moderate Spin',      M: 1.0, a_over_M: 0.70, a0: 1.5, sigma_throat: 0.5,  eta_s: 0.15 },
    { id: 'static-reference', label: 'Static (a=0)',       M: 1.0, a_over_M: 0.0,  a0: 2.0, sigma_throat: 0.3,  eta_s: 0.20 },
    { id: 'milestone-1',      label: 'Milestone 1',        M: 2.5, a_over_M: 0.92, a0: 0.8, sigma_throat: 0.6,  eta_s: 0.10 },
    { id: 'planck-throat',    label: 'Planck Throat',      M: 0.1, a_over_M: 0.95, a0: 0.1, sigma_throat: 0.9,  eta_s: 0.05 },
  ] as const;

  // ── Slider config ────────────────────────────────────────────────────────────
  const sliderGroups = [
    {
      group: 'TORUS',
      sliders: [
        { key: 'M',        label: 'Mass M',              min: 0.1,  max: 10.0, step: 0.1,  unit: 'M☉',  description: 'Total mass of rotating torus. Sets depth of gravitational well.' },
        { key: 'a_over_M', label: 'Spin a/M',            min: 0.0,  max: 0.99, step: 0.01, unit: '',    description: 'Spin parameter ratio. At 0.99 → near-extremal. Kerr suppression → 0.' },
        { key: 'R_torus',  label: 'Torus radius R',      min: 1.0,  max: 20.0, step: 0.5,  unit: 'r_g', description: 'Major radius of torus. Determines spatial extent of frame-dragging.' },
      ],
    },
    {
      group: 'THROAT',
      sliders: [
        { key: 'sigma_throat', label: 'Surface tension σ',      min: 0.01, max: 2.0, step: 0.01, unit: '',    description: 'Surface energy density of exotic shell. Sets oscillation frequency f₀.' },
        { key: 'a0',           label: 'Throat radius a₀',       min: 0.1,  max: 5.0, step: 0.05, unit: 'r_g', description: 'Equilibrium throat radius. Smaller → cheaper in rotation cost.' },
        { key: 'eta_s',        label: 'Membrane viscosity η_s', min: 0.01, max: 1.0, step: 0.01, unit: '',    description: 'Shear viscosity of throat membrane. Controls echo decay rate.' },
      ],
    },
  ];

  // ── UI state ─────────────────────────────────────────────────────────────────
  let activePreset  = $state('near-extremal');
  let activeObjectId = $state<string | null>(null);

  function selectPreset(id: string) {
    activePreset = id;
    const preset = presets.find(p => p.id === id);
    if (preset) loadPreset({ ...preset });
  }

  function showInfo(id: string) {
    activeObjectId = id === activeObjectId ? null : id;
  }

  // ── Geodesic paths (passed to EquatorialView) ────────────────────────────────
  let geodesicPaths = $state<Float32Array | null>(null);
  let nParticles    = $state(12);
  let nSteps        = $state(500);

  // ── Workers — manage here so they start once on mount ────────────────────────
  if (browser) {
    const pw = new Worker(
      new URL('$lib/workers/physics.worker.js', import.meta.url),
      { type: 'module' }
    );
    const gw = new Worker(
      new URL('$lib/workers/geodesic.worker.js', import.meta.url),
      { type: 'module' }
    );

    pw.onmessage = ({ data }) => {
      if (data.type === 'COMPUTED_STATE') computed.set(data.payload);
    };

    gw.onmessage = ({ data }) => {
      if (data.type === 'GEODESIC_PATHS') {
        geodesicPaths = data.payload.paths;
        nParticles    = data.payload.n;
        nSteps        = data.payload.n_steps;
      }
    };

    const unsubParams = params.subscribe((p) => {
      pw.postMessage({ type: 'UPDATE_PARAMS', payload: p });
      gw.postMessage({
        type: 'INTEGRATE_GEODESICS',
        payload: { ...p, n_particles: 12, n_steps: 500, dt: 0.02, initial_conditions: null },
      });
    });

    const handleVisibility = () => {
      pw.postMessage({ type: document.visibilityState === 'hidden' ? 'PAUSE' : 'RESUME' });
    };
    document.addEventListener('visibilitychange', handleVisibility);

    onDestroy(() => {
      unsubParams();
      document.removeEventListener('visibilitychange', handleVisibility);
      pw.terminate();
      gw.terminate();
    });
  }
</script>

<svelte:head>
  <title>Wormhole Simulator — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Simulator — Desktop Required">
  <div class="sim-page">

    <!-- Header bar -->
    <div class="sim-topbar">
      <div class="topbar-left">
        <a href="/construct" class="back-link">← Construct</a>
        <span class="page-title">WORMHOLE SIMULATOR</span>
        <span class="page-sub">Four views · Kerr spacetime · Real-time physics</span>
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
      </div>
    </div>

    <!-- Parameter sliders (3 columns) -->
    <div class="controls-row">
      {#each sliderGroups as grp}
        <div class="slider-group">
          <div class="group-label">{grp.group}</div>
          {#each grp.sliders as sl}
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
      <div class="constraints-notice">
        <strong>Feasibility note</strong>
        The exotic matter requirements shown are physically real constraints.
        A macroscopic traversable wormhole is not buildable at current technology.
        The simulator demonstrates parameter relationships only.
      </div>
    </div>

    <!-- Computed readout strip -->
    <ReadoutStrip onPerturb={() => {}} />

    <!-- 2×2 canvas grid -->
    <div class="views-grid" class:info-open={activeObjectId !== null}>
      <EquatorialView
        {geodesicPaths}
        {nParticles}
        {nSteps}
        onLabelClick={showInfo}
      />
      <MeridionalView onLabelClick={showInfo} />
      <EmbeddingView  onLabelClick={showInfo} />
      <PenroseView    onLabelClick={showInfo} />
    </div>

  </div>

  <!-- Slide-in info card (outside grid so it overlays) -->
  <ObjectInfoCard objectId={activeObjectId} onClose={() => (activeObjectId = null)} />
</DesktopRequired>

<style>
  .sim-page {
    display: flex;
    flex-direction: column;
    background: var(--navy);
    min-height: calc(100vh - 57px);
  }

  /* ── Top bar ── */
  .sim-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 20px;
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
    flex-shrink: 0;
  }
  .topbar-left  { display: flex; align-items: center; gap: 16px; }
  .topbar-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

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
  }
  .preset-btn:hover  { color: var(--text); border-color: var(--sub); }
  .preset-btn.active { color: var(--teal); border-color: var(--teal); background: rgba(0,200,200,0.07); }
  .preset-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  /* ── Controls row ── */
  .controls-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0;
    border-bottom: 1px solid var(--dim);
    flex-shrink: 0;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px 16px;
    border-right: 1px solid var(--dim);
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
    padding: 14px 16px;
    max-width: 260px;
    border-left: 3px solid var(--gold);
    background: var(--gold-faint);
    align-self: stretch;
  }
  .constraints-notice strong {
    color: var(--gold);
    display: block;
    margin-bottom: 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  /* ── 2×2 views grid ── */
  .views-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    flex: 1;
    transition: margin-right 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .views-grid.info-open {
    margin-right: 300px;
  }

  /* ── Mobile: stack vertically ── */
  @media (max-width: 767px) {
    .controls-row {
      grid-template-columns: 1fr;
    }
    .slider-group {
      border-right: none;
      border-bottom: 1px solid var(--dim);
    }
    .constraints-notice {
      max-width: none;
      border-left: none;
      border-top: 3px solid var(--gold);
    }
    .views-grid {
      grid-template-columns: 1fr;
    }
    .views-grid.info-open {
      margin-right: 0;
    }
  }
</style>
