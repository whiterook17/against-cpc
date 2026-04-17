<!-- src/routes/discuss/+page.svelte -->
<!-- Phase 7 — Discussion page. SSR + prerender. Svelte 5 runes. -->
<script lang="ts">
  import { onMount }      from 'svelte';
  import { browser }      from '$app/environment';
  import GapCard          from '$lib/components/GapCard.svelte';
  import CommentList      from '$lib/components/CommentList.svelte';
  import IdeaForm         from '$lib/components/IdeaForm.svelte';
  import {
    activeCategory,
    activeGap,
    allComments,
    CATEGORIES,
  } from '$lib/stores/discuss.js';
  import rawComments from '$lib/data/comments.json';

  // ── Gap data ──────────────────────────────────────────────────────────────
  const gaps = [
    {
      number: 1,
      title: 'Ford–Roman Bridging Theorem',
      description: 'No theorem connecting worldline quantum inequality bounds to thin-shell surface integrals exists in the literature.',
      needed: 'Theorem bridging Ford–Roman bounds to Morris–Thorne exotic shell',
      status: 'OPEN' as const,
    },
    {
      number: 2,
      title: 'KRW Extension to Non-Compactly-Generated Horizons',
      description: 'Klinkhammer–Ravishankar–Wald divergence applies only to compactly-generated chronology horizons.',
      needed: 'Proof or disproof of KRW for traversable wormhole horizon class',
      status: 'OPEN' as const,
    },
    {
      number: 3,
      title: 'Mixed-State QFT at Chronology Horizons',
      description: 'Pure-state boundary conditions assumed throughout CPC literature may be physically inadequate.',
      needed: 'Full mixed-state analysis of stress-energy near chronology horizons',
      status: 'OPEN' as const,
    },
    {
      number: 4,
      title: 'Rotating Exotic Matter Closed-Form Solution',
      description: 'No closed-form Einstein field equation solution with rotating exotic matter source exists.',
      needed: 'Exact simultaneous solution or rigorous numerical existence proof',
      status: 'OPEN' as const,
    },
  ];

  const commentCount = $derived((gapNum: number) =>
    ($allComments as { gap_ref: number | null }[]).filter(c => c.gap_ref === gapNum).length
  );
  const ideaCount = $derived((gapNum: number) =>
    ($allComments as { gap_ref: number | null; category: string }[]).filter(c =>
      c.gap_ref === gapNum &&
      (c.category === 'MATHEMATICAL GAP' || c.category === 'THEORETICAL')
    ).length
  );

  onMount(() => {
    allComments.set(rawComments);
  });
</script>

<svelte:head>
  <title>Discussion — Against Chronology Protection</title>
  <meta name="description" content="Community discussion of the open mathematical gaps in the chronology protection conjecture." />
</svelte:head>

