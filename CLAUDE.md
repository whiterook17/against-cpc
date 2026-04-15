# AGAINST CHRONOLOGY PROTECTION — Research Website
## Project Instruction File for Claude
### Version 2.0 — April 2026
### Stack: SvelteKit + Three.js (Threlte) + Web Workers + GSAP + KaTeX

---

## PROJECT OVERVIEW

Build a single-domain research website that serves three audiences simultaneously:
- **Academic physicists** — who need the full paper, citations, and formal mathematics
- **Curious non-specialists** — who want interactive visualisations to build physical intuition
- **Collaborators** — who want to contribute ideas, critique the model, and discuss improvements

The website is the public face of the paper *"Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture"* by Danny. It combines scholarly rigour with genuinely interactive science communication and community participation.

---

## ARCHITECTURE DECISION — WHY THIS STACK

The site has two fundamentally different workloads that must not interfere with each other:

```
WORKLOAD A — Static/semantic content
  Landing page, full paper, discussion forms
  → Needs: SEO, fast initial load, KaTeX, clean typography
  → Solved by: SvelteKit (SSR + file-based routing, zero virtual DOM overhead)

WORKLOAD B — Real-time physics simulation
  Spacetime curvature animation, geodesic integration, echo pulses
  → Needs: 60fps, GPU acceleration, physics off main thread
  → Solved by: Three.js (WebGL) + Web Workers (off-thread computation)

BRIDGE — Smooth UI interactions
  Tab switching, parameter slider transitions, callout animations
  → Needs: spring physics, staggered reveals, timeline control
  → Solved by: GSAP (GreenSock Animation Platform)
```

**The non-negotiable architectural rule:** physics computation NEVER runs on the main thread. The main thread renders. The Worker thread computes. They communicate via `postMessage`. This is what keeps the animation at 60fps regardless of slider activity.

---

## TECHNOLOGY STACK — DETAILED

### SvelteKit (UI Framework)
```
npm create svelte@latest against-cpc
```
- File-based routing: `src/routes/paper/+page.svelte`, etc.
- SSR for paper pages — fully indexed, fast first paint
- No virtual DOM — Svelte compiles to vanilla JS, zero runtime overhead
- Reactive stores (`$store`) cleanly bind slider values to simulation state
- `<canvas bind:this={el}>` gives direct canvas access without React wrapper friction
- Built-in TypeScript support
- SvelteKit adapter-vercel for zero-config Vercel deployment

### Three.js via Threlte (3D/WebGL Rendering)
```
npm install three @threlte/core @threlte/extras
```
- Threlte = Three.js in Svelte syntax — declarative scene graph
- WebGL gives GPU-side rendering: spacetime curvature grid runs as a vertex shader
- Custom GLSL shaders for the spacetime distortion effect (grid mesh vertices displaced by Kerr metric)
- `OrbitControls` from `@threlte/extras` for 3D view rotation
- Line2 / LineSegments2 for thick, anti-aliased field lines
- Post-processing: `UnrealBloomPass` for the throat glow effect

### Web Workers (Physics Thread)
```
// src/lib/workers/physics.worker.js
// Runs entirely off main thread — receives params, returns computed state
```
- All physics computation isolated here: geodesic integration, ω(r,θ), τ_required, f₀, echo spectrum
- Communicates via structured `postMessage` — no shared memory, no race conditions
- Runs at its own tick rate (physics dt = 1ms), independent of render frame rate
- Main thread receives computed state each frame and renders — never blocks

### GSAP (Animation & Transitions)
```
npm install gsap
```
- Page transitions between landing / paper / construct / discuss
- Tab switching animations in the construct section
- Staggered reveals on scroll (paper callout boxes animate in)
- Parameter slider value transitions (number readouts tween smoothly, not jump)
- Exploded view animation: layers separate outward with spring easing
- Timeline control for the perturbation sequence (perturb → oscillate → echo → decay)

### KaTeX (Equation Rendering)
```
npm install katex
```
- Renders all numbered equations from the paper
- Used as a Svelte action: `use:katex` on any element containing LaTeX
- Auto-render on page load, no manual trigger
- Fast: KaTeX renders synchronously, no layout shift

### Supporting Libraries
```
npm install @sveltejs/adapter-vercel  # Vercel deployment
npm install gsap                      # Animations
npm install katex                     # Equations
npm install three @threlte/core       # 3D rendering
npm install @threlte/extras           # OrbitControls, etc.
npm install lil-gui                   # Dev parameter tweaking (remove before launch)
```

---

## SITE ARCHITECTURE

```
src/
├── routes/
│   ├── +layout.svelte              — Global nav, GSAP page transitions
│   ├── +page.svelte                — Landing / hero
│   ├── paper/
│   │   └── +page.svelte            — Full paper (SSR)
│   ├── construct/
│   │   ├── +page.svelte            — Engineering visualisation hub
│   │   ├── simulator/
│   │   │   └── +page.svelte        — Interactive wormhole simulation
│   │   └── parameter-lab/
│   │       └── +page.svelte        — 2D parameter space map
│   └── discuss/
│       └── +page.svelte            — Community discussion + form
│
├── lib/
│   ├── components/
│   │   ├── Nav.svelte              — Global navigation
│   │   ├── EpistemicCallout.svelte — Tier I–IV callout boxes
│   │   ├── KatexBlock.svelte       — Equation renderer
│   │   ├── AraInterlude.svelte     — Pedagogical character panels
│   │   ├── LayerToggle.svelte      — Layer filter pills (reused across views)
│   │   ├── ToggleSwitch.svelte     — Labels/Dims/Eqs toggles (reused)
│   │   ├── ParameterSlider.svelte  — Physics slider with live readout
│   │   ├── ReadoutStrip.svelte     — Computed values display bar
│   │   └── GapCard.svelte          — Gap tracker cards (discuss page)
│   │
│   ├── three/
│   │   ├── WireframeScene.svelte   — Tab 1: SVG wireframe (ported)
│   │   ├── HifiScene.svelte        — Tab 2: Canvas hi-fi view (ported)
│   │   ├── SimulatorScene.svelte   — Threlte 3D simulation scene
│   │   ├── ParameterLabScene.svelte— 2D colour map canvas
│   │   ├── shaders/
│   │   │   ├── spacetime.vert      — Vertex shader: Kerr metric grid distortion
│   │   │   ├── spacetime.frag      — Fragment shader: curvature colour map
│   │   │   ├── throat.vert         — Throat pulse geometry
│   │   │   └── ergosphere.frag     — Ergosphere region fill
│   │   └── materials/
│   │       ├── fieldLineMaterial.js — Animated frame-dragging lines
│   │       └── echoMaterial.js      — GW pulse propagation
│   │
│   ├── workers/
│   │   ├── physics.worker.js       — ALL physics computation (off main thread)
│   │   └── geodesic.worker.js      — Geodesic path integration (separate worker)
│   │
│   ├── stores/
│   │   ├── params.js               — Svelte store: all slider parameter values
│   │   ├── computed.js             — Svelte store: physics output from Worker
│   │   ├── ui.js                   — Svelte store: labels/dims/eqs toggles, active tab
│   │   └── discuss.js              — Svelte store: comment list, form state
│   │
│   ├── physics/
│   │   ├── kerr.js                 — Kerr metric functions (shared worker + main)
│   │   ├── throat.js               — Throat oscillator functions
│   │   ├── echo.js                 — Echo spectrum computation
│   │   ├── geodesic.js             — Geodesic integrator (Runge-Kutta 4)
│   │   └── constants.js            — Physical constants, normalisation factors
│   │
│   └── data/
│       ├── paper.json              — Full paper content (structured)
│       ├── references.json         — 21 references with BibTeX keys
│       ├── equations.json          — All numbered equations with LaTeX strings
│       └── presets.json            — Named parameter configurations
│
├── static/
│   ├── downloads/
│   │   ├── against-cpc.pdf         — Generated paper PDF
│   │   └── against-cpc.docx        — Generated paper DOCX
│   └── og-image.png                — Social share image
│
└── app.css                         — Global design system (CSS variables)
```

---

## DESIGN SYSTEM

### Palette (app.css — global CSS variables)
```css
:root {
  --navy:   #0b1120;   /* primary background */
  --deep:   #0d1628;   /* panels, header */
  --panel:  #111e36;   /* cards, sidebars */
  --teal:   #00c8c8;   /* Tier I / L1 Torus / confirmed */
  --gold:   #e8a020;   /* Tier II / Kerr suppression / gold */
  --red:    #e05050;   /* Tier IV / gaps / throat */
  --purple: #a070e0;   /* Tier III / exotic matter / Casimir */
  --green:  #40d080;   /* coupling zone / confirmed results */
  --dim:    #2a3f5a;   /* borders, dividers */
  --text:   #c8daea;   /* primary text */
  --sub:    #6a8aaa;   /* secondary text, labels */

  /* Derived */
  --teal-faint:   rgba(0, 200, 200, 0.08);
  --gold-faint:   rgba(232, 160, 32, 0.08);
  --purple-faint: rgba(160, 112, 224, 0.08);
  --red-faint:    rgba(224, 80, 80, 0.08);
}
```

### Typography
```css
/* In app.css — loaded from Google Fonts */
@import url('https://fonts.googleapis.com/css2?
  family=Orbitron:wght@400;700;900&
  family=Exo+2:wght@300;400;600&
  family=Share+Tech+Mono&
  display=swap');

--font-display: 'Orbitron', monospace;     /* headings, labels, UI elements */
--font-body:    'Exo 2', sans-serif;        /* prose, paper text */
--font-mono:    'Share Tech Mono', mono;    /* equations, code, data readouts */
```

### Epistemic Tier Colour Map
This mapping is the single source of truth. Used in paper callouts, construct annotations, discuss gap cards, and all UI components.
```
Tier I  (Confirmed Foundations)      → var(--teal)
Tier II (Well-Motivated Extrapolation)→ var(--gold)
Tier III (Conjectural but Consistent) → var(--purple)
Tier IV (Explicit Gaps)              → var(--red)
```

### GSAP Easing Conventions
```javascript
// Page transitions
gsap.defaults({ ease: 'power2.inOut', duration: 0.4 });

// Physics readout number tweens
gsap.to(readout, { value: newVal, ease: 'power1.out', duration: 0.3 });

// Exploded view layer separation
gsap.to(layer, { x: targetX, ease: 'back.out(1.2)', duration: 0.8, stagger: 0.1 });

// Perturbation sequence timeline
const tl = gsap.timeline();
tl.to(throat, { scale: 1.4, duration: 0.1, ease: 'power4.out' })
  .to(throat, { scale: 1.0, duration: 2.0, ease: 'elastic.out(1, 0.3)' })
  .to(echoPulse, { opacity: 1, scale: 3, duration: 1.5 }, '<0.2');
```

---

## WEB WORKER ARCHITECTURE (Critical — Read First)

This is the most important architectural decision. Get this right before building anything else.

