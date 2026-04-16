<!-- KatexBlock.svelte — numbered display equation, SSR-rendered -->
<script lang="ts">
  import katex from 'katex';

  let { number, latex, description }: {
    number?: string;
    latex: string;
    description: string;
  } = $props();

  const rendered = $derived(
    katex.renderToString(latex, { displayMode: true, throwOnError: false })
  );
</script>

<div class="eq-wrap" role="math" aria-label={description}>
  <span class="sr-only">{description}</span>
  <div class="eq-body" aria-hidden="true">{@html rendered}</div>
  {#if number}
    <span class="eq-num">({number})</span>
  {/if}
</div>

<style>
  .eq-wrap {
    display: flex;
    align-items: center;
    margin-block: 28px;
    gap: 16px;
  }

  .eq-body {
    flex: 1;
    text-align: center;
    overflow-x: auto;
    /* KaTeX font colour override to match design system */
    color: var(--text);
  }

  /* Ensure KaTeX renders at a readable size */
  .eq-body :global(.katex) {
    font-size: 1.1em;
  }

  .eq-num {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--teal);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
