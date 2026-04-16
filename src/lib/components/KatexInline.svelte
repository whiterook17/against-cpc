<!-- KatexInline.svelte — inline equation, SSR-rendered, no equation number -->
<script lang="ts">
  import katex from 'katex';

  let { latex, description }: {
    latex: string;
    description?: string;
  } = $props();

  const rendered = $derived(
    katex.renderToString(latex, { displayMode: false, throwOnError: false })
  );
</script>

{#if description}
  <span role="math" aria-label={description}>
    <span class="sr-only">{description}</span>
    <span aria-hidden="true">{@html rendered}</span>
  </span>
{:else}
  <span>{@html rendered}</span>
{/if}