### Data Flow
```
┌─────────────────────────────────────────────────────┐
│  MAIN THREAD                                        │
│                                                     │
│  Svelte params store ──→ postMessage(params)        │
│                                    │                │
│  Three.js render loop ←── computed state            │
│  GSAP transitions     ←── computed state            │
│  Readout strip        ←── computed state            │
└─────────────────────────────────────────────────────┘
              ↕  postMessage (structured clone)
┌─────────────────────────────────────────────────────┐
│  PHYSICS WORKER THREAD (physics.worker.js)          │
│                                                     │
│  receives params → runs physics → postMessage back  │
│                                                     │
│  Tick rate: every 8ms (125Hz)                       │
│  Completely independent of render frame rate        │
└─────────────────────────────────────────────────────┘
              ↕  postMessage (large float arrays)
┌─────────────────────────────────────────────────────┐
│  GEODESIC WORKER THREAD (geodesic.worker.js)        │
│                                                     │
│  RK4 integration for each test particle             │
│  Returns: [r[], phi[], rdot[], phidot[]] arrays     │
│  Runs only when params change, not every frame      │
└─────────────────────────────────────────────────────┘
```

### Worker Message Protocol
```javascript
// MAIN → PHYSICS WORKER
{
  type: 'UPDATE_PARAMS',
  payload: {
    M: 1.0,          // torus mass
    a: 0.85,         // spin parameter (0–0.99M)
    a0: 1.2,         // throat equilibrium radius
    sigma_throat: 0.4,
    eta_s: 0.15,
    R_torus: 8.0,
    simTime: 1234.5, // current simulation time
  }
}

// PHYSICS WORKER → MAIN (every tick)
{
  type: 'COMPUTED_STATE',
  payload: {
    omega_throat: 0.234,        // ω at throat
    kerr_factor: 0.527,         // √(1 - a²/M²)
    tau_required: 4.21e12,      // exotic matter tension
    f0: 0.089,                  // echo frequency
    damping_regime: 'UNDERDAMPED',
    omega_d: 0.877,             // damped oscillation frequency
    ergosphere_radius: 1.74,    // R_erg at equatorial plane
    stability_index: 0.83,      // 0–1 normalised
    throat_displacement: 0.023, // δa at current simTime
    // Spacetime grid displacement field (for vertex shader)
    grid_displacements: Float32Array(1024), // 32×32 grid
    // Frame-dragging field line positions
    field_lines: Float32Array(600),         // 20 lines × 30 points each
  }
}

// MAIN → GEODESIC WORKER (on param change only)
{
  type: 'INTEGRATE_GEODESICS',
  payload: {
    M: 1.0, a: 0.85,
    n_particles: 12,
    initial_conditions: [...], // [r0, phi0, rdot0, phidot0] per particle
    n_steps: 500,
    dt: 0.02,
  }
}

// GEODESIC WORKER → MAIN
{
  type: 'GEODESIC_PATHS',
  payload: {
    paths: Float32Array(12 * 500 * 2), // [x, y] per step per particle
  }
}
```

### Worker Initialisation (in SimulatorScene.svelte)
```javascript
// Initialise workers once on component mount
let physicsWorker, geodesicWorker;

onMount(() => {
  physicsWorker  = new Worker('/src/lib/workers/physics.worker.js',   { type: 'module' });
  geodesicWorker = new Worker('/src/lib/workers/geodesic.worker.js',  { type: 'module' });

  physicsWorker.onmessage = ({ data }) => {
    if (data.type === 'COMPUTED_STATE') {
      computed.set(data.payload);          // update Svelte store
      updateShaderUniforms(data.payload);  // push to Three.js shader
    }
  };

  geodesicWorker.onmessage = ({ data }) => {
    if (data.type === 'GEODESIC_PATHS') {
      updateGeodesicGeometry(data.payload.paths);
    }
  };
});

// Reactive: whenever params store changes, post to worker
$: physicsWorker?.postMessage({ type: 'UPDATE_PARAMS', payload: $params });
$: geodesicWorker?.postMessage({ type: 'INTEGRATE_GEODESICS', payload: { ...$params, n_particles: 12, n_steps: 500, dt: 0.02, initial_conditions: defaultInitials }});

onDestroy(() => {
  physicsWorker?.terminate();
  geodesicWorker?.terminate();
});
```

---

## PAGE 1 — LANDING / HERO (+page.svelte)

### Svelte Component Breakdown
```
+page.svelte
├── <HeroCanvas />          (Threlte: slow-rotating torus background, low opacity)
├── <HeroText />            (headline, sub-headline, author)
├── <CTAButtons />          (READ PAPER / EXPLORE CONSTRUCT / JOIN DISCUSSION)
├── <ClaimCards />          (3-column: Hawking said / We found / Our case)
├── <EpistemicLegend />     (4-tier colour key)
├── <EquationStrip />       (3 key equations in KaTeX)
└── <SectionNavLinks />     (large navigation tiles)
```

### Hero Canvas (Threlte)
Lightweight Three.js scene — not the full simulator, just atmosphere:
- Slowly rotating torus wireframe (mesh, low opacity, teal)
- Pulsing throat sphere at centre (purple glow)
- Faint spacetime grid in background
- No physics worker needed here — pure visual, parametric animation

### GSAP on Landing
- Staggered reveal on load: hero text → claim cards → equation strip (each with 0.1s delay)
- Scroll-triggered: equation strip animates in when viewport enters
- Hover on CTA buttons: subtle scale + glow pulse

---

## PAGE 2 — THE PAPER (/paper/+page.svelte)

### Svelte Component Breakdown
```
paper/+page.svelte
├── <SectionNavigator />    (left sidebar — scroll-tracked, click to jump)
├── <PaperMain />           (main content column)
│   ├── <PaperSection />    × 10 (one per section)
│   │   ├── <KatexBlock />  (numbered equations)
│   │   ├── <EpistemicCallout tier={1|2|3|4} /> (colour-coded callouts)
│   │   ├── <AraInterlude /> (pedagogical character panels)
│   │   └── <DataTable />   (KRW table, anchor constants table, etc.)
│   └── <References />
└── <PaperTools />          (right sidebar — download, cite, share)
```

### SSR Configuration
Paper page uses SvelteKit SSR by default — no `export const ssr = false` needed. KaTeX runs on server side, equations arrive fully rendered. No layout shift.

### EpistemicCallout.svelte (reusable component)
```svelte
<script>
  export let tier;   // 1 | 2 | 3 | 4
  export let title;
  export let body;

  const tierConfig = {
    1: { color: 'var(--teal)',   label: 'TIER I — CONFIRMED FOUNDATION' },
    2: { color: 'var(--gold)',   label: 'TIER II — WELL-MOTIVATED EXTRAPOLATION' },
    3: { color: 'var(--purple)', label: 'TIER III — CONJECTURAL BUT CONSISTENT' },
    4: { color: 'var(--red)',    label: 'TIER IV — EXPLICIT GAP' },
  };
  const cfg = tierConfig[tier];
</script>

<div class="callout" style="--accent: {cfg.color}">
  <span class="tier-label">{cfg.label}</span>
  <strong>{title}</strong>
  <p>{body}</p>
</div>
```

### KaTeX equation list (all numbered equations to render)
```
Eq (5.1)   T^{μν}_{total} = T^{μν}_{matter} + T^{μν}_{exotic} + T^{μν}_{coupling}
Eq (5.2)   T^{μν}_{matter} = (ρ+p)u^μ u^ν + pg^{μν}
Eq (5.3)   T^{tφ}_{matter} = (ρ+p)\,u^t u^φ \neq 0
Eq (5.4)   ω(r,θ) = \frac{2Mar}{(r^2+a^2)Σ + 2Ma^2 r \sin^2θ}
Eq (5.5)   T^{μν}_{exotic} = \text{diag}(-ρ_{ex},\,-τ,\,p_⊥,\,p_⊥)
Eq (5.6)   T^{μν}_{exotic}\,k_μ k_ν = -ρ_{ex} - τ < 0
Eq (5.7)   |τ|_{static} \sim \frac{c^2}{G} \cdot a_0^{-2}
Eq (5.8)   |τ|_{Kerr} \sim \frac{c^2}{G} \cdot a_0^{-2} \cdot \sqrt{1 - \frac{a^2}{M^2}}
Eq (5.9)   T^{μν}_{coupling} \sim a \cdot ρ_{ex} \cdot ε^{μναβ}u_α k_β
Eq (5.10)  G^{μν} = 8πG \left[ (\text{rotating mass}) + (\text{exotic shell}) + (\text{coupling}) \right]
Eq (6.1)   [K_{ij}] - h_{ij}[K] = -8πG\,S_{ij}
Eq (6.2)   S_{ij} = \text{diag}(-σ_{throat},\,p_s)
Eq (6.3)   \ddot{δa} + 2η_s\,\dot{δa} + \frac{σ_{throat}}{a_0^2}\,δa = 0
Eq (9b)    \hat{H}(f) = A_0 \cdot \left(\frac{f}{f_0}\right)^2 \cdot e^{-η_s f/f_0^2} \cdot \left[1+\left(\frac{f}{f_0}\right)^2\right]^{-1}
Eq (7.1)   I \leq \frac{E_{ex}}{k_B T \ln 2} \cdot η_{CTC}
```

### Paper Download Links (static/)
Place pre-generated files in `static/downloads/`:
- `against-cpc-full.pdf` — the paper PDF (already generated)
- `against-cpc-full.docx` — the paper DOCX (already generated)
- `paper.qmd` — Quarto source file

### Citation Copy (BibTeX)
```javascript
// In PaperTools.svelte
const bibtex = `@unpublished{danny2026cpc,
  author  = {Danny},
  title   = {Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture},
  year    = {2026},
  month   = {April},
  note    = {Independent research. Available at againstcpc.com}
}`;

function copyCitation() {
  navigator.clipboard.writeText(bibtex);
  gsap.to(copyBtn, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
  // show "Copied!" feedback
}
```

---

## PAGE 3 — THE CONSTRUCT (/construct)

### Sub-section 3A — Engineering Visualisation

Port the existing `throat_construct_wireframe.html` into SvelteKit.

**Component split:**
```
construct/+page.svelte
├── <TabNav />                  (Tab 01 Wireframe / Tab 02 Hi-Fi)
├── <WireframeScene />          (ported SVG tab — lib/three/WireframeScene.svelte)
└── <HifiScene />               (ported Canvas hi-fi tab — lib/three/HifiScene.svelte)
    ├── <HifiToolbar />         (label/dim/eq toggles + layer pills + view switch)
    ├── <HifiCanvas />          (main canvas — existing drawAxial/drawLongit/drawCutaway)
    └── <DetailRow />           (Casimir + Oscillator detail canvases)
```

**GSAP additions to engineering view:**
- Tab switch: `gsap.to(content, { opacity: 0, x: -20 })` → swap → `gsap.from(newContent, { opacity: 0, x: 20 })`
- Exploded view: `gsap.to(layers, { x: targetX, stagger: 0.08, ease: 'back.out(1.4)', duration: 0.9 })`
- Label toggle: `gsap.to('.label-group', { opacity: 0, duration: 0.2 })` (not instant hide)
- View switch (axial → longitudinal → cutaway): canvas cross-fade via offscreen buffer

**New: Exploded View**
Additional toolbar button `[EXPLODE]` separates the four layers outward:
```
Normal:   [torus][coupling][casimir][throat] — nested
Exploded: [torus]  —10px gap—  [coupling]  —10px gap—  [casimir]  —10px gap—  [throat]
          FULL LABELS on each isolated layer
          Click any layer → jump to its paper section
```

**New: Annotation linking**
Hover any ①–⑧ annotation circle → tooltip shows:
- The layer name
- The governing equation (rendered KaTeX)
- Link: `→ See §5.2.1 in paper` (opens paper at that section)

---

