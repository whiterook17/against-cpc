<!-- src/routes/paper/+page.svelte — Phase 2B: complete paper §1–§10 + References -->
<script lang="ts">
  import 'katex/dist/katex.min.css';

  import { browser } from '$app/environment';
  import { gsap }    from 'gsap';

  import SectionNavigator from '$lib/components/SectionNavigator.svelte';
  import PaperTools       from '$lib/components/PaperTools.svelte';
  import EpistemicCallout from '$lib/components/EpistemicCallout.svelte';
  import KatexBlock       from '$lib/components/KatexBlock.svelte';
  import KatexInline      from '$lib/components/KatexInline.svelte';
  import AraInterlude     from '$lib/components/AraInterlude.svelte';
  import DataTable        from '$lib/components/DataTable.svelte';

  const SECTIONS = [
    { id: 'sec-1',    number: '1',   title: 'Introduction' },
    { id: 'sec-2',    number: '2',   title: "Hawking's CPC: Statement and Scope" },
    { id: 'sec-3',    number: '3',   title: 'Gap I — Ford–Roman Quantum Inequality' },
    { id: 'sec-4',    number: '4',   title: 'Gap II — KRW Theorem' },
    { id: 'sec-5',    number: '5',   title: 'Combined Gravitational System' },
    { id: 'sec-6',    number: '6',   title: 'Dynamic Throat Model & GW Echoes' },
    { id: 'sec-7',    number: '7',   title: 'Landauer–Deutsch Bound' },
    { id: 'sec-8',    number: '8',   title: 'Observational Roadmap' },
    { id: 'sec-9',    number: '9',   title: 'Historical & Theological Coda' },
    { id: 'sec-10',   number: '10',  title: 'Conclusion' },
    { id: 'sec-refs', number: 'Ref', title: 'References' },
  ];

  const KRW_HEADERS = ['Spacetime Type', 'Horizon Type', 'KRW Applies?'];
  const KRW_ROWS = [
    ['Misner space',            'Compactly generated',     'Yes — KRW holds'],
    ['Gott two-string',         'Compactly generated',     'Yes — KRW holds'],
    ['Morris–Thorne wormhole',  'Non-compactly generated', 'No — outside theorem scope'],
    ['Li–Gott rotating vacuum', 'Non-compactly generated', 'No — outside theorem scope'],
    ['Rotating Kerr wormhole',  'Non-compactly generated', 'No — outside theorem scope'],
  ];

  const ANCHOR_HEADERS = ['Constant', 'Role', 'Physical Meaning'];
  const ANCHOR_ROWS = [
    [
      'a₀',
      'Equilibrium throat radius; sets the rest position in the oscillator equation',
      "Resting throat size — the wormhole's 'waist' when unperturbed",
    ],
    [
      'σ_throat',
      'ω₀² = σ_throat / a₀² (restoring force)',
      'Surface energy density of exotic shell — acts as a spring constant for throat oscillations',
    ],
    [
      'η_s',
      'Damping coefficient in throat oscillator',
      'Membrane shear viscosity — controls how fast throat oscillations decay; sets echo damping rate',
    ],
  ];

  const DAMPING_HEADERS = ['Regime', 'Condition', 'Physical Outcome'];
  const DAMPING_ROWS = [
    [
      'Underdamped',
      'η_s² < σ_throat / a₀²',
      'Throat oscillates with decaying amplitude — produces a sequence of GW echoes',
    ],
    [
      'Critically damped',
      'η_s² = σ_throat / a₀²',
      'Fastest return to equilibrium with no oscillation — single echo pulse',
    ],
    [
      'Overdamped',
      'η_s² > σ_throat / a₀²',
      'Slow exponential return — echoes too widely spaced to distinguish',
    ],
  ];

  // Mobile tools strip state (mirrors PaperTools sidebar; the sidebar is hidden on small screens)
  const bibtex = `@unpublished{danny2026cpc,
  author  = {Danny},
  title   = {Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture},
  year    = {2026},
  month   = {April},
  note    = {Independent research. Available at againstcpc.com}
}`;
  let stripCopiedBib = $state(false);
  let stripCopiedUrl = $state(false);

  function stripPulse(el: HTMLElement) {
    gsap.fromTo(el, { scale: 1 }, { scale: 1.06, duration: 0.1, yoyo: true, repeat: 1 });
  }
  function stripCopyBib(e: MouseEvent) {
    if (!browser) return;
    navigator.clipboard.writeText(bibtex).then(() => {
      stripCopiedBib = true;
      stripPulse(e.currentTarget as HTMLElement);
      setTimeout(() => (stripCopiedBib = false), 2000);
    });
  }
  function stripCopyUrl(e: MouseEvent) {
    if (!browser) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      stripCopiedUrl = true;
      stripPulse(e.currentTarget as HTMLElement);
      setTimeout(() => (stripCopiedUrl = false), 2000);
    });
  }

  function mobileNavJump(e: Event) {
    if (!browser) return;
    const id = (e.target as HTMLSelectElement).value;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>The Paper — Against Chronology Protection</title>
  <meta
    name="description"
    content="Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture — full paper by Danny, April 2026."
  />
</svelte:head>

<div class="paper-layout">

  <!-- Left: section navigator -->
  <div class="col-nav">
    <SectionNavigator sections={SECTIONS} />
  </div>

  <!-- Centre: paper content -->
  <main class="paper-main">

    <!-- ── Mobile nav select (hidden ≥768px via CSS) ─────── -->
    <div class="mobile-nav-wrap">
      <select class="mobile-nav-select" onchange={mobileNavJump} aria-label="Jump to section">
        <option value="" disabled selected>Jump to section…</option>
        {#each SECTIONS as { id, number, title }}
          <option value={id}>§{number} — {title}</option>
        {/each}
      </select>
    </div>

    <!-- ── Condensed tools strip (hidden ≥1024px via CSS) ── -->
    <div class="paper-tools-strip">
      <a href="/downloads/against-cpc-full.pdf" download class="strip-btn">PDF</a>
      <a href="/downloads/against-cpc-full.docx" download class="strip-btn">DOCX</a>
      <button class="strip-btn" onclick={stripCopyBib}>
        {stripCopiedBib ? 'Copied!' : 'BibTeX'}
      </button>
      <button class="strip-btn" onclick={stripCopyUrl}>
        {stripCopiedUrl ? 'Copied!' : 'Copy URL'}
      </button>
    </div>

    <!-- ── Title & byline ──────────────────────────────────── -->
    <h1 class="paper-title">
      Against Chronology Protection: On the Insufficiency of Hawking's 1992 Conjecture
    </h1>
    <p class="paper-byline">Danny · Independent Research · April 2026</p>

    <!-- ── Abstract ───────────────────────────────────────── -->
    <div class="abstract-box">
      <span class="abstract-label">ABSTRACT</span>
      <p>
        Stephen Hawking's 1992 Chronology Protection Conjecture (CPC) holds that the laws of
        physics conspire to prevent the formation of closed timelike curves (CTCs), citing a
        divergence in the renormalised stress-energy tensor near chronology horizons. This paper
        argues that the CPC is insufficient as a universal prohibition on past-directed time
        travel for three independent reasons: (1) the Ford–Roman quantum inequality framework
        contains no bridging theorem connecting worldline-integrated constraints to the thin-shell
        exotic matter quantities required by traversable wormhole models; (2) the
        Kay–Radzikowski–Wald theorem's stress-energy divergence result does not extend to
        non-compactly-generated chronology horizons, which are precisely the class produced by
        traversable wormhole geometries; and (3) Hawking's divergence is an artifact of
        pure-state boundary conditions imposed on what is physically a maximum-entropy
        mixed-state surface. We further construct a positive case: a combined stress-energy
        configuration integrating rotating dense matter (sourcing frame dragging), exotic matter
        shell (stabilising the throat), and their mutual coupling via the Kerr suppression factor
        demonstrates that near-extremal rotation reduces the exotic matter budget to near zero,
        invalidating the CPC's implicit assumption that exotic matter requirements are
        prohibitive. A dynamic throat model parameterised by three anchor constants — equilibrium
        radius <KatexInline latex="a_0" description="a-sub-zero: equilibrium throat radius" />,
        surface tension
        <KatexInline
          latex={String.raw`\sigma_{\text{throat}}`}
          description="sigma-throat: surface tension of the exotic shell"
        />, and membrane viscosity
        <KatexInline latex="\eta_s" description="eta-s: membrane viscosity" /> — yields a
        gravitational-wave echo spectrum testable with near-future LIGO/ET configurations. A
        five-milestone observational roadmap, Landauer–Deutsch information bound analysis, and
        historical coda situating these findings within classical theological models of time
        complete the argument.
      </p>
    </div>

    <!-- ── Epistemic Tier Legend ──────────────────────────── -->
    <section class="tier-legend">
      <h2 class="section-h2">Epistemic Tier System</h2>
      <p class="prose">
        This paper employs four epistemic tiers to distinguish the confidence level of different
        claims. Readers should attend to these markers carefully.
      </p>

      <EpistemicCallout tier={1} title="Confirmed Foundations">
        Established results with broad consensus in the physics literature. Treated as background
        constraints, not as contested claims.
      </EpistemicCallout>

      <EpistemicCallout tier={2} title="Well-Motivated Extrapolations">
        Results that follow from established frameworks by standard methods. Contested in detail
        but not in principle. The main arguments of this paper reside here.
      </EpistemicCallout>

      <EpistemicCallout tier={3} title="Conjectural but Consistent">
        Proposals that have not been derived from first principles but are consistent with all
        known constraints. Flagged explicitly. The coupling stress-energy term and full rotating
        exotic matter configuration are Tier III.
      </EpistemicCallout>

      <EpistemicCallout tier={4} title="Explicit Gaps">
        Identified open problems where the argument requires further mathematical work. Catalogued
        in the companion gaps.md file. Honesty about gaps is a feature, not a weakness.
      </EpistemicCallout>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §1  INTRODUCTION
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-1">
      <h2 class="section-h2">1. Introduction</h2>

      <p class="prose">
        In 1992, Stephen Hawking published what he described as a "chronology protection
        conjecture" — the proposal that the laws of physics do not allow the appearance of closed
        timelike curves (CTCs). The argument rested on a calculation showing that the renormalised
        stress-energy tensor diverges near a chronology horizon, suggesting that quantum effects
        would destroy any spacetime configuration approaching CTC formation before it could
        succeed. Hawking concluded that this constituted evidence for a law of nature protecting
        macroscopic causality, rendering time machines impossible.
      </p>

      <p class="prose">
        This paper argues that the conjecture fails as a universal prohibition. It fails not
        because Hawking's calculation was wrong in its domain, but because its domain was
        significantly narrower than the conclusion it was asked to support. The CPC implicitly
        assumes: static (non-rotating) background geometries; pure quantum states at chronology
        horizons; compactly generated horizon structure; and exotic matter requirements so large
        as to be physically unreasonable. Each of these assumptions can be relaxed, and when they
        are, the prohibition dissolves.
      </p>

      <p class="prose">
        The argument proceeds in three phases. The first (Sections 2–4) is negative: three
        independent gaps in the CPC argument are identified and examined. The second (Sections
        5–6) is positive: a combined physical system — rotating mass, exotic matter shell, and
        their mutual coupling — is shown to produce a stable traversable throat whose exotic
        matter budget approaches zero as rotation approaches the extremal Kerr limit. The third
        (Sections 7–9) is empirical and programmatic: gravitational-wave echo signatures, an
        information-theoretic bound, and a five-milestone observational roadmap situate these
        theoretical claims within the landscape of testable predictions.
      </p>

      <p class="prose">
        Throughout, we employ a pedagogical character, Ara Vasquez — a physicist navigating these
        frameworks for the first time — to illustrate the practical force of technical
        distinctions. Mathematics is presented in coordinate-explicit form to permit checking. All
        gaps are flagged explicitly and catalogued. The reader is invited to treat this paper as a
        structured argument, not as settled science.
      </p>

      <AraInterlude>
        Ara opens the notebook. "So the claim is that no universe allows time machines. But what
        does 'allow' mean, mathematically? Hawking argued it dynamically — the universe prevents
        them by making their approach energetically divergent. If the divergence isn't universal,
        the argument isn't universal. That's what we have to check, piece by piece."
      </AraInterlude>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §2  HAWKING'S CPC
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-2">
      <h2 class="section-h2">2. Hawking's Chronology Protection Conjecture: Statement and Scope</h2>

      <h3 class="section-h3">2.1 The 1992 Argument</h3>

      <p class="prose">
        Hawking's conjecture rests on a computation of the expectation value of the stress-energy
        tensor
        <KatexInline
          latex={String.raw`\langle T_{\mu\nu}\rangle`}
          description="expectation value of the stress-energy tensor"
        />
        near a chronology horizon — the boundary of the region containing CTCs. In the simplest
        model (Misner space, a compactly generated spacetime with CTCs produced by identified
        regions of flat Minkowski space), Hawking showed that:
      </p>

      <KatexBlock
        number="1"
        latex={String.raw`\langle T_{\mu\nu}\rangle_{\text{ren}} \to \infty \text{ as } t \to t_{\text{CTC}}`}
        description="The renormalised stress-energy tensor diverges as time approaches the chronology horizon."
      />

      <p class="prose">
        The divergence is polarisation-independent: it persists for all quantum states that are
        "locally Hadamard" — regular away from the horizon. Hawking interpreted this as evidence
        that quantum backreaction would prevent the horizon from forming, and elevated this
        calculation to a conjectural law of nature.
      </p>

      <p class="prose">
        The conjecture as stated has three components: (a) an empirical claim — we have never
        observed CTCs; (b) a theoretical claim — the stress-energy divergence provides a dynamical
        mechanism for chronology protection; and (c) a universality claim — this mechanism
        operates for all spacetime configurations permitting CTC formation. The arguments of this
        paper target (b) and (c) specifically.
      </p>

      <h3 class="section-h3">2.2 What the Conjecture Requires</h3>

      <p class="prose">
        For the CPC to function as a universal prohibition, it needs the following auxiliary
        claims to hold:
      </p>

      <EpistemicCallout tier={1} title="Auxiliary Claim A">
        The Ford–Roman quantum inequality constraints on negative energy density apply to the
        exotic matter required by traversable wormhole geometries — bridging worldline integrals
        to thin-shell quantities.
      </EpistemicCallout>

      <EpistemicCallout tier={1} title="Auxiliary Claim B">
        The Kay–Radzikowski–Wald stress-energy divergence result extends to
        non-compactly-generated chronology horizons of the type produced by traversable wormholes.
      </EpistemicCallout>

      <EpistemicCallout tier={1} title="Auxiliary Claim C">
        The divergence is a physical result, not an artifact of the pure-state boundary conditions
        imposed on the horizon surface.
      </EpistemicCallout>

      <EpistemicCallout tier={1} title="Auxiliary Claim D">
        Exotic matter requirements for traversable wormholes are so large as to be physically
        unreasonable even in the rotating case.
      </EpistemicCallout>

      <p class="prose">
        Sections 3–6 argue that Claims A, B, C, and D all fail. The failure is independent for
        each claim — even if three of them held, the CPC would be undermined by the fourth.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §3  GAP I — FORD–ROMAN
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-3">
      <h2 class="section-h2">3. Gap I — The Ford–Roman Quantum Inequality</h2>

      <EpistemicCallout tier={2} title="Scope of this section">
        The Ford–Roman inequalities are established (Tier I). The claim that they do not bridge
        to thin-shell exotic matter quantities is a Tier II analysis of their domain of
        applicability.
      </EpistemicCallout>

      <h3 class="section-h3">3.1 The Ford–Roman Inequalities</h3>

      <p class="prose">
        Ford and Roman (1995, 1997) derived a class of quantum inequalities (QIs) constraining
        the magnitude and duration of negative energy densities measurable by inertial observers.
        For a massless scalar field in flat spacetime, a sampling function
        <KatexInline latex={String.raw`f(\tau)`} description="sampling function f of proper time tau" />
        of characteristic duration
        <KatexInline latex="\tau_0" description="tau-zero: characteristic sampling duration" />
        along an observer's worldline, the averaged energy density satisfies:
      </p>

      <KatexBlock
        latex={String.raw`\int \langle T_{\mu\nu}\, u^\mu u^\nu\rangle\, f(\tau)\,d\tau \;\geq\; -\frac{C}{\tau_0^4}`}
        description="The Ford–Roman quantum inequality: the averaged negative energy density along a worldline is bounded below by minus C over tau-zero to the fourth power."
      />

      <p class="prose">
        where <KatexInline latex="C" description="positive constant C" /> is a positive constant
        depending on the quantum state and field theory. The inequality says: the more negative
        the energy density, the shorter the duration over which it can be sustained. Sustained
        large negative energy densities are ruled out.
      </p>

      <p class="prose">
        This is a genuine and important result. It applies to worldline-integrated quantities —
        the integral of energy density as experienced by an observer traversing a trajectory. It
        is derived for inertial observers in flat or weakly curved spacetime. It is a constraint
        on what quantum field theory permits along a path.
      </p>

      <h3 class="section-h3">3.2 The Bridging Gap</h3>

      <p class="prose">
        Traversable wormhole geometries, following Morris and Thorne (1988), require exotic matter
        concentrated in the throat region. The stability condition is characterised by the surface
        energy density <KatexInline latex="\sigma" description="sigma: surface energy density" />
        and tension <KatexInline latex="\tau" description="tau: surface tension" /> of a thin
        shell at the throat radius
        <KatexInline latex="a_0" description="a-sub-zero: throat radius" />. These are intrinsic
        surface quantities — they characterise the throat shell as a geometric object, not as
        quantities accumulated along an observer's path.
      </p>

      <p class="prose">
        For the Ford–Roman inequalities to constrain traversable wormholes, one would need a
        theorem of the form: "if a thin-shell exotic matter configuration has surface parameters
        <KatexInline
          latex={String.raw`(\sigma, \tau, a_0)`}
          description="sigma, tau, a-zero: the thin-shell surface parameters"
        />, then some worldline integral of energy density violates the Ford–Roman bound." No
        such theorem exists in the literature.
      </p>

      <EpistemicCallout tier={4} title="GAP-1: No Ford–Roman to Thin-Shell Bridging Theorem">
        There is no bridging theorem connecting Ford–Roman worldline-integrated quantum
        inequalities to Morris–Thorne thin-shell exotic matter quantities. The two frameworks
        operate on different geometric objects (worldline averages vs. surface integrals) and
        there is no published derivation linking them. Auxiliary Claim A therefore fails for want
        of a mathematical bridge.
      </EpistemicCallout>

      <AraInterlude>
        <p>
          To see why the gap matters, consider Ara's situation: she is asked to check whether a
          proposed wormhole throat violates the Ford–Roman bound. She computes the worldline
          integral of
          <KatexInline
            latex={String.raw`\langle T_{\mu\nu} u^\mu u^\nu\rangle`}
            description="expectation value of the stress-energy tensor contracted with four-velocity"
          />
          along a radial geodesic passing through the throat. This gives her a number — but it is
          not the surface tension <KatexInline latex="\tau" description="tau: surface tension" />
          of the shell. The shell tension is determined by the Israel junction conditions across
          the throat hypersurface, which involves the extrinsic curvature jump
          <KatexInline
            latex={String.raw`[K_{ij}]`}
            description="K-ij: jump in extrinsic curvature across the throat"
          />, not any worldline integral. Ara has computed a real quantity, but it is not the
          quantity the stability condition requires. The two frameworks are incommensurable without
          a bridging theorem.
        </p>
        <p>
          The practical consequence: there is no derivation in the CPC literature showing that
          Ford–Roman inequalities rule out the exotic matter configurations required by traversable
          wormholes. Papers that assert this connection typically do so by intuitive analogy, not
          by mathematical derivation.
        </p>
      </AraInterlude>

      <h3 class="section-h3">3.3 Curvature Corrections</h3>

      <p class="prose">
        A secondary issue compounds the gap. The Ford–Roman inequalities are derived for flat or
        weakly curved spacetime. Near a traversable wormhole throat, the curvature is not weak —
        it is necessarily high (the Morris–Thorne geometry requires a non-trivial embedding
        function that curves sharply near <KatexInline latex="a_0" />). Applying flat-spacetime
        quantum inequalities in this regime introduces unknown corrections of order
        <KatexInline
          latex={String.raw`R^2 a_0^2`}
          description="R-squared a-zero-squared: order of curvature corrections to the Ford–Roman bound"
        />, where <KatexInline latex="R" description="R: Riemann curvature scalar" /> is the
        Riemann curvature scalar. No systematic study of these corrections exists for the
        thin-shell wormhole case. Until such corrections are computed, the Ford–Roman framework
        cannot be reliably applied near wormhole throats even in principle.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §4  GAP II — KRW THEOREM
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-4">
      <h2 class="section-h2">
        4. Gap II — The Kay–Radzikowski–Wald Theorem and Non-Compactly-Generated Horizons
      </h2>

      <EpistemicCallout tier={2} title="Scope of this section">
        The KRW theorem is established (Tier I). Its inapplicability to non-compactly-generated
        horizons is a Tier II domain-of-applicability argument.
      </EpistemicCallout>

      <h3 class="section-h3">4.1 The KRW Theorem</h3>

      <p class="prose">
        Kay, Radzikowski, and Wald (1997) proved a rigorous version of Hawking's stress-energy
        divergence result. Their theorem states: in any Hadamard state on a compactly generated
        spacetime with a chronology horizon, the two-point function of any quantum field is not of
        Hadamard form at the horizon. This implies the stress-energy tensor is not locally
        well-defined there — the renormalised expectation value diverges.
      </p>

      <p class="prose">
        The theorem is careful about its hypothesis: it applies to <em>compactly generated</em>
        chronology horizons. A chronology horizon is compactly generated if its generators (null
        geodesics on the horizon surface) have past endpoints within a compact set — roughly, if
        the horizon is "created locally" rather than sourced from infinity.
      </p>

      <h3 class="section-h3">4.2 Traversable Wormholes Produce Non-Compactly-Generated Horizons</h3>

      <p class="prose">
        The chronology horizons produced by traversable wormhole geometries are not compactly
        generated. In the Morris–Thorne or Visser thin-shell constructions, the wormhole connects
        two asymptotically flat regions. The null generators of any chronology horizon formed via
        the wormhole have past endpoints that trace back through the throat and out to spatial
        infinity in the other asymptotic region — they are not enclosed in any compact set.
      </p>

      <p class="prose">
        This is not a technical loophole. It reflects a genuine physical difference between the
        two classes of CTC-producing spacetimes:
      </p>

      <DataTable
        headers={KRW_HEADERS}
        rows={KRW_ROWS}
        caption="KRW theorem applicability by spacetime type"
      />

      <p class="prose">
        Auxiliary Claim B fails for traversable wormhole geometries because those geometries fall
        outside the hypothesis of the KRW theorem. Extending the stress-energy divergence result
        to non-compactly-generated horizons would require a new theorem — which has not been
        proved.
      </p>

      <EpistemicCallout tier={4} title="GAP-2: KRW Does Not Apply to Non-Compactly-Generated Horizons">
        The KRW stress-energy divergence theorem does not apply to non-compactly-generated
        chronology horizons. Traversable wormholes produce exactly this class of horizon.
        Extending the theorem to this case is an open mathematical problem. Auxiliary Claim B
        therefore fails for the physically relevant spacetimes.
      </EpistemicCallout>

      <h3 class="section-h3">4.3 The Li–Gott Vacuum Construction</h3>

      <p class="prose">
        Li and Gott (1998) constructed a self-consistent vacuum state for a spacetime containing
        CTCs — demonstrating that at least one quantum state exists in which the stress-energy
        tensor does not diverge on the chronology horizon. Their construction uses a rotating
        spacetime with CTCs produced by frame-dragging (related to but distinct from Gott's 1991
        two-string construction).
      </p>

      <p class="prose">
        The Li–Gott vacuum is self-consistent: it satisfies the backreaction equations without
        divergence. It is not clear that it is unique or that it is the physical vacuum. But its
        existence proves that the KRW divergence is state-dependent, not universal — there exist
        states for which the horizon is not singular. This undermines the interpretation of the
        KRW result as a universal physical law rather than a statement about Hadamard states
        specifically.
      </p>

      <AraInterlude>
        Suppose Hawking's argument were correct universally. Then no quantum state should be
        definable on a CTC-containing spacetime without a stress-energy divergence at the horizon.
        The Li–Gott construction provides a counterexample. One may object that the Li–Gott vacuum
        is physically unreasonable — but the burden is then to specify what criterion of physical
        reasonableness rules it out, without simply assuming the conclusion one wishes to prove.
      </AraInterlude>

      <h3 class="section-h3" id="sec-4-4">4.4 Gap III — Pure-State Boundary Conditions</h3>

      <p class="prose">
        A third, independent gap concerns the physical interpretation of the stress-energy
        divergence. The KRW theorem and Hawking's original calculation both impose a Hadamard
        (pure-state) condition on the quantum field at the chronology horizon. This is
        mathematically convenient — Hadamard states have well-defined renormalised stress-energy
        tensors away from the horizon — but it may be physically wrong.
      </p>

      <p class="prose">
        A chronology horizon is a special kind of surface: it is the boundary of the region where
        causality is violated. Physically, this surface is exposed to the full past history of the
        spacetime, including all causal influences from the CTC region itself. There is no physical
        reason to expect such a surface to carry a pure quantum state. If anything, the maximal
        causal exposure of the horizon suggests it should carry a maximally mixed state — a thermal
        or Planckian distribution, not a Hadamard vacuum.
      </p>

      <p class="prose">
        If the horizon carries a mixed rather than pure state, the KRW derivation does not apply.
        The stress-energy divergence is derived by examining the short-distance behaviour of the
        two-point function of a Hadamard state — specifically, the logarithmic singularity
        structure that makes renormalisation possible. For mixed states, the two-point function has
        a different structure, and the divergence need not occur.
      </p>

      <EpistemicCallout tier={2} title="GAP-3: Pure-State Boundary Conditions at the Chronology Horizon">
        The Hawking–KRW stress-energy divergence may be an artifact of pure-state boundary
        conditions imposed on a maximally mixed-state surface. The physical argument for expecting
        a mixed state at the chronology horizon is strong (maximal causal exposure), but the
        mathematical analysis of mixed-state QFT near chronology horizons has not been completed.
        Auxiliary Claim C therefore fails on physical grounds pending a full mixed-state analysis.
      </EpistemicCallout>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §5  COMBINED GRAVITATIONAL SYSTEM
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-5">
      <h2 class="section-h2">
        5. The Combined Gravitational System: Rotating Mass, Frame Dragging, and Exotic Matter
      </h2>

      <EpistemicCallout tier={2} title="Scope of §5.1–5.2 / Tier III scope of §5.3">
        The Kerr metric and Israel junction conditions are established (Tier I). The suppression
        of exotic matter requirements by rotation follows from standard analysis (Tier II). The
        explicit coupling stress-energy tensor form is schematic and Tier III.
      </EpistemicCallout>

      <h3 class="section-h3">5.1 Motivation: Beyond the Non-Rotating Case</h3>

      <p class="prose">
        Hawking's CPC analysis and the KRW theorem are both conducted in non-rotating spacetimes.
        The Misner space, Gott two-string, and similar model spacetimes used to derive
        stress-energy divergences all have vanishing angular momentum. This is mathematically
        convenient but physically unjustified. Real astrophysical objects rotate; real spacetime
        configurations with CTCs are more likely to involve rotation than not, since rotation is
        the mechanism by which frame-dragging produces CTCs without requiring identified regions
        or cosmic strings.
      </p>

      <p class="prose">
        The central new result of this paper is that combining three independently legitimate
        sources of spacetime curvature — rotating dense matter (sourcing frame dragging), exotic
        matter shell (stabilising the throat), and their mutual coupling — produces a stable throat
        configuration in which the exotic matter budget is suppressed by a Kerr factor that
        approaches zero as rotation approaches the extremal limit. The CPC's implicit Auxiliary
        Claim D — that exotic matter requirements are physically unreasonable — fails in this
        regime.
      </p>

      <h3 class="section-h3">5.2 Decomposition of the Total Stress-Energy Tensor</h3>

      <p class="prose">
        We work in Boyer–Lindquist coordinates
        <KatexInline
          latex={String.raw`(t, r, \theta, \phi)`}
          description="Boyer-Lindquist coordinates t, r, theta, phi"
        />
        with metric signature
        <KatexInline latex={String.raw`(-, +, +, +)`} description="metric signature minus plus plus plus" />.
        The total stress-energy tensor of the combined system decomposes as:
      </p>

      <KatexBlock
        number="5.1"
        latex={String.raw`T^{\mu\nu}_{\text{total}} = T^{\mu\nu}_{\text{matter}} + T^{\mu\nu}_{\text{exotic}} + T^{\mu\nu}_{\text{coupling}}`}
        description="The total stress-energy tensor decomposes into matter, exotic, and coupling contributions."
      />

      <p class="prose">
        Each term is physically distinct. Their interaction — captured in
        <KatexInline
          latex={String.raw`T^{\mu\nu}_{\text{coupling}}`}
          description="T-coupling: the coupling stress-energy tensor"
        /> — is the central structural result of this section.
      </p>

      <h3 class="section-h3">5.2.1 Rotating Matter: Sourcing Frame Dragging</h3>

      <p class="prose">
        A rotating dense matter configuration — concretely a torus of compressed matter with
        total mass <KatexInline latex="M" description="M: total mass" />, angular momentum
        <KatexInline latex="J" description="J: angular momentum" />, and spin parameter
        <KatexInline
          latex={String.raw`a \equiv J/Mc`}
          description="a: spin parameter, defined as J over Mc"
        /> — is modelled as a rotating perfect fluid:
      </p>

      <KatexBlock
        number="5.2"
        latex={String.raw`T^{\mu\nu}_{\text{matter}} = (\rho + p)\,u^\mu u^\nu + p\,g^{\mu\nu}`}
        description="The stress-energy tensor of a rotating perfect fluid: sum of density-plus-pressure times four-velocity outer product, plus pressure times metric."
      />

      <p class="prose">
        The four-velocity <KatexInline latex={String.raw`u^\mu`} description="u-mu: four-velocity" />
        of the rotating fluid has a non-zero
        <KatexInline latex="\phi" description="phi: azimuthal coordinate" />-component,
        producing the off-diagonal stress component:
      </p>

      <KatexBlock
        number="5.3"
        latex={String.raw`T^{t\phi}_{\text{matter}} = (\rho + p)\,u^t u^\phi \neq 0`}
        description="The off-diagonal t-phi component of the matter stress-energy tensor, which sources frame dragging."
      />

      <p class="prose">
        This term sources frame dragging. Via the Einstein field equation
        <KatexInline
          latex={String.raw`G^{t\phi} = 8\pi G\, T^{t\phi}`}
          description="Einstein equation for the t-phi component"
        />, it drives the off-diagonal metric component
        <KatexInline latex={String.raw`g_{t\phi}`} description="g-t-phi: off-diagonal Kerr metric component" />,
        encoding the angular velocity at which spacetime co-rotates with the source. In the Kerr
        geometry this frame-dragging rate is:
      </p>

      <KatexBlock
        number="5.4"
        latex={String.raw`\omega(r,\theta) = \frac{2Mar}{\bigl(r^2 + a^2\bigr)\Sigma + 2Ma^2 r\sin^2\!\theta}`}
        description="The Kerr frame-dragging angular velocity omega as a function of radius r and polar angle theta."
      />

      <p class="prose">
        where
        <KatexInline
          latex={String.raw`\Sigma \equiv r^2 + a^2\cos^2\!\theta`}
          description="Sigma: the Boyer-Lindquist Sigma function, r-squared plus a-squared cosine-squared theta"
        />. The ergosphere — the region where
        <KatexInline latex={String.raw`\omega`} description="omega: frame-dragging rate" />
        equals the local light-speed limit — is where frame dragging becomes gravitationally
        compulsory. A rotating wormhole throat placed near or inside the ergosphere inherits this
        dragging without any exotic matter contribution.
      </p>

      <AraInterlude>
        Ara stations herself outside a rapidly rotating neutron star and asks: what minimum
        angular velocity must she maintain to remain stationary relative to the distant stars?
        Outside the ergosphere, the answer is zero. Inside it, spacetime itself is moving at
        <KatexInline
          latex={String.raw`\omega(r,\theta) > 0`}
          description="omega greater than zero: frame-dragging rate is positive"
        />, and she cannot remain stationary without exceeding light speed. The ergosphere is
        where frame dragging becomes compulsory. A wormhole throat here inherits that dragging at
        no exotic matter cost.
      </AraInterlude>

      <h3 class="section-h3">5.2.2 Exotic Matter Shell: Stabilising the Throat</h3>

      <p class="prose">
        At the throat surface
        <KatexInline latex={String.raw`r = a_0`} description="r equals a-zero: the throat surface" />
        we place a thin shell of exotic matter. In the orthonormal frame of the shell:
      </p>

      <KatexBlock
        number="5.5"
        latex={String.raw`T^{\mu\nu}_{\text{exotic}} = \operatorname{diag}(-\rho_{\text{ex}},\,-\tau,\,p_\perp,\,p_\perp)`}
        description="The exotic matter stress-energy tensor: diagonal with negative energy density, negative radial tension, and transverse pressure."
      />

      <p class="prose">
        with
        <KatexInline
          latex={String.raw`\rho_{\text{ex}} > 0`}
          description="rho-ex: positive energy magnitude; the actual energy density is negative"
        />
        (energy density is
        <KatexInline
          latex={String.raw`-\rho_{\text{ex}} < 0`}
          description="negative rho-ex: the exotic shell has negative energy density"
        />), radial tension
        <KatexInline latex={String.raw`\tau > 0`} description="tau: positive radial tension" />,
        and transverse pressure
        <KatexInline latex={String.raw`p_\perp`} description="p-perp: transverse pressure" />.
        The sign of <KatexInline latex="\tau" description="tau: tension" /> is essential: unlike
        ordinary pressure, tension resists contraction, holding the throat open against
        gravitational collapse.
      </p>

      <p class="prose">
        The Null Energy Condition (NEC) requires
        <KatexInline
          latex={String.raw`T^{\mu\nu}_{\text{exotic}}\,k_\mu k_\nu \geq 0`}
          description="NEC requirement: stress-energy contracted with null vectors must be non-negative"
        />
        for all null vectors
        <KatexInline latex={String.raw`k^\mu`} description="k-mu: null vector" />.
        For our configuration:
      </p>

      <KatexBlock
        number="5.6"
        latex={String.raw`T^{\mu\nu}_{\text{exotic}}\,k_\mu k_\nu = -\rho_{\text{ex}} - \tau < 0`}
        description="The NEC is violated: the exotic matter stress-energy contracted with null vectors gives a strictly negative result."
      />

      <p class="prose">
        Traversability demands this be strictly negative — a deliberate, controlled NEC violation.
        In the static (non-rotating) case the exotic matter budget scales as:
      </p>

      <KatexBlock
        number="5.7"
        latex={String.raw`|\tau|_{\text{static}} \sim \frac{c^2}{G} \cdot a_0^{-2}`}
        description="The static exotic matter tension scales as c-squared over G divided by the throat radius squared."
      />

      <p class="prose">
        This diverges as
        <KatexInline latex={String.raw`a_0 \to 0`} description="a-zero approaches zero: throat shrinks" />:
        a static microscopic throat is arbitrarily expensive. This is the result that has made
        static Lorentzian wormholes appear physically unreasonable — and which Hawking's Auxiliary
        Claim D implicitly relies on.
      </p>

      <h3 class="section-h3">5.2.3 The Coupling Term: Rotation as Exotic Matter Subsidy</h3>

      <p class="prose">
        Rotation modifies the stability condition for the exotic shell. In the Kerr background,
        the required throat tension becomes:
      </p>

      <KatexBlock
        number="5.8"
        latex={String.raw`|\tau|_{\text{Kerr}} \sim \frac{c^2}{G} \cdot a_0^{-2} \cdot \sqrt{1 - \frac{a^2}{M^2}}`}
        description="The Kerr-suppressed exotic matter tension: the static budget multiplied by the Kerr suppression factor."
      />

      <p class="prose">
        The factor
        <KatexInline
          latex={String.raw`\sqrt{1 - a^2/M^2}`}
          description="square root of one minus a-squared over M-squared: the Kerr suppression factor"
        />
        is the Kerr suppression factor. At zero rotation
        (<KatexInline latex={String.raw`a = 0`} description="a equals zero: non-rotating case" />)
        it returns the static budget of Eq. (5.7). As
        <KatexInline latex={String.raw`a \to M`} description="a approaches M: near-extremal rotation" />
        (near-extremal rotation), it approaches zero: frame dragging performs gravitational work
        that would otherwise demand exotic matter to supply. The coupling stress-energy term
        encoding this exchange is:
      </p>

      <KatexBlock
        number="5.9"
        latex={String.raw`T^{\mu\nu}_{\text{coupling}} \sim a \cdot \rho_{\text{ex}} \cdot \varepsilon^{\mu\nu\alpha\beta}\,u_\alpha k_\beta`}
        description="The coupling stress-energy tensor: proportional to the spin parameter, exotic energy density, and antisymmetric Levi-Civita contraction."
      />

      <p class="prose">
        where
        <KatexInline
          latex={String.raw`\varepsilon^{\mu\nu\alpha\beta}`}
          description="epsilon: the Levi-Civita tensor"
        />
        is the Levi-Civita tensor,
        <KatexInline latex={String.raw`u_\alpha`} description="u-alpha: matter four-velocity (covariant)" />
        the matter four-velocity, and
        <KatexInline latex={String.raw`k_\beta`} description="k-beta: null generator of the throat horizon" />
        a null generator of the throat horizon. The antisymmetric structure reflects that the
        coupling is chiral — it depends on the handedness of rotation relative to the null
        generators.
      </p>

      <EpistemicCallout tier={3} title="Tier III: Coupling Tensor Form">
        The tensorial form of
        <KatexInline
          latex={String.raw`T^{\mu\nu}_{\text{coupling}}`}
          description="T-coupling: the coupling stress-energy tensor"
        />
        in Eq. (5.9) is schematic. A fully rigorous treatment requires solving the Einstein
        equations with rotating exotic matter source terms simultaneously — not yet done in closed
        form. The physical conclusion (rotation reduces the exotic matter budget) follows robustly
        from Israel junction conditions and is confirmed numerically in the literature. The
        specific tensorial coupling structure is Tier III.
      </EpistemicCallout>

      <h3 class="section-h3">5.3 The Master Einstein Equation</h3>

      <p class="prose">
        Assembling all three contributions:
      </p>

      <KatexBlock
        number="5.10"
        latex={String.raw`G^{\mu\nu} = 8\pi G \Bigl[\,(\rho+p)\,u^\mu u^\nu + p\,g^{\mu\nu} \;+\; {-\rho_{\text{ex}}}\,\delta(r-a_0)\,h^{\mu\nu} \;+\; a\cdot\rho_{\text{ex}}\cdot\varepsilon^{\mu\nu\alpha\beta}\,u_\alpha k_\beta\,\Bigr]`}
        description="The master Einstein equation: curvature equals 8 pi G times the sum of the rotating matter, exotic shell, and coupling stress-energy tensors."
      />

      <p class="prose">
        The three terms are not independent: the spin parameter
        <KatexInline latex="a" description="a: spin parameter" />
        threads through the matter four-velocity, the Kerr suppression of the shell tension, and
        the explicit coupling. This interdependence is precisely what the CPC analysis omits.
        Hawking's divergence result — derived at
        <KatexInline latex={String.raw`a = 0`} description="a equals zero: non-rotating" />
        under pure-state boundary conditions — cannot be extended to this regime without a new
        argument, and none has been supplied.
      </p>

      <p class="prose">
        The failure of Auxiliary Claim D is now explicit: near-extremal rotation renders the
        exotic matter requirement negligible. The CPC's implicit assumption that exotic matter is
        physically unreasonable collapses in this regime.
      </p>

      <!-- Anchor constants table (content from §6.2; included here for §5 context) -->
      <DataTable
        headers={ANCHOR_HEADERS}
        rows={ANCHOR_ROWS}
        caption="Three anchor constants parameterising the dynamic throat model"
      />
    </section>

    <!-- ══════════════════════════════════════════════════════
         §6  DYNAMIC THROAT MODEL AND GW ECHO SIGNATURES
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-6">
      <h2 class="section-h2">6. Dynamic Throat Model and Gravitational-Wave Echo Signatures</h2>

      <EpistemicCallout tier={2} title="Scope of this section">
        The Israel junction condition formalism is Tier I. The damped oscillator model for throat
        perturbations and the echo spectrum formula follow from this by standard methods (Tier II).
        The three anchor constants are defined within this framework.
      </EpistemicCallout>

      <h3 class="section-h3">6.1 Israel Junction Conditions at the Throat</h3>

      <p class="prose">
        The thin-shell formalism of Israel (1966) bridges the bulk stress-energy of Eq. (5.10) to
        observable surface quantities. Let <KatexInline latex="\Sigma" description="Sigma: the throat hypersurface" />
        denote the throat hypersurface at
        <KatexInline latex={String.raw`r = a_0`} description="r equals a-zero: the throat surface" />,
        with induced metric
        <KatexInline latex={String.raw`h_{ij}`} description="h-ij: induced metric on the throat" />
        and extrinsic curvature
        <KatexInline latex={String.raw`K_{ij}`} description="K-ij: extrinsic curvature of the throat" />.
        The junction conditions are:
      </p>

      <KatexBlock
        number="6.1"
        latex={String.raw`[K_{ij}] - h_{ij}[K] = -8\pi G\,S_{ij}`}
        description="The Israel junction condition: the jump in extrinsic curvature across the throat equals minus 8 pi G times the surface stress-energy."
      />

      <p class="prose">
        where <KatexInline latex={String.raw`[\cdot]`} description="square brackets: jump across Sigma" />
        denotes the jump across
        <KatexInline latex="\Sigma" description="Sigma: the throat hypersurface" />
        and
        <KatexInline latex={String.raw`S_{ij}`} description="S-ij: surface stress-energy of the shell" />
        is the surface stress-energy of the shell. Decomposing
        <KatexInline latex={String.raw`S_{ij}`} />:
      </p>

      <KatexBlock
        number="6.2"
        latex={String.raw`S_{ij} = \mathrm{diag}(-\sigma_{\text{throat}},\,p_s)`}
        description="The surface stress-energy tensor: a thin shell with negative surface energy density sigma-throat and surface pressure p-s."
      />

      <p class="prose">
        The surface energy density
        <KatexInline latex={String.raw`\sigma_{\text{throat}}`} description="sigma-throat: surface energy density, first anchor constant" />
        is our first anchor constant. The viscous correction to the surface stress introduces the
        second anchor constant
        <KatexInline latex="\eta_s" description="eta-s: membrane viscosity, second anchor constant" />
        (membrane viscosity), and the equilibrium throat radius
        <KatexInline latex="a_0" description="a-zero: equilibrium throat radius, third anchor constant" />
        is the third.
      </p>

      <h3 class="section-h3">6.2 Three Anchor Constants</h3>

      <DataTable
        headers={ANCHOR_HEADERS}
        rows={ANCHOR_ROWS}
        caption="Three anchor constants parameterising the dynamic throat model"
      />

      <h3 class="section-h3">6.3 Throat Perturbation Dynamics</h3>

      <p class="prose">
        Perturbing the throat radius as
        <KatexInline latex={String.raw`a(t) = a_0 + \delta a(t)`} description="a of t equals a-zero plus delta-a: the perturbed throat radius" />,
        the linearised equation of motion for the shell, derived from the Israel conditions, is:
      </p>

      <KatexBlock
        number="6.3"
        latex={String.raw`\ddot{\delta a} + 2\eta_s\,\dot{\delta a} + \frac{\sigma_{\text{throat}}}{a_0^2}\,\delta a = 0`}
        description="The damped oscillator equation for throat radius perturbation: second derivative plus 2 eta-s times first derivative plus sigma-throat over a-zero-squared times delta-a equals zero."
      />

      <p class="prose">
        This is a damped harmonic oscillator for the throat radius. Three qualitatively distinct
        regimes follow directly:
      </p>

      <DataTable
        headers={DAMPING_HEADERS}
        rows={DAMPING_ROWS}
        caption="Throat oscillation regimes and their observational consequences"
      />

      <h3 class="section-h3">6.4 The Dynamic Throat Echo Spectrum Formula</h3>

      <p class="prose">
        The Green's function of the damped oscillator equation (6.3) gives the throat radius
        response to an impulsive perturbation (such as a binary merger GW event). In the
        underdamped regime, the echo spectrum — the frequency-domain power of GW echoes produced
        by the oscillating throat — is:
      </p>

      <KatexBlock
        number="9b"
        latex={String.raw`\hat{H}(f) = A_0 \cdot \left(\frac{f}{f_0}\right)^{\!2} \cdot e^{-\eta_s f/f_0^2} \cdot \left[1+\left(\frac{f}{f_0}\right)^{\!2}\right]^{-1}`}
        description="The predicted gravitational-wave echo spectrum as a function of frequency f: amplitude A-zero times f over f-zero squared, times an exponential decay, times a Lorentzian roll-off."
      />

      <p class="prose">
        where
        <KatexInline
          latex={String.raw`f_0 = \tfrac{1}{2\pi}\sqrt{\sigma_{\text{throat}}/a_0^2}`}
          description="f-zero: the characteristic echo frequency, equal to one over 2 pi times the square root of sigma-throat over a-zero-squared"
        />
        is the characteristic echo frequency, and
        <KatexInline latex="A_0" description="A-zero: normalisation amplitude set by the triggering event" />
        is a normalisation constant set by the amplitude of the triggering event. The spectrum
        peaks near
        <KatexInline latex="f_0" description="f-zero: peak echo frequency" />,
        rolls off below (suppressed by the
        <KatexInline latex="\beta = 2" description="beta equals 2: the low-frequency spectral index" />
        low-frequency tail) and above (exponential damping by
        <KatexInline latex="\eta_s" description="eta-s: membrane viscosity controlling the high-frequency decay" />),
        and is distinct from the primary GW signal in three ways: it arrives after the main event,
        it has a characteristic repeated structure (successive echoes at intervals
        <KatexInline latex={String.raw`\Delta t \sim \pi/f_0`} description="delta-t approximately pi over f-zero: the echo repeat interval" />),
        and its damping rate is set by
        <KatexInline latex="\eta_s" />
        rather than by the primary merger parameters.
      </p>

      <EpistemicCallout tier={2} title="Observational Status of the Echo Prediction">
        These three observational signatures — time delay, periodicity, and independent damping
        rate — constitute a falsifiable prediction. Detection of GW echoes consistent with the
        <KatexInline latex={String.raw`(a_0, \sigma_{\text{throat}}, \eta_s)`} description="the three anchor-constant parameter family" />
        parameter family would constitute the first observational evidence for exotic compact
        objects with traversable-wormhole-type throats.
      </EpistemicCallout>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §7  LANDAUER–DEUTSCH INFORMATION BOUND
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-7">
      <h2 class="section-h2">7. The Landauer–Deutsch Information Bound</h2>

      <EpistemicCallout tier={2} title="Scope of this section">
        The Landauer principle is established thermodynamics. Deutsch's CTC information framework
        is well-developed. Their combination as a constraint on CTC information throughput is a
        Tier II extrapolation.
      </EpistemicCallout>

      <h3 class="section-h3">7.1 Information and Exotic Matter: The Bound</h3>

      <p class="prose">
        A traversable wormhole supporting CTCs is also an information channel: signals sent through
        the wormhole can in principle arrive before they are sent. This raises the question of how
        much information can be transmitted per unit of exotic matter energy budget.
      </p>

      <p class="prose">
        Combining the Landauer principle (each bit erased costs at least
        <KatexInline latex={String.raw`k_B T \ln 2`} description="k-B T ln 2: Landauer energy cost per bit" />
        of energy) with Deutsch's formulation of information flow through CTC regions (consistent
        CTC computations require a fixed-point condition on density matrices), the maximum
        information throughput
        <KatexInline latex="I" description="I: information throughput in bits" />
        through a CTC supported by exotic matter energy budget
        <KatexInline latex={String.raw`E_{\text{ex}}`} description="E-ex: exotic matter energy budget" />
        is bounded by:
      </p>

      <KatexBlock
        number="7.1"
        latex={String.raw`I \leq \frac{E_{\text{ex}}}{k_B T \ln 2} \cdot \eta_{\text{CTC}}`}
        description="The Landauer-Deutsch information bound: bits transmittable through a CTC channel are bounded by the exotic energy divided by k-B T ln 2, multiplied by a CTC efficiency factor eta-CTC."
      />

      <p class="prose">
        where
        <KatexInline latex={String.raw`\eta_{\text{CTC}} < 1`} description="eta-CTC: CTC efficiency factor, less than one" />
        is a CTC efficiency factor accounting for the Novikov self-consistency constraint (not all
        computational operations are consistent with self-consistent CTC evolution). This is the
        Landauer–Deutsch bound.
      </p>

      <h3 class="section-h3">7.2 Implications for the CPC</h3>

      <p class="prose">
        The bound has two consequences for the CPC argument. First, it confirms that CTCs are not
        computationally unconstrained: Novikov self-consistency limits what can be computed through
        a CTC channel, and the Landauer bound limits the throughput. Time travel, if possible, is
        thermodynamically expensive and informationally limited — not a route to paradox-free
        omniscience.
      </p>

      <p class="prose">
        Second, the bound connects to the Kerr suppression result: as rotation reduces
        <KatexInline latex={String.raw`E_{\text{ex}}`} description="E-ex: exotic matter energy budget" />
        toward zero, the information throughput
        <KatexInline latex="I" description="I: information throughput" />
        also approaches zero unless
        <KatexInline latex="T" description="T: temperature" />
        simultaneously increases. A near-extremal rotating wormhole throat is stable but has very
        low CTC information capacity — which is thermodynamically consistent with the third law of
        black hole mechanics (extremal objects have vanishing Hawking temperature, hence large
        Landauer cost per bit).
      </p>

      <p class="prose">
        This is a pleasant consistency check: the framework does not permit a near-extremal
        rotating wormhole to be simultaneously cheap to maintain and informationally rich. The
        physics constrains itself.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §8  OBSERVATIONAL ROADMAP: FIVE MILESTONES
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-8">
      <h2 class="section-h2">8. Observational Roadmap: Five Milestones</h2>

      <EpistemicCallout tier={2} title="Scope of this section">
        The GW echo framework and detector sensitivities are established. The specific thresholds
        stated here are informed estimates, not published experimental results.
      </EpistemicCallout>

      <p class="prose">
        The theoretical framework developed in this paper generates specific, falsifiable
        predictions at five levels of observational sophistication. We present them in order of
        increasing experimental requirement.
      </p>

      <EpistemicCallout tier={2} title="Milestone 1 — GW Echo Detection">
        Search LIGO O4/O5 and Einstein Telescope data for post-merger echoes with the spectral
        signature of Eq. (9b). A detection consistent with the
        <KatexInline latex={String.raw`(a_0, \sigma_{\text{throat}}, \eta_s)`} description="the three-parameter family" />
        parameter family at &gt;3σ significance would constitute the first evidence for exotic
        compact objects with traversable-wormhole-type throats. The characteristic time delay and
        periodic echo structure are distinct from all known astrophysical post-merger signals. This
        milestone is achievable with existing detector technology and Bayesian matched-filter
        methods.
      </EpistemicCallout>

      <EpistemicCallout tier={2} title="Milestone 2 — Kerr Suppression Scaling">
        If echo signals are detected, measure the echo amplitude as a function of the primary
        object's spin parameter
        <KatexInline latex="a/M" description="a over M: dimensionless spin parameter" />.
        The Kerr suppression factor
        <KatexInline latex={String.raw`\sqrt{1 - a^2/M^2}`} description="square root of one minus a-squared over M-squared: the Kerr suppression factor" />
        predicts that the exotic matter budget — and hence the restoring force
        <KatexInline latex={String.raw`\sigma_{\text{throat}}`} description="sigma-throat: surface energy density" /> —
        should decrease systematically as spin increases. A correlation between spin and echo
        frequency
        <KatexInline latex="f_0" description="f-zero: characteristic echo frequency" />
        would confirm the rotating wormhole model over alternatives.
      </EpistemicCallout>

      <EpistemicCallout tier={2} title="Milestone 3 — Information Throughput Constraints">
        If CTCs are supported by observed wormhole-type objects, their information throughput is
        bounded by the Landauer–Deutsch bound (Eq. 7.1). Observations constraining
        <KatexInline latex={String.raw`E_{\text{ex}}`} description="E-ex: exotic energy budget" />
        and
        <KatexInline latex="T" description="T: temperature from thermal emission" />
        (from thermal emission) can place bounds on
        <KatexInline latex={String.raw`\eta_{\text{CTC}}`} description="eta-CTC: CTC efficiency factor" />.
        A measurement of
        <KatexInline latex={String.raw`\eta_{\text{CTC}} \approx 0`} description="eta-CTC approximately zero: computationally trivial" />
        would indicate that consistent CTC evolution is computationally trivial in this system;
        <KatexInline latex={String.raw`\eta_{\text{CTC}}`} />
        close to 1 would indicate near-maximal CTC computational power.
      </EpistemicCallout>

      <EpistemicCallout tier={3} title="Milestone 4 — Mixed-State Horizon Thermodynamics">
        The Gap III argument (§4.4) predicts that chronology horizons of traversable wormholes
        carry mixed rather than pure quantum states. This should produce a measurable thermal
        signature distinct from Hawking radiation: a quasi-thermal emission spectrum with
        temperature set by the mixing entropy rather than by the surface gravity. Distinguishing
        this from Hawking radiation requires sub-Planck frequency resolution, but the predicted
        spectral shape is qualitatively different.
      </EpistemicCallout>

      <EpistemicCallout tier={3} title="Milestone 5 — Direct Throat Imaging">
        The Event Horizon Telescope or next-generation VLBI arrays could in principle resolve the
        shadow of an exotic compact object with a traversable wormhole throat. The shadow
        morphology predicted by the rotating wormhole metric differs from that of a Kerr black
        hole in the inner shadow structure — the wormhole throat produces a secondary image of the
        far-side spacetime. This is the most demanding milestone, requiring angular resolution
        beyond current capabilities, but constitutes the definitive direct observational test.
      </EpistemicCallout>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §9  HISTORICAL AND THEOLOGICAL CODA
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-9">
      <h2 class="section-h2">9. Historical and Theological Coda</h2>

      <h3 class="section-h3">9.1 Vedic Kala: Time as Structured Hierarchy</h3>

      <p class="prose">
        The Sanskrit concept of <em>kala</em> (time, from the root <em>kal-</em>, to count or
        reckon) does not map simply onto the physicist's parameter <KatexInline latex="t" description="t: the physicist's time parameter" />.
        In the Vedic astronomical tradition, time is structured as a hierarchy of nested cycles:
        the paramanu (indivisible moment), truti, nimesha, kala (in the astronomical sense, 1/1800
        of a day), muhurta, ahoratra (day), paksha, masa, ritu, ayana, samvatsara, and ultimately
        the vast cosmological cycles of manvantara and kalpa. The structure is not circular but
        spirally recursive: each great cycle contains within it the same internal structure as the
        previous, but at a different phase.
      </p>

      <p class="prose">
        This structure is not irrelevant to the physics of CTCs. The Novikov self-consistency
        principle — which requires that events on a CTC must be consistent with themselves — has a
        structural analogue in the Vedic notion of <em>rita</em> (cosmic order, the regularity of
        cycles). In both frameworks, time is not a free variable to be traversed arbitrarily; it
        is a structured constraint that self-consistency imposes on events. The physicist's
        "consistent histories" formulation of CTC evolution and the Vedic notion of dharmic
        regularity describe the same formal constraint in different conceptual vocabularies.
      </p>

      <p class="prose">
        The <em>kala</em> tradition also predicts what we might call temporal granularity: a
        minimum unit of time below which the concept of "before" and "after" loses meaning. This
        maps onto the Planck time in modern physics. Whether this is coincidence or structural
        inevitability — whether any sufficiently developed cosmology must posit a minimum time
        scale — is an open question in comparative philosophy of physics.
      </p>

      <h3 class="section-h3">9.2 Boethius, Aquinas, and the Block Universe</h3>

      <p class="prose">
        The most theologically sophisticated treatments of time in the Western tradition are those
        of Boethius (c. 524 CE) and Thomas Aquinas (c. 1274 CE). Both argue that divine eternity
        is not endless time but the simultaneous possession of all time — what Boethius calls
        <em>tota simul</em> (literally: all at once). In this view, God does not experience
        temporal succession; the entirety of created time is present to the divine intellect as a
        single eternal now.
      </p>

      <p class="prose">
        This metaphysical picture maps with surprising precision onto the block universe
        interpretation of general relativity. In the block universe, all spacetime events exist
        simultaneously as a four-dimensional manifold; the experience of temporal flow is a
        perspectival feature of observers embedded in the manifold, not a feature of the manifold
        itself. The "eternal now" of Boethius is structurally equivalent to the block universe's
        atemporal simultaneity.
      </p>

      <p class="prose">
        The connection to CTCs is this: in a block universe with CTCs, closed timelike curves are
        not paradoxes — they are simply closed loops in the four-manifold. From the block universe
        perspective (equivalently, from the divine <em>tota simul</em> perspective), there is no
        "before the loop begins" or "after it ends"; the loop simply is, as a geometric object.
        The Novikov self-consistency principle is then not a constraint imposed from outside but an
        analytic feature of what it means for the loop to exist as a consistent geometric object.
      </p>

      <p class="prose">
        Aquinas's treatment of divine foreknowledge without temporal determination provides an
        additional resonance. Aquinas argues that God knows future contingents not by knowing them
        "before" they happen but by knowing them in their eternal presentness — the events are
        future for us, but present to God. This is structurally equivalent to saying that in the
        block universe, no event is genuinely future from the perspective of the full
        four-manifold; all events are equally "present" as geometric objects, and an observer with
        access to the full manifold (a Creator-level perspective) would perceive no temporal
        asymmetry.
      </p>

      <p class="prose">
        The CPC's failure, on this reading, is not merely a technical failure of a physics
        argument. It is a failure to take seriously the possibility that causality — the feature
        of our physical theories that the CPC is designed to protect — is a perspectival feature
        of embedded observers, not a constraint on the structure of spacetime itself. A theory
        that allows CTCs is not a theory that permits causality violations; it is a theory that
        treats causality as what it is: an emergent, perspectival regularity, not a fundamental
        law.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════════
         §10  CONCLUSION
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-10">
      <h2 class="section-h2">10. Conclusion</h2>

      <p class="prose">
        We have argued that Hawking's Chronology Protection Conjecture fails as a universal
        prohibition on past-directed time travel for four independent reasons.
      </p>

      <p class="prose">
        First (Section 3), there is no bridging theorem connecting Ford–Roman quantum inequality
        constraints to the thin-shell exotic matter parameters required by traversable wormhole
        stability. The two frameworks are mathematically incommensurable in their present form,
        and the gap has not been closed in the literature.
      </p>

      <p class="prose">
        Second (Section 4), the Kay–Radzikowski–Wald stress-energy divergence theorem applies
        only to compactly generated chronology horizons. Traversable wormholes produce
        non-compactly-generated horizons, which fall outside the theorem's hypothesis. The Li–Gott
        vacuum construction demonstrates that at least one quantum state exists on a
        CTC-containing spacetime without divergence, proving that the divergence is state-dependent
        rather than universal.
      </p>

      <p class="prose">
        Third (Section 4.4), the Hawking–KRW divergence is derived under pure-state boundary
        conditions. The physical argument for expecting a pure state at a chronology horizon — the
        boundary of the causality-violating region — is weak; a mixed state is physically more
        natural. The mixed-state regime has not been analysed, and until it is, the divergence
        result cannot be claimed as a physical prediction rather than a mathematical artifact.
      </p>

      <p class="prose">
        Fourth (Section 5), the combined stress-energy configuration of rotating matter, exotic
        matter shell, and their Kerr coupling demonstrates that near-extremal rotation reduces the
        exotic matter requirement to near zero. The Kerr suppression factor
        <KatexInline latex={String.raw`\sqrt{1 - a^2/M^2}`} description="square root of one minus a-squared over M-squared: the Kerr suppression factor" />
        eliminates the practical objection that exotic matter requirements are physically
        unreasonable.
      </p>

      <p class="prose">
        The positive case — a stable, traversable, rotating wormhole throat parameterised by
        <KatexInline latex={String.raw`(a_0, \sigma_{\text{throat}}, \eta_s)`} description="the three anchor constants" /> —
        is consistent with all known physical constraints and generates the falsifiable GW echo
        spectrum of Eq. (9b). Milestone 1 of the observational roadmap is achievable with
        near-future detector technology.
      </p>

      <p class="prose">
        The theological and historical codas are not decorative. They situate the physics in a
        wider intellectual tradition that has independently arrived at structural conclusions —
        the block universe, consistent-histories causality, temporal granularity — that the
        physics of CTCs now makes precise. The chronology protection conjecture was, in
        retrospect, a category error: it attempted to enforce at the level of fundamental physics
        a constraint that is properly emergent at the level of embedded observers.
      </p>

      <p class="prose coda-close">
        Time, as Boethius understood, is <em>tota simul</em> — all at once — from the outside.
        The physics of closed timelike curves is the mathematical grammar of what that looks like
        from within.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════════
         REFERENCES
    ═══════════════════════════════════════════════════════ -->
    <section id="sec-refs" class="refs-section">
      <h2 class="section-h2">References</h2>

      <ol class="refs">
        <li>Boethius, A. M. S. (c. 524). <em>Consolatio Philosophiae</em>, Book V. Trans. V. E. Watts. Penguin Classics, 1969.</li>
        <li>Deutsch, D. (1991). Quantum mechanics near closed timelike lines. <em>Physical Review D</em>, 44(10), 3197–3217.</li>
        <li>Ford, L. H., &amp; Roman, T. A. (1995). Averaged energy conditions and quantum inequalities. <em>Physical Review D</em>, 51(8), 4277–4286.</li>
        <li>Ford, L. H., &amp; Roman, T. A. (1997). Restrictions on negative energy density in flat spacetime. <em>Physical Review D</em>, 55(4), 2082–2089.</li>
        <li>Gott, J. R. (1991). Closed timelike curves produced by pairs of moving cosmic strings. <em>Physical Review Letters</em>, 66(9), 1126–1129.</li>
        <li>Hawking, S. W. (1992). Chronology protection conjecture. <em>Physical Review D</em>, 46(2), 603–611.</li>
        <li>Israel, W. (1966). Singular hypersurfaces and thin shells in general relativity. <em>Il Nuovo Cimento B</em>, 44(1), 1–14.</li>
        <li>Kay, B. S., Radzikowski, M. J., &amp; Wald, R. M. (1997). Quantum field theory on spacetimes with a compactly generated Cauchy horizon. <em>Communications in Mathematical Physics</em>, 183(3), 533–556.</li>
        <li>Kerr, R. P. (1963). Gravitational field of a spinning mass as an example of algebraically special metrics. <em>Physical Review Letters</em>, 11(5), 237–238.</li>
        <li>Landauer, R. (1961). Irreversibility and heat generation in the computing process. <em>IBM Journal of Research and Development</em>, 5(3), 183–191.</li>
        <li>Li, L.-X., &amp; Gott, J. R. (1998). Self-consistent vacuum for Misner space and the chronology protection conjecture. <em>Physical Review Letters</em>, 80(13), 2980–2983.</li>
        <li>Morris, M. S., &amp; Thorne, K. S. (1988). Wormholes in spacetime and their use for interstellar travel. <em>American Journal of Physics</em>, 56(5), 395–412.</li>
        <li>Morris, M. S., Thorne, K. S., &amp; Yurtsever, U. (1988). Wormholes, time machines, and the weak energy condition. <em>Physical Review Letters</em>, 61(13), 1446–1449.</li>
        <li>Novikov, I. D. (1989). An analysis of the operation of a time machine. <em>Journal of Experimental and Theoretical Physics</em>, 68(3), 439–443.</li>
        <li>Thomas Aquinas (c. 1274). <em>Summa Theologiae</em>, Ia, Q. 14, Art. 13. Trans. Fathers of the English Dominican Province. Benziger Bros., 1947.</li>
        <li>Thorne, K. S. (1994). <em>Black Holes and Time Warps: Einstein's Outrageous Legacy</em>. W. W. Norton &amp; Company.</li>
        <li>Visser, M. (1995). <em>Lorentzian Wormholes: From Einstein to Hawking</em>. AIP Press.</li>
        <li>Visser, M., Kar, S., &amp; Dadhich, N. (2003). Traversable wormholes with arbitrarily small energy condition violations. <em>Physical Review Letters</em>, 90(20), 201102.</li>
        <li>Wald, R. M. (1984). <em>General Relativity</em>. University of Chicago Press.</li>
        <li>Wald, R. M. (1994). <em>Quantum Field Theory in Curved Spacetime and Black Hole Thermodynamics</em>. University of Chicago Press.</li>
      </ol>
    </section>

    <!-- ── Honest-constraints footer ─────────────────────── -->
    <details class="honest-footer">
      <summary>A note on feasibility →</summary>
      <p>
        The simulations and calculations on this site implement the theoretical framework of the
        paper faithfully. The exotic matter requirements shown are physically real constraints —
        at current technology, a macroscopic traversable wormhole is not buildable. This paper
        and its companion tools demonstrate how the physics parameters relate, not that the object
        is constructible. All Tier III (conjectural) and Tier IV (gap) content is marked
        throughout. The goal is to show what the physics permits in principle, and to help
        identify what needs solving for principle to become practice.
      </p>
    </details>

  </main>

  <!-- Right: paper tools -->
  <div class="col-tools">
    <PaperTools />
  </div>

</div>

<style>
  /* ── Three-column layout ─────────────────────────────────── */
  .paper-layout {
    display: grid;
    grid-template-columns: 220px 1fr 240px;
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 48px 24px 80px;
    align-items: start;
  }

  /* ── Paper main column ───────────────────────────────────── */
  .paper-main {
    min-width: 0; /* prevent grid blowout on narrow content */
  }

  /* ── Title ───────────────────────────────────────────────── */
  .paper-title {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 2.5vw, 2rem);
    font-weight: 900;
    color: var(--teal);
    letter-spacing: 1px;
    line-height: 1.25;
    margin-block: 40px 12px;
  }

  .paper-byline {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--sub);
    letter-spacing: 2px;
    margin-bottom: 40px;
  }

  /* ── Abstract box ────────────────────────────────────────── */
  .abstract-box {
    border: 2px solid var(--teal);
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 40px;
  }

  .abstract-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--teal);
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  /* ── Section headings ────────────────────────────────────── */
  .section-h2 {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--teal);
    margin-top: 56px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--dim);
  }

  .section-h3 {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin-top: 32px;
    margin-bottom: 14px;
  }

  /* ── Prose paragraphs ────────────────────────────────────── */
  .prose {
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.65;
    color: var(--text);
    max-width: 68ch;
    margin-block: 16px;
  }

  /* ── Tier legend section ─────────────────────────────────── */
  .tier-legend {
    margin-bottom: 48px;
  }

  /* ── Phase marker placeholder ────────────────────────────── */
  .phase-marker {
    margin-top: 64px;
    padding: 16px 20px;
    border: 1px dashed var(--dim);
    border-radius: 2px;
  }

  .phase-marker p {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--sub);
    margin: 0;
  }

  /* ── References section ──────────────────────────────────── */
  .refs-section {
    margin-top: 56px;
  }

  .refs {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    color: var(--text);
    padding-left: 0;
    list-style-position: inside;
    margin-block: 20px 0;
  }

  .refs li {
    padding-left: 2.5ch;
    text-indent: -2.5ch;
    margin-bottom: 14px;
  }

  .refs li::marker {
    color: var(--sub);
  }

  .refs li a {
    color: var(--teal);
    text-decoration: none;
  }

  .refs li a:hover {
    text-decoration: underline;
  }

  .refs li em,
  .refs li i {
    color: var(--text);
  }

  /* ── §10 closing line ────────────────────────────────────── */
  .coda-close {
    margin-top: 32px;
    font-style: italic;
    text-align: center;
    color: var(--sub);
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.5;
  }

  /* ── Honest-constraints footer ───────────────────────────── */
  .honest-footer {
    background: var(--deep);
    border: 1px solid var(--dim);
    padding: 16px;
    border-radius: 2px;
    margin-block: 48px 24px;
  }

  .honest-footer summary {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 2px;
    color: var(--sub);
    cursor: pointer;
    list-style: none;
    text-transform: uppercase;
    user-select: none;
  }

  /* Hide default disclosure triangle in all browsers */
  .honest-footer summary::-webkit-details-marker { display: none; }

  .honest-footer summary::before {
    content: '›';
    display: inline-block;
    margin-right: 8px;
    transition: transform 0.2s;
  }

  .honest-footer[open] summary::before {
    transform: rotate(90deg);
  }

  .honest-footer p {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    padding-top: 12px;
    margin: 0;
  }

  /* ── Mobile nav dropdown (default: hidden on desktop) ────── */
  .mobile-nav-wrap {
    display: none;
  }

  .mobile-nav-select {
    width: 100%;
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--dim);
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 2px;
  }

  /* ── Condensed tools strip (default: hidden on desktop) ─── */
  .paper-tools-strip {
    display: none;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }

  .strip-btn {
    border: 1px solid var(--dim);
    color: var(--text);
    background: transparent;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 8px 12px;
    border-radius: 2px;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.15s, color 0.15s;
  }

  .strip-btn:hover {
    border-color: var(--teal);
    color: var(--teal);
  }

  /* ── Mobile (<768px) ─────────────────────────────────────── */
  @media (max-width: 767px) {
    .paper-layout {
      grid-template-columns: 1fr;
      gap: 0;
      padding: 24px 20px;
    }

    .col-nav {
      display: none;
    }

    .col-tools {
      display: none;
    }

    .mobile-nav-wrap {
      display: block;
      margin-bottom: 20px;
    }

    .paper-tools-strip {
      display: flex;
    }

    .paper-main {
      max-width: 100%;
    }

    .paper-title {
      font-size: 24px;
    }

    .section-h2 {
      font-size: 22px;
    }

    .abstract-box {
      padding: 16px;
    }
  }

  /* ── Tablet (768px–1023px) ───────────────────────────────── */
  @media (min-width: 768px) and (max-width: 1023px) {
    .paper-layout {
      grid-template-columns: 200px 1fr;
      gap: 24px;
    }

    .col-tools {
      display: none;
    }

    .mobile-nav-wrap {
      display: none;
    }

    .paper-tools-strip {
      display: flex;
    }
  }
</style>
