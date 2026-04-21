<!-- src/lib/components/ContextBanner.svelte -->
<!-- Feasibility context warning. Dismissible via prop. Svelte 5 runes. -->
<script lang="ts">
  interface Props { dismissible?: boolean; }
  let { dismissible = false }: Props = $props();

  let visible = $state(true);
</script>

{#if visible}
  <div class="context-banner">
    <div class="banner-icon">ℹ️</div>
    <div class="banner-content">
      <h3>Important Context</h3>
      <p>
        This is a <strong>theoretical design</strong>. We cannot build this with current technology —
        it requires exotic matter with negative energy density, which we can only create in
        microscopic amounts in the lab.
      </p>
      <p>
        However, the physics equations <em>might</em> allow it. That's what this research explores.
      </p>
    </div>
    {#if dismissible}
      <button class="banner-close" onclick={() => { visible = false; }} aria-label="Dismiss">×</button>
    {/if}
  </div>
{/if}

<style>
  .context-banner {
    background: color-mix(in srgb, var(--gold) 8%, transparent);
    border: 1px solid var(--gold);
    border-radius: 4px;
    padding: 20px 24px;
    margin-bottom: 0;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    position: relative;
  }
  .banner-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  .banner-content h3 {
    font-family: var(--font-display);
    font-size: 14px;
    color: var(--gold);
    margin: 0 0 8px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .banner-content p {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    margin: 0 0 12px;
  }
  .banner-content p:last-child {
    margin-bottom: 0;
  }
  .banner-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: var(--gold);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .banner-close:hover {
    opacity: 0.7;
  }

  @media (max-width: 767px) {
    .context-banner {
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
    }
    .banner-icon {
      font-size: 20px;
    }
  }
</style>
