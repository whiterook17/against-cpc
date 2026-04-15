<!-- src/lib/components/Nav.svelte -->
<script lang="ts">
  import { page }          from '$app/stores';
  import { mobileNavOpen } from '$lib/stores/ui.js';
  import { gsap }          from 'gsap';

  const links = [
    { href: '/',                        label: 'Overview'   },
    { href: '/paper',                   label: 'The Paper'  },
    { href: '/construct',               label: 'Construct'  },
    { href: '/construct/simulator',     label: 'Simulator'  },
    { href: '/discuss',                 label: 'Discuss'    },
  ];

  function isActive(href: string): boolean {
    return $page.url.pathname === href ||
           (href !== '/' && $page.url.pathname.startsWith(href));
  }

  let hamburger: HTMLButtonElement | null = $state(null);

  function toggleMobile() {
    mobileNavOpen.update(v => !v);
    gsap.to('.mobile-menu', {
      height:  $mobileNavOpen ? 'auto' : 0,
      opacity: $mobileNavOpen ? 1 : 0,
      duration: 0.25,
      ease: 'power2.inOut',
    });
  }
</script>

<header class="nav">
  <div class="nav-brand">
    <span class="brand-title">Against CPC</span>
    <span class="brand-sub">Danny · 2026</span>
  </div>

  <!-- Desktop links -->
  <nav class="nav-links" aria-label="Primary navigation">
    {#each links as { href, label }}
      <a {href} class="nav-link" class:active={isActive(href)}>
        {label}
      </a>
    {/each}
  </nav>

  <span class="nav-badge">THEORETICAL</span>

  <!-- Mobile hamburger -->
  <button
    class="hamburger"
    bind:this={hamburger}
    onclick={toggleMobile}
    aria-label="Toggle navigation menu"
    aria-expanded={$mobileNavOpen}
  >
    <span></span><span></span><span></span>
  </button>
</header>

<!-- Mobile dropdown -->
<div class="mobile-menu" style="height:0;overflow:hidden;opacity:0" role="navigation" aria-label="Mobile navigation">
  {#each links as { href, label }}
    <a
      {href}
      class="mobile-link"
      class:active={isActive(href)}
      onclick={() => mobileNavOpen.set(false)}
    >
      {label}
    </a>
  {/each}
</div>

<style>
  .nav {
    border-bottom: 1px solid var(--dim);
    padding: 14px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    background: var(--deep);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-brand {
    display: flex;
    align-items: baseline;
    gap: 0;
    flex-shrink: 0;
  }

  .brand-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--teal);
    text-transform: uppercase;
  }

  .brand-sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--sub);
    margin-left: 12px;
  }

  .nav-links {
    display: flex;
    gap: 4px;
    margin-left: 24px;
  }

  .nav-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--sub);
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 2px;
    text-transform: uppercase;
    transition: color 0.15s, background 0.15s;
  }

  .nav-link:hover {
    color: var(--text);
    background: rgba(0, 200, 200, 0.06);
    text-decoration: none;
  }

  .nav-link.active {
    color: var(--teal);
    background: rgba(0, 200, 200, 0.1);
  }

  .nav-badge {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--gold);
    border: 1px solid var(--gold);
    padding: 3px 10px;
    letter-spacing: 2px;
    flex-shrink: 0;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
  }

  .hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--teal);
  }

  .mobile-menu {
    background: var(--deep);
    border-bottom: 1px solid var(--dim);
    display: flex;
    flex-direction: column;
  }

  .mobile-link {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--sub);
    text-decoration: none;
    padding: 14px 28px;
    border-bottom: 1px solid var(--dim);
    text-transform: uppercase;
  }

  .mobile-link:hover {
    text-decoration: none;
    color: var(--text);
  }

  .mobile-link.active {
    color: var(--teal);
  }

  @media (max-width: 767px) {
    .nav-links { display: none; }
    .hamburger  { display: flex; }
    .nav-badge  { display: none; }
  }
</style>
