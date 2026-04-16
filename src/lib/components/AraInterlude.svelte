<!-- AraInterlude.svelte — pedagogical character panel for Ara Vasquez -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<aside class="ara-interlude">
  <span class="ara-header">ARA VASQUEZ · PEDAGOGICAL INTERLUDE</span>
  <div class="ara-body">{@render children()}</div>
</aside>

<style>
  .ara-interlude {
    background: var(--deep);
    border-left: 4px solid var(--gold);
    padding: 20px 24px;
    margin-block: 28px;
    border-radius: 2px;
  }

  .ara-header {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--gold);
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .ara-body {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
  }

  .ara-body :global(p) {
    margin: 0;
  }

  .ara-body :global(p + p) {
    margin-top: 0.75em;
  }
</style>
