<!-- src/routes/construct/simulator/+page.svelte -->
<script lang="ts">
  import DesktopRequired from '$lib/components/DesktopRequired.svelte';
</script>

<svelte:head>
  <title>Wormhole Simulator — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Simulator — Desktop Required">
  <div class="placeholder">
    <h1>Coming in Phase 5</h1>
    <p>
      Interactive wormhole simulator: real-time Kerr spacetime, Web Worker physics,
      parameter sliders, geodesic integration, and GW echo spectrum.
    </p>
    <a href="/construct">← Back to Construct</a>
  </div>
</DesktopRequired>

<style>
  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 57px);
    gap: 16px;
    text-align: center;
    padding: 40px 24px;
  }
  h1 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--teal);
  }
  p {
    font-family: var(--font-body);
    color: var(--sub);
    max-width: 480px;
  }
  a {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 8px;
  }
</style>
