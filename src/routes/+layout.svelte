<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount }       from 'svelte';
  import { page }          from '$app/stores';
  import { gsap }          from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Nav               from '$lib/components/Nav.svelte';
  import '../app.css';

  let { children } = $props();

  let main: HTMLElement | null = $state(null);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
  });

  // Animate in whenever the route changes (or on first mount once main is bound)
  $effect(() => {
    void $page.url.pathname; // track pathname as a dependency
    if (main) {
      const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          main,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    }
  });
</script>

<Nav />

<main bind:this={main}>
  {@render children()}
</main>

<style>
  main {
    min-height: calc(100vh - 57px);
    background: var(--navy);
  }
</style>
