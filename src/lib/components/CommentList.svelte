<!-- src/lib/components/CommentList.svelte -->
<!-- Filtered comment list with KaTeX rendering and threaded replies. Svelte 5 runes. -->
<script lang="ts">
  import { filteredComments, activeGap } from '$lib/stores/discuss.js';
  import katex from 'katex';

  interface Comment {
    id:         string;
    name:       string;
    background: string;
    category:   string;
    gap_ref:    number | null;
    body:       string;
    approved:   boolean;
    created_at: string;
    reply_to?:  string;
  }

  const BACKGROUND_LABELS: Record<string, string> = {
    physicist:   'Physicist',
    mathematician: 'Mathematician',
    engineer:    'Engineer',
    student:     'Student',
    other:       'Other',
  };

  const CATEGORY_COLOURS: Record<string, string> = {
    'MATHEMATICAL GAP': 'var(--red)',
    'ENGINEERING':      'var(--gold)',
    'OBSERVATIONAL':    'var(--teal)',
    'THEORETICAL':      'var(--purple)',
    'CORRECTION':       'var(--green)',
    'GENERAL':          'var(--sub)',
  };

  /**
   * Render inline $...$ and block $$...$$ in a comment body.
   * Returns HTML string with KaTeX.
   */
  function renderBody(text: string): string {
    // Block math: $$...$$
    let out = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
      try {
        return `<span class="math-block">${katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</span>`;
      } catch { return `<code>$$${latex}$$</code>`; }
    });
    // Inline math: $...$
    out = out.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
      } catch { return `<code>$${latex}$</code>`; }
    });
    // Newlines → <br>
    return out.replace(/\n/g, '<br>');
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  }

  // Group: top-level comments + their replies
  const topLevel = $derived(
    $filteredComments.filter((c: Comment) => !c.reply_to)
  );
  const repliesFor = $derived((id: string) =>
    $filteredComments.filter((c: Comment) => c.reply_to === id)
  );

  function clearGapFilter() { activeGap.set(null); }
</script>

<div class="comment-list" id="comment-section">
  <div class="list-header">
    <span class="list-count">{$filteredComments.length} comment{$filteredComments.length !== 1 ? 's' : ''}</span>
    {#if $activeGap !== null}
      <button class="clear-filter" onclick={clearGapFilter}>
        Gap {$activeGap} ✕ clear filter
      </button>
    {/if}
  </div>

  {#if topLevel.length === 0}
    <div class="empty-state">
      <p>No comments yet for this filter. Be the first to contribute below.</p>
    </div>
  {:else}
    <div class="comments">
      {#each topLevel as comment (comment.id)}
        <article class="comment-card">
          <div class="comment-meta">
            <span class="comment-name">{comment.name || 'Anonymous'}</span>
            {#if comment.background}
              <span class="comment-bg">{BACKGROUND_LABELS[comment.background] ?? comment.background}</span>
            {/if}
            <span class="comment-date">{formatDate(comment.created_at)}</span>
            <span
              class="comment-cat"
              style="color:{CATEGORY_COLOURS[comment.category] ?? 'var(--sub)'};border-color:{CATEGORY_COLOURS[comment.category] ?? 'var(--dim)'}"
            >{comment.category}</span>
            {#if comment.gap_ref}
              <span class="comment-gap">Gap {comment.gap_ref}</span>
            {/if}
          </div>
          <div class="comment-body">{@html renderBody(comment.body)}</div>

          <!-- Threaded replies -->
          {#each repliesFor(comment.id) as reply (reply.id)}
            <div class="reply-card">
              <div class="comment-meta">
                <span class="comment-name">{reply.name || 'Anonymous'}</span>
                {#if reply.background}
                  <span class="comment-bg">{BACKGROUND_LABELS[reply.background] ?? reply.background}</span>
                {/if}
                <span class="comment-date">{formatDate(reply.created_at)}</span>
              </div>
              <div class="comment-body">{@html renderBody(reply.body)}</div>
            </div>
          {/each}
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .comment-list { display: flex; flex-direction: column; gap: 0; }

  .list-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0 10px;
    border-bottom: 1px solid var(--dim);
    margin-bottom: 16px;
  }
  .list-count { font-family: var(--font-mono); font-size: 11px; color: var(--sub); letter-spacing: 1px; }
  .clear-filter {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    color: var(--red); background: none; border: 1px solid var(--red);
    border-radius: 10px; padding: 2px 10px; cursor: pointer;
    transition: background 0.15s;
  }
  .clear-filter:hover { background: rgba(224,64,64,0.1); }

  .empty-state {
    padding: 32px 0;
    font-family: var(--font-body); font-size: 13px; color: var(--sub);
    text-align: center;
  }

  .comments { display: flex; flex-direction: column; gap: 16px; }

  .comment-card {
    background: var(--deep);
    border: 1px solid var(--dim);
    border-radius: 3px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .comment-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .comment-name {
    font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--teal);
  }
  .comment-bg {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px;
    color: var(--sub); border: 1px solid var(--dim); border-radius: 2px; padding: 1px 6px;
  }
  .comment-date { font-family: var(--font-mono); font-size: 10px; color: var(--sub); margin-left: auto; }
  .comment-cat {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px;
    border: 1px solid; border-radius: 2px; padding: 1px 6px; text-transform: uppercase;
  }
  .comment-gap {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 1px;
    color: var(--red); border: 1px solid var(--red); border-radius: 2px; padding: 1px 6px;
  }

  .comment-body {
    font-family: var(--font-body); font-size: 13px; color: var(--text); line-height: 1.7;
  }
  :global(.comment-body .math-block) {
    display: block; overflow-x: auto; padding: 8px 0;
  }

  .reply-card {
    margin-top: 4px;
    padding: 12px 14px;
    background: rgba(255,255,255,0.02);
    border-left: 2px solid var(--dim);
    border-radius: 0 3px 3px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
