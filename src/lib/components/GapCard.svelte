<!-- src/lib/components/GapCard.svelte -->
<!-- Research gap tracker card. Click scrolls to filtered comment list. Svelte 5 runes. -->
<script lang="ts">
  import { activeGap, activeCategory } from '$lib/stores/discuss.js';

  interface Props {
    number:       number;
    title:        string;
    description:  string;
    needed:       string;
    status:       'OPEN' | 'CLOSED';
    commentCount: number;
    ideaCount:    number;
  }
  let { number, title, description, needed, status, commentCount, ideaCount }: Props = $props();

  function handleClick() {
    // Filter comments to this gap and scroll to list
    activeGap.set(number);
    activeCategory.set('ALL');
    const el = document.getElementById('comment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }
</script>

<div
  class="gap-card"
  class:open={status === 'OPEN'}
  role="button"
  tabindex="0"
  aria-label="Gap {number}: {title}. Status {status}. Click to view comments."
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <div class="card-header">
    <span class="gap-number">GAP {number}</span>
    <span class="status-badge" class:open={status === 'OPEN'}>{status}</span>
  </div>

  <h3 class="card-title">{title}</h3>
  <p class="card-desc">{description}</p>

  <div class="needed-block">
    <span class="needed-label">NEEDED:</span>
    <span class="needed-text">{needed}</span>
  </div>

  <div class="card-footer">
    <span class="meta-item">{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
    <span class="meta-sep">·</span>
    <span class="meta-item">{ideaCount} idea{ideaCount !== 1 ? 's' : ''}</span>
    <span class="view-link">view discussion →</span>
  </div>
</div>

<style>
  .gap-card {
    background: var(--deep);
    border: 1px solid var(--dim);
    border-left: 4px solid var(--dim);
    border-radius: 3px;
    padding: 18px 20px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .gap-card.open {
    border-left-color: var(--red);
  }
  .gap-card:hover, .gap-card:focus-visible {
    background: rgba(224, 64, 64, 0.04);
    border-color: var(--red);
    outline: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .gap-number {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--red);
    text-transform: uppercase;
  }
  .status-badge {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    padding: 2px 8px;
    border-radius: 2px;
    border: 1px solid var(--dim);
    color: var(--sub);
    text-transform: uppercase;
  }
  .status-badge.open {
    border-color: var(--red);
    color: var(--red);
    background: rgba(224, 64, 64, 0.08);
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text);
    text-transform: uppercase;
    margin: 0;
    line-height: 1.3;
  }
  .card-desc {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--sub);
    line-height: 1.5;
    margin: 0;
  }

  .needed-block {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 8px 10px;
    background: rgba(224, 64, 64, 0.05);
    border-radius: 2px;
    border-left: 2px solid var(--red);
  }
  .needed-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--red);
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .needed-text {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--text);
    line-height: 1.4;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }
  .meta-item {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
  }
  .meta-sep { color: var(--dim); font-size: 10px; }
  .view-link {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--teal);
    opacity: 0.7;
  }
  .gap-card:hover .view-link { opacity: 1; }
</style>
