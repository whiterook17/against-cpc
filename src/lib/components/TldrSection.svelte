<!-- src/lib/components/TldrSection.svelte -->
<section class="tldr-section">
  <div class="tldr-icon">🎯</div>
  <h2>TL;DR for Non-Physicists</h2>

  <div class="tldr-content">
    <p class="tldr-claim">
      Stephen Hawking proved time travel is impossible.<br>
      We found 3 gaps in his proof.<br>
      This site explains the physics and makes our case.
    </p>

    <div class="tldr-guide">
      <p class="tldr-guide-label">New to this topic?</p>
      <ul class="tldr-steps">
        <li>→ Start with the claim cards below</li>
        <li>→ Then explore the interactive physics</li>
        <li>→ Read the full paper if you want all the details</li>
      </ul>
    </div>
  </div>
</section>

<style>
  .tldr-section {
    background: var(--panel);
    border: 1px solid var(--dim);
    border-radius: 4px;
    padding: 28px 32px;
    margin: 32px auto;
    max-width: 800px;
  }
  .tldr-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  .tldr-section h2 {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--teal);
    margin: 0 0 20px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .tldr-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .tldr-claim {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    color: var(--text);
    margin: 0;
  }
  .tldr-guide-label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--sub);
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .tldr-steps {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tldr-steps li {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    padding: 4px 0;
  }

  @media (max-width: 767px) {
    .tldr-section {
      padding: 20px;
      margin: 24px 16px;
    }
  }
</style>
