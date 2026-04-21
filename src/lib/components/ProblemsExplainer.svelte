<!-- src/lib/components/ProblemsExplainer.svelte -->
<section class="problems-explainer">
  <h2>What Are "Open Problems"?</h2>

  <p>
    Scientific research always has <strong>gaps</strong> — things we haven't figured out yet.
    This page lists the 4 major gaps in our wormhole design.
  </p>

  <div class="problem-types">
    <div class="problem-type">
      <span class="type-icon">📐</span>
      <p>Some are <strong>mathematical</strong> — we need new theorems to prove certain claims.</p>
    </div>
    <div class="problem-type">
      <span class="type-icon">🔬</span>
      <p>Some are <strong>technological</strong> — we need better lab equipment or experiments.</p>
    </div>
  </div>

  <div class="how-to-help">
    <h3>You can help by:</h3>
    <ul>
      <li>Suggesting approaches to solve these problems</li>
      <li>Pointing out errors in our reasoning</li>
      <li>Sharing relevant research we might have missed</li>
    </ul>
  </div>
</section>

<style>
  .problems-explainer {
    background: var(--panel);
    border: 1px solid var(--dim);
    border-radius: 4px;
    padding: 28px 32px;
    margin-bottom: 32px;
  }
  .problems-explainer h2 {
    font-family: var(--font-display);
    font-size: 18px;
    color: var(--teal);
    margin: 0 0 16px;
    letter-spacing: 1.5px;
  }
  .problems-explainer > p {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    color: var(--text);
    margin: 0 0 20px;
  }
  .problem-types {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .problem-type {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .type-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  .problem-type p {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text);
    margin: 0;
  }
  .how-to-help h3 {
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--gold);
    margin: 0 0 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .how-to-help ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .how-to-help li {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    padding: 4px 0 4px 20px;
    position: relative;
  }
  .how-to-help li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--teal);
  }

  @media (max-width: 767px) {
    .problems-explainer {
      padding: 20px;
    }
    .problem-types {
      grid-template-columns: 1fr;
    }
  }
</style>
