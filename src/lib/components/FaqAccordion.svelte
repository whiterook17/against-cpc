<!-- FaqAccordion.svelte — 4 groups, 20 questions, KaTeX inline rendering -->
<script lang="ts">
  import katex from 'katex';

  const groups = [
    {
      id: 'research',
      label: 'About the Research',
      icon: '📄',
      questions: [
        {
          q: 'What is chronology protection?',
          a: `Stephen Hawking proposed in 1992 that nature has a built-in mechanism that prevents time travel from ever being possible. His argument: any attempt to build a time machine would cause quantum effects to build up and destroy it before it could work. He called this the Chronology Protection Conjecture (CPC). This site challenges that argument by identifying 3 specific gaps in his proof.`
        },
        {
          q: 'Who is Hawking and why does this challenge him?',
          a: `Stephen Hawking (1942–2018) was one of the most influential physicists of the 20th century, known for Hawking radiation and his work on black holes. His 1992 CPC paper is widely accepted in physics. This research doesn't claim Hawking was wrong about everything — it identifies 3 specific mathematical gaps in that particular argument. The physics community has known some of these gaps exist; this paper formalises them.`
        },
        {
          q: 'Is this peer-reviewed?',
          a: `Not yet (as of April 2026). This is independent research shared publicly for community review. The epistemic tier system on this site is our way of being transparent: Tier I (teal) = established physics, Tier IV (red) = explicit gaps we acknowledge. If you're a physicist, you can contribute review comments in the Community section.`
        },
        {
          q: 'How is this different from other wormhole theories?',
          a: `Most wormhole theories (Morris-Thorne 1988, Visser 1995) focus on static wormholes — no rotation. The exotic matter cost for static wormholes is enormous: roughly $c^2/(G a_0^2)$ where $a_0$ is the throat radius. This research adds rotation (Kerr metric) to the design. The key result: rotation reduces that cost by a factor of $\\sqrt{1 - a^2/M^2}$, which approaches zero as the spin approaches maximum (near-extremal Kerr). So rotation makes the design cheaper — potentially drastically so.`
        },
        {
          q: "How is this different from Ronald Mallett's approach?",
          a: `Ronald Mallett (University of Connecticut) proposed using a ring laser — rotating light — to create frame-dragging and closed timelike curves. Key differences: Mallett uses electromagnetic energy (light); this research uses massive rotating matter (torus). Mallett needs no exotic matter; this design does but reduces the cost via rotation. Mallett's ring would need to be larger than the observable universe to achieve sufficient frame-dragging (per Olum & Everett). This design uses a massive torus, which achieves much stronger frame-dragging at realistic scales. Both face chronology protection — that's the common challenge.`
        }
      ]
    },
    {
      id: 'physics',
      label: 'About the Physics',
      icon: '⚛️',
      questions: [
        {
          q: 'What is exotic matter?',
          a: `Exotic matter is any material with negative energy density — the opposite of normal matter. Normal matter has positive mass-energy (it attracts gravity). Exotic matter would repel gravity. A wormhole throat needs exotic matter to stay open: without it, gravity collapses the tunnel shut. The Casimir effect (a quantum phenomenon between parallel metal plates) produces tiny amounts of negative energy in the lab. The problem: we need vastly more than we can currently create.`
        },
        {
          q: 'Why does rotation reduce the exotic matter cost?',
          a: `In a static (non-rotating) wormhole, the exotic matter must do all the work holding the throat open against gravity. When the wormhole is embedded in a rotating spacetime (Kerr metric), frame-dragging transfers some of that load to the rotation itself. The exotic matter requirement scales as $|\\tau|_{Kerr} \\sim \\frac{c^2}{G a_0^2} \\sqrt{1 - \\frac{a^2}{M^2}}$. The factor $\\sqrt{1 - a^2/M^2}$ → 0 as spin a → M (near-extremal). So maximum rotation → minimum exotic matter cost.`
        },
        {
          q: 'What is frame-dragging?',
          a: `Frame-dragging (also called the Lense-Thirring effect) is a phenomenon in Einstein's general relativity: a rotating massive object drags the surrounding spacetime with it — like a ball spinning in honey pulls the honey around it. Near a fast-rotating black hole or torus, even light is forced to orbit in the direction of rotation. The frame-dragging rate is $\\omega(r,\\theta) = \\frac{2Mar}{\\Sigma^2 + 2Ma^2r\\sin^2\\theta}$. This twisting of spacetime is what makes the rotating wormhole design work — the rotation is transferred to the throat region.`
        },
        {
          q: 'What is an ergosphere?',
          a: `The ergosphere is a region around a rotating massive object where spacetime rotates so fast that nothing can remain stationary — even if you fire rockets at full power, you're swept along. Its boundary is at $R_{erg} = M + \\sqrt{M^2 - a^2\\cos^2\\theta}$. In our design, the ergosphere is the coupling zone — the region where the torus's rotation is efficiently transferred to the wormhole throat. On the simulator, it's shown as the green dashed circle.`
        },
        {
          q: 'What is the Kerr metric?',
          a: `The Kerr metric is the exact solution to Einstein's equations for a rotating massive object (found by Roy Kerr in 1963). It describes how spacetime is curved and twisted by rotation. All the physics in this paper uses the Kerr metric — it's Tier I (confirmed) physics. The spinning black holes we observe match the Kerr solution precisely. Our design uses a Kerr-like spacetime created by the rotating torus.`
        },
        {
          q: 'What are closed timelike curves (CTCs)?',
          a: `A closed timelike curve is a path through spacetime that loops back on itself in time — following it, you return to your starting point in both space AND time. In other words: time travel to the past. They're allowed by Einstein's equations in certain geometries (Gödel 1949, Kerr black hole interior). Hawking's chronology protection conjecture says CTCs can't form in physically realistic situations. This research disagrees — finding gaps in that argument for rotating wormhole spacetimes.`
        }
      ]
    },
    {
      id: 'design',
      label: 'About the Design',
      icon: '🔧',
      questions: [
        {
          q: 'Can we actually build this?',
          a: `Not with current technology. Two main obstacles: (1) Exotic matter: we need roughly $10^{55}$ J/m² of negative energy density. Current lab maximum (Casimir effect, 2026): about $10^{-3}$ J/m². That's a gap of 58 orders of magnitude. (2) Engineering at gravitational radius scales requires precision far beyond anything we can manufacture. The research shows the physics might allow it — that's different from being able to engineer it. Think of it like heavier-than-air flight in 1800: the physics allowed it, but the engineering took 100 more years.`
        },
        {
          q: 'What is a gravitational radius (rg)?',
          a: `A gravitational radius ($r_g$) is a natural unit for measuring distances near a massive object: $r_g = GM/c^2$. For our Sun (1 solar mass): $r_g$ ≈ 1.477 km. For 2 solar masses: $r_g$ ≈ 2.95 km. The simulator shows all distances in $r_g$ by default, but you can toggle to SI (km/m) using the unit switch. Using $r_g$ keeps the physics scale-independent — the equations work the same whether you're discussing a 1-solar-mass or 10-solar-mass design.`
        },
        {
          q: 'What do the 4 layers do?',
          a: `Each layer handles a different physics task. Layer 1 (Rotating Torus): provides the angular momentum — the engine of frame-dragging. Layer 2 (Coupling Zone / Ergosphere): transfers the rotation from the torus to the throat region. Layer 3 (Casimir Cavity): the exotic matter shell — holds the throat open with negative energy. Layer 4 (Stabilized Throat): the wormhole tunnel itself, oscillating at frequency $f_0 = \\frac{1}{2\\pi}\\sqrt{\\sigma_{throat}/a_0^2}$.`
        },
        {
          q: 'What is the Casimir effect and why is it relevant?',
          a: `The Casimir effect: place two uncharged parallel metal plates very close together in a vacuum, and they attract each other. Reason: quantum vacuum fluctuations between the plates are suppressed (fewer modes fit), while outside there are more. The energy between the plates is lower than the vacuum — effectively negative. This is the only lab-verified source of negative energy density. Our design needs a macroscopic shell of Casimir-like exotic matter. The gap between what's needed ($10^{55}$ J/m²) and what's achievable ($10^{-3}$ J/m²) is Gap 1 in the open problems.`
        },
        {
          q: 'What is a gravitational wave echo?',
          a: `When the wormhole throat is disturbed (e.g., by infalling matter), it oscillates like a struck bell at frequency $f_0$. Each oscillation emits a burst of gravitational waves — detectable in principle by instruments like LIGO. The throat then re-oscillates and emits another burst. These repeating bursts are "echoes." The echo spectrum follows $\\hat{H}(f) = A_0(f/f_0)^2 e^{-\\eta_s f/f_0^2}[1+(f/f_0)^2]^{-1}$ (Eq. 9b). If we detect a signal matching this template in LIGO O5 data, it's an observational signature of a wormhole-like object.`
        }
      ]
    },
    {
      id: 'site',
      label: 'About This Site',
      icon: '💻',
      questions: [
        {
          q: 'How do I use the simulator?',
          a: `Go to "Explore the Physics" → "See It In Action" tab. You'll see 4 canvas views and 5 parameter sliders. Start by selecting a preset from the dropdown (try "Near-Extremal"). Then move the "Rotation Speed" slider and watch all 4 views update. Each view shows a different aspect: Top-Down (spatial layout), Side Cross-Section (layers), Spacetime Curvature (how mass bends space), Time Diagram (can you travel backwards?). Click any labeled element (torus, throat, ergosphere) for a detailed info card.`
        },
        {
          q: 'Can I download the paper?',
          a: `Yes. On the "Read the Paper" page, look at the right sidebar. You'll find download buttons for PDF and Word (DOCX) formats. The PDF is best for reading and printing. The DOCX is best if you want to annotate or reference specific passages. A Quarto source file is also available for researchers who want to verify the build process.`
        },
        {
          q: 'How do I cite this work?',
          a: `On the "Read the Paper" page, click the "Copy Citation" button in the right sidebar. It copies this BibTeX to your clipboard:\n\n@unpublished{danny2026cpc,\n  author = {Danny},\n  title  = {Against Chronology Protection},\n  year   = {2026},\n  month  = {April},\n  note   = {Available at againstcpc.com}\n}`
        },
        {
          q: 'I found an error. Where do I report it?',
          a: `Use the submission form at the bottom of this page. Set Category to "Corrections" and reference the specific section and equation number. Be as specific as possible: "Equation 5.7 assumes X, but X is only valid when Y." We review all corrections carefully. If you're right, we'll update the paper and credit your contribution.`
        },
        {
          q: 'Can I contribute to solving the open problems?',
          a: `Yes, that's exactly what this section is for. We're looking for: (1) mathematical theorems bridging gaps in our argument, (2) references to papers we may have missed, (3) alternative approaches, (4) simulations or numerical results. You don't have to be a physicist — engineering insights, observational ideas, and even well-formed questions all help. Use the submission form below. Choose the relevant "Problem" from the dropdown.`
        },
        {
          q: 'Why are some things colored red?',
          a: `Red (Tier IV) means we're explicitly flagging a gap in our own argument — something we don't know how to prove yet. We use a 4-color system: Teal (confirmed physics), Gold (reasonable extrapolation), Purple (speculative but consistent), Red (acknowledged gap). Red doesn't mean wrong — it means unproven. We show it openly so you know exactly where the weaknesses are. Most physics papers don't label their uncertainties this explicitly.`
        }
      ]
    }
  ];

  // Per-group open index: null = all closed, number = that index is open
  let openIndex: Record<string, number | null> = $state(
    Object.fromEntries(groups.map(g => [g.id, null]))
  );

  function toggle(groupId: string, idx: number) {
    openIndex = {
      ...openIndex,
      [groupId]: openIndex[groupId] === idx ? null : idx
    };
  }

  function renderAnswer(text: string): string {
    // Render $$...$$ (display) then $...$ (inline)
    return text
      .replace(/\$\$([^$]+)\$\$/g, (_, math) => {
        try { return katex.renderToString(math, { displayMode: true, throwOnError: false }); }
        catch { return math; }
      })
      .replace(/\$([^$\n]+)\$/g, (_, math) => {
        try { return katex.renderToString(math, { displayMode: false, throwOnError: false }); }
        catch { return math; }
      });
  }