### Sub-section 3B — Wormhole Simulator (/construct/simulator)

#### Three.js Scene Structure (SimulatorScene.svelte)
```javascript
// Scene objects
const scene = new THREE.Scene();

// 1. Spacetime curvature grid (custom shader mesh)
const gridGeo = new THREE.PlaneGeometry(20, 20, 32, 32);
const gridMat = new THREE.ShaderMaterial({
  vertexShader: spacetimeVert,     // displaces vertices by Kerr metric
  fragmentShader: spacetimeFrag,   // colours by curvature magnitude
  uniforms: {
    u_M:   { value: 1.0 },         // mass
    u_a:   { value: 0.85 },        // spin
    u_time:{ value: 0.0 },
    u_grid_displacements: { value: null }, // Float32Array from Worker
  },
  wireframe: true,
});
const gridMesh = new THREE.Mesh(gridGeo, gridMat);

// 2. Ergosphere (translucent sphere, radius from Worker)
const ergosphereGeo = new THREE.SphereGeometry(1, 32, 32);
const ergosphereMat = new THREE.MeshBasicMaterial({
  color: 0x40d080, transparent: true, opacity: 0.08, side: THREE.BackSide
});

// 3. Torus (dense matter ring)
const torusGeo = new THREE.TorusGeometry(4, 0.8, 16, 64);
const torusMat = new THREE.MeshStandardMaterial({ color: 0x00c8c8, wireframe: true });

// 4. Frame-dragging field lines (Line2 for thickness)
// Positions updated each frame from Worker float array

// 5. Throat (pulsing sphere, radius = a0 + δa from Worker)
const throatGeo = new THREE.SphereGeometry(1, 32, 32);
const throatMat = new THREE.ShaderMaterial({
  vertexShader: throatVert,
  fragmentShader: throatFrag, // purple glow, bloom-ready
  uniforms: { u_pulse: { value: 0.0 }, u_time: { value: 0.0 } },
});

// 6. Test particle geodesics (from GeodesicWorker)
// LineSegments with BufferGeometry, positions updated when params change

// 7. Wormhole mouths (two portals, left and right)
const mouthGeo  = new THREE.RingGeometry(0.8, 1.2, 64);
const mouthMatL = new THREE.MeshBasicMaterial({ color: 0xa070e0, side: THREE.DoubleSide });

// 8. GW echo pulses (expanding torus shapes, triggered by perturbation)
```

#### Vertex Shader — Spacetime Curvature Grid (spacetime.vert)
```glsl
// spacetime.vert
// Displaces grid vertices to visualise Kerr metric spatial curvature
uniform float u_M;
uniform float u_a;
uniform float u_time;
uniform sampler2D u_displacement_map; // computed by Worker, uploaded as texture

varying float v_curvature;

void main() {
  vec3 pos = position;

  // Radial distance from origin
  float r = length(pos.xz);
  float r_safe = max(r, 0.1);

  // Boyer-Lindquist-inspired radial displacement
  // Approximation for visualisation (not exact Kerr embedding)
  float sigma = r_safe * r_safe + u_a * u_a;
  float delta  = r_safe * r_safe - 2.0 * u_M * r_safe + u_a * u_a;
  float embed  = sqrt(max(0.0, 6.0 * u_M / r_safe)); // Flamm paraboloid

  pos.y -= embed * 0.4; // depress grid near mass centre

  // Frame-dragging twist (azimuthal displacement)
  float omega = (2.0 * u_M * u_a * r_safe) / (sigma * sigma);
  float twist = omega * u_time * 0.1;
  float cosT  = cos(twist), sinT = sin(twist);
  pos.xz = vec2(cosT * pos.x - sinT * pos.z, sinT * pos.x + cosT * pos.z);

  // Pass curvature magnitude to fragment shader for colouring
  v_curvature = clamp(u_M / r_safe, 0.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

#### Fragment Shader — Spacetime Colouring (spacetime.frag)
```glsl
// spacetime.frag
varying float v_curvature;

void main() {
  // Colour from deep navy (flat space) through teal to gold (high curvature)
  vec3 flat   = vec3(0.043, 0.067, 0.125);   // --navy
  vec3 mid    = vec3(0.0,   0.784, 0.784);    // --teal
  vec3 peak   = vec3(0.910, 0.627, 0.125);    // --gold

  vec3 col = mix(flat, mid, v_curvature * 2.0);
  col = mix(col, peak, max(0.0, v_curvature * 2.0 - 1.0));

  gl_FragColor = vec4(col, 0.6); // semi-transparent grid
}
```

#### Post-Processing (UnrealBloomPass)
```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(W, H),
  0.8,   // strength
  0.4,   // radius
  0.85   // threshold
));
// Bloom only on throat and echo pulse objects — use layers mask
```

#### Parameter Sliders (ParameterSlider.svelte)
```svelte
<script>
  import { params } from '$lib/stores/params.js';
  import { gsap }   from 'gsap';
  export let key, label, min, max, step, unit, description;

  let displayValue = $params[key];

  // Tween display value for smooth readout (doesn't affect actual param)
  $: gsap.to({ v: displayValue }, {
    v: $params[key],
    duration: 0.25,
    ease: 'power1.out',
    onUpdate() { displayValue = this.targets()[0].v; }
  });
</script>

<div class="slider-wrap">
  <div class="slider-header">
    <span class="slider-label">{label}</span>
    <span class="slider-value">{displayValue.toFixed(3)} {unit}</span>
  </div>
  <input
    type="range" {min} {max} {step}
    bind:value={$params[key]}
    class="slider"
  />
  <p class="slider-desc">{description}</p>
</div>
```

#### Full Slider Configuration
```javascript
// src/lib/data/sliders.json
[
  {
    "group": "TORUS",
    "sliders": [
      { "key": "M",       "label": "Mass M",        "min": 0.1, "max": 10.0, "step": 0.1,  "unit": "M☉",  "description": "Total mass of rotating torus. Sets depth of gravitational well." },
      { "key": "a_over_M","label": "Spin a/M",       "min": 0.0, "max": 0.99, "step": 0.01, "unit": "",    "description": "Spin parameter ratio. At 0.99 → near-extremal. Kerr suppression factor → 0." },
      { "key": "R_torus", "label": "Torus radius R", "min": 1.0, "max": 20.0, "step": 0.5,  "unit": "r_g", "description": "Major radius of torus ring. Determines spatial extent of frame-dragging." }
    ]
  },
  {
    "group": "THROAT",
    "sliders": [
      { "key": "a0",            "label": "Throat radius a₀",      "min": 0.1, "max": 5.0, "step": 0.05, "unit": "r_g", "description": "Equilibrium throat radius. Smaller → cheaper in rotation cost, exponentially expensive static." },
      { "key": "sigma_throat",  "label": "Surface tension σ",     "min": 0.01,"max": 2.0, "step": 0.01, "unit": "",    "description": "Surface energy density of exotic shell. Sets oscillation frequency f₀." },
      { "key": "eta_s",         "label": "Membrane viscosity η_s","min": 0.01,"max": 1.0, "step": 0.01, "unit": "",    "description": "Shear viscosity of throat membrane. Controls echo decay rate." }
    ]
  }
]
```

#### Live Readout Strip (ReadoutStrip.svelte)
```
┌────────────────────────────────────────────────────────────────────────────┐
│  ω(throat):  0.234     │  Kerr factor: 52.7%   │  f₀: 0.089 Hz-eq       │
│  τ required: 4.2×10¹²  │  Echo Δt: 11.2 s-eq   │  Stability: 83%         │
│  Regime: UNDERDAMPED   │  Info bound: 3.1 bits  │  [PERTURB THROAT]       │
└────────────────────────────────────────────────────────────────────────────┘
```

All values tween smoothly via GSAP when slider changes — no jarring jumps.

The `τ required` value also displays a context card (hover):
```
τ_required at current params: 4.2 × 10¹² J/m²

Context:
  Casimir lab max (2026):  ~10⁻³ J/m²
  Solar mass-energy:        ~10⁴⁷ J
  Near-extremal reduction:  × √(1 − 0.99²) = × 0.14

Epistemic note: Tier IV gap — Casimir-to-shell bridging unresolved.
```

#### Presets (presets.json)
```json
[
  { "id": "near-extremal",    "label": "Near-Extremal",     "M": 1.0, "a_over_M": 0.99, "a0": 1.2, "sigma_throat": 0.4, "eta_s": 0.12 },
  { "id": "moderate-spin",    "label": "Moderate Spin",     "M": 1.0, "a_over_M": 0.70, "a0": 1.5, "sigma_throat": 0.5, "eta_s": 0.15 },
  { "id": "static-reference", "label": "Static (a=0)",      "M": 1.0, "a_over_M": 0.0,  "a0": 2.0, "sigma_throat": 0.3, "eta_s": 0.20 },
  { "id": "milestone-1",      "label": "Milestone 1 Target","M": 2.5, "a_over_M": 0.92, "a0": 0.8, "sigma_throat": 0.6, "eta_s": 0.10 },
  { "id": "planck-throat",    "label": "Planck Throat",     "M": 0.1, "a_over_M": 0.95, "a0": 0.1, "sigma_throat": 0.9, "eta_s": 0.05 }
]
```

#### Penrose Diagram (Canvas 2D, toggled)
Rendered on a separate canvas below the main sim:
```
Conformal diagram of Kerr wormhole spacetime:

       i⁺ (future timelike infinity)
        │
        │  ╔══════════╗   ╔══════════╗
        │  ║          ║   ║          ║
        │  ║ Region I  ║   ║ Region II║
  J⁺   │  ║ (our      ║   ║ (far     ║
  ───── │  ║ universe) ║   ║ universe)║
        │  ║          ║   ║          ║
        │  ╚══════════╝   ╚══════════╝
        │       │               │
        │   WORMHOLE THROAT (shaded)
        │
   i⁰ (spatial infinity)
```
Chronology horizon drawn if CTC region exists (parameters allow). Click any region to annotate what physics operates there.

---

### Sub-section 3C — Parameter Laboratory (/construct/parameter-lab)

#### 2D Colour Map Canvas
```
┌─────────────────────────────────────────────────────┐
│  Y-axis: [dropdown — choose param]                  │
│                                                     │
│  ████████████████████████████████  ← colour map    │
│  ████████████████████████████████    (output var    │
│  ████████████████████████████████     maps to hue) │
│  ████████████████████████████████                   │
│  ████████████████████████████████                   │
│                                                     │
│                  X-axis: [dropdown — choose param]  │
│                                                     │
│  Output: [dropdown — choose computed variable]      │
└─────────────────────────────────────────────────────┘
```
- Computed entirely in a Worker (parameter sweep over 64×64 grid)
- Hover: crosshair + tooltip showing exact parameter values and output
- Click: loads that point into the main simulator

#### Constraint Overlays (toggleable)
```
☑ Kerr extremal limit (a = M)               — hard boundary, solid gold line
☑ Casimir feasibility (τ ≤ τ_Casimir_max)   — current technology, dashed red
☐ Ford-Roman would apply                    — labelled "GAP — no bridging theorem", grey dashed
☐ KRW applicability boundary               — labelled "Compactly-generated only", grey dashed
☐ LIGO O5 echo detectability               — minimum echo amplitude, dotted teal
☐ Near-future tech projection (2040)        — extrapolated Casimir max, dotted gold
```

#### Export Features
- Download map as PNG with parameter labels
- Copy current params as JSON snippet
- Share URL: encodes params as base64 URL hash
  - `parameter-lab#eyJNIjoxLjAsImEvTSI6MC45OX0=`

