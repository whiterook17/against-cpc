<!-- EpistemicCallout.svelte — colour-coded epistemic tier box -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { TIER_CONFIG, type TierNumber } from '$lib/data/tiers.js';

  let { tier, title, children }: {
    tier: TierNumber;
    title: string;
    children?: Snippet;
  } = $props();

  const cfg = $derived(TIER_CONFIG[tier]);
</script>

<div class="callout" style="--accent: {cfg.accent}; --bg: {cfg.faint};">
  <span class="tier-label">{cfg.label}</span>
  {#if title}
    <strong class="callout-title">{title}</strong>
  {/if}
  {#if children}
    <div class="callout-body">{@render children()}</div>
  {/if}
</div>

<style>
  .callout {
    border-left: 4px solid var(--accent);
    background: var(--bg);
    padding: 16px 20px;
    margin-block: 24px;
    border-radius: 2px;
  }

  .tier-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--accent);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .callout-title {
    display: block;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 10px;
  }

  .callout-body {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.55;
    color: var(--text);
  }

  .callout-body :global(p) {
    margin: 0;
  }

  .callout-body :global(p + p) {
    margin-top: 0.75em;
  }
</style>
