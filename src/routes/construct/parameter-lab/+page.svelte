<!-- src/routes/construct/parameter-lab/+page.svelte -->
<script lang="ts">
  import DesktopRequired from '$lib/components/DesktopRequired.svelte';
</script>

<svelte:head>
  <title>Parameter Lab — Against Chronology Protection</title>
</svelte:head>

<DesktopRequired title="Parameter Lab — Desktop Required">
  <div class="placeholder">
    <h1>Coming in Phase 6</h1>
    <p>
      2D parameter space colour map: sweep any two physics parameters,
      visualise computed outputs, toggle constraint overlays, and export results.
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