---

## PAGE 4 — DISCUSSION (/discuss/+page.svelte)

### Component Breakdown
```
discuss/+page.svelte
├── <GapTracker />          (4 gap cards with comment counts)
├── <CategoryFilter />      (filter tabs)
├── <CommentList />         (approved comments, threaded)
│   └── <CommentItem />     × n (with KaTeX rendering)
└── <IdeaForm />            (submission form)
    └── <LatexPreview />    (live preview of equation input)
```

### Gap Tracker Cards (GapCard.svelte)
```svelte
<div class="gap-card" style="--accent: var(--red)">
  <div class="gap-header">
    <span class="gap-id">GAP {number}</span>
    <span class="gap-status status-open">OPEN</span>
  </div>
  <h3>{title}</h3>
  <p class="gap-desc">{description}</p>
  <div class="gap-meta">
    <span>What's needed: {needed}</span>
  </div>
  <div class="gap-stats">
    <span>{commentCount} comments</span>
    <span>{ideaCount} ideas</span>
    <a href="#comments?gap={id}" class="gap-link">Discuss →</a>
  </div>
</div>
```

Four gap cards:
```
GAP-1: Ford–Roman Bridging Theorem
  Needed: Theorem connecting worldline-integrated QI bounds to thin-shell surface integrals.
  Status: OPEN

GAP-2: KRW Extension to Non-Compactly-Generated Horizons
  Needed: Proof or disproof that stress-energy divergence applies to traversable wormhole horizons.
  Status: OPEN

GAP-3: Mixed-State Analysis at Chronology Horizons
  Needed: QFT analysis on CTC spacetimes with mixed (non-Hadamard) states at the horizon.
  Status: OPEN

GAP-4: Closed-Form Rotating Exotic Matter Solution
  Needed: Exact Einstein equations solved with rotating exotic matter source simultaneously.
  Status: OPEN
```

### Comment / Idea Form (IdeaForm.svelte)
```
Name (optional):           [______________]
Background:                [Physicist / Engineer / Student / Curious / Other ▼]
Category:                  [Mathematical Gap / Engineering / Observational / 
                            Theoretical Extension / Correction / General ▼]
Gap reference:             [GAP-1 / GAP-2 / GAP-3 / GAP-4 / General ▼]

Your idea / comment:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│         (supports LaTeX: type $...$ for inline,           │
│          $$...$$ for block equations)                      │
│                                                            │
└────────────────────────────────────────────────────────────┘

Equation preview:          [live KaTeX render of any $...$ in textarea]

                                              [SUBMIT CONTRIBUTION]
```

### Backend: Formspree (Phase 1) → Supabase (Phase 2)

**Phase 1 — Formspree (get comments working immediately):**
```svelte
<!-- IdeaForm.svelte -->
<form action="https://formspree.io/f/FORM_ID" method="POST">
  <input type="hidden" name="_subject" value="New contribution to Against CPC" />
  <!-- all fields -->
  <button type="submit">Submit Contribution</button>
</form>
```
Submissions go to Danny's email. Danny manually approves and adds to `static/data/comments.json` for display.

**Phase 2 — Supabase (when community grows):**
```sql
-- Supabase table
create table contributions (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  background  text,
  category    text,
  gap_ref     text,
  body        text not null,
  approved    boolean default false,
  created_at  timestamptz default now()
);

-- Row-level security: anyone can insert (submit), only approved rows are readable
alter table contributions enable row level security;
create policy "Public read approved"  on contributions for select using (approved = true);
create policy "Public insert"         on contributions for insert with check (true);
```

### Seed Questions (pre-populated in comments.json)
```json
[
  {
    "id": "seed-1", "name": "Danny (author)", "background": "Physicist",
    "category": "Mathematical Gap", "gap_ref": "GAP-1", "approved": true,
    "body": "Does a bridging theorem connecting Ford–Roman worldline integrals to thin-shell surface parameters exist anywhere in the literature? I have not found one. References welcome.",
    "created_at": "2026-04-15T00:00:00Z"
  },
  {
    "id": "seed-2", "name": "Danny (author)", "background": "Physicist",
    "category": "Mathematical Gap", "gap_ref": "GAP-2",
    "body": "The KRW theorem is restricted to compactly-generated horizons. Has anyone attempted to extend it? What are the main obstacles — does the proof break at the non-compact boundary conditions, or earlier?",
    "approved": true, "created_at": "2026-04-15T00:01:00Z"
  },
  {
    "id": "seed-3", "name": "Danny (author)", "background": "Physicist",
    "category": "Observational", "gap_ref": "GAP-1",
    "body": "What Bayesian prior should we assign to the echo spectrum template $\\hat{H}(f) = A_0(f/f_0)^2 e^{-\\eta_s f/f_0^2}$ in LIGO O5 data, given the three-parameter uncertainty in $(a_0, \\sigma_{throat}, \\eta_s)$?",
    "approved": true, "created_at": "2026-04-15T00:02:00Z"
  }
]
```

---

## PHYSICS COMPUTATION REFERENCE

### physics.worker.js — Complete Implementation
```javascript
// src/lib/workers/physics.worker.js
import { frameDragging, ergosphereRadius, kerrSuppression,
         exoticMatterTension, echoFrequency, dampingRegime,
         throatDisplacement } from '../physics/kerr.js';
import { echoSpectrum }                from '../physics/echo.js';
import { computeGridDisplacements }    from '../physics/grid.js';
import { computeFieldLines }           from '../physics/fieldlines.js';

let simTime = 0;
const DT = 0.008; // 8ms tick
let params = {};

self.onmessage = ({ data }) => {
  if (data.type === 'UPDATE_PARAMS') {
    params = data.payload;
  }
};

// Physics tick loop (independent of render)
setInterval(() => {
  if (!params.M) return;

  const { M, a_over_M, a0, sigma_throat, eta_s } = params;
  const a = a_over_M * M;

  const omega_throat    = frameDragging(a0, Math.PI/2, M, a);
  const kerr_factor     = kerrSuppression(a, M);
  const tau_required    = exoticMatterTension(a0, M, a);
  const f0              = echoFrequency(sigma_throat, a0);
  const regime          = dampingRegime(sigma_throat, a0, eta_s);
  const R_erg           = ergosphereRadius(Math.PI/2, M, a);
  const throat_disp     = throatDisplacement(simTime, 0.1, sigma_throat, a0, eta_s);
  const stability       = Math.max(0, Math.min(1, 1 - kerr_factor * 0.8));

  const grid_displacements = computeGridDisplacements(M, a, simTime, 32);
  const field_lines        = computeFieldLines(M, a, simTime, 20, 30);

  self.postMessage({
    type: 'COMPUTED_STATE',
    payload: {
      omega_throat, kerr_factor, tau_required, f0,
      damping_regime: regime.regime,
      omega_d: regime.omega_d,
      ergosphere_radius: R_erg,
      stability_index: stability,
      throat_displacement: throat_disp,
      grid_displacements,
      field_lines,
    }
  }, [grid_displacements.buffer, field_lines.buffer]); // transfer ownership, no copy

  simTime += DT;
}, DT * 1000);
```

### kerr.js — Core Physics Functions
```javascript
// src/lib/physics/kerr.js

export function sigma_BL(r, theta, a) {
  return r*r + a*a * Math.cos(theta)**2;
}

export function delta(r, M, a) {
  return r*r - 2*M*r + a*a;
}

export function frameDragging(r, theta, M, a) {
  const s   = sigma_BL(r, theta, a);
  const num = 2 * M * a * r;
  const den = (r*r + a*a) * s + 2*M*a*a*r * Math.sin(theta)**2;
  return num / den;
}

export function ergosphereRadius(theta, M, a) {
  return M + Math.sqrt(Math.max(0, M*M - a*a * Math.cos(theta)**2));
}

export function kerrSuppression(a, M) {
  if (M === 0) return 1;
  return Math.sqrt(Math.max(0, 1 - (a/M)**2));
}

export function exoticMatterTension(a0, M, a) {
  const G = 1, c = 1; // geometric units
  return (c*c / G) * Math.pow(Math.max(a0, 1e-6), -2) * kerrSuppression(a, M);
}

export function echoFrequency(sigma_throat, a0) {
  return Math.sqrt(sigma_throat / Math.max(a0*a0, 1e-6)) / (2 * Math.PI);
}

export function dampingRegime(sigma_throat, a0, eta_s) {
  const omega0sq = sigma_throat / Math.max(a0*a0, 1e-6);
  const disc     = omega0sq - eta_s*eta_s;
  if (disc >  1e-8) return { regime: 'UNDERDAMPED',   omega_d: Math.sqrt(disc) };
  if (disc < -1e-8) return { regime: 'OVERDAMPED',    omega_d: 0 };
                    return { regime: 'CRITICAL',       omega_d: 0 };
}

export function throatDisplacement(t, delta_a0, sigma_throat, a0, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  const decay = Math.exp(-eta_s * t);
  if (regime === 'UNDERDAMPED') return delta_a0 * decay * Math.cos(omega_d * t);
  if (regime === 'OVERDAMPED')  return delta_a0 * decay;
  return delta_a0 * decay * (1 + eta_s * t); // critical damping
}
```

### echo.js — Echo Spectrum
```javascript
// src/lib/physics/echo.js

export function echoSpectrum(f, A0, f0, eta_s) {
  // Eq. (9b): Ḣ(f) = A₀·(f/f₀)²·exp(−η_s f/f₀²)·[1+(f/f₀)²]⁻¹
  if (f0 <= 0 || f <= 0) return 0;
  const ratio = f / f0;
  return A0 * ratio**2 * Math.exp(-eta_s * f / (f0**2)) / (1 + ratio**2);
}

export function echoSpectrumArray(fMin, fMax, nPoints, A0, f0, eta_s) {
  // Returns [frequencies, amplitudes] for plotting
  const freqs = new Float32Array(nPoints);
  const amps  = new Float32Array(nPoints);
  for (let i = 0; i < nPoints; i++) {
    freqs[i] = fMin + (fMax - fMin) * i / (nPoints - 1);
    amps[i]  = echoSpectrum(freqs[i], A0, f0, eta_s);
  }
  return { freqs, amps };
}
```

