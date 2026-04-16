<!-- PaperTools.svelte — sticky right sidebar: download, cite, share -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { gsap } from 'gsap';

  let copiedBib = $state(false);
  let copiedUrl = $state(false);

  const bibtex = `@unpublished{danny2026cpc,
  author  = {Danny},
  title   = {Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture},
  year    = {2026},
  month   = {April},
  note    = {Independent research. Available at againstcpc.com}
}`;

  function pulse(el: HTMLElement) {
    gsap.fromTo(el, { scale: 1 }, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  function copyBib(e: MouseEvent) {
    if (!browser) return;
    navigator.clipboard.writeText(bibtex).then(() => {
      copiedBib = true;
      pulse(e.currentTarget as HTMLElement);
      setTimeout(() => (copiedBib = false), 2000);
    });
  }

  function copyUrl(e: MouseEvent) {
    if (!browser) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      copiedUrl = true;
      pulse(e.currentTarget as HTMLElement);
      setTimeout(() => (copiedUrl = false), 2000);
    });
  }
</script>

<aside class="paper-tools" aria-label="Paper tools">

  <!-- DOWNLOAD -->
  <div class="tools-card">
    <span class="card-header">DOWNLOAD</span>
    <a href="/downloads/against-cpc-full.pdf" download class="tool-btn">
      PDF
    </a>
    <a href="/downloads/against-cpc-full.docx" download class="tool-btn">
      DOCX
    </a>
  </div>

  <!-- CITE -->
  <div class="tools-card">
    <span class="card-header">CITE</span>
    <button class="tool-btn" onclick={copyBib}>
      {copiedBib ? 'Copied!' : 'Copy BibTeX'}
    </button>
  </div>

  <!-- SHARE -->
  <div class="tools-card">
    <span class="card-header">SHARE</span>
    <button class="tool-btn" onclick={copyUrl}>
      {copiedUrl ? 'Copied!' : 'Copy URL'}
    </button>
  </div>

</aside>

<style>
  .paper-tools {
    position: sticky;
    top: 80px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-self: flex-start;
  }

  .tools-card {
    background: var(--panel);
    border: 1px solid var(--dim);
    border-radius: 2px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .card-header {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--sub);
    text-transform: uppercase;
  }

  .tool-btn {
    display: block;
    width: 100%;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--text);
    background: none;
    border: 1px solid var(--dim);
    border-radius: 2px;
    padding: 8px 12px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: border-color 0.15s, color 0.15s;
    box-sizing: border-box;
  }

  .tool-btn:hover {
    border-color: var(--teal);
    color: var(--teal);
    text-decoration: none;
  }
</style>
