<!-- src/lib/components/IdeaForm.svelte -->
<!-- Comment/idea submission form. Formspree action, live LaTeX preview. Svelte 5 runes. -->
<script lang="ts">
  import { browser } from '$app/environment';
  import katex from 'katex';

  const BACKGROUND_OPTIONS = [
    { value: '',             label: 'Select background…' },
    { value: 'physicist',   label: 'Physicist' },
    { value: 'mathematician',label: 'Mathematician' },
    { value: 'engineer',    label: 'Engineer' },
    { value: 'student',     label: 'Student' },
    { value: 'other',       label: 'Other' },
  ];
  const CATEGORY_OPTIONS = [
    { value: '',                 label: 'Select category…' },
    { value: 'MATHEMATICAL GAP', label: 'Mathematical Gap' },
    { value: 'ENGINEERING',      label: 'Engineering' },
    { value: 'OBSERVATIONAL',    label: 'Observational' },
    { value: 'THEORETICAL',      label: 'Theoretical' },
    { value: 'CORRECTION',       label: 'Correction' },
    { value: 'GENERAL',          label: 'General' },
  ];
  const GAP_OPTIONS = [
    { value: '',  label: 'Not gap-specific' },
    { value: '1', label: 'Gap 1 — Ford–Roman Bridging Theorem' },
    { value: '2', label: 'Gap 2 — KRW Non-Compact Extension' },
    { value: '3', label: 'Gap 3 — Mixed-State QFT Analysis' },
    { value: '4', label: 'Gap 4 — Rotating Exotic Matter Solution' },
  ];

  // Form field state
  let nameVal       = $state('');
  let backgroundVal = $state('');
  let categoryVal   = $state('');
  let gapRefVal     = $state('');
  let bodyVal       = $state('');
  let submitted     = $state(false);
  let submitting    = $state(false);

  // Live LaTeX preview
  const previewHtml = $derived(() => {
    if (!browser || !bodyVal.trim()) return '';
    let out = bodyVal
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => {
        try { return `<span class="preview-block">${katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</span>`; }
        catch { return `<code>$$${latex}$$</code>`; }
      })
      .replace(/\$([^$\n]+?)\$/g, (_, latex) => {
        try { return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false }); }
        catch { return `<code>$${latex}$</code>`; }
      })
      .replace(/\n/g, '<br>');
    return out;
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!browser || submitting) return;
    submitting = true;
    const form = e.target as HTMLFormElement;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        submitted = true;
        nameVal = ''; backgroundVal = ''; categoryVal = ''; gapRefVal = ''; bodyVal = '';
      } else {
        alert('Submission failed — please try again or email directly.');
      }
    } catch {
      alert('Network error — please check your connection and try again.');
    } finally {
      submitting = false;
    }
  }
</script>

