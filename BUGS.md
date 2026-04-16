# BUGS.md — Known Issues (Deferred)

Running log of visual / content / behaviour bugs caught during phase deploys.
Kept here so they aren't lost, but deferred until a dedicated bugfix pass
(typically between a phase deploy and the next phase, or at final polish).

**Rule:** Claude Code must not fix items in this file unless explicitly instructed.
Phase prompts should state "do not touch anything in BUGS.md" to prevent drift.

---

## OPEN

### BUG-001 — Auxiliary Claims A/B/C/D mis-tagged as Tier I
- **Caught:** Phase 2A deploy, 2026-04-16
- **Location:** `src/routes/paper/+page.svelte`, §2.2 of the paper page
- **Severity:** HIGH — factual contradiction visible to readers
- **Symptom:** All four Auxiliary Claim boxes render with
  "TIER I — CONFIRMED FOUNDATION" chrome. The paragraph directly below
  says "Sections 3–6 argue that Claims A, B, C, and D all fail."
  Labels directly contradict the surrounding prose.
- **Root cause:** Upstream prompt specified
  `<EpistemicCallout tier={1}>` for these claims. Epistemic-tier chrome is
  the wrong visual category for CPC requirements being *quoted* — those
  claims are not tier assignments by the author; they are premises of
  Hawking's argument that the paper proceeds to challenge.
- **Fix direction:** Create a new `<RequirementCallout>` component with
  neutral styling (dim border, no tier colour, label "CPC AUXILIARY CLAIM").
  Replace the four `<EpistemicCallout tier={1}>` instances in §2.2 with it.
  Leave the Tier Legend's four `<EpistemicCallout>` demos untouched —
  those correctly use tier chrome.

### BUG-002 — Inline KaTeX description text may be leaking visually
- **Caught:** Phase 2A deploy, 2026-04-16
- **Location:** every `<KatexInline>` call site across §1–§5
- **Severity:** UNKNOWN — needs visual confirmation
- **Symptom:** Scraped DOM shows description text ("a-sub-zero:
  equilibrium throat radius") adjacent to rendered inline math.
  Could be:
  - (a) correct accessibility behaviour — `.sr-only` hides the description
    visually, scraper captures it anyway for screen-reader purposes.
  - (b) real bug — `.sr-only` not applying, descriptions render as
    clutter next to every inline equation.
- **Fix direction (if b):** confirm `.sr-only` rule in `src/app.css` is
  the standard absolute-positioned clip pattern, and that it's being
  applied to the sr-only span inside `KatexInline.svelte`. If classname
  is wrong or missing, add it.
- **Verify by:** loading `/paper` in a browser (not a scraper) and
  visually checking §5 around Eq. (5.4).

---

## FIXED
(none yet)

---

## WON'T FIX
(none yet)