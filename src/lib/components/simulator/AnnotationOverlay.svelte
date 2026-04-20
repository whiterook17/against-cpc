<!-- src/lib/components/simulator/AnnotationOverlay.svelte -->
<!-- Absolute-positioned annotation labels over a canvas view. -->
<script lang="ts">
  interface Label {
    id: string;
    text: string;
    left: string;
    top: string;
  }
  interface Props {
    labels: Label[];
    accent?: string;
    onLabelClick?: (id: string) => void;
  }
  let { labels, accent = 'teal', onLabelClick }: Props = $props();
</script>

<div class="overlay" aria-hidden="true">
  {#each labels as lbl}
    <button
      class="ann-btn"
      style="left:{lbl.left}; top:{lbl.top}; --accent: var(--{accent})"
      onclick={() => onLabelClick?.(lbl.id)}
    >{lbl.text}</button>
  {/each}
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .ann-btn {
    position: absolute;
    pointer-events: all;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--accent, var(--teal));
    background: rgba(11, 17, 32, 0.78);
    border: 1px solid color-mix(in srgb, var(--accent, var(--teal)) 45%, transparent);
    border-radius: 2px;
    padding: 2px 8px;
    cursor: pointer;
    white-space: nowrap;
    line-height: 1.6;
  }
  .ann-btn:hover {
    color: var(--text);
    border-color: var(--accent, var(--teal));
  }
  .ann-btn:focus-visible {
    outline: 1px solid var(--teal);
    outline-offset: 2px;
  }
</style>