### geodesic.js — Runge-Kutta 4 Integrator
```javascript
// src/lib/physics/geodesic.js
// Equatorial Kerr geodesic (theta = π/2 throughout)
// Uses RK4 integration — more accurate than Euler for long paths

function geodesicDerivs(r, phi, rdot, L, E, M, a) {
  // L = angular momentum per unit mass (conserved)
  // E = energy per unit mass (conserved)
  const D   = r*r - 2*M*r + a*a;       // delta(r)
  const S   = r*r;                       // sigma (equatorial)
  const Vr  = ((E*(r*r+a*a) - L*a) / D)**2 - (r*r + (L - a*E)**2);
  const dVr = -2*M*(E*(r*r+a*a) - L*a)*(2*r) / (D*D)
              + 2*r*E*(2*r) / D
              - 2*r; // simplified
  return {
    drdt:    rdot,
    dphidt:  (L - a*E + a*(E*(r*r+a*a) - L*a)/D) / (r*r),
    drdotdt: -0.5 * dVr / (r*r),
  };
}

export function integrateGeodesic(r0, phi0, rdot0, L, E, M, a, nSteps, dt) {
  const xs = new Float32Array(nSteps);
  const ys = new Float32Array(nSteps);
  let r = r0, phi = phi0, rdot = rdot0;

  for (let i = 0; i < nSteps; i++) {
    xs[i] = r * Math.cos(phi);
    ys[i] = r * Math.sin(phi);

    // RK4
    const k1 = geodesicDerivs(r,             phi,             rdot,             L, E, M, a);
    const k2 = geodesicDerivs(r+k1.drdt*dt/2,phi+k1.dphidt*dt/2,rdot+k1.drdotdt*dt/2, L,E,M,a);
    const k3 = geodesicDerivs(r+k2.drdt*dt/2,phi+k2.dphidt*dt/2,rdot+k2.drdotdt*dt/2, L,E,M,a);
    const k4 = geodesicDerivs(r+k3.drdt*dt,  phi+k3.dphidt*dt,  rdot+k3.drdotdt*dt,   L,E,M,a);

    r    += dt/6 * (k1.drdt    + 2*k2.drdt    + 2*k3.drdt    + k4.drdt);
    phi  += dt/6 * (k1.dphidt  + 2*k2.dphidt  + 2*k3.dphidt  + k4.dphidt);
    rdot += dt/6 * (k1.drdotdt + 2*k2.drdotdt + 2*k3.drdotdt + k4.drdotdt);

    if (r < 0.05) break; // absorbed by throat
  }
  return { xs, ys };
}
```

---

## IMPLEMENTATION ORDER

Each phase deploys independently to Vercel. Ship each phase before starting the next.

### PHASE 1 — Foundation (Week 1)
```
1.1  Scaffold SvelteKit project (npm create svelte@latest)
1.2  Install all dependencies (Three.js, Threlte, GSAP, KaTeX)
1.3  app.css — full design system (CSS variables, typography, reset)
1.4  +layout.svelte — global nav + GSAP page transitions
1.5  Landing +page.svelte — hero text + CTA buttons (no canvas yet)
1.6  Configure adapter-vercel + vercel.json
1.7  Deploy to Vercel — get live URL
```

### PHASE 2 — Paper (Week 1–2)
```
2.1  paper/+page.svelte — three-column layout shell
2.2  Load paper-content.json — render all 10 sections
2.3  KatexBlock.svelte — all 15 numbered equations
2.4  EpistemicCallout.svelte — all 4 tiers, colour-coded
2.5  AraInterlude.svelte — pedagogical panels
2.6  SectionNavigator.svelte — scroll tracking, click-to-jump
2.7  PaperTools.svelte — download links, BibTeX copy
2.8  Mobile layout — single column at 768px breakpoint
```

### PHASE 3 — Engineering Visualisation (Week 2)
```
3.1  construct/+page.svelte — tab shell + GSAP tab transitions
3.2  WireframeScene.svelte — port existing SVG wireframe
3.3  HifiScene.svelte — port existing Canvas hi-fi view
3.4  All toggle controls (ToggleSwitch, LayerToggle, ViewSwitch)
3.5  Detail panels (Casimir, Oscillator)
3.6  Exploded view animation (GSAP)
3.7  Annotation → paper linking (hover tooltip)
```

### PHASE 4 — Physics Worker (Week 3)
```
4.1  src/lib/physics/ — all computation functions (kerr.js, throat.js, echo.js, geodesic.js)
4.2  physics.worker.js — tick loop, postMessage protocol
4.3  geodesic.worker.js — RK4 integrator, batch processing
4.4  params.js + computed.js Svelte stores
4.5  Worker integration test — verify computed values match paper equations
```

### PHASE 5 — Wormhole Simulator (Week 3–4)
```
5.1  SimulatorScene.svelte — Threlte scene scaffold
5.2  spacetime.vert + spacetime.frag — curvature grid shaders
5.3  Grid mesh + shader uniforms from Worker
5.4  Torus, ergosphere, throat geometries
5.5  Frame-dragging field lines (Line2)
5.6  ParameterSlider.svelte — all sliders with GSAP tweens
5.7  ReadoutStrip.svelte — live computed values
5.8  Presets dropdown
5.9  Post-processing (UnrealBloomPass on throat)
5.10 Test particle geodesics from GeodesicWorker
5.11 Perturbation button + GSAP timeline sequence
5.12 Echo pulse animation
5.13 Echo spectrum panel (Canvas 2D, echoSpectrumArray)
5.14 Penrose diagram toggle (Canvas 2D)
```

### PHASE 6 — Parameter Laboratory (Week 4)
```
6.1  parameter-lab/+page.svelte — layout
6.2  2D colour map — Worker sweep, canvas render
6.3  Axis + output selectors
6.4  Constraint overlays (toggleable)
6.5  Hover crosshair + tooltip
6.6  Click → load into simulator (cross-page state via store)
6.7  Export PNG + share URL (base64 hash)
```

### PHASE 7 — Discussion (Week 4–5)
```
7.1  discuss/+page.svelte — layout
7.2  GapCard.svelte — all 4 gaps with seed content
7.3  CategoryFilter.svelte — filter tabs
7.4  CommentList.svelte — static JSON comments with KaTeX render
7.5  IdeaForm.svelte — Formspree integration
7.6  LaTeX preview in form textarea
7.7  (Optional) Supabase integration for live comments
```

### PHASE 8 — Polish (Week 5)
```
8.1  Landing hero — Threlte background torus animation
8.2  GSAP scroll triggers on landing + paper (staggered reveals)
8.3  Mobile testing at 375px / 768px / 1024px
8.4  Performance: 60fps audit, Web Worker load test
8.5  SEO: meta tags, OG image, sitemap.xml
8.6  Accessibility: aria-labels on canvas elements, keyboard nav
8.7  Full deployment checklist (see below)
```

---

## PERFORMANCE GUIDELINES

### Canvas / Three.js
- Target: **60fps on a 2020 MacBook Pro at 1440px**
- Use `requestAnimationFrame` via Threlte's `useFrame` — never `setInterval` for render
- Transfer Worker ArrayBuffers with ownership transfer (zero-copy): `postMessage(data, [buffer])`
- Pause physics tick and render when `document.visibilityState === 'hidden'`
- LOD for geodesics: 12 particles on desktop, 4 on mobile (detect via `navigator.hardwareConcurrency`)
- Bloom pass at half resolution on low-end devices (detect via `renderer.getMaxAnisotropy() < 4`)

### SvelteKit
- Paper page: SSR with `export const prerender = true` — fully static, CDN-cached
- Simulator page: `export const ssr = false` — client-only, no window guards needed
- Lazy-load Three.js and GSAP — not imported on paper page
- KaTeX: server-side render on paper page (no client-side render, no layout shift)

### GSAP
- Use `gsap.context()` for cleanup on Svelte `onDestroy`
- Avoid animating layout-triggering properties (width/height) — use transform/opacity only
- `will-change: transform` on elements that animate frequently

---

## MOBILE STRATEGY

```css
/* app.css — mobile-first breakpoints */
/* Mobile  (<768px):  single column, simplified controls */
/* Tablet  (≥768px):  two-column paper, condensed sim */
/* Desktop (≥1024px): full layout */
/* Wide    (≥1440px): maximum canvas size */
```

| Page | Mobile (<768px) | Tablet (≥768px) | Desktop (≥1024px) |
|------|----------------|-----------------|-------------------|
| Landing | Single column, stacked | Two-column claims | Full hero |
| Paper | Single col, top dropdown nav | Two col sidebar | Three col |
| Construct (wireframe) | Canvas full-width, toolbar below | Side-by-side | Full |
| Simulator | Canvas top, params accordion below, 3 sliders only | Split | Full |
| Parameter Lab | Disabled (show message) | Basic map | Full |
| Discuss | Full-width form | Two-col | Three-col |

---

## SEO & META

```html
<!-- src/app.html -->
<title>Against Chronology Protection — Danny</title>
<meta name="description"
  content="A formal challenge to Hawking's 1992 Chronology Protection Conjecture.
  Three independent gaps identified. Interactive rotating wormhole simulator and open community discussion.">

<meta property="og:title"       content="Against Chronology Protection">
<meta property="og:description" content="Rotating exotic-stabilised traversable wormhole:
  theory, interactive visualisation, and open collaboration.">
<meta property="og:type"        content="article">
<meta property="og:image"       content="/og-image.png">
<meta property="og:url"         content="https://againstcpc.com">

<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="Against Chronology Protection">
<meta name="twitter:description" content="Can we build a traversable wormhole?
  Three gaps in Hawking's chronology protection argument — and a positive case.">
```

```javascript
// src/routes/paper/+page.js — structured data for Google Scholar
export function load() {
  return {
    schema: {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": "Against Chronology Protection",
      "author": { "@type": "Person", "name": "Danny" },
      "datePublished": "2026-04",
      "keywords": ["chronology protection", "closed timelike curves", "traversable wormhole",
                   "Kerr metric", "exotic matter", "gravitational waves"]
    }
  };
}
```

---

## VERCEL DEPLOYMENT

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".svelte-kit/output",
  "framework": "sveltekit",
  "rewrites": [
    { "source": "/paper",               "destination": "/paper" },
    { "source": "/construct",           "destination": "/construct" },
    { "source": "/construct/simulator", "destination": "/construct/simulator" },
    { "source": "/construct/parameter-lab", "destination": "/construct/parameter-lab" },
    { "source": "/discuss",             "destination": "/discuss" }
  ]
}
```

### Environment Variables
```
FORMSPREE_FORM_ID=xxxxxxxxxxxx      (for comment form)
SUPABASE_URL=https://xxx.supabase.co (Phase 7+)
SUPABASE_ANON_KEY=xxx               (Phase 7+)
```

---

## HONEST CONSTRAINTS NOTICE

Display this on all Construct pages — persistent footer or collapsible banner:

> **A note on feasibility:**
> The simulations on this site implement the theoretical framework of the paper faithfully.
> The exotic matter requirements shown in the readout strip are physically real constraints —
> at current technology, a macroscopic traversable wormhole is not buildable.
> The simulator demonstrates how parameters relate, not that the object is constructible.
> All Tier III (conjectural) and Tier IV (gap) content is marked throughout.
> The goal of this site is to show what the physics permits in principle,
> and to help identify what needs solving for principle to become practice.

---

## DEPLOYMENT CHECKLIST

Before launch:
- [ ] All 15 KaTeX equations render on paper page (SSR, no client flash)
- [ ] Simulator hits 60fps on Chrome 120+ / Firefox 120+ / Safari 17+
- [ ] Web Workers initialise without errors in all three browsers
- [ ] Mobile layout correct at 375px, 768px, 1024px
- [ ] Comment form submits + Danny receives email
- [ ] PDF + DOCX download links resolve
- [ ] Epistemic tier colours consistent: paper ↔ construct ↔ landing ↔ discuss
- [ ] BibTeX copy button produces valid BibTeX
- [ ] Parameter share URL encodes + decodes correctly
- [ ] `vercel.json` routing covers all sub-paths
- [ ] OG meta image renders correctly in Twitter/Slack/WhatsApp preview
- [ ] Structured data (ScholarlyArticle schema) validates in Google Rich Results Test
- [ ] `document.visibilityState` pause implemented (no wasted CPU on background tabs)
- [ ] GSAP context cleanup on all Svelte `onDestroy` calls (no memory leaks)
- [ ] Zero console errors in production build

---

## NOTES FOR CLAUDE (Implementation Guidelines)

1. **Physics correctness is non-negotiable.** Before any animation runs, verify that `kerr.js` functions return values consistent with §5 of the paper. Test against known limits: `kerrSuppression(M, M) === 0`, `kerrSuppression(0, M) === 1`, `frameDragging(a0, PI/2, M, 0) === 0`.

2. **Worker-first thinking.** Any function that runs in a loop and involves more than arithmetic belongs in the Worker. When in doubt: Worker.

3. **The existing wireframe HTML** (`throat_construct_wireframe.html`) is the reference for /construct Phase 3. Port it by extracting the drawing functions into `HifiScene.svelte` — do not rewrite the physics from scratch.

4. **GSAP for everything that moves in the UI.** No CSS transitions for interactive elements — GSAP gives frame-by-frame control and is interruptible. Reserve CSS transitions only for hover states.

5. **Threlte for the 3D scene; raw Canvas 2D for the 2D overlays** (Casimir detail, oscillator plot, Penrose diagram, echo spectrum). Don't mix Three.js and Canvas 2D on the same element.

6. **Colour system is the single source of truth.** All colours come from CSS variables defined in `app.css`. Never hardcode hex values in Svelte components or JavaScript. In Three.js materials, read computed CSS variables: `getComputedStyle(document.body).getPropertyValue('--teal')`.

7. **Paper content is authoritative.** When implementing the paper page, use the actual text from the paper. Do not paraphrase. Ask Danny if any section text is unclear.

8. **Formspree first, always.** Do not build a custom comment backend in Phase 7. Formspree gets comments working in 30 minutes. Supabase is Phase 8+ if needed.

9. **Deploy after every phase.** Each phase must be on the live Vercel URL before Phase N+1 begins. This catches deployment issues early.

10. **Epistemic honesty in the UI.** The simulator readout for `τ_required` must always show the honest scientific notation value with the feasibility context note. Never round to a "manageable" looking number.

---

---

## MISSING FILES — COMPLETE IMPLEMENTATIONS

The following files are referenced throughout the document but their implementations were not yet written. Claude must create all of these during Phase 1–4.

---

### constants.js — Physical Constants and Normalisation
```javascript
// src/lib/physics/constants.js
// All values in geometric units unless noted.
// Geometric units: G = c = 1. Lengths in r_g = GM/c² (gravitational radii).

