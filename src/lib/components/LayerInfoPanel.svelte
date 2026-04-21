<!-- LayerInfoPanel.svelte — Layer detail panel. Svelte 5 runes. Read-only from stores. -->
<script lang="ts">
  import { gsap } from 'gsap';
  import { params } from '$lib/stores/params.js';
  import { computed } from '$lib/stores/computed.js';
  import { formatRgAsKm, formatRgAsM, formatMassKg, rgToKm } from '$lib/utils/unitConversion.js';

  let { layerId = null }: { layerId: string | null } = $props();

  let panelEl: HTMLElement | null = $state(null);

  // Unit base — 1 rg in km for current mass
  const rg_km = $derived(rgToKm($params.M ?? 1.0));

  // All 4 layer descriptors, reactive to params + computed
  const layers = $derived({
    torus: {
      number: '01',
      name: 'Rotating Dense Matter Torus',
      color: 'var(--teal)',
      tier: 'II',
      tierLabel: 'WELL-MOTIVATED EXTRAPOLATION',
      tierColor: 'var(--gold)',
      paperSection: '5.1',
      what: 'A ring of extremely dense matter — think of a neutron star reshaped into a torus — spinning at near light speed.',
      does: 'Its rotation drags surrounding spacetime with it, like a spoon stirring honey. This is called frame-dragging, and it is the engine of the entire design.',
      measurements: [
        { label: 'Major radius (R)', rg: ($params.R_torus ?? 8.0).toFixed(1) + ' rg', si: formatRgAsKm($params.R_torus ?? 8.0, $params.M ?? 1.0) },
        { label: 'Total mass (M)',   rg: ($params.M ?? 1.0).toFixed(1) + ' M☉',       si: formatMassKg($params.M ?? 1.0) },
        { label: 'Spin (a/M)',       rg: ($params.a_over_M ?? 0.85).toFixed(2),        si: '— (dimensionless)' },
        { label: '1 gravitational radius', rg: '1 rg', si: rg_km.toFixed(3) + ' km' },
      ],
      keyInsight: 'The faster the torus spins, the cheaper the wormhole becomes. At spin a/M = 0.99, exotic matter cost drops by 86% compared to a static design.',
    },

    coupling: {
      number: '02',
      name: 'Ergosphere Coupling Zone',
      color: 'var(--gold)',
      tier: 'I',
      tierLabel: 'CONFIRMED FOUNDATION',
      tierColor: 'var(--teal)',
      paperSection: '5.2',
      what: 'The ergosphere is a region around the rotating torus where spacetime itself spins so fast that nothing can remain stationary — even at full engine thrust, you are swept along.',
      does: 'Acts as the bridge between the torus and the throat. Angular momentum is transferred here — the rotation propagates inward to keep the throat region spinning.',
      measurements: [
        { label: 'Ergosphere radius (equat.)', rg: ($computed.ergosphere_radius ?? 2.0).toFixed(2) + ' rg', si: formatRgAsKm($computed.ergosphere_radius ?? 2.0, $params.M ?? 1.0) },
        { label: 'Frame-drag rate ω',          rg: ($computed.omega_throat ?? 0.234).toFixed(4) + ' rg⁻¹', si: '— (geometric)' },
        { label: 'Kerr suppression',           rg: (($computed.kerr_factor ?? 0.527) * 100).toFixed(1) + '%', si: '— (dimensionless)' },
      ],
      keyInsight: 'The ergosphere is real — we observe it around spinning black holes. Embedding it in a wormhole design is Tier II (well-motivated extrapolation, not yet tested).',
    },

    casimir: {
      number: '03',
      name: 'Casimir Exotic Matter Shell',
      color: 'var(--purple)',
      tier: 'III',
      tierLabel: 'CONJECTURAL BUT CONSISTENT',
      tierColor: 'var(--purple)',
      paperSection: '5.3',
      what: 'A thin spherical shell of exotic matter — material with negative energy density — surrounding the throat. The Casimir effect produces small amounts of this in the lab.',
      does: 'Provides the outward push that stops the wormhole throat from collapsing. Like an inflated balloon, but the pressure comes from negative energy rather than air.',
      measurements: [
        { label: 'Shell thickness (approx)', rg: '~0.01 rg', si: '~' + formatRgAsM(0.01, $params.M ?? 1.0) },
        { label: 'Exotic tension τ (geom)',  rg: ($computed.tau_required ?? 0).toExponential(2), si: '~10⁵⁵ J/m² (SI)' },
        { label: 'Casimir lab max (2026)',   rg: '—', si: '~10⁻³ J/m²' },
        { label: 'Feasibility gap',          rg: '—', si: '~58 orders of magnitude' },
      ],
      keyInsight: "This is the hardest part. The τ required is real physics — it's not rounded down. The 58-order gap between what we need and what the lab can provide is the most honest number in the paper.",
    },

    throat: {
      number: '04',
      name: 'Stabilized Wormhole Throat',
      color: 'var(--red)',
      tier: 'II',
      tierLabel: 'WELL-MOTIVATED EXTRAPOLATION',
      tierColor: 'var(--gold)',
      paperSection: '6',
      what: 'The actual wormhole opening — a tunnel through the fabric of spacetime connecting two regions. Without exotic matter support, gravity collapses it instantly.',
      does: 'Provides the traversable passage. When perturbed by infalling matter, it oscillates like a bell and emits gravitational wave echoes detectable by LIGO.',
      measurements: [
        { label: 'Equilibrium radius (a₀)',  rg: ($params.a0 ?? 1.2).toFixed(2) + ' rg', si: formatRgAsKm($params.a0 ?? 1.2, $params.M ?? 1.0) },
        { label: 'Displacement δa',          rg: ($computed.throat_displacement ?? 0).toFixed(4) + ' rg', si: formatRgAsM($computed.throat_displacement ?? 0, $params.M ?? 1.0) },
        { label: 'Oscillation freq (f₀)',    rg: ($computed.f0 ?? 0).toFixed(4) + ' (geom)', si: '— Hz-equivalent' },
        { label: 'Damping regime',           rg: $computed.damping_regime ?? 'UNDERDAMPED', si: '—' },
      ],
      keyInsight: 'The oscillation frequency f₀ is the key observational prediction. If LIGO O5 detects gravitational wave echoes at this frequency, that is evidence for a wormhole-like object.',
    },
  });

  const currentLayer = $derived(layerId ? (layers as Record<string, typeof layers.torus>)[layerId] : null);

  // Animate panel in when layer changes
  $effect(() => {
    if (panelEl && currentLayer) {
      gsap.fromTo(panelEl, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.22, ease: 'power2.out' });
    }
  });
