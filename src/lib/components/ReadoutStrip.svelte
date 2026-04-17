<!-- src/lib/components/ReadoutStrip.svelte -->
<!-- Live computed-value readout bar. All values tween via GSAP. Svelte 5 runes. -->
<script lang="ts">
  import { computed } from '$lib/stores/computed.js';
  import { tau_SI, feasibility_gap_orders, echo_interval, echoes_detectable } from '$lib/stores/computed.js';
  import { gsap } from 'gsap';

  interface Props {
    onPerturb: () => void;
  }
  let { onPerturb }: Props = $props();

  // Tweened display values
  let d_omega      = $state(0);
  let d_kerr_pct   = $state(100);
  let d_f0         = $state(0);
  let d_tau_exp    = $state(0);
  let d_stability  = $state(0);
  let d_echo_dt    = $state(0);

  // Show tau context card
  let showTauCard  = $state(false);

  function tween(setter: (v: number) => void, target: number) {
    gsap.to({ v: 0 }, {
      v: 1, duration: 0.25, ease: 'power1.out',
      onUpdate() {
        // @ts-ignore
        setter(target);
      },
    });
  }

  $effect(() => {
    const c = $computed;
    gsap.to({ v: d_omega      }, { v: c.omega_throat,                 duration: 0.25, ease: 'power1.out', onUpdate() { d_omega      = (this as any).targets()[0].v; } });
    gsap.to({ v: d_kerr_pct   }, { v: c.kerr_factor * 100,            duration: 0.25, ease: 'power1.out', onUpdate() { d_kerr_pct   = (this as any).targets()[0].v; } });
    gsap.to({ v: d_f0         }, { v: c.f0,                           duration: 0.25, ease: 'power1.out', onUpdate() { d_f0         = (this as any).targets()[0].v; } });
    gsap.to({ v: d_stability  }, { v: c.stability_index * 100,        duration: 0.25, ease: 'power1.out', onUpdate() { d_stability  = (this as any).targets()[0].v; } });

    const ei = $echo_interval;
    gsap.to({ v: d_echo_dt    }, { v: isFinite(ei) ? ei : 0,          duration: 0.25, ease: 'power1.out', onUpdate() { d_echo_dt    = (this as any).targets()[0].v; } });
  });

  $effect(() => {
    const tsi = $tau_SI;
    if (tsi > 0) {
      const exp = Math.log10(tsi);
      gsap.to({ v: d_tau_exp }, { v: exp, duration: 0.25, ease: 'power1.out', onUpdate() { d_tau_exp = (this as any).targets()[0].v; } });
    }
  });

  function fmtTau(log10val: number): string {
    const exp = Math.round(log10val);
    const mant = Math.pow(10, log10val - exp);
    return `${mant.toFixed(1)}×10<sup>${exp}</sup>`;
  }
</script>

<div class="readout-strip">
  <div class="readout-cell">
    <span class="label">ω(throat)</span>
    <span class="value">{d_omega.toFixed(4)}</span>
    <span class="unit">rad/s-eq</span>
  </div>
  <div class="readout-cell">
    <span class="label">Kerr factor</span>
    <span class="value">{d_kerr_pct.toFixed(1)}%</span>
  </div>
  <div class="readout-cell">
    <span class="label">f₀</span>
    <span class="value">{d_f0.toFixed(4)}</span>
    <span class="unit">Hz-eq</span>
  </div>

  <div class="readout-cell tau-cell" role="button" tabindex="0"
    onmouseenter={() => showTauCard = true}
    onmouseleave={() => showTauCard = false}
    onfocus={() => showTauCard = true}
    onblur={() => showTauCard = false}
    aria-label="Exotic matter tension required — hover for context"
  >
    <span class="label">τ required</span>
    <span class="value tau-value">{@html fmtTau(d_tau_exp)}</span>
    <span class="unit">J/m²</span>
    {#if showTauCard}
      <div class="tau-card" role="tooltip">
        <div class="tau-row"><span>Required τ:</span><span>{@html fmtTau(d_tau_exp)} J/m²</span></div>
        <div class="tau-row"><span>Casimir lab max:</span><span>~10⁻³ J/m²</span></div>
        <div class="tau-row gap-row"><span>Gap:</span><span>{$feasibility_gap_orders.toFixed(1)} orders of magnitude</span></div>
        <div class="tau-note">Tier IV gap — Casimir-to-shell bridging unresolved.</div>
      </div>
    {/if}
  </div>

  <div class="readout-cell">
    <span class="label">Echo Δt</span>
    <span class="value" class:dim={!$echoes_detectable}>
      {isFinite($echo_interval) ? d_echo_dt.toFixed(2) : '∞'}
    </span>
    <span class="unit">s-eq</span>
  </div>
  <div class="readout-cell">
    <span class="label">Stability</span>
    <span class="value" class:good={d_stability > 60} class:warn={d_stability > 30 && d_stability <= 60} class:bad={d_stability <= 30}>
      {d_stability.toFixed(0)}%
    </span>
  </div>
  <div class="readout-cell">
    <span class="label">Regime</span>
    <span class="value regime"
      class:under={$computed.damping_regime === 'UNDERDAMPED'}
      class:over={$computed.damping_regime === 'OVERDAMPED'}
      class:crit={$computed.damping_regime === 'CRITICAL'}
    >{$computed.damping_regime}</span>
  </div>

  <div class="readout-cell perturb-cell">
    <button class="perturb-btn" onclick={onPerturb} aria-label="Perturb throat — trigger oscillation">
      [PERTURB THROAT]
    </button>
  </div>
</div>

<style>
  .readout-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    background: var(--deep);
    border: 1px solid var(--dim);
    border-radius: 3px;
    overflow: visible;
  }
  .readout-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 16px;
    border-right: 1px solid var(--dim);
    min-width: 120px;
    position: relative;
  }
  .readout-cell:last-child { border-right: none; }
  .label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--sub);
  }
  .value {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--teal);
    line-height: 1;
  }
  .value.dim   { color: var(--sub); }
  .value.good  { color: var(--green); }
  .value.warn  { color: var(--gold); }
  .value.bad   { color: var(--red); }
  .value.regime.under { color: var(--teal); }
  .value.regime.over  { color: var(--gold); }
  .value.regime.crit  { color: var(--purple); }
  .unit {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--sub);
  }
  .tau-cell { cursor: help; }
  .tau-value { color: var(--red); }

  .tau-card {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    width: 320px;
    background: var(--panel);
    border: 1px solid var(--dim);
    border-left: 3px solid var(--red);
    border-radius: 3px;
    padding: 12px 14px;
    z-index: 50;
    pointer-events: none;
  }
  .tau-row {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    padding: 3px 0;
    border-bottom: 1px solid var(--dim);
  }
  .tau-row.gap-row { color: var(--red); }
  .tau-note {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--sub);
    margin-top: 8px;
    line-height: 1.4;
  }

  .perturb-cell { justify-content: center; border-right: none; }
  .perturb-btn {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--purple);
    background: rgba(160, 112, 224, 0.1);
    border: 1px solid var(--purple);
    border-radius: 2px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .perturb-btn:hover {
    background: rgba(160, 112, 224, 0.2);
    color: var(--text);
  }
  .perturb-btn:focus-visible {
    outline: 2px solid var(--teal);
    outline-offset: 3px;
  }
</style>