export const G  = 1;       // gravitational constant (geometric units)
export const c  = 1;       // speed of light (geometric units)
export const k_B = 1;      // Boltzmann constant (normalised)

// Planck units (for throat radius lower bound display)
export const L_PLANCK_OVER_RG = 1.616e-35 / 1477; // Planck length / r_g of 1 solar mass

// Casimir reference: maximum negative energy density achievable in lab (J/m²)
// Used for feasibility comparison in readout strip
export const CASIMIR_LAB_MAX_SI = 1e-3;   // J/m² (2026 best)

// Solar mass-energy for context display (Joules)
export const SOLAR_MASS_ENERGY_SI = 1.8e47;

// Observable universe total energy (Joules) — order of magnitude
export const UNIVERSE_ENERGY_SI = 1e70;

// Conversion: geometric tau (dimensionless) → SI J/m²
// tau_SI = tau_geom × (c⁴ / G) × (1/r_g²) — requires knowing M in kg
// For display only: use tau_geom directly in simulator, note units are r_g-scaled
export const TAU_GEOM_TO_SI_PER_SOLAR_MASS = 1.21e44; // (c⁴/G) / r_g² for M=M_sun

// Default initial parameter values (loaded into params store on startup)
export const DEFAULT_PARAMS = {
  M:             1.0,   // solar mass equivalent
  a_over_M:      0.85,  // spin ratio
  R_torus:       8.0,   // major torus radius (r_g)
  a0:            1.2,   // throat equilibrium radius (r_g)
  sigma_throat:  0.40,  // surface energy density (dimensionless)
  eta_s:         0.15,  // membrane viscosity (dimensionless)
};

// Physics tick rate
export const PHYSICS_DT   = 0.008;  // seconds per tick (125 Hz)
export const PHYSICS_DT_MS = PHYSICS_DT * 1000;

// Grid resolution for displacement field
export const GRID_N = 32;  // 32×32 vertex grid → 1024 displacements

// Field line configuration
export const FIELD_LINE_COUNT  = 20;
export const FIELD_LINE_POINTS = 30;
```

---

### throat.js — Throat and Surface Functions
```javascript
// src/lib/physics/throat.js
// Surface stress, Israel junction, and perturbation functions
// Separate from kerr.js to keep files single-responsibility

import { dampingRegime } from './kerr.js';

/**
 * Surface pressure from Israel junction conditions.
 * p_s = (1/2) × (trace of extrinsic curvature jump terms)
 * Simplified: p_s = σ_throat / 2 (isotropic thin shell approximation)
 */
export function surfacePressure(sigma_throat) {
  return sigma_throat / 2;
}

/**
 * Echo time interval: time between successive echo pulses.
 * Δt = π / ω_d  (half-period of damped oscillator)
 */
export function echoInterval(sigma_throat, a0, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  if (regime !== 'UNDERDAMPED' || omega_d < 1e-10) return Infinity;
  return Math.PI / omega_d;
}

/**
 * Number of observable echoes before amplitude drops below threshold.
 * n_echoes = floor( -ln(threshold) / (η_s × Δt) )
 */
export function echoCount(sigma_throat, a0, eta_s, threshold = 0.01) {
  const dt   = echoInterval(sigma_throat, a0, eta_s);
  if (!isFinite(dt)) return 0;
  return Math.floor(-Math.log(threshold) / (eta_s * dt));
}

/**
 * Stability index: 0 (unstable) to 1 (maximally stable).
 * Based on damping regime and Kerr suppression factor.
 */
export function stabilityIndex(sigma_throat, a0, eta_s, kerr_factor) {
  const { regime } = dampingRegime(sigma_throat, a0, eta_s);
  const regime_score = regime === 'UNDERDAMPED' ? 0.9
                     : regime === 'CRITICAL'    ? 1.0
                     :                            0.5; // overdamped
  const kerr_score = 1 - kerr_factor; // higher spin = lower exotic cost = more stable
  return Math.min(1, (regime_score * 0.6 + kerr_score * 0.4));
}

/**
 * Throat radius as a function of time after perturbation impulse.
 * δa(t) — full solution of damped oscillator Eq. (6.3)
 */
export function throatRadiusAtTime(t, a0, delta_a0, sigma_throat, eta_s) {
  const { regime, omega_d } = dampingRegime(sigma_throat, a0, eta_s);
  const decay = Math.exp(-eta_s * t);
  let displacement;
  if (regime === 'UNDERDAMPED') {
    displacement = delta_a0 * decay * Math.cos(omega_d * t);
  } else if (regime === 'OVERDAMPED') {
    displacement = delta_a0 * decay;
  } else {
    displacement = delta_a0 * decay * (1 + eta_s * t);
  }
  return a0 + displacement;
}
```

---

### grid.js — Spacetime Grid Displacement Field
```javascript
// src/lib/physics/grid.js
// Computes the displacement field for the spacetime curvature vertex shader.
// Called from physics.worker.js — runs off main thread.

import { G, c, GRID_N } from './constants.js';

/**
 * Computes a GRID_N × GRID_N array of y-displacements (downward wells)
 * representing the embedding diagram of the Kerr metric spatial slice.
 *
 * Uses the Flamm paraboloid approximation extended for spin:
 *   embed(r) = √(6M / r_eff)  where r_eff accounts for frame-dragging
 *
 * Returns Float32Array of length GRID_N*GRID_N (row-major).
 */
export function computeGridDisplacements(M, a, simTime, gridN = GRID_N) {
  const N    = gridN;
  const out  = new Float32Array(N * N);
  const span = 22; // grid spans ±11 r_g

  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const x = (col / (N - 1) - 0.5) * span;
      const z = (row / (N - 1) - 0.5) * span;
      const r = Math.sqrt(x*x + z*z);
      const r_safe = Math.max(r, 0.15);

      // Frame-dragging azimuthal correction to effective radius
      const phi   = Math.atan2(z, x);
      const omega = (2 * M * a * r_safe) / (r_safe**4 + a*a * r_safe**2);
      const twist = omega * simTime * 0.08; // slow visual drift
      const r_eff = r_safe * (1 - 0.15 * Math.cos(phi - twist) * (a / Math.max(M, 0.01)));

      // Flamm paraboloid: embed ∝ √(M/r)
      const embed = Math.sqrt(Math.max(0, 6 * M / r_eff)) * 0.38;

      out[row * N + col] = -embed; // negative = downward (depression)
    }
  }
  return out;
}
```

---

### fieldlines.js — Frame-Dragging Field Line Positions
```javascript
// src/lib/physics/fieldlines.js
// Generates animated spiral field lines visualising ω(r,θ) frame dragging.
// Called from physics.worker.js.

import { frameDragging } from './kerr.js';
import { FIELD_LINE_COUNT, FIELD_LINE_POINTS } from './constants.js';

/**
 * Computes (x, y) positions for FIELD_LINE_COUNT spiral field lines,
 * each with FIELD_LINE_POINTS points.
 *
 * Returns Float32Array of length COUNT × POINTS × 2 (interleaved x,y).
 */
export function computeFieldLines(M, a, simTime, count = FIELD_LINE_COUNT, points = FIELD_LINE_POINTS) {
  const out = new Float32Array(count * points * 2);
  let idx = 0;

  for (let l = 0; l < count; l++) {
    // Each line starts at a different radius and phase
    const r0    = 1.2 + (l / count) * 9.0; // radii from 1.2 to 10.2 r_g
    const phase0 = (l / count) * Math.PI * 2;

    for (let p = 0; p < points; p++) {
      const t_frac = p / (points - 1); // 0 → 1 along the line
      const r      = r0 + t_frac * 1.5; // lines extend slightly outward

      // Frame-dragging rate at this radius (equatorial plane)
      const omega = frameDragging(r, Math.PI / 2, M, a);

      // Angular position: base phase + frame-drag offset + slow time animation
      const phi = phase0 + omega * simTime * 0.12 + t_frac * Math.PI * 0.4;

      out[idx++] = r * Math.cos(phi); // x
      out[idx++] = r * Math.sin(phi); // y
    }
  }
  return out;
}
```

---

### geodesic.worker.js — Geodesic Worker Wrapper
```javascript
// src/lib/workers/geodesic.worker.js
// Separate worker for RK4 geodesic integration.
// Runs ONLY when params change — not every frame.

import { integrateGeodesic } from '../physics/geodesic.js';

// Default initial conditions: 12 test particles at varying radii and angles
function defaultInitialConditions(M, a) {
  const particles = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const r0   = 3.0 + i * 0.8;                     // r0 from 3 to 11.8 r_g
    const phi0 = (i / n) * Math.PI * 2;              // evenly distributed
    // Approximate circular orbit angular momentum and energy for Kerr equatorial
    const rdot0  = 0.0;
    const L = Math.sqrt(M * r0) * (1 + a * Math.sqrt(M) / (r0 * Math.sqrt(r0))); // prograde
    const E = Math.sqrt(1 - 2*M/r0 + a*a/(r0*r0)) * (1 + M/(r0 * Math.sqrt(r0)));
    particles.push({ r0, phi0, rdot0, L, E });
  }
  return particles;
}

