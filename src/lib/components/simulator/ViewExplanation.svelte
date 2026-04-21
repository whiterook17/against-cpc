<!-- ViewExplanation.svelte — Explanation panel below each canvas view. Svelte 5 runes. -->
<script lang="ts">
  import { params } from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';
  import { unitMode } from '$lib/stores/units.js';
  import { formatRgAsKm, formatRgAsM, rgToKm } from '$lib/utils/unitConversion.js';

  let { viewId }: { viewId: 'equatorial' | 'meridional' | 'embedding' | 'penrose' } = $props();

  const M        = $derived($params.M ?? 1.0);
  const a_over_M = $derived($params.a_over_M ?? 0.85);
  const a0       = $derived($params.a0 ?? 1.2);
  const R_torus  = $derived($params.R_torus ?? 8.0);

  const omega    = $derived($computed.omega_throat ?? 0);
  const erg_r    = $derived($computed.ergosphere_radius ?? 2.0);
  const kerr_f   = $derived($computed.kerr_factor ?? 1);
  const tau_req  = $derived($computed.tau_required ?? 0);
  const f0       = $derived($computed.f0 ?? 0);
  const disp     = $derived($computed.throat_displacement ?? 0);

  function fmt(rg_value: number, decimals = 2): string {
    if ($unitMode === 'si') return formatRgAsKm(rg_value, M, decimals);
    return rg_value.toFixed(decimals) + ' rg';
  }

  function fmtS(rg_value: number, decimals = 1): string {
    if ($unitMode === 'si') return formatRgAsM(rg_value, M, decimals);
    return rg_value.toFixed(3) + ' rg';
  }

  // Per-view content — fully reactive via $derived
  const views = $derived({
    equatorial: {
      title: 'What You Are Seeing',
      intro: 'A top-down view of the equatorial plane (θ = π/2) — as if you are hovering directly above the rotation axis looking down.',
      elements: [
        {
          symbol: '●', color: 'var(--purple)',
          label: 'Throat (purple circle)',
          value: fmt(a0) + ' radius',
          detail: 'The wormhole opening. Currently ' + (disp >= 0 ? 'expanding' : 'contracting') + ' by ' + fmtS(Math.abs(disp)) + '.',
        },
        {
          symbol: '○', color: 'var(--green)',
          label: 'Ergosphere (green dashed)',
          value: fmt(erg_r) + ' radius',
          detail: 'Region where spacetime rotates so fast nothing can stand still. Frame-drag rate ω = ' + omega.toFixed(4) + '.',
        },
        {
          symbol: '○', color: 'var(--text)',
          label: 'Rotating torus (white ring)',
          value: fmt(R_torus) + ' radius',
          detail: 'Dense matter ring spinning at a/M = ' + a_over_M.toFixed(2) + '. Provides all frame-dragging.',
        },
        {
          symbol: '~', color: 'var(--teal)',
          label: 'Field lines (teal spirals)',
          value: 'ω = ' + omega.toFixed(4) + ' at throat',
          detail: 'Visualise frame-dragging. Tighter spirals = stronger rotation effect.',
        },
        {
          symbol: '—', color: 'var(--gold)',
          label: 'Geodesics (gold curves)',
          value: '12 test particles',
          detail: 'Paths followed by free-falling matter. Curved by gravity and frame-dragging.',
        },
      ],
      note: null,
    },

    meridional: {
      title: 'What You Are Seeing',
      intro: 'A vertical cross-section through the middle of the structure (the r–z plane, φ = 0) — like cutting the design in half to see the layers inside.',
      elements: [
        {
          symbol: '⌒', color: 'var(--text)',
          label: 'Embedding curve (white)',
          value: fmt(Math.sqrt(6 * M / Math.max(a0, 0.1)) * 0.38, 3) + ' depth',
          detail: 'Shows how spacetime curves downward near the mass — the classic "bowling ball on a trampoline" shape (Flamm paraboloid).',
        },
        {
          symbol: '●', color: 'var(--text)',
          label: 'Torus cross-sections',
          value: fmt(R_torus) + ' from centre',
          detail: 'Top and bottom slices of the torus ring. Shows its poloidal (minor) radius as well as major radius.',
        },
        {
          symbol: '▓', color: 'var(--gold)',
          label: 'Coupling zone (gold)',
          value: fmt(a0) + ' → ' + fmt(erg_r),
          detail: 'The ergosphere region between throat and torus. Angular momentum transfers here — rotation reaches the throat.',
        },
        {
          symbol: '|', color: 'var(--red)',
          label: 'Casimir shell (red band)',
          value: '~' + fmtS(0.01) + ' thick',
          detail: 'Thin exotic matter shell surrounding the throat. τ required = ' + tau_req.toExponential(2) + ' (geom).',
        },
        {
          symbol: '|', color: 'var(--purple)',
          label: 'Throat (purple line)',
          value: 'a₀ = ' + fmt(a0),
          detail: 'The wormhole tunnel. Oscillates at f₀ = ' + f0.toFixed(4) + ' — gravitational wave echoes at this frequency.',
        },
      ],
      note: null,
    },

    embedding: {
      title: 'What You Are Seeing',
      intro: 'A 3D embedding diagram showing how mass bends the geometry of space — rendered in isometric perspective. Vertical displacement = spatial curvature.',
      elements: [
        {
          symbol: '⊞', color: 'var(--dim)',
          label: 'Wireframe grid (grey)',
          value: '32 × 32 vertices',
          detail: 'Each vertex is displaced downward in proportion to local spacetime curvature. Flat = weak gravity; steep = strong gravity.',
        },
        {
          symbol: '↓', color: 'var(--teal)',
          label: 'Central depression depth',
          value: fmt(Math.sqrt(6 * M / Math.max(a0, 0.1)) * 0.38, 3),
          detail: 'How deep the gravity well is at the throat. Increases with mass, decreases with throat size.',
        },
        {
          symbol: '↻', color: 'var(--teal)',
          label: 'Grid twist (frame-dragging)',
          value: 'ω·t = ' + (omega * 0.5).toFixed(3) + ' rad',
          detail: 'The grid rotates slowly as time advances — shows how rotating mass twists spacetime. Strongest at high spin (a/M → 0.99).',
        },
        {
          symbol: '○', color: 'var(--text)',
          label: 'Torus ring on surface',
          value: fmt(R_torus) + ' from centre',
          detail: 'The rotating matter ring sits on the curved surface. Its weight creates the depression.',
        },
      ],
      note: 'This is the Flamm paraboloid approximation extended for spin — a visualisation tool, not an exact Kerr embedding (which requires numerical methods).',
    },

    penrose: {
      title: 'What You Are Seeing',
      intro: 'A conformal (Penrose) diagram — all of spacetime compressed so infinity fits on the page. Vertical = time, horizontal = space.',
      elements: [
        {
          symbol: '◇', color: 'var(--teal)',
          label: 'Region I (left diamond)',
          value: 'Our universe',
          detail: 'The spacetime region containing the observer. Light cones show which events can be reached from here.',
        },
        {
          symbol: '◇', color: 'var(--teal)',
          label: 'Region II (right diamond)',
          value: 'Far universe',
          detail: 'The other end of the wormhole. Connected to Region I through the throat band.',
        },
        {
          symbol: '▬', color: 'var(--purple)',
          label: 'Throat band (purple)',
          value: 'a₀ = ' + fmt(a0),
          detail: 'The wormhole connection between the two regions. If traversable, an observer can cross from Region I to Region II.',
        },
        {
          symbol: '◁▷', color: 'var(--gold)',
          label: 'Light cones (gold)',
          value: '4 positions shown',
          detail: 'At each point, light cones show which future events are reachable. Tilted cones near the throat indicate strong curvature.',
        },
        {
          symbol: '▓', color: a_over_M > 0.9 ? 'var(--red)' : 'var(--sub)',
          label: 'CTC region (red band)',
          value: a_over_M > 0.9
            ? 'ACTIVE — a/M = ' + a_over_M.toFixed(2)
            : 'Not visible — requires a/M > 0.9',
          detail: a_over_M > 0.9
            ? 'Closed timelike curves exist here. Time travel to the past is theoretically possible in this region. This is what Hawking tried to prevent.'
            : "Increase Rotation Speed above 0.9 to see this region appear. It marks the chronology horizon — the boundary Hawking's conjecture claims cannot form.",
        },
      ],
      note: a_over_M > 0.9
        ? '⚠ CTC region is active. This is the regime challenged by this research — Hawking says nature destroys this configuration. We identify 3 gaps in that argument.'
        : 'Try setting Rotation Speed to 0.95 to see the CTC region appear in this diagram.',
    },
  });

  const view = $derived(views[viewId]);
