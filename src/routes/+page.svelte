<!-- src/routes/+page.svelte — Phase 1 landing hero -->
<script lang="ts">
  import { gsap } from 'gsap';
  import { onMount } from 'svelte';

  onMount(() => {
    // Staggered reveal on load
    gsap.from('.hero-content > *', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.12,
    });
  });
</script>

<svelte:head>
  <title>Against Chronology Protection — Danny</title>
</svelte:head>

<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">Against Chronology Protection</h1>
    <p class="hero-subtitle">On the Insufficiency of Hawking's 1992 Conjecture</p>
    <p class="hero-byline">Danny · April 2026</p>

    <div class="cta-row">
      <a href="/paper"    class="cta-btn">Read Paper</a>
      <a href="/construct" class="cta-btn">Explore Construct</a>
      <a href="/discuss"  class="cta-btn">Join Discussion</a>
    </div>
  </div>
</section>

<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 57px);
    padding: 40px 24px;
  }

  .hero-content {
    text-align: center;
    max-width: 720px;
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 5vw, 3rem);
    font-weight: 900;
    letter-spacing: 4px;
    color: var(--teal);
    text-transform: uppercase;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-family: var(--font-body);
    font-size: clamp(1rem, 2.5vw, 1.35rem);
    font-weight: 300;
    color: var(--text);
    margin-bottom: 12px;
  }

  .hero-byline {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--sub);
    letter-spacing: 2px;
    margin-bottom: 48px;
  }

  .cta-row {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-btn {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text);
    border: 1px solid var(--dim);
    padding: 14px 28px;
    border-radius: 2px;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
  }

  .cta-btn:hover {
    border-color: var(--teal);
    color: var(--teal);
    box-shadow: 0 0 12px rgba(0, 200, 200, 0.18);
    text-decoration: none;
  }
</style>
