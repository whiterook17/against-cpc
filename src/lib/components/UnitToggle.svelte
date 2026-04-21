<!-- UnitToggle.svelte — switches all panels between rg and SI. Svelte 5 runes. -->
<script lang="ts">
  import { unitMode } from '$lib/stores/units.js';
</script>

<div class="unit-toggle-wrap">
  <span class="toggle-label">Units:</span>

  <div class="toggle-track">
    <button
      class="toggle-option"
      class:active={$unitMode === 'rg'}
      onclick={() => unitMode.set('rg')}
    >r<sub>g</sub></button>
    <button
      class="toggle-option"
      class:active={$unitMode === 'si'}
      onclick={() => unitMode.set('si')}
    >SI</button>
  </div>

  <span class="toggle-hint">
    {#if $unitMode === 'rg'}
      Geometric units (r<sub>g</sub>, M☉)
    {:else}
      Metric units (km, kg)
    {/if}
  </span>
</div>

<style>
  .unit-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toggle-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    letter-spacing: 1px;
  }

  .toggle-track {
    display: flex;
    border: 1px solid var(--dim);
    border-radius: 3px;
    overflow: hidden;
  }

  .toggle-option {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 11px;
    background: none;
    border: none;
    color: var(--sub);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 1px;
    line-height: 1.4;
  }

  .toggle-option:first-child {
    border-right: 1px solid var(--dim);
  }

  .toggle-option.active {
    background: rgba(0, 200, 200, 0.12);
    color: var(--teal);
  }

  .toggle-option:hover:not(.active) {
    background: rgba(0, 200, 200, 0.04);
    color: var(--text);
  }

  .toggle-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    letter-spacing: 0.5px;
  }

  @media (max-width: 767px) {
    .toggle-hint { display: none; }
  }
</style>