</script>

{#if currentLayer}
  <div class="layer-panel" bind:this={panelEl}>

    <div class="panel-header" style="--layer-color: {currentLayer.color}">
      <span class="layer-number">LAYER {currentLayer.number}</span>
      <h3 class="layer-name">{currentLayer.name}</h3>
    </div>

    <div class="tier-badge" style="--tier-color: {currentLayer.tierColor}">
      <span class="tier-dot"></span>
      <span class="tier-text">TIER {currentLayer.tier} — {currentLayer.tierLabel}</span>
    </div>

    <div class="panel-body">

      <div class="panel-block">
        <h4 class="block-label">WHAT IT IS</h4>
        <p>{currentLayer.what}</p>
      </div>

      <div class="panel-block">
        <h4 class="block-label">WHAT IT DOES</h4>
        <p>{currentLayer.does}</p>
      </div>

      <div class="panel-block">
        <h4 class="block-label">MEASUREMENTS</h4>
        <table class="measurements-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Geometric (rg)</th>
              <th>SI</th>
            </tr>
          </thead>
          <tbody>
            {#each currentLayer.measurements as m (m.label)}
              <tr>
                <td class="prop-label">{m.label}</td>
                <td class="prop-rg">{m.rg}</td>
                <td class="prop-si">{m.si}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="unit-note">1 rg = {rg_km.toFixed(3)} km for M = {($params.M ?? 1.0).toFixed(1)} M☉</p>
      </div>

      <div class="panel-insight">
        <span class="insight-label">KEY INSIGHT</span>
        <p>{currentLayer.keyInsight}</p>
      </div>

      <a href="/paper#section-{currentLayer.paperSection.replace('.', '-')}" class="paper-link">
        → Read §{currentLayer.paperSection} in the paper
      </a>

    </div>
  </div>

{:else}
  <div class="panel-empty">
    <div class="empty-icon">◎</div>
    <p>Hover or click a layer pill to see detailed measurements and plain-English explanation.</p>
  </div>
{/if}

<style>
  .layer-panel {
    background: var(--panel);
    border: 1px solid var(--dim);
    border-radius: 4px;
    overflow: hidden;
  }

  .panel-header {
    padding: 14px 18px;
    border-bottom: 2px solid var(--layer-color);
    background: var(--deep);
  }

  .layer-number {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    letter-spacing: 2px;
    display: block;
    margin-bottom: 4px;
  }

  .layer-name {
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--layer-color);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .tier-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 18px;
    background: rgba(0,0,0,0.2);
    border-bottom: 1px solid var(--dim);
  }

  .tier-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tier-color);
    flex-shrink: 0;
  }

  .tier-text {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--tier-color);
    letter-spacing: 1px;
  }

  .panel-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
    max-height: 70vh;
  }

  .block-label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--sub);
    letter-spacing: 2px;
    margin: 0 0 7px;
  }

  .panel-block p {
    font-family: var(--font-body);
    font-size: 12px;
    line-height: 1.65;
    color: var(--text);
    margin: 0;
  }

  .measurements-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: 10px;
    margin-bottom: 6px;
  }

  .measurements-table thead th {
    text-align: left;
    color: var(--sub);
    font-weight: normal;
    padding: 3px 6px 5px 0;
    border-bottom: 1px solid var(--dim);
    letter-spacing: 1px;
    font-size: 9px;
  }

  .measurements-table tbody td {
    padding: 5px 6px 5px 0;
    border-bottom: 1px solid rgba(42,63,90,0.4);
    vertical-align: top;
  }

  .measurements-table tbody tr:last-child td {
    border-bottom: none;
  }

  .prop-label { color: var(--sub);  font-size: 10px; width: 42%; }
  .prop-rg    { color: var(--teal); font-size: 10px; width: 26%; }
  .prop-si    { color: var(--gold); font-size: 10px; width: 32%; }

  .unit-note {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--sub);
    margin: 2px 0 0;
    font-style: italic;
  }

  .panel-insight {
    background: rgba(0,200,200,0.06);
    border-left: 2px solid var(--teal);
    padding: 10px 12px;
    border-radius: 0 4px 4px 0;
  }

  .insight-label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--teal);
    letter-spacing: 2px;
    display: block;
    margin-bottom: 5px;
  }

  .panel-insight p {
    font-family: var(--font-body);
    font-size: 12px;
    line-height: 1.6;
    color: var(--text);
    margin: 0;
  }

  .paper-link {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--teal);
    text-decoration: none;
    letter-spacing: 1px;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s;
    display: inline-block;
  }

  .paper-link:hover {
    border-bottom-color: var(--teal);
  }

  .panel-empty {
    min-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 28px;
    text-align: center;
    background: var(--panel);
    border: 1px solid var(--dim);
    border-radius: 4px;
  }

  .empty-icon {
    font-size: 32px;
    color: var(--dim);
  }

  .panel-empty p {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--sub);
    max-width: 200px;
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 1023px) {
    .panel-body { max-height: none; }
  }
</style>
