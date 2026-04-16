<!-- SectionNavigator.svelte — sticky left sidebar, scroll-tracked section nav -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  let { sections }: {
    sections: Array<{ id: string; number: string; title: string }>;
  } = $props();

  let activeId = $state('');
  let observer: IntersectionObserver | null = null;

  onMount(() => {
    if (!browser) return;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) activeId = e.target.id;
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer!.observe(el);
    });
  });

  onDestroy(() => observer?.disconnect());

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<nav class="section-nav" aria-label="Paper sections">
  {#each sections as { id, number, title }}
    <button
      class="sec-link"
      class:active={activeId === id}
      onclick={() => scrollTo(id)}
    >
      <span class="sec-num">§{number}</span>
      <span class="sec-title">{title}</span>
    </button>
  {/each}
</nav>

<style>
  .section-nav {
    position: sticky;
    top: 80px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-self: flex-start;
  }

  .sec-link {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
    background: none;
    border: none;
    border-left: 2px solid transparent;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 0 2px 2px 0;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .sec-link:hover .sec-num,
  .sec-link:hover .sec-title {
    color: var(--text);
  }

  .sec-link.active {
    background: var(--teal-faint);
    border-left-color: var(--teal);
  }

  .sec-link.active .sec-num,
  .sec-link.active .sec-title {
    color: var(--teal);
  }

  .sec-num {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--sub);
  }

  .sec-title {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--sub);
    line-height: 1.3;
  }
</style>