</script>

<section class="faq-section" id="faq">
  <div class="faq-header">
    <h2>Frequently Asked Questions</h2>
    <p class="faq-subtitle">
      Everything you need to understand this research — from first principles to technical details.
    </p>
  </div>

  <div class="faq-groups">
    {#each groups as group (group.id)}
      <div class="faq-group">
        <div class="group-header">
          <span class="group-icon" aria-hidden="true">{group.icon}</span>
          <h3 class="group-label">{group.label}</h3>
        </div>

        <div class="group-items">
          {#each group.questions as item, idx (idx)}
            {@const open = openIndex[group.id] === idx}
            <div class="faq-item" class:open>
              <button
                class="faq-question"
                onclick={() => toggle(group.id, idx)}
                aria-expanded={open}
              >
                <span class="question-text">{item.q}</span>
                <span class="faq-chevron" class:rotated={open} aria-hidden="true">›</span>
              </button>

              {#if open}
                <div class="faq-answer">
                  <p>{@html renderAnswer(item.a)}</p>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .faq-section {
    scroll-margin-top: 80px;
  }

  .faq-header {
    margin-bottom: 32px;
  }

  .faq-header h2 {
    font-family: var(--font-display);
    font-size: 22px;
    color: var(--teal);
    margin: 0 0 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .faq-subtitle {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--sub);
    margin: 0;
  }

  .faq-groups {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .faq-group {
    border: 1px solid var(--dim);
    border-radius: 4px;
    overflow: hidden;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--panel);
    border-bottom: 1px solid var(--dim);
  }

  .group-icon {
    font-size: 18px;
  }

  .group-label {
    font-family: var(--font-display);
    font-size: 13px;
    color: var(--text);
    margin: 0;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .group-items {
    background: var(--navy);
  }

  .faq-item {
    border-bottom: 1px solid var(--dim);
  }

  .faq-item:last-child {
    border-bottom: none;
  }

  .faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .faq-question:hover {
    background: rgba(0, 200, 200, 0.04);
  }

  .faq-item.open .faq-question {
    background: rgba(0, 200, 200, 0.06);
  }

  .question-text {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    line-height: 1.5;
  }

  .faq-chevron {
    font-size: 20px;
    color: var(--teal);
    flex-shrink: 0;
    display: inline-block;
    transition: transform 0.2s ease;
  }

  .faq-chevron.rotated {
    transform: rotate(90deg);
  }

  .faq-answer {
    padding: 0 20px 20px;
    border-top: 1px solid var(--dim);
    background: rgba(0, 200, 200, 0.02);
  }

  .faq-answer p {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
    margin: 16px 0 0;
    white-space: pre-line;
  }

  @media (max-width: 767px) {
    .faq-question {
      padding: 14px 16px;
    }
    .faq-answer {
      padding: 0 16px 16px;
    }
  }
</style>
