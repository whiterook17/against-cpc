<!-- src/lib/components/simulator/ObjectInfoCard.svelte -->
<!-- Slide-in panel from right showing physics info for a clicked object. -->
<script lang="ts">
  interface Props {
    objectId: string | null;
    onClose?: () => void;
  }
  let { objectId, onClose }: Props = $props();

  const INFO: Record<string, { title: string; desc: string; eq: string; section: string }> = {
    torus: {
      title: 'Rotating Dense Matter Torus',
      desc: 'Rapidly spinning ring provides frame-dragging angular momentum transfer to the exotic throat. Mass M and radius R determine the depth of the gravitational well and the extent of the Kerr ergosphere.',
      eq: 'T^{\\mu\\nu}_{\\text{mat}} = (\\rho+p)u^\\mu u^\\nu + p g^{\\mu\\nu}',
      section: '5.1',
    },
    ergosphere: {
      title: 'Ergosphere — Frame-Dragging Zone',
      desc: 'Region where spacetime itself rotates. No stationary observers exist here. The boundary expands toward the equatorial plane as spin increases toward extremal.',
      eq: 'R_{\\text{erg}} = M + \\sqrt{M^2 - a^2 \\cos^2\\theta}',
      section: '5.2',
    },
    throat: {
      title: 'Exotic-Stabilised Throat',
      desc: 'Wormhole throat held open by negative energy density exotic matter. The throat radius oscillates under perturbation and decays according to membrane viscosity η_s.',
      eq: 'T^{\\mu\\nu}_{\\text{ex}}k_\\mu k_\\nu = -\\rho_{\\text{ex}} - \\tau < 0',
      section: '5.3',
    },
    coupling: {
      title: 'Kerr Coupling Zone',
      desc: 'Intermediate region between the ergosphere and throat where frame-dragging effects are harvested to offset exotic matter requirements. Coupling efficiency scales with spin.',
      eq: '\\chi_{\\text{Kerr}} = \\sqrt{1 - a^2/M^2}',
      section: '5.4',
    },
    casimir: {
      title: 'Casimir Exotic Layer',
      desc: 'Thin shell of vacuum-fluctuation-sourced negative energy density surrounding the throat. Surface tension σ sets the fundamental echo frequency f₀.',
      eq: 'f_0 = \\frac{1}{2\\pi}\\sqrt{\\frac{\\sigma}{a_0^2}}',
      section: '5.5',
    },
    field: {
      title: 'Frame-Dragging Field Lines',
      desc: 'Streamlines of the frame-dragging angular velocity field ω(r,θ). Spiral inward toward the ergosphere boundary. Computed at 20 seed angles via RK4 integration.',
      eq: '\\omega(r,\\theta) = \\frac{2Mar}{\\Sigma^2 + 2Ma^2 r\\sin^2\\theta}',
      section: '5.2',
    },
  };

  const item = $derived(objectId ? (INFO[objectId] ?? null) : null);
</script>

{#if item}
  <aside class="info-card" aria-label="Physics object information">
    <button class="close-btn" onclick={onClose} aria-label="Close information panel">×</button>

    <div class="card-tier">§{item.section}</div>
    <h2 class="card-title">{item.title}</h2>
    <p class="card-desc">{item.desc}</p>

    <div class="card-eq">
      <div class="eq-label">Governing equation</div>
      <code class="eq-tex">{item.eq}</code>
    </div>

    <a class="paper-link" href="/paper#section-{item.section}">
      → View in paper §{item.section}
    </a>
  </aside>
{/if}

<style>
  .info-card {
    position: fixed;
    right: 0;
    top: 57px;
    bottom: 0;
    width: 300px;
    background: var(--panel);
    border-left: 1px solid var(--dim);
    padding: 20px 16px 24px;
    overflow-y: auto;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: slide-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 20px;
    line-height: 1;
    color: var(--sub);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
  }
  .close-btn:hover { color: var(--text); }
  .card-tier {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--sub);
  }
  .card-title {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--teal);
    line-height: 1.5;
    margin: 0;
    padding-right: 20px;
  }
  .card-desc {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--text);
    line-height: 1.65;
    margin: 0;
  }
  .card-eq {
    background: var(--deep);
    border: 1px solid var(--dim);
    border-radius: 3px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .eq-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--sub);
  }
  .eq-tex {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--gold);
    word-break: break-all;
    line-height: 1.5;
  }
  .paper-link {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--teal);
    text-decoration: none;
    border-top: 1px solid var(--dim);
    padding-top: 14px;
    margin-top: auto;
  }
  .paper-link:hover { color: var(--text); }
</style>