self.onmessage = ({ data }) => {
  if (data.type !== 'INTEGRATE_GEODESICS') return;

  const { M, a_over_M, n_steps, dt, initial_conditions } = data.payload;
  const a = a_over_M * M;

  const conditions = initial_conditions || defaultInitialConditions(M, a);
  const n = conditions.length;

  // Allocate output buffer: n particles × n_steps × 2 floats (x, y)
  const paths = new Float32Array(n * n_steps * 2);

  conditions.forEach(({ r0, phi0, rdot0, L, E }, i) => {
    const { xs, ys } = integrateGeodesic(r0, phi0, rdot0, L, E, M, a, n_steps, dt);
    for (let s = 0; s < xs.length; s++) {
      paths[(i * n_steps + s) * 2]     = xs[s];
      paths[(i * n_steps + s) * 2 + 1] = ys[s];
    }
  });

  // Transfer buffer ownership — zero-copy
  self.postMessage({ type: 'GEODESIC_PATHS', payload: { paths, n, n_steps } }, [paths.buffer]);
};
```

---

### SVELTE STORES — Complete Implementations

#### params.js — Physics Parameter Store
```javascript
// src/lib/stores/params.js
import { writable } from 'svelte/store';
import { DEFAULT_PARAMS } from '$lib/physics/constants.js';

// The single source of truth for all slider values.
// Subscribed to by: ParameterSlider components, physics Worker reactivity.
export const params = writable({ ...DEFAULT_PARAMS });

// Helper: load a preset object into the store
export function loadPreset(preset) {
  params.set({
    M:             preset.M,
    a_over_M:      preset.a_over_M,
    R_torus:       preset.R_torus    ?? DEFAULT_PARAMS.R_torus,
    a0:            preset.a0,
    sigma_throat:  preset.sigma_throat,
    eta_s:         preset.eta_s,
  });
}

// Helper: encode current params to base64 URL hash for sharing
export function encodeParamsToHash(p) {
  return btoa(JSON.stringify(p));
}

// Helper: decode URL hash back to params and load
export function loadFromHash(hash) {
  try {
    const decoded = JSON.parse(atob(hash));
    params.set({ ...DEFAULT_PARAMS, ...decoded });
  } catch {
    console.warn('Invalid parameter hash — using defaults');
  }
}
```

#### computed.js — Physics Output Store
```javascript
// src/lib/stores/computed.js
import { writable, derived } from 'svelte/store';
import { params } from './params.js';
import { kerrSuppression } from '$lib/physics/kerr.js';
import { TAU_GEOM_TO_SI_PER_SOLAR_MASS, CASIMIR_LAB_MAX_SI } from '$lib/physics/constants.js';

// Raw output from physics Worker — updated every 8ms
export const computed = writable({
  omega_throat:       0,
  kerr_factor:        1,
  tau_required:       0,
  f0:                 0,
  damping_regime:     'UNDERDAMPED',
  omega_d:            0,
  ergosphere_radius:  0,
  stability_index:    0,
  throat_displacement: 0,
  grid_displacements: null,
  field_lines:        null,
});

// Derived: tau in SI units for display (approximate, for M = 1 solar mass)
export const tau_SI = derived([computed, params], ([$c, $p]) => {
  return $c.tau_required * TAU_GEOM_TO_SI_PER_SOLAR_MASS * ($p.M);
});

// Derived: ratio of required tau to Casimir lab max (feasibility gap)
export const feasibility_gap_orders = derived(tau_SI, ($tau_SI) => {
  if ($tau_SI <= 0) return 0;
  return Math.log10($tau_SI / CASIMIR_LAB_MAX_SI);
});

// Derived: echo interval in simulation time units
export const echo_interval = derived(computed, ($c) => {
  if ($c.damping_regime !== 'UNDERDAMPED' || $c.omega_d < 1e-10) return Infinity;
  return Math.PI / $c.omega_d;
});

// Derived: is perturbation visible (underdamped + reasonable eta_s)?
export const echoes_detectable = derived(computed, ($c) => {
  return $c.damping_regime === 'UNDERDAMPED' && $c.stability_index > 0.3;
});
```

#### ui.js — UI State Store
```javascript
// src/lib/stores/ui.js
import { writable } from 'svelte/store';

// Engineering view toggles (persist across construct sub-pages)
export const showLabels    = writable(true);
export const showDims      = writable(true);
export const showEqs       = writable(true);
export const activeView    = writable('axial');       // 'axial' | 'longit' | 'cutaway'
export const isExploded    = writable(false);

// Layer visibility
export const layers = writable({
  torus:    true,
  coupling: true,
  casimir:  true,
  throat:   true,
});

// Simulator state
export const perturbationActive = writable(false);
export const perturbationTime   = writable(0);
export const showPenrose        = writable(false);
export const activePreset       = writable('near-extremal');

// Global nav
export const mobileNavOpen = writable(false);
```

#### discuss.js — Discussion Store
```javascript
// src/lib/stores/discuss.js
import { writable, derived } from 'svelte/store';

// All approved comments (loaded from comments.json on mount, or Supabase)
export const comments = writable([]);

// Active category filter
export const activeCategory = writable('ALL');
// 'ALL' | 'MATHEMATICAL_GAP' | 'ENGINEERING' | 'OBSERVATIONAL' |
// 'THEORETICAL' | 'CORRECTION' | 'GENERAL'

// Active gap filter
export const activeGap = writable('ALL');
// 'ALL' | 'GAP-1' | 'GAP-2' | 'GAP-3' | 'GAP-4'

// Filtered comments derived store
export const filteredComments = derived(
  [comments, activeCategory, activeGap],
  ([$comments, $cat, $gap]) => {
    return $comments.filter(c => {
      const catMatch = $cat === 'ALL' || c.category === $cat;
      const gapMatch = $gap === 'ALL' || c.gap_ref === $gap;
      return catMatch && gapMatch;
    });
  }
);

// Form state
export const formState = writable({
  name:       '',
  background: '',
  category:   '',
  gap_ref:    '',
  body:       '',
  submitting: false,
  submitted:  false,
  error:      null,
});

// Comment count per gap (for gap tracker cards)
export const gapCounts = derived(comments, ($comments) => {
  return {
    'GAP-1': $comments.filter(c => c.gap_ref === 'GAP-1').length,
    'GAP-2': $comments.filter(c => c.gap_ref === 'GAP-2').length,
    'GAP-3': $comments.filter(c => c.gap_ref === 'GAP-3').length,
    'GAP-4': $comments.filter(c => c.gap_ref === 'GAP-4').length,
  };
});
```

---

### +layout.svelte — Global Layout with GSAP Page Transitions
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount }        from 'svelte';
  import { page }           from '$app/stores';
  import { gsap }           from 'gsap';
  import { ScrollTrigger }  from 'gsap/ScrollTrigger';
  import Nav                from '$lib/components/Nav.svelte';

  let main;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
  });

  // Animate in on route change
  $: if (main && $page.url.pathname) {
    gsap.fromTo(main,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }
</script>

<Nav />

<main bind:this={main}>
  <slot />
</main>

<style>
  main {
    min-height: calc(100vh - 57px);
    background: var(--navy);
  }
</style>
```

---

### Nav.svelte — Global Navigation Component
```svelte
<!-- src/lib/components/Nav.svelte -->
<script>
  import { page }        from '$app/stores';
  import { mobileNavOpen } from '$lib/stores/ui.js';
  import { gsap }        from 'gsap';

  const links = [
    { href: '/',                  label: 'Overview' },
    { href: '/paper',             label: 'The Paper' },
    { href: '/construct',         label: 'Construct' },
    { href: '/construct/simulator',  label: 'Simulator' },
    { href: '/discuss',           label: 'Discuss' },
  ];

  function isActive(href) {
    return $page.url.pathname === href ||
           ($page.url.pathname.startsWith(href) && href !== '/');
  }

  let hamburger;
  function toggleMobile() {
    mobileNavOpen.update(v => !v);
    gsap.to('.mobile-menu', {
      height: $mobileNavOpen ? 'auto' : 0,
      opacity: $mobileNavOpen ? 1 : 0,
      duration: 0.25,
      ease: 'power2.inOut'
    });
  }
</script>

<header class="nav">
  <div class="nav-brand">
    <span class="brand-title">Against CPC</span>
    <span class="brand-sub">Danny · 2026</span>
  </div>

  <!-- Desktop links -->
  <nav class="nav-links">
    {#each links as { href, label }}
      <a {href} class="nav-link" class:active={isActive(href)}>
        {label}
      </a>
    {/each}
  </nav>

  <span class="nav-badge">THEORETICAL</span>

  <!-- Mobile hamburger -->
  <button class="hamburger" bind:this={hamburger} on:click={toggleMobile}
    aria-label="Toggle navigation menu">
    <span></span><span></span><span></span>
  </button>
</header>

<!-- Mobile dropdown -->
<div class="mobile-menu" style="height:0;overflow:hidden;opacity:0">
  {#each links as { href, label }}
    <a {href} class="mobile-link" class:active={isActive(href)}
       on:click={() => mobileNavOpen.set(false)}>
      {label}
    </a>
  {/each}
</div>

<style>
  .nav {
    border-bottom: 1px solid var(--dim);
    padding: 14px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    background: var(--deep);
    position: sticky; top: 0; z-index: 100;
  }
  .brand-title {
    font-family: var(--font-display);
    font-size: 13px; font-weight: 700;
    letter-spacing: 3px; color: var(--teal);
    text-transform: uppercase;
  }
  .brand-sub {
    font-family: var(--font-mono);
    font-size: 10px; color: var(--sub);
    margin-left: 12px;
  }
  .nav-links {
    display: flex; gap: 4px; margin-left: 24px;
  }
  .nav-link {
    font-family: var(--font-mono);
    font-size: 11px; letter-spacing: 1px;
    color: var(--sub); text-decoration: none;
    padding: 6px 14px; border-radius: 2px;
    text-transform: uppercase;
    transition: color .15s, background .15s;
  }
  .nav-link:hover { color: var(--text); background: rgba(0,200,200,.06); }
  .nav-link.active { color: var(--teal); background: rgba(0,200,200,.1); }
  .nav-badge {
    margin-left: auto;
    font-family: var(--font-mono); font-size: 10px;
    color: var(--gold); border: 1px solid var(--gold);
    padding: 3px 10px; letter-spacing: 2px;
  }
  .hamburger {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 4px;
  }
  .hamburger span {
    display: block; width: 22px; height: 2px; background: var(--teal);
  }
  .mobile-menu {
    background: var(--deep); border-bottom: 1px solid var(--dim);
    display: flex; flex-direction: column;
  }
  .mobile-link {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px;
    color: var(--sub); text-decoration: none;
    padding: 14px 28px; border-bottom: 1px solid var(--dim);
    text-transform: uppercase;
  }
  .mobile-link.active { color: var(--teal); }
  @media (max-width: 767px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
    .nav-badge  { display: none; }
  }
</style>
```

---

### Missing GLSL Shaders

