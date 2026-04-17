<!-- src/lib/components/DesktopRequired.svelte -->
<!-- Pure-CSS mobile block — no JS, no flicker, SSR-safe -->
<script lang="ts">
  let {
    title = 'Desktop Required',
    children,
  }: {
    title?: string;
    children: import('svelte').Snippet;
  } = $props();
</script>

<div class="mobile-block">
  <div class="content">
    <h1>{title}</h1>
    <p>This page requires a desktop browser.</p>
    <p class="muted">
      The interactive visualisations on this page need a larger screen
      and precise pointer input. Please revisit on a desktop or laptop
      for the intended experience.
    </p>
  </div>
</div>

<div class="desktop-content">
  {@render children()}
</div>

<style>
  /* Desktop default — hide block, show content */
  .mobile-block   { display: none; }
  .desktop-content { display: contents; }

  /* Mobile — show block, hide content */
  @media (max-width: 767px) {
    .mobile-block {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 57px);
      background: var(--navy);
      padding: 40px 24px;
    }
    .content {
      max-width: 440px;
      text-align: center;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--teal);
      margin-bottom: 16px;
    }
    p {
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--text);
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .muted {
      color: var(--sub);
    }
    .desktop-content { display: none; }
  }
</style>
