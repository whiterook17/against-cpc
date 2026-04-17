# Against CPC — Operational Reference
## Stack: SvelteKit 5 + Threlte + Web Workers + GSAP + KaTeX | Deploy: Vercel

---

## PHASE STATUS

| Phase | Name                    | Status      | Commit    |
|-------|-------------------------|-------------|-----------|
| 1     | Foundation              | DONE        | ebe7458   |
| 2     | Paper page              | DONE        | aa2d7af   |
| 3     | Engineering wireframe   | DONE        | 4513605   |
| 4     | Physics workers         | NOT STARTED |           |
| 5     | Wormhole simulator      | NOT STARTED |           |
| 6     | Parameter lab           | NOT STARTED |           |
| 7     | Discussion page         | NOT STARTED |           |
| 8     | Polish + OG image       | NOT STARTED |           |

---

## HARD RULES

- **Svelte 5 runes only:** `$state`, `$props`, `$effect`, `{@render children()}`. Never `export let`, `$:`, `on:click`, `<slot>`
- **All colours via CSS vars** (`--navy`, `--teal`, `--gold`, `--red`, `--purple`, `--green`, `--dim`, `--text`, `--sub`). No hardcoded hex
- **Physics computation never on main thread** — always in Web Workers
- **Canvas/browser APIs guarded** with `if (!browser) return;`
- **No new npm dependencies** without approval
- **Mobile block at 767px** on all `/construct/*` routes via `DesktopRequired.svelte`
- **SSR on `/paper`** (`prerender = true`). **SSR off on `/construct/simulator`** (`ssr = false`)
- **GSAP for all UI animation.** No CSS transitions on interactive elements
- **Do not touch BUGS.md** unless explicitly told to
- **Deploy after every phase** — `npm run build` must exit 0 before `git push`

---

## DESIGN SYSTEM

- **Fonts:** Orbitron (display/headings), Exo 2 (body), Share Tech Mono (mono/code/equations)
- **Nav height:** 57px. Use `calc(100vh - 57px)` for full-height sections
- **Breakpoints:** mobile `<768px`, tablet `768–1023px`, desktop `≥1024px`

### Epistemic tier colours
| Tier | Label                          | Var          |
|------|--------------------------------|--------------|
| I    | Confirmed Foundation           | `--teal`     |
| II   | Well-Motivated Extrapolation   | `--gold`     |
| III  | Conjectural but Consistent     | `--purple`   |
| IV   | Explicit Gap                   | `--red`      |

---

## KEY FILES

```
src/app.css
src/routes/+layout.svelte
src/lib/components/Nav.svelte
src/lib/components/DesktopRequired.svelte
src/lib/three/construct/drawings.ts

# Phase 4 (not yet created)
src/lib/physics/constants.js
src/lib/physics/kerr.js
src/lib/physics/throat.js
src/lib/physics/echo.js
src/lib/physics/geodesic.js
src/lib/physics/grid.js
src/lib/physics/fieldlines.js
src/lib/workers/physics.worker.js
src/lib/workers/geodesic.worker.js
src/lib/stores/params.js
src/lib/stores/computed.js
src/lib/stores/ui.js
src/lib/stores/discuss.js
```

---

## OPEN BUGS
> Do not fix without explicit instruction. Full details in `BUGS.md`.

- **BUG-001:** Aux Claims A–D mis-tagged Tier I (§2.2) — should be Tier II
- **BUG-002:** `sr-only` descriptions leaking visually near inline KaTeX
- **BUG-003:** References list marker cross-browser (Safari)

---

## PHASE 4 NEXT — Physics Workers

### Files to create
1. `src/lib/physics/constants.js` — G, c, k_B, DEFAULT_PARAMS, PHYSICS_DT, GRID_N
2. `src/lib/physics/kerr.js` — `sigma_BL`, `delta`, `frameDragging`, `ergosphereRadius`, `kerrSuppression`, `exoticMatterTension`, `echoFrequency`, `dampingRegime`, `throatDisplacement`
3. `src/lib/physics/throat.js` — `surfacePressure`, `echoInterval`, `echoCount`, `stabilityIndex`, `throatRadiusAtTime`
4. `src/lib/physics/echo.js` — `echoSpectrum`, `echoSpectrumArray`
5. `src/lib/physics/geodesic.js` — `integrateGeodesic` (RK4, equatorial Kerr)
6. `src/lib/physics/grid.js` — `computeGridDisplacements` (32×32 Flamm paraboloid)
7. `src/lib/physics/fieldlines.js` — `computeFieldLines` (20 lines × 30 points)
8. `src/lib/workers/physics.worker.js` — 8ms tick loop, `UPDATE_PARAMS` → `COMPUTED_STATE`
9. `src/lib/workers/geodesic.worker.js` — `INTEGRATE_GEODESICS` → `GEODESIC_PATHS`
10. `src/lib/stores/params.js` — writable store, `loadPreset`, `encodeParamsToHash`, `loadFromHash`
11. `src/lib/stores/computed.js` — Worker output store + derived `tau_SI`, `feasibility_gap_orders`, `echo_interval`, `echoes_detectable`

### Worker message protocol
```
MAIN → WORKER:  { type: 'UPDATE_PARAMS', payload: { M, a_over_M, R_torus, a0, sigma_throat, eta_s, simTime } }
WORKER → MAIN:  { type: 'COMPUTED_STATE', payload: { omega_throat, kerr_factor, tau_required, f0,
                  damping_regime, omega_d, ergosphere_radius, stability_index, throat_displacement,
                  grid_displacements: Float32Array(1024), field_lines: Float32Array(600) } }
```
Transfer buffers with ownership: `postMessage(data, [grid_displacements.buffer, field_lines.buffer])`

### Correctness tests (run in browser console)
```js
kerrSuppression(1, 1) === 0          // extremal Kerr → zero exotic cost
kerrSuppression(0, 1) === 1          // static → full cost
frameDragging(r, Math.PI/2, M, 0) === 0  // no spin → no frame drag
```

---

## HONEST CONSTRAINTS NOTICE
Display on all `/construct/*` pages (footer or banner):

> The exotic matter requirements shown are physically real constraints. At current technology,
> a macroscopic traversable wormhole is not buildable. The simulator demonstrates how parameters
> relate, not that the object is constructible. All Tier III and Tier IV content is marked.
