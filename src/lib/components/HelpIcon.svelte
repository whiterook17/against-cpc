<!-- src/lib/components/HelpIcon.svelte -->
<!-- Reusable ? tooltip. Tap/click to toggle on mobile; hover on desktop. Svelte 5 runes. -->
<script lang="ts">
  interface Props { text?: string; }
  let { text = '' }: Props = $props();

  let showTooltip = $state(false);

  function toggle() { showTooltip = !showTooltip; }
</script>

<div class="help-icon-wrapper">
  <button
    class="help-icon"
    onclick={toggle}
    onmouseenter={() => { showTooltip = true; }}
    onmouseleave={() => { showTooltip = false; }}
    aria-label="Help information"
    aria-expanded={showTooltip}
  >?</button>

  {#if showTooltip}
    <div class="tooltip" role="tooltip">
      {text}
    </div>
  {/if}
</div>

<style>
  .help-icon-wrapper {
    position: relative;
    display: inline-block;
  }
  .help-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--teal);
    background: var(--navy);
    color: var(--teal);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .help-icon:hover {
    background: rgba(0, 200, 200, 0.1);
  }
  .tooltip {
    position: absolute;
    top: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--deep);
    border: 1px solid var(--teal);
    border-radius: 4px;
    padding: 12px 16px;
    width: 280px;
    font-family: var(--font-body);
    font-size: 13px;
    line-height: 1.5;
    color: var(--text);
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .tooltip::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--teal);
  }

  @media (max-width: 767px) {
    .tooltip {
      width: 240px;
      font-size: 12px;
      /* anchor to the right edge so it doesn't overflow left on narrow screens */
      left: auto;
      right: 0;
      transform: none;
    }
    .tooltip::before {
      left: auto;
      right: 6px;
      transform: none;
    }
  }
</style>
