<!-- src/routes/construct/+page.svelte — Phase 3 placeholder -->
<svelte:head>
  <title>The Construct — Against Chronology Protection</title>
</svelte:head>

<div class="placeholder">
  <h1>Coming in Phase 3</h1>
  <p>Engineering visualisation: wireframe and hi-fi construct views, exploded layer animation.</p>
  <a href="/">← Back to overview</a>
</div>

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