<div class="form-wrap" id="submit-form">
  <div class="form-header">
    <h3 class="form-title">SUBMIT AN IDEA OR COMMENT</h3>
    <p class="form-sub">
      All fields except body are optional. LaTeX is supported in the body using
      <code>$...$</code> for inline and <code>$$...$$</code> for display math.
      Comments are reviewed before appearing publicly.
    </p>
  </div>

  {#if submitted}
    <div class="success-state">
      <span class="success-icon">✓</span>
      <div>
        <strong>Submitted — awaiting approval.</strong>
        <p>Thank you for contributing. Your comment will appear once reviewed.</p>
      </div>
      <button class="reset-btn" onclick={() => submitted = false}>Submit another</button>
    </div>
  {:else}
    <form
      class="idea-form"
      action="https://formspree.io/f/PLACEHOLDER"
      method="POST"
      onsubmit={handleSubmit}
    >
      <div class="form-row two-col">
        <div class="field-group">
          <label class="field-label" for="field-name">NAME (optional)</label>
          <input
            id="field-name"
            name="name"
            type="text"
            class="field-input"
            placeholder="Your name or handle"
            bind:value={nameVal}
            autocomplete="name"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="field-background">BACKGROUND</label>
          <select id="field-background" name="background" class="field-select" bind:value={backgroundVal}>
            {#each BACKGROUND_OPTIONS as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="form-row two-col">
        <div class="field-group">
          <label class="field-label" for="field-category">CATEGORY <span class="req">*</span></label>
          <select id="field-category" name="category" class="field-select" required bind:value={categoryVal}>
            {#each CATEGORY_OPTIONS as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="field-gap">GAP REFERENCE</label>
          <select id="field-gap" name="gap_ref" class="field-select" bind:value={gapRefVal}>
            {#each GAP_OPTIONS as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="field-body">COMMENT / IDEA <span class="req">*</span></label>
        <textarea
          id="field-body"
          name="body"
          class="field-textarea"
          placeholder="Your comment, question, or idea. Use $...$ for inline LaTeX and $$...$$ for display equations."
          required
          minlength="20"
          bind:value={bodyVal}
          rows="7"
        ></textarea>
      </div>

      <!-- Live LaTeX preview -->
      {#if bodyVal.trim() && browser}
        <div class="latex-preview">
          <div class="preview-label">PREVIEW</div>
          <div class="preview-body">{@html previewHtml()}</div>
        </div>
      {/if}

      <!-- Honeypot anti-spam -->
      <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />
      <input type="hidden" name="_subject" value="New comment — Against CPC discussion" />

      <div class="form-actions">
        <button type="submit" class="submit-btn" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : '[SUBMIT COMMENT]'}
        </button>
        <span class="form-note">Comments are moderated before appearing publicly.</span>
      </div>
    </form>
  {/if}
</div>

<style>
  .form-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .form-header { display: flex; flex-direction: column; gap: 6px; }
  .form-title {
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    letter-spacing: 3px; color: var(--teal); text-transform: uppercase;
    margin: 0;
  }
  .form-sub {
    font-family: var(--font-body); font-size: 12px; color: var(--sub); line-height: 1.5; margin: 0;
  }
  .form-sub code {
    font-family: var(--font-mono); font-size: 11px; color: var(--text);
    background: rgba(255,255,255,0.05); padding: 1px 4px; border-radius: 2px;
  }

  .idea-form { display: flex; flex-direction: column; gap: 16px; }

  .form-row { display: flex; gap: 16px; }
  .form-row.two-col > * { flex: 1; min-width: 0; }
  @media (max-width: 600px) { .form-row.two-col { flex-direction: column; } }

  .field-group { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--sub);
  }
  .req { color: var(--red); }

  .field-input, .field-select, .field-textarea {
    font-family: var(--font-mono); font-size: 12px; color: var(--text);
    background: var(--deep); border: 1px solid var(--dim); border-radius: 2px;
    padding: 8px 10px; transition: border-color 0.15s;
    width: 100%; box-sizing: border-box;
  }
  .field-input:focus, .field-select:focus, .field-textarea:focus {
    outline: none; border-color: var(--teal);
  }
  .field-select { appearance: none; cursor: pointer; }
  .field-textarea { resize: vertical; min-height: 140px; font-family: var(--font-body); line-height: 1.6; }

  .latex-preview {
    border: 1px solid var(--dim); border-radius: 3px;
    background: rgba(0,200,200,0.03); overflow: hidden;
  }
  .preview-label {
    font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--teal);
    padding: 5px 12px; border-bottom: 1px solid var(--dim);
    background: rgba(0,200,200,0.05);
  }
  .preview-body {
    font-family: var(--font-body); font-size: 13px; color: var(--text);
    line-height: 1.7; padding: 12px 14px;
  }
  :global(.preview-body .preview-block) { display: block; overflow-x: auto; padding: 6px 0; }

  .form-actions {
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  .submit-btn {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--teal);
    background: rgba(0,200,200,0.08); border: 1px solid var(--teal);
    border-radius: 2px; padding: 9px 20px; cursor: pointer;
    transition: background 0.15s;
  }
  .submit-btn:hover:not(:disabled) { background: rgba(0,200,200,0.16); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .submit-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
  .form-note { font-family: var(--font-mono); font-size: 10px; color: var(--sub); }

  /* Success state */
  .success-state {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 20px; background: rgba(64,208,128,0.07);
    border: 1px solid var(--green); border-radius: 3px;
  }
  .success-icon { font-size: 20px; color: var(--green); line-height: 1; flex-shrink: 0; }
  .success-state strong { font-family: var(--font-mono); font-size: 12px; color: var(--green); display: block; margin-bottom: 4px; }
  .success-state p { font-family: var(--font-body); font-size: 12px; color: var(--sub); margin: 0; }
  .reset-btn {
    margin-left: auto; font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px;
    color: var(--sub); background: none; border: 1px solid var(--dim); border-radius: 2px;
    padding: 5px 12px; cursor: pointer; flex-shrink: 0;
  }
  .reset-btn:hover { color: var(--text); border-color: var(--sub); }
</style>