#### throat.vert — Throat Pulse Geometry
```glsl
// src/lib/three/shaders/throat.vert
// Animates the throat sphere to pulse at frequency f₀.
// Radius = a0 + δa(t) from Worker uniform.

uniform float u_pulse;       // throat displacement δa(t), from Worker
uniform float u_time;        // simulation time
uniform float u_a0;          // equilibrium throat radius

void main() {
  // Scale the unit sphere to throat radius + current displacement
  float radius = u_a0 + u_pulse;
  vec3 displaced = normalize(position) * radius;

  // Add subtle surface ripple (visualises quantum fluctuations)
  float ripple = 0.015 * sin(position.x * 8.0 + u_time * 3.0)
                       * sin(position.y * 6.0 + u_time * 2.3);
  displaced += normalize(position) * ripple;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
```

#### throat.frag — Throat Surface Appearance
```glsl
// src/lib/three/shaders/throat.frag
// Purple glow, bloom-ready. Opacity varies with pulse amplitude.

uniform float u_pulse;
uniform float u_a0;
uniform float u_time;

varying vec3 vNormal;

void main() {
  // Base colour: deep purple
  vec3 base  = vec3(0.376, 0.176, 0.565); // --purple approximate

  // Rim glow: brightens at grazing angles (Fresnel-like)
  float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5);

  // Pulse brightness: throat brightens as it oscillates
  float pulse_brightness = 1.0 + abs(u_pulse / max(u_a0, 0.01)) * 2.5;

  vec3 col = base * pulse_brightness + vec3(0.3, 0.1, 0.6) * rim;

  // Alpha: semi-transparent interior with bright edges
  float alpha = 0.35 + rim * 0.55;

  gl_FragColor = vec4(col, alpha);
}
```

#### ergosphere.frag — Ergosphere Region Fill
```glsl
// src/lib/three/shaders/ergosphere.frag
// Soft green fill for the ergosphere volume.
// Applied to BackSide sphere of radius R_erg.

uniform float u_erg_radius;
uniform float u_time;

void main() {
  // Animated shimmer suggesting frame-dragging activity
  float shimmer = 0.04 * sin(u_time * 1.2);
  float alpha   = 0.06 + shimmer;

  // Green tint — coupling zone colour
  vec3 col = vec3(0.063, 0.408, 0.188); // --green approximate

  gl_FragColor = vec4(col, alpha);
}
```

---

## PAPER SECTIONS — CONTENT REFERENCE

The following sections must be rendered in order on `/paper`. Use the actual text from `against-cpc-full.docx` as the content source. Each entry lists the section number, title, epistemic tier, and which components appear within it.

| § | Title | Tier | KaTeX eqs | Callouts | Ara? | Tables |
|---|-------|------|-----------|----------|------|--------|
| — | Epistemic Tier Legend | all 4 | none | 4 (one per tier) | No | No |
| 1 | Introduction | none | none | none | Yes | No |
| 2 | Hawking's CPC — Statement and Scope | I | 1 | 4 (Aux Claims A–D) | No | No |
| 3 | Gap I — Ford–Roman Quantum Inequality | II | 2 | 2 (bridging gap, curvature) | Yes | No |
| 4 | Gap II — KRW Theorem | II + IV | 0 | 3 | Yes | Yes (KRW applicability) |
| 4.4 | Gap III — Pure-State Boundary Conditions | II | 0 | 1 | No | No |
| 5 | Combined System — Stress-Energy Architecture | II + III | 10 | 4 | Yes | Yes (anchor constants) |
| 6 | Dynamic Throat and GW Echo Signatures | II | 3 | 1 | No | Yes (damping regimes) |
| 7 | Landauer–Deutsch Information Bound | II | 1 | 1 | No | No |
| 8 | Observational Roadmap: Five Milestones | II + III | 0 | 5 (one per milestone) | No | No |
| 9 | Historical and Theological Coda | none | 0 | 0 | No | No |
| 10 | Conclusion | none | 0 | 0 | No | No |
| — | References | none | none | none | No | No |

### SectionNavigator scroll tracking (SectionNavigator.svelte)
```svelte
<!-- src/lib/components/SectionNavigator.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  export let sections = []; // array of { id, number, title }

  let activeId = '';
  let observer;

  onMount(() => {
    const options = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeId = entry.target.id;
      });
    }, options);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  });

  onDestroy(() => observer?.disconnect());

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<nav class="section-nav" aria-label="Paper section navigation">
  {#each sections as { id, number, title }}
    <button
      class="sec-link"
      class:active={activeId === id}
      on:click={() => scrollTo(id)}
    >
      <span class="sec-num">§{number}</span>
      <span class="sec-title">{title}</span>
    </button>
  {/each}
</nav>
```

---

## ACCESSIBILITY GUIDE

Canvas-based content requires explicit accessibility support. These are the minimum requirements before launch.

### Canvas aria-labels
Every `<canvas>` element must have a descriptive `aria-label` and `role`:
```html
<!-- Main simulator canvas -->
<canvas
  id="hifi-canvas"
  role="img"
  aria-label="Interactive engineering diagram of the rotating exotic-stabilised throat construct, showing four nested layers: rotating dense matter torus, ergosphere coupling zone, Casimir cavity array, and stabilised throat. Labels, dimensions, and equations can be toggled using the toolbar controls above."
></canvas>

<!-- Wormhole simulation canvas -->
<canvas
  id="sim-canvas"
  role="img"
  aria-label="Real-time simulation of a rotating Kerr wormhole spacetime. The spacetime curvature grid, frame-dragging field lines, ergosphere boundary, and throat are shown. Adjust sliders in the control panel to see how mass, spin, and throat parameters affect the geometry."
></canvas>
```

### Keyboard navigation
- All toolbar buttons (toggles, pills, presets): reachable via Tab, activated via Enter/Space
- Parameter sliders: native `<input type="range">` — fully keyboard accessible by default
- Section navigator: all `<button>` elements — Tab navigable
- Comment form: all standard form elements — fully accessible

### Reduced motion
```css
/* In app.css — respect OS preference */
@media (prefers-reduced-motion: reduce) {
  /* Pause all canvas animations */
  .spin-torus, .spin-field, .spin-inner, .pulse-throat {
    animation-play-state: paused;
  }
  /* Replace GSAP page transitions with instant swap */
  /* (handle in +layout.svelte by checking matchMedia) */
}
```

```javascript
// In +layout.svelte — skip GSAP transition if reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  gsap.fromTo(main, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 });
}
```

### Focus indicators
```css
/* Never remove focus outlines — style them to match the design system */
:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 3px;
  border-radius: 2px;
}
```

### Screen reader text for equations
KaTeX renders equations visually but screen readers need text alternatives:
```svelte
<!-- KatexBlock.svelte -->
<div class="eq-wrap">
  <span class="sr-only" aria-label={description}>{description}</span>
  <div aria-hidden="true" use:katex={latex}></div>
</div>
<!-- sr-only: position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0) -->
```

---

## SITEMAP AND OG IMAGE

### sitemap.xml (place in static/)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://againstcpc.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://againstcpc.com/paper</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://againstcpc.com/construct</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://againstcpc.com/construct/simulator</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://againstcpc.com/construct/parameter-lab</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://againstcpc.com/discuss</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### OG Image (og-image.png — 1200×630px)
Design spec for the social sharing image. Generate it as a PNG and place in `static/`:

```
Background: --navy (#0b1120)
Left third: The rotating torus + throat diagram (simplified, from wireframe SVG)
            — exported at low opacity as a static render
Right two-thirds:
  Top:    "AGAINST CHRONOLOGY PROTECTION"
          Font: Orbitron Bold, 48px, --teal
  Middle: "On the Insufficiency of Hawking's 1992 Conjecture"
          Font: Exo 2, 28px, --text
  Below:  The Kerr suppression equation rendered large:
          |τ|_Kerr ~ √(1 − a²/M²)
          Font: Share Tech Mono, 32px, --gold
  Bottom: "againstcpc.com  ·  Danny  ·  2026"
          Font: Share Tech Mono, 18px, --sub

Border:   1px solid --dim on all sides
```

Generate this with a Svelte page that renders as an image, or use `satori` + `sharp` in a build script:
```javascript
// scripts/generate-og.js
// Run: node scripts/generate-og.js → outputs static/og-image.png
import satori from 'satori';
import sharp  from 'sharp';
// ... (implement using satori React-like JSX template)
```

---

## COMPLETE DEPENDENCY LIST (package.json)

```json
{
  "name": "against-cpc",
  "version": "0.4.0",
  "private": true,
  "scripts": {
    "dev":     "vite dev",
    "build":   "vite build",
    "preview": "vite preview",
    "check":   "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "og":      "node scripts/generate-og.js"
  },
  "dependencies": {
    "@sveltejs/kit":              "^2.0.0",
    "@threlte/core":              "^8.0.0",
    "@threlte/extras":            "^9.0.0",
    "gsap":                       "^3.12.0",
    "katex":                      "^0.16.0",
    "three":                      "^0.165.0"
  },
  "devDependencies": {
    "@sveltejs/adapter-vercel":   "^5.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "lil-gui":                    "^0.19.0",
    "satori":                     "^0.10.0",
    "sharp":                      "^0.33.0",
    "svelte":                     "^5.0.0",
    "svelte-check":               "^3.6.0",
    "typescript":                 "^5.0.0",
    "vite":                       "^5.0.0"
  }
}
```

---

## QUICK-START COMMAND SEQUENCE

When Claude starts a new session to build this project, run these commands in order:

```bash
# 1. Scaffold
npm create svelte@latest against-cpc -- --template skeleton --types typescript

# 2. Enter project
cd against-cpc

# 3. Install all deps
npm install three @threlte/core @threlte/extras gsap katex
npm install -D @sveltejs/adapter-vercel lil-gui satori sharp

# 4. Replace adapter in svelte.config.js
# adapter: adapter from '@sveltejs/adapter-vercel'

# 5. Create core directories
mkdir -p src/lib/{components,three/shaders,three/materials,workers,physics,stores,data}
mkdir -p src/routes/{paper,construct/simulator,construct/parameter-lab,discuss}
mkdir -p static/downloads

# 6. Copy physics files (from this document's code blocks):
#    src/lib/physics/constants.js
#    src/lib/physics/kerr.js
#    src/lib/physics/throat.js
#    src/lib/physics/echo.js
#    src/lib/physics/geodesic.js
#    src/lib/physics/grid.js
#    src/lib/physics/fieldlines.js

# 7. Copy worker files:
#    src/lib/workers/physics.worker.js
#    src/lib/workers/geodesic.worker.js

# 8. Copy store files:
#    src/lib/stores/params.js
#    src/lib/stores/computed.js
#    src/lib/stores/ui.js
#    src/lib/stores/discuss.js

# 9. Copy shader files:
#    src/lib/three/shaders/spacetime.vert
#    src/lib/three/shaders/spacetime.frag
#    src/lib/three/shaders/throat.vert
#    src/lib/three/shaders/throat.frag
#    src/lib/three/shaders/ergosphere.frag

# 10. Copy global layout:
#    src/routes/+layout.svelte
#    src/lib/components/Nav.svelte
#    src/app.css (design system variables)

# 11. Run dev server
npm run dev

# 12. Verify Workers initialise (check browser console — no errors)
# 13. Verify kerrSuppression(1, 1) === 0 in browser console
# 14. Deploy Phase 1 to Vercel
npx vercel --prod
```

---

*End of instruction file — v2.1 — April 2026*
*Author: Danny  |  Paper: "Against Chronology Protection"*
*Stack: SvelteKit + Three.js (Threlte) + Web Workers + GSAP + KaTeX*
*Deploy: Vercel  |  Comments: Formspree → Supabase*
*Status: COMPLETE — all referenced files implemented*