<div class="discuss-page">

  <header class="page-header">
    <div class="breadcrumb">
      <a href="/" class="bc-link">Overview</a>
      <span class="bc-sep">›</span>
      <span class="bc-current">Discussion</span>
    </div>
    <h1 class="page-title">OPEN GAPS &amp; DISCUSSION</h1>
    <p class="page-sub">
      Four unresolved mathematical gaps identified in the paper. Each is a precisely
      formulated missing result. Contributions, corrections, and counterexamples welcome.
    </p>
  </header>

  <div class="page-body">

    <!-- Gap tracker -->
    <section class="section" aria-labelledby="gap-heading">
      <h2 class="section-heading" id="gap-heading">
        <span class="heading-num">01</span>
        OPEN GAPS
        <span class="heading-badge">{gaps.length} identified</span>
      </h2>
      <div class="gap-grid">
        {#each gaps as gap (gap.number)}
          <GapCard
            number={gap.number}
            title={gap.title}
            description={gap.description}
            needed={gap.needed}
            status={gap.status}
            commentCount={commentCount(gap.number)}
            ideaCount={ideaCount(gap.number)}
          />
        {/each}
      </div>
    </section>

    <!-- Category filter + comment list -->
    <section class="section" aria-labelledby="comments-heading">
      <h2 class="section-heading" id="comments-heading">
        <span class="heading-num">02</span>
        DISCUSSION
        {#if $activeGap !== null}
          <span class="heading-badge red-badge">Gap {$activeGap} filtered</span>
        {/if}
      </h2>

      <div class="category-tabs" role="tablist" aria-label="Filter comments by category">
        {#each CATEGORIES as cat}
          <button
            class="cat-tab"
            class:active={$activeCategory === cat}
            role="tab"
            aria-selected={$activeCategory === cat}
            onclick={() => activeCategory.set(cat)}
          >{cat}</button>
        {/each}
      </div>

      <CommentList />
    </section>

    <!-- Submission form -->
    <section class="section" aria-labelledby="form-heading">
      <h2 class="section-heading" id="form-heading">
        <span class="heading-num">03</span>
        CONTRIBUTE
      </h2>
      <p class="section-intro">
        Have a partial proof, a counterexample, a relevant reference, or a question?
        Submit below. All backgrounds welcome — these are genuinely open problems.
      </p>
      <IdeaForm />
    </section>

  </div>

  <footer class="discuss-footer">
    <p>
      Comments are moderated. LaTeX is rendered via KaTeX.
      All four gaps are Tier IV — explicit, precisely formulated open problems.
    </p>
    <a href="/paper" class="footer-link">Read the gap analysis in the paper →</a>
  </footer>

</div>

<style>
  .discuss-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px 64px;
  }

  .page-header {
    padding: 48px 0 32px;
    border-bottom: 1px solid var(--dim);
    margin-bottom: 48px;
  }
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px; margin-bottom: 16px;
  }
  .bc-link { color: var(--sub); text-decoration: none; text-transform: uppercase; }
  .bc-link:hover { color: var(--teal); }
  .bc-sep  { color: var(--dim); }
  .bc-current { color: var(--text); text-transform: uppercase; }
  .page-title {
    font-family: var(--font-display); font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 700; letter-spacing: 4px; color: var(--text); text-transform: uppercase;
    margin: 0 0 12px;
  }
  .page-sub {
    font-family: var(--font-body); font-size: 14px; color: var(--sub);
    line-height: 1.7; max-width: 680px; margin: 0;
  }

  .page-body  { display: flex; flex-direction: column; gap: 56px; }
  .section    { display: flex; flex-direction: column; gap: 20px; }

  .section-heading {
    display: flex; align-items: baseline; gap: 12px;
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    letter-spacing: 3px; color: var(--teal); text-transform: uppercase;
    margin: 0; padding-bottom: 10px; border-bottom: 1px solid var(--dim);
  }
  .heading-num  { color: var(--dim); font-size: 10px; }
  .heading-badge {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px;
    color: var(--sub); border: 1px solid var(--dim); border-radius: 2px;
    padding: 1px 7px; text-transform: uppercase; margin-left: auto;
  }
  .red-badge { color: var(--red); border-color: var(--red); }

  .gap-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (max-width: 640px) { .gap-grid { grid-template-columns: 1fr; } }

  .category-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
  .cat-tab {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    text-transform: uppercase; color: var(--sub);
    background: none; border: 1px solid var(--dim); border-radius: 2px;
    padding: 5px 10px; cursor: pointer;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
  }
  .cat-tab:hover  { color: var(--text); border-color: var(--sub); }
  .cat-tab.active {
    color: var(--teal); border-color: var(--teal);
    background: rgba(0,200,200,0.07);
  }
  .cat-tab:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

  .section-intro {
    font-family: var(--font-body); font-size: 13px; color: var(--sub);
    line-height: 1.6; margin: 0;
  }

  .discuss-footer {
    margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--dim);
    display: flex; flex-direction: column; gap: 8px;
  }
  .discuss-footer p {
    font-family: var(--font-body); font-size: 11px; color: var(--sub); line-height: 1.6; margin: 0;
  }
  .footer-link {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    color: var(--teal); text-decoration: none;
  }
  .footer-link:hover { text-decoration: underline; }
</style>