</script>

{#if view}
  <div class="view-explanation">

    <div class="explanation-header">
      <h4>{view.title}</h4>
    </div>

    <p class="explanation-intro">{view.intro}</p>

    <div class="elements-list">
      {#each view.elements as el (el.label)}
        <div class="element-row">
          <span class="element-symbol" style="color: {el.color}">{el.symbol}</span>
          <div class="element-content">
            <div class="element-header">
              <span class="element-label" style="color: {el.color}">{el.label}</span>
              <span class="element-value">{el.value}</span>
            </div>
            <p class="element-detail">{el.detail}</p>
          </div>
        </div>
      {/each}
    </div>

    {#if view.note}
      <p class="explanation-note" class:ctc-active={viewId === 'penrose' && a_over_M > 0.9}>
        {view.note}
      </p>
    {/if}

  </div>
{/if}

<style>
  .view-explanation {
    background: var(--panel);
    border: 1px solid var(--dim);
    border-top: none;
    border-radius: 0 0 4px 4px;
    padding: 14px 18px;
  }

  .explanation-header h4 {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--sub);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0 0 8px;
  }

  .explanation-intro {
    font-family: var(--font-body);
    font-size: 12px;
    line-height: 1.6;
    color: var(--text);
    margin: 0 0 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--dim);
  }

  .elements-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .element-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .element-symbol {
    font-family: var(--font-mono);
    font-size: 14px;
    width: 18px;
    flex-shrink: 0;
    text-align: center;
    margin-top: 1px;
    line-height: 1.2;
  }

  .element-content { flex: 1; }

  .element-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }

  .element-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.5px;
    font-weight: bold;
  }

  .element-value {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
  }

  .element-detail {
    font-family: var(--font-body);
    font-size: 11px;
    line-height: 1.5;
    color: var(--sub);
    margin: 0;
  }

  .explanation-note {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    margin: 12px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--dim);
    line-height: 1.5;
    font-style: italic;
  }

  .explanation-note.ctc-active {
    color: var(--red);
    border-top-color: var(--red);
    font-style: normal;
    background: rgba(224, 80, 80, 0.05);
    padding: 8px 10px;
    border-radius: 0 0 3px 3px;
    margin-top: 10px;
  }

  @media (max-width: 767px) {
    .view-explanation { padding: 12px 14px; }
    .element-header { flex-direction: column; gap: 2px; }
  }
</style>
