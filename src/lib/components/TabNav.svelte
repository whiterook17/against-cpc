<!-- src/lib/components/TabNav.svelte -->
<!-- Reusable top-level tab navigation bar. Svelte 5 runes. -->
<script lang="ts">
  interface Tab { id: string; label: string; }
  interface Props {
    tabs: Tab[];
    activeTab: string;
    onchange?: (id: string) => void;
  }
  let { tabs, activeTab, onchange }: Props = $props();
</script>

<nav class="tab-nav" role="tablist" aria-label="Page sections">
  {#each tabs as tab}
    <button
      class="tab-btn"
      class:active={activeTab === tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      onclick={() => onchange?.(tab.id)}
    >{tab.label}</button>
  {/each}
</nav>

<style>
  .tab-nav {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--dim);
    background: var(--deep);
    padding: 0 28px;
  }
  .tab-btn {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 14px 28px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--sub);
    cursor: pointer;
    position: relative;
    top: 1px;
  }
  .tab-btn:hover {
    color: var(--text);
    background: rgba(0, 200, 200, 0.04);
  }
  .tab-btn.active {
    color: var(--teal);
    border-bottom-color: var(--teal);
  }
  .tab-btn:focus-visible {
    outline: 1px solid var(--teal);
    outline-offset: 2px;
  }
  @media (max-width: 767px) {
    .tab-nav {
      padding: 0;
      flex-direction: column;
    }
    .tab-btn {
      padding: 14px 20px;
      top: 0;
      border-bottom: none;
      border-left: 3px solid transparent;
      text-align: left;
    }
    .tab-btn.active {
      border-left-color: var(--teal);
      border-bottom-color: transparent;
      background: rgba(0, 200, 200, 0.05);
    }
  }
</style>
