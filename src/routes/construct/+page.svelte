<!-- src/routes/construct/+page.svelte -->
<!-- Engineering Blueprint + Physics Simulation — merged tabbed page. SSR disabled. Svelte 5 runes. -->
<script lang="ts">
  import { browser }   from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import { gsap }      from 'gsap';

  import DesktopRequired from '$lib/components/DesktopRequired.svelte';
  import TabNav          from '$lib/components/TabNav.svelte';
  import ParameterSlider from '$lib/components/ParameterSlider.svelte';
  import ReadoutStrip    from '$lib/components/ReadoutStrip.svelte';
  import EquatorialView  from '$lib/components/simulator/EquatorialView.svelte';
  import MeridionalView  from '$lib/components/simulator/MeridionalView.svelte';
  import EmbeddingView   from '$lib/components/simulator/EmbeddingView.svelte';
  import PenroseView     from '$lib/components/simulator/PenroseView.svelte';
  import ObjectInfoCard  from '$lib/components/simulator/ObjectInfoCard.svelte';

  import { drawHifi, drawCasimir, drawOscillator } from '$lib/three/construct/drawings.js';
  import { params, loadPreset } from '$lib/stores/params.js';
  import { computed }  from '$lib/stores/computed.js';

  // ── TOP-LEVEL TABS ───────────────────────────────────────────────────────────
  const MAIN_TABS = [
    { id: 'engineering', label: '01  Engineering Blueprint' },
    { id: 'physics',     label: '02  Physics Simulation' },
  ];

  let mainTab   = $state<'engineering' | 'physics'>('engineering');
  let engEl:     HTMLElement | null = $state(null);
  let physicsEl: HTMLElement | null = $state(null);

  function switchMainTab(tab: 'engineering' | 'physics') {
    if (tab === mainTab) return;
    if (!browser) { mainTab = tab; return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const oldEl = mainTab === 'engineering' ? engEl : physicsEl;

    function commit() {
      mainTab = tab;
      if (tab === 'physics') stopAnim();
      if (tab === 'engineering' && engTab === 'hifi') startAnim();
      history.replaceState(null, '', tab === 'physics' ? '#physics' : location.pathname.split('#')[0]);
      if (!reduced) {
        const newEl = tab === 'engineering' ? engEl : physicsEl;
        setTimeout(() => {
          if (newEl) gsap.fromTo(newEl, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        }, 0);
      }
    }

    if (reduced || !oldEl) { commit(); return; }
    gsap.to(oldEl, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: commit });
  }

  // ── ENGINEERING INNER TABS ───────────────────────────────────────────────────
  let engTab   = $state<'wireframe' | 'hifi'>('wireframe');
  let wireframeEl: HTMLElement | null = $state(null);
  let hifiEl:      HTMLElement | null = $state(null);

  let showLabels = $state(true);
  let showDims   = $state(true);
  let showEqs    = $state(true);
  let layers = $state({ torus: true, coupling: true, casimir: true, throat: true });
  let view   = $state<'axial' | 'longit' | 'cutaway'>('axial');
  let exploded = $state(false);

  let hifiCanvas:    HTMLCanvasElement | null = $state(null);
  let casimirCanvas: HTMLCanvasElement | null = $state(null);
  let oscCanvas:     HTMLCanvasElement | null = $state(null);

  let animId: number | null = null;
  let frame = 0;

  function drawState() {
    return { labels: showLabels, dims: showDims, eqs: showEqs, layers: { ...layers }, view };
  }
  function loop() {
    frame = (frame + 1) % 3600;
    if (hifiCanvas)    drawHifi(hifiCanvas, frame, drawState());
    if (casimirCanvas) drawCasimir(casimirCanvas, frame, drawState());
    if (oscCanvas)     drawOscillator(oscCanvas, frame, drawState());
    animId = requestAnimationFrame(loop);
  }
  function startAnim() { if (animId === null) loop(); }
  function stopAnim()  { if (animId !== null) { cancelAnimationFrame(animId); animId = null; } }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') stopAnim();
    else if (engTab === 'hifi' && mainTab === 'engineering') startAnim();
  }

  function switchEngTab(tab: 'wireframe' | 'hifi') {
    if (tab === engTab) return;
    if (!browser) { engTab = tab; return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const oldEl = engTab === 'wireframe' ? wireframeEl : hifiEl;

    function commit() {
      engTab = tab;
      if (tab === 'hifi') {
        startAnim();
        if (!reduced) setTimeout(() => { if (hifiEl) gsap.fromTo(hifiEl, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }); }, 0);
      } else {
        stopAnim();
        if (!reduced) setTimeout(() => { if (wireframeEl) gsap.fromTo(wireframeEl, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }); }, 0);
      }
    }

    if (reduced || !oldEl) { commit(); return; }
    gsap.to(oldEl, { opacity: 0, x: -20, duration: 0.25, ease: 'power2.in', onComplete: commit });
  }

  function toggleLayer(k: keyof typeof layers) { layers = { ...layers, [k]: !layers[k] }; }
  function setView(v: 'axial' | 'longit' | 'cutaway') { view = v; }
  function toggleExplode() { exploded = !exploded; }

  const annLinks: Record<string, string> = {
    '①': '/paper#sec-5', '②': '/paper#sec-5', '③': '/paper#sec-5',
    '④': '/paper#sec-5', '⑤': '/paper#sec-6', '⑥': '/paper#sec-5',
    '⑦': '/paper#sec-5', '⑧': '/paper#sec-5',
  };

  const viewLabels: Record<string, string> = {
    axial:   '// FIG 2A — AXIAL CROSS-SECTION  ·  HIGH-FIDELITY ENGINEERING VIEW',
    longit:  '// FIG 2B — LONGITUDINAL SECTION THROUGH SPIN AXIS',
    cutaway: '// FIG 2C — CUTAWAY PERSPECTIVE  ·  LAYER STRUCTURE REVEALED',
  };

  // Re-draw static detail panels when toggles change while hifi is active
  $effect(() => {
    if (!browser || engTab !== 'hifi' || mainTab !== 'engineering') return;
    void showLabels; void showDims; void showEqs; void layers; void view;
    if (hifiCanvas)    drawHifi(hifiCanvas, frame, drawState());
    if (casimirCanvas) drawCasimir(casimirCanvas, frame, drawState());
    if (oscCanvas)     drawOscillator(oscCanvas, frame, drawState());
  });

  // ── PHYSICS TAB STATE ────────────────────────────────────────────────────────
  let activeObjectId = $state<string | null>(null);
  let geodesicPaths  = $state<Float32Array | null>(null);
  let nParticles     = $state(12);
  let nSteps         = $state(500);
  let activePreset   = $state('near-extremal');

  const presets = [
    { id: 'near-extremal',    label: 'Near-Extremal',  M: 1.0, a_over_M: 0.99, a0: 1.2, sigma_throat: 0.4,  eta_s: 0.12 },
    { id: 'moderate-spin',    label: 'Moderate Spin',  M: 1.0, a_over_M: 0.70, a0: 1.5, sigma_throat: 0.5,  eta_s: 0.15 },
    { id: 'static-reference', label: 'Static (a=0)',   M: 1.0, a_over_M: 0.0,  a0: 2.0, sigma_throat: 0.3,  eta_s: 0.20 },
    { id: 'milestone-1',      label: 'Milestone 1',    M: 2.5, a_over_M: 0.92, a0: 0.8, sigma_throat: 0.6,  eta_s: 0.10 },
    { id: 'planck-throat',    label: 'Planck Throat',  M: 0.1, a_over_M: 0.95, a0: 0.1, sigma_throat: 0.9,  eta_s: 0.05 },
  ] as const;

  const sliderGroups = [
    {
      group: 'TORUS',
      sliders: [
        { key: 'M',        label: 'Mass M',          min: 0.1,  max: 10.0, step: 0.1,  unit: 'M☉',  description: 'Total mass of rotating torus. Sets depth of gravitational well.' },
        { key: 'a_over_M', label: 'Spin a/M',        min: 0.0,  max: 0.99, step: 0.01, unit: '',    description: 'Spin parameter ratio. At 0.99 → near-extremal. Kerr suppression → 0.' },
        { key: 'R_torus',  label: 'Torus radius R',  min: 1.0,  max: 20.0, step: 0.5,  unit: 'r_g', description: 'Major radius of torus. Determines spatial extent of frame-dragging.' },
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

  function selectPreset(id: string) {
    activePreset = id;
    const preset = presets.find(p => p.id === id);
    if (preset) loadPreset({ ...preset });
  }

  // ── WORKERS (always running once page mounts) ────────────────────────────────
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

    const unsubParams = params.subscribe(p => {
      pw.postMessage({ type: 'UPDATE_PARAMS', payload: p });
      gw.postMessage({ type: 'INTEGRATE_GEODESICS', payload: { ...p, n_particles: 12, n_steps: 500, dt: 0.02, initial_conditions: null } });
    });

    const handlePageVis = () => {
      pw.postMessage({ type: document.visibilityState === 'hidden' ? 'PAUSE' : 'RESUME' });
    };
    document.addEventListener('visibilitychange', handlePageVis);

    onDestroy(() => {
      unsubParams();
      document.removeEventListener('visibilitychange', handlePageVis);
      pw.terminate();
      gw.terminate();
    });
  }

  // ── LIFECYCLE ────────────────────────────────────────────────────────────────
  onMount(() => {
    if (!browser) return;
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (window.location.hash === '#physics') mainTab = 'physics';
  });

  onDestroy(() => {
    stopAnim();
    if (browser) document.removeEventListener('visibilitychange', onVisibilityChange);
  });
</script>

<svelte:head>
  <title>Construct the Wormhole — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Construct — Desktop Required">

  <!-- Sub-header -->
  <div class="sub-head-bar">
    <span class="sub-head-text">Engineering Reference  //  GR Construct  //  Rev 0.4</span>
    <span class="badge">THEORETICAL</span>
  </div>

  <!-- Top-level tab navigation -->
  <TabNav tabs={MAIN_TABS} activeTab={mainTab} onchange={id => switchMainTab(id as 'engineering' | 'physics')} />

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- TAB 1 — ENGINEERING BLUEPRINT                                 -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  {#if mainTab === 'engineering'}
    <div bind:this={engEl}>

      <!-- Engineering inner tab nav -->
      <div class="eng-tab-nav">
        <button
          class="etab-btn"
          class:active={engTab === 'wireframe'}
          onclick={() => switchEngTab('wireframe')}
        ><span class="tab-num">01</span>WIREFRAME OVERVIEW</button>
        <button
          class="etab-btn"
          class:active={engTab === 'hifi'}
          onclick={() => switchEngTab('hifi')}
        ><span class="tab-num">02</span>HI-FI ENGINEERING VIEW</button>
      </div>

      <!-- ─── WIREFRAME ─── -->
      {#if engTab === 'wireframe'}
        <div class="workspace" bind:this={wireframeEl}>
          <div class="diagram-panel">
            <div class="diagram-title">// FIG 1 — AXIAL CROSS-SECTION (not to scale)</div>

            <svg class="main-diagram" viewBox="0 0 700 620" xmlns="http://www.w3.org/2000/svg" aria-label="Axial cross-section diagram of the rotating exotic-stabilised throat construct showing four nested layers: rotating dense torus, coupling zone, Casimir array, and stabilised throat">
              <defs>
                <radialGradient id="w-tG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#a070e0" stop-opacity=".9"/><stop offset="60%" stop-color="#5030a0" stop-opacity=".4"/><stop offset="100%" stop-color="#a070e0" stop-opacity="0"/></radialGradient>
                <radialGradient id="w-trG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a3a5a"/><stop offset="100%" stop-color="#0d2040"/></radialGradient>
                <radialGradient id="w-cG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2a1a4a"/><stop offset="100%" stop-color="#1a0d30"/></radialGradient>
                <radialGradient id="w-cpG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a3020" stop-opacity="0"/><stop offset="80%" stop-color="#20e070" stop-opacity=".08"/><stop offset="100%" stop-color="#20e070" stop-opacity="0"/></radialGradient>
                <filter id="w-b4"><feGaussianBlur stdDeviation="4"/></filter>
                <filter id="w-b2"><feGaussianBlur stdDeviation="2"/></filter>
                <marker id="w-aT" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#00c8c8" opacity=".8"/></marker>
                <marker id="w-aG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#e8a020"/></marker>
              </defs>
              <g opacity=".06" stroke="#00c8c8" stroke-width=".5"><line x1="0" y1="155" x2="700" y2="155"/><line x1="0" y1="310" x2="700" y2="310"/><line x1="0" y1="465" x2="700" y2="465"/><line x1="175" y1="0" x2="175" y2="620"/><line x1="350" y1="0" x2="350" y2="620"/><line x1="525" y1="0" x2="525" y2="620"/></g>
              <line x1="350" y1="20" x2="350" y2="600" stroke="#2a3f5a" stroke-width=".8" stroke-dasharray="4,4"/>
              <line x1="40" y1="310" x2="660" y2="310" stroke="#2a3f5a" stroke-width=".8" stroke-dasharray="4,4"/>
              <g class="spin-field"><ellipse cx="350" cy="310" rx="270" ry="270" fill="none" stroke="#00c8c8" stroke-width=".5" stroke-dasharray="3,12" opacity=".22"/><ellipse cx="350" cy="310" rx="240" ry="240" fill="none" stroke="#00c8c8" stroke-width=".5" stroke-dasharray="3,18" opacity=".16"/><ellipse cx="350" cy="310" rx="210" ry="210" fill="none" stroke="#00c8c8" stroke-width=".5" stroke-dasharray="2,16" opacity=".12"/></g>
              <ellipse cx="350" cy="310" rx="195" ry="195" fill="none" stroke="#00c8c8" stroke-width="16" opacity=".06" filter="url(#w-b4)"/>
              <g class="spin-torus">
                <ellipse cx="196" cy="310" rx="58" ry="58" fill="url(#w-trG)" stroke="#00c8c8" stroke-width="1.5" opacity=".9"/>
                <ellipse cx="504" cy="310" rx="58" ry="58" fill="url(#w-trG)" stroke="#00c8c8" stroke-width="1.5" opacity=".9"/>
                <ellipse cx="350" cy="156" rx="58" ry="58" fill="url(#w-trG)" stroke="#00c8c8" stroke-width="1.5" opacity=".9"/>
                <ellipse cx="350" cy="464" rx="58" ry="58" fill="url(#w-trG)" stroke="#00c8c8" stroke-width="1.5" opacity=".9"/>
                <line x1="165" y1="290" x2="225" y2="310" stroke="#00c8c8" stroke-width=".5" opacity=".3"/><line x1="162" y1="305" x2="228" y2="318" stroke="#00c8c8" stroke-width=".5" opacity=".3"/><line x1="168" y1="320" x2="224" y2="330" stroke="#00c8c8" stroke-width=".5" opacity=".3"/>
              </g>
              <circle cx="350" cy="310" r="140" fill="url(#w-cpG)"/>
              <circle cx="350" cy="310" r="140" fill="none" stroke="#40d080" stroke-width="1" stroke-dasharray="6,6" opacity=".4"/>
              <text x="470" y="200" font-family="Share Tech Mono" font-size="10" fill="#40d080" opacity=".8">ω(r,θ) MAX</text>
              <line x1="463" y1="202" x2="430" y2="228" stroke="#40d080" stroke-width=".7" stroke-dasharray="3,3" opacity=".5"/>
              <g class="spin-inner">
                <circle cx="350" cy="310" r="100" fill="url(#w-cG)" stroke="#a070e0" stroke-width="1.2" opacity=".85"/>
                <circle cx="350" cy="310" r="85" fill="none" stroke="#a070e0" stroke-width=".8" stroke-dasharray="4,4" opacity=".6"/>
                <circle cx="350" cy="310" r="70" fill="none" stroke="#a070e0" stroke-width=".8" stroke-dasharray="4,6" opacity=".5"/>
                <circle cx="350" cy="310" r="57" fill="none" stroke="#a070e0" stroke-width=".8" stroke-dasharray="3,6" opacity=".4"/>
                <line x1="255" y1="295" x2="445" y2="295" stroke="#a070e0" stroke-width=".5" opacity=".22"/><line x1="258" y1="310" x2="442" y2="310" stroke="#a070e0" stroke-width=".5" opacity=".22"/><line x1="255" y1="325" x2="445" y2="325" stroke="#a070e0" stroke-width=".5" opacity=".22"/>
                <line x1="310" y1="215" x2="310" y2="405" stroke="#a070e0" stroke-width=".5" opacity=".18"/><line x1="350" y1="212" x2="350" y2="408" stroke="#a070e0" stroke-width=".5" opacity=".18"/><line x1="390" y1="215" x2="390" y2="405" stroke="#a070e0" stroke-width=".5" opacity=".18"/>
              </g>
              <circle cx="350" cy="310" r="50" fill="url(#w-tG)" filter="url(#w-b2)"/>
              <circle class="pulse-throat" cx="350" cy="310" r="48" fill="none" stroke="#a070e0" stroke-width="2"/>
              <circle cx="350" cy="310" r="38" fill="#0d0820" opacity=".95"/>
              <circle cx="350" cy="310" r="38" fill="none" stroke="#a070e0" stroke-width="1" opacity=".6"/>
              <line x1="350" y1="310" x2="398" y2="310" stroke="#a070e0" stroke-width="1"/>
              <circle cx="350" cy="310" r="2" fill="#a070e0"/><circle cx="398" cy="310" r="2" fill="#a070e0"/>
              <text x="360" y="305" font-family="Share Tech Mono" font-size="10" fill="#a070e0">a₀</text>
              <text x="350" y="314" font-family="Orbitron,monospace" font-size="7" fill="#a070e0" text-anchor="middle" letter-spacing="1">THROAT</text>
              <line x1="350" y1="52" x2="350" y2="30" stroke="#2a3f5a" stroke-width=".8"/><line x1="156" y1="30" x2="544" y2="30" stroke="#2a3f5a" stroke-width=".8"/><line x1="156" y1="52" x2="156" y2="30" stroke="#2a3f5a" stroke-width=".8"/><line x1="544" y1="52" x2="544" y2="30" stroke="#2a3f5a" stroke-width=".8"/>
              <text x="350" y="26" font-family="Share Tech Mono" font-size="9" fill="#2a3f5a" text-anchor="middle">R_torus</text>
              <line x1="252" y1="260" x2="160" y2="220" stroke="#a070e0" stroke-width=".7" stroke-dasharray="3,3" opacity=".5"/>
              <text x="40" y="215" font-family="Share Tech Mono" font-size="9" fill="#a070e0" opacity=".8">CASIMIR</text><text x="40" y="227" font-family="Share Tech Mono" font-size="9" fill="#a070e0" opacity=".8">ARRAY</text>
              <line x1="196" y1="254" x2="115" y2="170" stroke="#00c8c8" stroke-width=".7" stroke-dasharray="3,3" opacity=".5"/>
              <text x="22" y="162" font-family="Share Tech Mono" font-size="9" fill="#00c8c8" opacity=".9">ROTATING</text><text x="22" y="174" font-family="Share Tech Mono" font-size="9" fill="#00c8c8" opacity=".9">DENSE TORUS</text>
              <line x1="350" y1="578" x2="350" y2="540" stroke="#e8a020" stroke-width="1.5" marker-end="url(#w-aG)"/>
              <line x1="350" y1="42" x2="350" y2="80" stroke="#e8a020" stroke-width="1.5" marker-end="url(#w-aG)"/>
              <text x="358" y="573" font-family="Share Tech Mono" font-size="9" fill="#e8a020">J</text><text x="358" y="58" font-family="Share Tech Mono" font-size="9" fill="#e8a020">J</text>
              <rect x="418" y="378" width="232" height="50" rx="3" fill="#0d1828" stroke="#e8a020" stroke-width=".8" opacity=".9"/>
              <text x="428" y="397" font-family="Share Tech Mono" font-size="9" fill="#e8a020">KERR SUPPRESSION FACTOR:</text>
              <text x="428" y="417" font-family="Share Tech Mono" font-size="11" fill="#e8a020">|τ| ~ √(1 − a²/M²)</text>
              <path d="M 350,464 A 154,154 0 0,0 196,310" fill="none" stroke="#00c8c8" stroke-width="1.1" stroke-dasharray="5,5" marker-end="url(#w-aT)" opacity=".45"/>
              <path d="M 350,156 A 154,154 0 0,0 504,310" fill="none" stroke="#00c8c8" stroke-width="1.1" stroke-dasharray="5,5" marker-end="url(#w-aT)" opacity=".45"/>
              <text x="616" y="598" font-family="Share Tech Mono" font-size="9" fill="#2a3f5a">NOT TO SCALE</text>
              <text x="616" y="610" font-family="Share Tech Mono" font-size="9" fill="#2a3f5a">GR GEOMETRY</text>
            </svg>

            <div class="eq-strip">
              <div class="eq-card teal">
                <div class="eq-label">// Frame Dragging Rate</div>
                <div class="eq-formula">ω(r,θ) = <em>2Mar</em><br>──────────────<br>(r²+a²)Σ+2Ma²r·sin²θ</div>
              </div>
              <div class="eq-card gold">
                <div class="eq-label">// Kerr Throat Tension</div>
                <div class="eq-formula">|τ|<sub>Kerr</sub> ~ <span class="g">c²/G·a₀⁻²</span><br>· <span class="g">√(1−a²/M²)</span></div>
              </div>
              <div class="eq-card purple">
                <div class="eq-label">// Echo Spectrum (Eq. 9b)</div>
                <div class="eq-formula">Ḣ(f)=A₀·(f/f₀)²·<span class="p">e^(−η_sf/f₀²)</span><br>f₀=√(<span class="p">σ_throat</span>/a₀²)/2π</div>
              </div>
            </div>
          </div>

          <div class="sidebar">
            <div class="sidebar-section">
              <h3>// Layer Architecture</h3>
              <div class="layer-item"><div class="layer-dot teal"></div><div class="layer-info"><h4 class="teal">L1 — Rotating Dense Torus</h4><p>Maximally dense matter ring at a→M. Generates frame dragging ω(r,θ). Primary Kerr suppression driver.</p></div></div>
              <div class="layer-item"><div class="layer-dot green"></div><div class="layer-info"><h4 class="green">L2 — Coupling Zone</h4><p>Interior ergosphere: ω(r,θ) maximal. Geometric region, not physical structure. Minimum exotic matter cost.</p></div></div>
              <div class="layer-item"><div class="layer-dot purple"></div><div class="layer-info"><h4 class="purple">L3 — Casimir Array</h4><p>Nested conducting shells at sub-micron gaps. NEC-violating negative energy density zone.</p></div></div>
              <div class="layer-item"><div class="layer-dot red"></div><div class="layer-info"><h4 class="red">L4 — Stabilised Throat</h4><p>Geometric feature at a₀. Israel junction equilibrium. Damped harmonic oscillator dynamics.</p></div></div>
            </div>
            <div class="sidebar-section">
              <h3>// Anchor Constants</h3>
              <div class="param-row"><div class="param-sym">a₀</div><div class="param-desc">Equilibrium throat radius. Rest position of geometric feature.</div></div>
              <div class="param-row"><div class="param-sym">σ_throat</div><div class="param-desc">Surface energy density. Spring constant for throat oscillations. Sets echo freq f₀.</div></div>
              <div class="param-row"><div class="param-sym">η_s</div><div class="param-desc">Membrane shear viscosity. Controls oscillation decay. Echo damping rate.</div></div>
              <div class="param-row"><div class="param-sym">a/M</div><div class="param-desc">Spin parameter ratio. As a→M, exotic budget→0.</div></div>
            </div>
            <div class="sidebar-section">
              <h3>// System State</h3>
              <div class="status-row"><span class="status-label">SPIN FACTOR a/M</span><div class="status-bar"><div class="status-fill" style="width:78%;background:var(--teal)"></div></div></div>
              <div class="status-row"><span class="status-label">EXOTIC BUDGET τ</span><div class="status-bar"><div class="status-fill" style="width:22%;background:var(--purple)"></div></div></div>
              <div class="status-row"><span class="status-label">THROAT STABILITY</span><div class="status-bar"><div class="status-fill" style="width:91%;background:var(--green)"></div></div></div>
              <div class="status-row"><span class="status-label">KERR SUPPRESSION</span><div class="status-bar"><div class="status-fill" style="width:63%;background:var(--gold)"></div></div></div>
            </div>
            <div class="sidebar-section">
              <h3>// Engineering Status</h3>
              <p class="eng-status">
                <span style="color:var(--green)">■</span> Architecture: Theoretically coherent<br>
                <span style="color:var(--gold)">■</span> Kerr suppression: Derived (Tier II)<br>
                <span style="color:var(--purple)">■</span> Coupling tensor: Schematic (Tier III)<br>
                <span style="color:var(--red)">■</span> Realisation: Beyond current tech<br>
                <span style="color:var(--red)">■</span> Bottleneck: Torus density + spin rate
              </p>
            </div>
            <div class="sidebar-section">
              <h3>// Ref Equations</h3>
              <p class="ref-eqs">
                Eq 5.1 — T_total decomposition<br>
                Eq 5.4 — ω(r,θ) frame dragging<br>
                Eq 5.8 — Kerr tension suppression<br>
                Eq 6.1 — Israel junction cond.<br>
                Eq 6.3 — Throat oscillator<br>
                Eq 9b  — Echo spectrum
              </p>
            </div>
          </div>
        </div>

      <!-- ─── HI-FI ─── -->
      {:else}
        <div class="hifi-wrap" bind:this={hifiEl}>
          <div class="hifi-toolbar">
            <div class="tool-group">
              <span class="tool-label">Labels</span>
              <button class="toggle-wrap" onclick={() => { showLabels = !showLabels; }} aria-pressed={showLabels} aria-label="Toggle labels">
                <div class="toggle-track" class:on={showLabels}><div class="toggle-thumb"></div></div>
                <span class="toggle-text" class:on={showLabels}>{showLabels ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div class="tool-group">
              <span class="tool-label">Dimensions</span>
              <button class="toggle-wrap" onclick={() => { showDims = !showDims; }} aria-pressed={showDims} aria-label="Toggle dimensions">
                <div class="toggle-track" class:on={showDims}><div class="toggle-thumb"></div></div>
                <span class="toggle-text" class:on={showDims}>{showDims ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div class="tool-group">
              <span class="tool-label">Equations</span>
              <button class="toggle-wrap" onclick={() => { showEqs = !showEqs; }} aria-pressed={showEqs} aria-label="Toggle equations">
                <div class="toggle-track" class:on={showEqs}><div class="toggle-thumb"></div></div>
                <span class="toggle-text" class:on={showEqs}>{showEqs ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div class="tool-group">
              <span class="tool-label">Layers</span>
              <button class="pill teal"   class:off={!layers.torus}    onclick={() => toggleLayer('torus')}>L1 Torus</button>
              <button class="pill green"  class:off={!layers.coupling} onclick={() => toggleLayer('coupling')}>L2 Coupling</button>
              <button class="pill purple" class:off={!layers.casimir}  onclick={() => toggleLayer('casimir')}>L3 Casimir</button>
              <button class="pill red"    class:off={!layers.throat}   onclick={() => toggleLayer('throat')}>L4 Throat</button>
            </div>
            <div class="tool-group">
              <span class="tool-label">View</span>
              <div class="view-switch">
                <button class="vs-btn" class:active={view === 'axial'}   onclick={() => setView('axial')}>Axial</button>
                <button class="vs-btn" class:active={view === 'longit'}  onclick={() => setView('longit')}>Longitudinal</button>
                <button class="vs-btn" class:active={view === 'cutaway'} onclick={() => setView('cutaway')}>Cutaway</button>
              </div>
            </div>
            <div class="tool-group explode-group">
              <button class="explode-btn" class:active={exploded} onclick={toggleExplode} disabled title="Exploded view — coming in Phase 3 follow-up">[EXPLODE]</button>
            </div>
          </div>

          <div class="hifi-main">
            <div class="hifi-canvas-wrap">
              <div class="hifi-view-label">{viewLabels[view]}</div>
              <canvas id="hifi-canvas" width="900" height="760" bind:this={hifiCanvas} aria-label="High-fidelity engineering diagram. Use toolbar controls to toggle labels, dimensions, equations, layer visibility, and view angle."></canvas>
              <div class="detail-row">
                <div class="detail-card">
                  <div class="detail-card-title">// DETAIL A — Casimir Cavity Cross-Section</div>
                  <canvas class="detail-canvas" width="400" height="140" bind:this={casimirCanvas}></canvas>
                </div>
                <div class="detail-card">
                  <div class="detail-card-title">// DETAIL B — Throat Oscillator Phase</div>
                  <canvas class="detail-canvas" width="400" height="140" bind:this={oscCanvas}></canvas>
                </div>
              </div>
            </div>

            <div class="hifi-sidebar">
              <div class="hs-section">
                <h3>// Structural Annotations</h3>
                {#each [
                  { n: '①', c: 'var(--teal)',   title: 'Rotating Dense Matter Torus',   body: 'High-density toroid at spin parameter a≡J/Mc → M. Generates off-diagonal component g_tφ via T^tφ = (ρ+p)u^t u^φ ≠ 0. Primary frame-dragging source.', eq: 'T^tφ = (ρ+p)·u^t·u^φ' },
                  { n: '②', c: 'var(--gold)',   title: 'Ergosphere Boundary',           body: 'Surface g_tt = 0. Co-rotation mandatory. Frame drag ω equals local light speed limit.', eq: 'ω → Ω_H = a/(2Mr₊) at horizon' },
                  { n: '③', c: 'var(--green)',  title: 'Coupling Zone (Kerr Interior)', body: 'Region of maximal ω(r,θ). Kerr suppression factor √(1−a²/M²) → 0 as a→M. Rotation does stabilisation work.', eq: '|τ|_Kerr ~ (c²/G)·a₀⁻²·√(1−a²/M²)' },
                  { n: '④', c: 'var(--purple)', title: 'Casimir Cavity Array',          body: 'Nested conducting shells, separation d ≪ 1μm. NEC violated: T_μν k^μk^ν = −ρ_ex−τ < 0.', eq: 'P_Casimir = −π²ℏc / 240d⁴' },
                  { n: '⑤', c: 'var(--red)',    title: 'Stabilised Throat (a₀)',        body: 'Wormhole throat at equilibrium radius a₀. Israel junction. Perturbed: damped harmonic oscillator.', eq: 'δä + 2η_s·δȧ + (σ_throat/a₀²)·δa = 0' },
                  { n: '⑥', c: 'var(--gold)',   title: 'Spin Axis J',                   body: 'Boyer–Lindquist z-axis. Lense–Thirring precession in surrounding spacetime.', eq: 'Ω_LT = GJ/c²r³·(3cos²θ−1)' },
                  { n: '⑦', c: 'var(--sub)',    title: 'Spacetime Dragging Field Lines', body: 'Dashed arcs show co-rotation at ω(r,θ). Line density indicates dragging strength.', eq: null },
                  { n: '⑧', c: 'var(--sub)',    title: 'Coupling Stress-Energy',        body: 'Antisymmetric interaction between rotating matter and exotic shell. Chiral.', eq: 'T^μν_coupling ~ a·ρ_ex·ε^μναβ·u_α·k_β' },
                ] as ann (ann.n)}
                  <a class="ann-item" href={annLinks[ann.n]} title="Go to paper section">
                    <span class="ann-key" style="color:{ann.c}">{ann.n}</span>
                    <div class="ann-text">
                      <strong style="color:{ann.c}">{ann.title}</strong>
                      {ann.body}
                      {#if ann.eq}<div class="ann-eq">{ann.eq}</div>{/if}
                    </div>
                  </a>
                {/each}
              </div>
              <div class="hs-section">
                <h3>// Dimensional Parameters</h3>
                <table class="data-table">
                  <tbody>
                    <tr><td>R_torus</td><td>Major radius. Determines spatial extent of frame-dragging field.</td></tr>
                    <tr><td>r_tube</td><td>Minor radius (tube cross-section). Sets mass distribution.</td></tr>
                    <tr><td>R_erg</td><td>Ergosphere radius. R_erg = M+√(M²−a²cos²θ) at equatorial plane.</td></tr>
                    <tr><td>R_cas</td><td>Outer radius of Casimir array. Must satisfy R_cas &lt; R_erg.</td></tr>
                    <tr><td>d_cas</td><td>Shell separation. d ≪ 1μm required for Casimir effect.</td></tr>
                    <tr><td>a₀</td><td>Throat equilibrium radius. Set by Israel junction balance.</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="hs-section">
                <h3>// Epistemic Tier Map</h3>
                <p class="tier-map">
                  <span style="color:var(--teal)">TIER I</span> — Kerr metric, Israel junction, Casimir effect<br>
                  <span style="color:var(--gold)">TIER II</span> — Kerr suppression factor, throat oscillator, echo spectrum<br>
                  <span style="color:var(--purple)">TIER III</span> — Coupling tensor T^μν_coupling (schematic form)<br>
                  <span style="color:var(--red)">TIER IV</span> — GAP: no closed-form rotating exotic matter solution
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}

    </div><!-- end engineering tab -->

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- TAB 2 — PHYSICS SIMULATION                                    -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  {:else}
    <div bind:this={physicsEl}>

      <!-- Physics top bar: presets -->
      <div class="phys-topbar">
        <span class="phys-title">KERR WORMHOLE — REAL-TIME PHYSICS</span>
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

      <!-- Parameter sliders (3-column grid) -->
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

      <!-- Readout strip -->
      <ReadoutStrip onPerturb={() => {}} />

      <!-- 4-panel views grid -->
      <div class="views-grid" class:info-open={activeObjectId !== null}>
        <EquatorialView {geodesicPaths} {nParticles} {nSteps} onLabelClick={id => (activeObjectId = id)} />
        <MeridionalView  onLabelClick={id => (activeObjectId = id)} />
        <EmbeddingView   onLabelClick={id => (activeObjectId = id)} />
        <PenroseView     onLabelClick={id => (activeObjectId = id)} />
      </div>

    </div><!-- end physics tab -->
  {/if}

  <!-- Object info card (physics tab) -->
  <ObjectInfoCard objectId={activeObjectId} onClose={() => (activeObjectId = null)} />

</DesktopRequired>

<style>
  /* ── Sub-header ── */
  .sub-head-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 28px;
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
  }
  .sub-head-text { font-family: var(--font-mono); font-size: 10px; color: var(--sub); letter-spacing: 1px; }
  .badge { margin-left: auto; font-family: var(--font-mono); font-size: 10px; color: var(--gold); border: 1px solid var(--gold); padding: 3px 10px; letter-spacing: 2px; }

  /* ── Engineering inner tab nav ── */
  .eng-tab-nav {
    display: flex;
    border-bottom: 1px solid var(--dim);
    background: var(--panel);
    padding: 0 28px;
  }
  .etab-btn {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--sub);
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px 20px;
    border-bottom: 2px solid transparent;
    text-transform: uppercase;
    position: relative;
    top: 1px;
  }
  .etab-btn:hover { color: var(--text); }
  .etab-btn.active { color: var(--teal); border-bottom-color: var(--teal); }
  .tab-num { color: var(--dim); margin-right: 8px; font-size: 9px; }
  .etab-btn.active .tab-num { color: var(--teal); opacity: .5; }

  /* ── Wireframe workspace ── */
  .workspace {
    display: grid;
    grid-template-columns: 1fr 300px;
    min-height: calc(100vh - 175px);
  }
  .diagram-panel { padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .diagram-title { font-family: var(--font-mono); font-size: 10px; color: var(--sub); letter-spacing: 2px; text-transform: uppercase; align-self: flex-start; }
  svg.main-diagram { width: 100%; max-width: 680px; height: auto; filter: drop-shadow(0 0 40px rgba(0,200,200,.07)); }

  :global(.spin-torus)  { animation: rot-s 8s linear infinite; transform-origin: 350px 310px; }
  :global(.spin-field)  { animation: rot-s 12s linear infinite; transform-origin: 350px 310px; }
  :global(.spin-inner)  { animation: rot-r 5s linear infinite; transform-origin: 350px 310px; }
  :global(.pulse-throat){ animation: p-ring 2.5s ease-in-out infinite; }
  @keyframes rot-s  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
  @keyframes rot-r  { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
  @keyframes p-ring { 0%,100% { opacity: .3; } 50% { opacity: .9; } }
  @media (prefers-reduced-motion: reduce) {
    :global(.spin-torus), :global(.spin-field), :global(.spin-inner), :global(.pulse-throat) { animation-play-state: paused; }
  }

  .eq-strip { width: 100%; max-width: 680px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .eq-card { background: var(--panel); border: 1px solid var(--dim); border-top: 2px solid; padding: 12px 14px; }
  .eq-card.teal   { border-top-color: var(--teal); }
  .eq-card.gold   { border-top-color: var(--gold); }
  .eq-card.purple { border-top-color: var(--purple); }
  .eq-label { font-family: var(--font-mono); font-size: 9px; color: var(--sub); letter-spacing: 2px; margin-bottom: 7px; text-transform: uppercase; }
  .eq-formula { font-family: var(--font-mono); font-size: 11px; color: var(--text); line-height: 1.7; }
  .eq-formula em { color: var(--teal); font-style: normal; }
  .eq-formula .g { color: var(--gold); }
  .eq-formula .p { color: var(--purple); }

  /* Wireframe sidebar */
  .sidebar { border-left: 1px solid var(--dim); background: var(--panel); display: flex; flex-direction: column; overflow-y: auto; }
  .sidebar-section { border-bottom: 1px solid var(--dim); padding: 18px; }
  .sidebar-section h3 { font-family: var(--font-display); font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--sub); margin-bottom: 12px; }
  .layer-item { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
  .layer-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; border: 2px solid; }
  .layer-dot.teal   { background: rgba(0,200,200,.2);    border-color: var(--teal); }
  .layer-dot.green  { background: rgba(64,208,128,.2);   border-color: var(--green); }
  .layer-dot.purple { background: rgba(160,112,224,.2);  border-color: var(--purple); }
  .layer-dot.red    { background: rgba(224,80,80,.2);    border-color: var(--red); }
  .layer-info h4 { font-size: 11px; font-weight: 600; margin-bottom: 2px; }
  .layer-info h4.teal   { color: var(--teal); }
  .layer-info h4.green  { color: var(--green); }
  .layer-info h4.purple { color: var(--purple); }
  .layer-info h4.red    { color: var(--red); }
  .layer-info p { font-size: 10px; color: var(--sub); line-height: 1.5; }
  .param-row { display: grid; grid-template-columns: 80px 1fr; gap: 6px; align-items: baseline; margin-bottom: 9px; }
  .param-sym { font-family: var(--font-mono); font-size: 13px; color: var(--teal); }
  .param-desc { font-size: 10px; color: var(--sub); line-height: 1.4; }
  .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
  .status-label { font-family: var(--font-mono); font-size: 9px; color: var(--sub); letter-spacing: 1px; }
  .status-bar { width: 110px; height: 3px; background: var(--dim); border-radius: 2px; overflow: hidden; position: relative; }
  .status-fill { height: 100%; border-radius: 2px; position: absolute; left: 0; top: 0; animation: pf 3s ease-in-out infinite; }
  @keyframes pf { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  .eng-status { font-size: 10px; color: var(--sub); line-height: 1.7; }
  .ref-eqs { font-family: var(--font-mono); font-size: 10px; color: var(--sub); line-height: 2; }

  /* ── Hi-fi tab ── */
  .hifi-wrap { display: flex; flex-direction: column; flex: 1; }
  .hifi-toolbar { display: flex; align-items: center; gap: 12px; padding: 10px 28px; background: var(--deep); border-bottom: 1px solid var(--dim); flex-wrap: wrap; }
  .tool-group { display: flex; align-items: center; gap: 8px; padding-right: 16px; border-right: 1px solid var(--dim); }
  .tool-group:last-child { border: none; margin-left: auto; }
  .tool-label { font-family: var(--font-mono); font-size: 9px; color: var(--sub); letter-spacing: 1px; text-transform: uppercase; }
  .toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; background: none; border: none; padding: 0; }
  .toggle-track { width: 36px; height: 18px; border-radius: 9px; background: var(--dim); border: 1px solid var(--dim); position: relative; transition: background .2s; cursor: pointer; }
  .toggle-track.on { background: rgba(0,200,200,.25); border-color: var(--teal); }
  .toggle-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--sub); position: absolute; top: 2px; left: 2px; transition: left .2s, background .2s; }
  .toggle-track.on .toggle-thumb { left: 20px; background: var(--teal); }
  .toggle-text { font-family: var(--font-mono); font-size: 10px; color: var(--sub); letter-spacing: 1px; text-transform: uppercase; user-select: none; }
  .toggle-text.on { color: var(--teal); }
  .pill { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; cursor: pointer; border: 1px solid; background: none; user-select: none; }
  .pill.teal   { color: var(--teal);   border-color: var(--teal);   background: rgba(0,200,200,.08); }
  .pill.green  { color: var(--green);  border-color: var(--green);  background: rgba(64,208,128,.08); }
  .pill.purple { color: var(--purple); border-color: var(--purple); background: rgba(160,112,224,.08); }
  .pill.red    { color: var(--red);    border-color: var(--red);    background: rgba(224,80,80,.08); }
  .pill.off    { opacity: .28; }
  .view-switch { display: flex; }
  .vs-btn { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border: 1px solid var(--dim); background: none; color: var(--sub); cursor: pointer; }
  .vs-btn:first-child { border-radius: 2px 0 0 2px; }
  .vs-btn:last-child  { border-radius: 0 2px 2px 0; border-left: none; }
  .vs-btn:not(:first-child):not(:last-child) { border-left: none; }
  .vs-btn.active { background: rgba(0,200,200,.12); color: var(--teal); border-color: var(--teal); }
  .explode-btn { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; padding: 5px 12px; border: 1px solid var(--dim); background: none; color: var(--sub); cursor: not-allowed; opacity: .4; border-radius: 2px; }
  .explode-btn.active { color: var(--gold); border-color: var(--gold); opacity: 1; cursor: pointer; }
  .hifi-main { display: grid; grid-template-columns: 1fr 290px; flex: 1; overflow: hidden; }
  .hifi-canvas-wrap { padding: 20px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; overflow-y: auto; }
  .hifi-view-label { font-family: var(--font-mono); font-size: 10px; color: var(--sub); letter-spacing: 2px; align-self: flex-start; }
  canvas#hifi-canvas { width: 100%; max-width: 820px; border: 1px solid var(--dim); cursor: grab; background: var(--navy); display: block; }
  canvas#hifi-canvas:active { cursor: grabbing; }
  .detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 820px; }
  .detail-card { background: var(--panel); border: 1px solid var(--dim); padding: 14px; }
  .detail-card-title { font-family: var(--font-display); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--sub); margin-bottom: 10px; }
  canvas.detail-canvas { width: 100%; height: 140px; display: block; }
  .hifi-sidebar { border-left: 1px solid var(--dim); background: var(--panel); overflow-y: auto; display: flex; flex-direction: column; }
  .hs-section { border-bottom: 1px solid var(--dim); padding: 16px 18px; }
  .hs-section h3 { font-family: var(--font-display); font-size: 8px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--sub); margin-bottom: 12px; }
  .ann-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; font-size: 10px; width: 100%; padding: 4px; cursor: pointer; text-decoration: none; color: inherit; border-left: 2px solid transparent; border-radius: 2px; }
  .ann-item:hover { background: rgba(255,255,255,.03); border-left-color: var(--dim); }
  .ann-key { font-family: var(--font-mono); font-size: 11px; min-width: 24px; text-align: right; flex-shrink: 0; }
  .ann-text { color: var(--sub); line-height: 1.45; }
  .ann-text strong { display: block; margin-bottom: 2px; }
  .ann-eq { font-family: var(--font-mono); font-size: 9px; color: var(--text); background: rgba(0,0,0,.3); padding: 2px 6px; margin-top: 3px; display: inline-block; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .data-table td { padding: 5px 6px; border-bottom: 1px solid var(--dim); vertical-align: top; line-height: 1.4; }
  .data-table td:first-child { font-family: var(--font-mono); font-size: 11px; color: var(--teal); width: 70px; }
  .data-table tr:last-child td { border: none; }
  .tier-map { font-size: 10px; color: var(--sub); line-height: 1.8; }

  /* ── Physics tab ── */
  .phys-topbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 20px;
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
  }
  .phys-title {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--teal);
    text-transform: uppercase;
    margin-right: 12px;
  }
  .preset-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; color: var(--sub); text-transform: uppercase; margin-right: 2px; }
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

  .controls-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    border-bottom: 1px solid var(--dim);
  }
  .slider-group { display: flex; flex-direction: column; gap: 14px; padding: 14px 16px; border-right: 1px solid var(--dim); }
  .group-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--teal); border-bottom: 1px solid var(--dim); padding-bottom: 6px; }
  .constraints-notice { font-family: var(--font-body); font-size: 11px; color: var(--sub); line-height: 1.6; padding: 14px 16px; max-width: 260px; border-left: 3px solid var(--gold); background: var(--gold-faint); }
  .constraints-notice strong { color: var(--gold); display: block; margin-bottom: 6px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; }

  .views-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    transition: margin-right 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .views-grid.info-open { margin-right: 300px; }

  /* ── Mobile ── */
  @media (max-width: 767px) {
    .workspace { grid-template-columns: 1fr; }
    .sidebar   { border-left: none; border-top: 1px solid var(--dim); }
    .hifi-main { grid-template-columns: 1fr; }
    .hifi-sidebar { border-left: none; border-top: 1px solid var(--dim); }
    .controls-row { grid-template-columns: 1fr; }
    .slider-group { border-right: none; border-bottom: 1px solid var(--dim); }
    .constraints-notice { max-width: none; border-left: none; border-top: 3px solid var(--gold); }
    .views-grid { grid-template-columns: 1fr; }
    .views-grid.info-open { margin-right: 0; }
    .eq-strip { grid-template-columns: 1fr; }
  }
</style>
