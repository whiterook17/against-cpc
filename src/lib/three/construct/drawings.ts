// src/lib/three/construct/drawings.ts
// Extracted canvas drawing functions from throat_construct_wireframe.html.
// All colours read from CSS variables via color() — no hardcoded hex.

export interface DrawState {
  labels: boolean;
  dims: boolean;
  eqs: boolean;
  layers: { torus: boolean; coupling: boolean; casimir: boolean; throat: boolean };
  view: 'axial' | 'longit' | 'cutaway';
}

// ── COLOUR HELPERS ──────────────────────────────────────────────────────────
// Cache populated once per draw call from getComputedStyle
interface ColCache {
  navy: string; deep: string; teal: string; gold: string;
  red: string; purple: string; green: string; dim: string;
  text: string; sub: string;
}

function buildColCache(): ColCache {
  const s = getComputedStyle(document.body);
  const g = (v: string) => s.getPropertyValue(v).trim();
  return {
    navy:   g('--navy'),
    deep:   g('--deep'),
    teal:   g('--teal'),
    gold:   g('--gold'),
    red:    g('--red'),
    purple: g('--purple'),
    green:  g('--green'),
    dim:    g('--dim'),
    text:   g('--text'),
    sub:    g('--sub'),
  };
}

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── DRAW HELPERS ─────────────────────────────────────────────────────────────
function ln(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  c: string, w = 1, d: number[] = []
) {
  ctx.save();
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.setLineDash(d);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}

function dimLn(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  label: string, c: string,
  S: DrawState
) {
  if (!S.dims) return;
  ctx.save();
  ctx.strokeStyle = rgba(c, .45); ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]);
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len * 14, ny = dx / len * 14;
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x1 + nx, y1 + ny);
  ctx.moveTo(x2, y2); ctx.lineTo(x2 + nx, y2 + ny);
  ctx.moveTo(x1 + nx, y1 + ny); ctx.lineTo(x2 + nx, y2 + ny);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = rgba(c, .8); ctx.font = '10px Share Tech Mono';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, (x1 + x2) / 2 + nx * 1.8, (y1 + y2) / 2 + ny * 1.8);
  ctx.restore();
}

function ldrBox(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, bx: number, by: number,
  title: string, body: string | null, c: string,
  S: DrawState, CL: ColCache
) {
  if (!S.labels) return;
  ctx.save();
  ctx.strokeStyle = rgba(c, .45); ctx.lineWidth = 0.8; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
  const bw = 155, bh = body ? 40 : 22, px = bx < 450 ? bx - bw - 4 : bx + 4, py = by - bh / 2;
  ctx.fillStyle = rgba(CL.deep, .93); ctx.strokeStyle = rgba(c, .6); ctx.lineWidth = 0.8;
  ctx.fillRect(px, py, bw, bh); ctx.strokeRect(px, py, bw, bh);
  ctx.fillStyle = c; ctx.fillRect(px, py, 2, bh);
  ctx.fillStyle = c; ctx.font = 'bold 9px Share Tech Mono'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(title, px + 8, py + 5);
  if (body) { ctx.fillStyle = rgba(CL.text, .65); ctx.font = '9px Share Tech Mono'; ctx.fillText(body, px + 8, py + 20); }
  ctx.restore();
}

function eqBx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, lbl: string, eq: string, c: string,
  S: DrawState, CL: ColCache
) {
  if (!S.eqs) return;
  ctx.save();
  const w = 215, h = 36;
  ctx.fillStyle = rgba(CL.navy, .95); ctx.strokeStyle = rgba(c, .5); ctx.lineWidth = 0.8;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = rgba(c, .55); ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(lbl, x + 6, y + 4);
  ctx.fillStyle = CL.text; ctx.font = '10px Share Tech Mono'; ctx.fillText(eq, x + 6, y + 19);
  ctx.restore();
}

function annC(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, num: string, c: string,
  S: DrawState
) {
  if (!S.labels) return;
  ctx.save();
  ctx.fillStyle = rgba(c, .2); ctx.strokeStyle = c; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c; ctx.font = 'bold 10px Share Tech Mono'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(num, x, y); ctx.restore();
}

function corners(ctx: CanvasRenderingContext2D, W: number, H: number, CL: ColCache) {
  ([[0, 0], [W, 0], [0, H], [W, H]] as [number, number][]).forEach(([x, y]) => {
    const dx = x === 0 ? 1 : -1, dy = y === 0 ? 1 : -1;
    ctx.strokeStyle = rgba(CL.teal, .3); ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x + dx * 16, y); ctx.lineTo(x + dx * 3, y); ctx.lineTo(x + dx * 3, y + dy * 16);
    ctx.moveTo(x, y + dy * 16); ctx.lineTo(x, y + dy * 3); ctx.lineTo(x + dx * 16, y + dy * 3);
    ctx.stroke();
  });
}

function grid(ctx: CanvasRenderingContext2D, W: number, H: number, CL: ColCache) {
  ctx.strokeStyle = rgba(CL.teal, .04); ctx.lineWidth = 0.5; ctx.setLineDash([]);
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

// ── AXIAL ────────────────────────────────────────────────────────────────────
function axial(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, cx: number, cy: number,
  frame: number, S: DrawState, CL: ColCache
) {
  const t = frame * 0.012;
  grid(ctx, W, H, CL);
  ln(ctx, cx, 20, cx, H - 20, rgba(CL.dim, .4), 0.8, [6, 6]);
  ln(ctx, 20, cy, W - 20, cy, rgba(CL.dim, .4), 0.8, [6, 6]);
  if (S.labels) {
    ctx.fillStyle = rgba(CL.sub, .55); ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'center'; ctx.fillText('z-AXIS (SPIN)', cx, 13);
    ctx.textAlign = 'right'; ctx.fillText('r-AXIS', W - 10, cy - 6);
  }

  // L1 TORUS
  if (S.layers.torus) {
    const Rm = 185, rm = 54;
    for (let i = 0; i < 5; i++) {
      const r = Rm + rm + 22 + i * 22;
      ctx.save(); ctx.strokeStyle = rgba(CL.teal, 0.1 - i * 0.015); ctx.lineWidth = 0.8; ctx.setLineDash([4, 14 + i * 3]);
      ctx.beginPath(); ctx.arc(cx, cy, r, t * 0.4 + i, t * 0.4 + i + Math.PI * 1.6); ctx.stroke(); ctx.restore();
    }
    ([[ cx - Rm, cy], [cx + Rm, cy], [cx, cy - Rm], [cx, cy + Rm]] as [number, number][]).forEach(([lx, ly]) => {
      const g = ctx.createRadialGradient(lx - 12, ly - 12, 0, lx, ly, rm);
      g.addColorStop(0, '#1e3e60'); g.addColorStop(1, '#0a1e3a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, rm, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = CL.teal; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(lx, ly, rm, 0, Math.PI * 2); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, rm, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = rgba(CL.teal, .13); ctx.lineWidth = 0.6;
      for (let hx = lx - rm; hx < lx + rm; hx += 9) { ctx.beginPath(); ctx.moveTo(hx, ly - rm); ctx.lineTo(hx, ly + rm); ctx.stroke(); }
      ctx.strokeStyle = rgba(CL.teal, .22); ctx.lineWidth = 0.9; ctx.setLineDash([6, 6]);
      ctx.translate(lx, ly); ctx.rotate(t * 0.55);
      ctx.beginPath(); ctx.arc(0, 0, rm - 9, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
    ctx.strokeStyle = rgba(CL.teal, .14); ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.arc(cx, cy, Rm, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.strokeStyle = rgba(CL.teal, .9); ctx.lineWidth = 1.4; ctx.fillStyle = CL.teal;
    ctx.beginPath(); ctx.arc(cx - Rm, cy, rm - 6, -Math.PI / 2, Math.PI / 3, false); ctx.stroke();
    const ang = Math.PI / 3, ax = cx - Rm + (rm - 6) * Math.cos(ang), ay = cy + (rm - 6) * Math.sin(ang);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 9 * Math.cos(ang - 1.3), ay - 9 * Math.sin(ang - 1.3)); ctx.lineTo(ax - 9 * Math.cos(ang + 0.4), ay - 9 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
    ctx.restore();
    annC(ctx, cx - Rm + rm + 14, cy - rm + 12, '①', CL.teal, S);
    ldrBox(ctx, cx - Rm, cy - rm - 10, 100, 178, '① ROTATING TORUS', 'Dense matter  a→M  T^tφ≠0', CL.teal, S, CL);
    dimLn(ctx, cx, cy + Rm + 72, cx - Rm, cy + Rm + 72, 'R_major', CL.teal, S);
    dimLn(ctx, cx - Rm, cy, cx - Rm, cy - rm, 'r_minor', CL.dim, S);
    if (S.labels) {
      ctx.fillStyle = rgba(CL.gold, .7); ctx.font = 'bold 10px Share Tech Mono'; ctx.textAlign = 'center';
      ctx.fillText('↑ J', cx + 10, 38);
    }
    ctx.strokeStyle = CL.gold; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx, H - 32); ctx.lineTo(cx, 30); ctx.stroke();
    ctx.fillStyle = CL.gold;
    ctx.beginPath(); ctx.moveTo(cx, 28); ctx.lineTo(cx - 5, 40); ctx.lineTo(cx + 5, 40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, H - 30); ctx.lineTo(cx - 5, H - 42); ctx.lineTo(cx + 5, H - 42); ctx.closePath(); ctx.fill();
    if (S.labels) {
      ctx.font = '9px Share Tech Mono'; ctx.fillStyle = CL.gold; ctx.textAlign = 'left';
      ctx.fillText('J', cx + 6, H - 34); ctx.fillText('J', cx + 6, 34);
    }
    annC(ctx, cx + 8, 60, '⑥', CL.gold, S);
    eqBx(ctx, 12, 50, '// LENSE-THIRRING', 'Ω_LT = GJ/c²r³·(3cos²θ−1)', CL.gold, S, CL);
  }

  // L2 COUPLING
  if (S.layers.coupling) {
    const Re = 138;
    const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Re);
    eg.addColorStop(0, rgba(CL.green, .0)); eg.addColorStop(.7, rgba(CL.green, .07)); eg.addColorStop(1, rgba(CL.green, .0));
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(CL.green, .45); ctx.lineWidth = 1; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 5; i++) {
      const ph = t * 0.45 + i * Math.PI * 2 / 5;
      ctx.save(); ctx.strokeStyle = rgba(CL.green, .15); ctx.lineWidth = 0.7; ctx.setLineDash([3, 9]);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.06) {
        const r = 28 + (Re - 36) * ((a + ph) % (Math.PI * 2)) / (Math.PI * 2);
        const px = cx + r * Math.cos(a + ph * 0.25), py = cy + r * Math.sin(a + ph * 0.25);
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
    }
    annC(ctx, cx + Re - 14, cy - 22, '③', CL.green, S);
    ldrBox(ctx, cx + Re, cy, W - 50, 138, '③ COUPLING ZONE', 'ω(r,θ) max  Kerr suppressed', CL.green, S, CL);
    dimLn(ctx, cx, cy, cx + Re, cy, 'R_erg', CL.green, S);
    eqBx(ctx, W - 232, 90, '// KERR SUPPRESSION', '|τ| ~ √(1 − a²/M²)', CL.gold, S, CL);
    annC(ctx, W - 232 + 8, 90 + 8, '⑧', CL.sub, S);
    eqBx(ctx, W - 232, 135, '// COUPLING TENSOR', 'T_cpl ~ a·ρ_ex·ε^μναβ u_α k_β', CL.sub, S, CL);
  }

  // L3 CASIMIR
  if (S.layers.casimir) {
    const rr = [96, 82, 68, 56, 46];
    const cg = ctx.createRadialGradient(cx, cy, rr[rr.length - 1], cx, cy, rr[0]);
    cg.addColorStop(0, rgba(CL.purple, .2)); cg.addColorStop(1, rgba(CL.purple, .0));
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rr[0], 0, Math.PI * 2); ctx.fill();
    rr.forEach((r, i) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.28);
      ctx.strokeStyle = rgba(CL.purple, 0.58 - i * 0.08); ctx.lineWidth = i === 0 ? 1.6 : 0.9;
      ctx.setLineDash(i === 0 ? [] : [4, 5 + i * 2]);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.28);
    ctx.strokeStyle = rgba(CL.purple, .12); ctx.lineWidth = 0.6; ctx.setLineDash([]);
    for (let a = -rr[0]; a < rr[0]; a += 10) {
      const h = Math.sqrt(Math.max(0, rr[0] * rr[0] - a * a));
      ctx.beginPath(); ctx.moveTo(a, -h); ctx.lineTo(a, h); ctx.stroke();
    }
    ctx.restore();
    annC(ctx, cx - rr[0] + 10, cy + rr[0] - 10, '④', CL.purple, S);
    ldrBox(ctx, cx - rr[0] + 2, cy + 10, 82, 368, '④ CASIMIR ARRAY', 'NEC violated  ρ_ex<0  P~1/d⁴', CL.purple, S, CL);
    dimLn(ctx, cx, cy, cx - rr[0], cy, 'R_cas', CL.purple, S);
    eqBx(ctx, 12, H - 130, '// CASIMIR PRESSURE', 'P = −π²ℏc / 240d⁴', CL.purple, S, CL);
    if (S.labels) { annC(ctx, 12 + 8, H - 130 + 8, '⑦', CL.sub, S); }
  }

  // L4 THROAT
  if (S.layers.throat) {
    const a0 = 40, pulse = a0 + 3.5 * Math.sin(t * 2);
    const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse + 24);
    tg.addColorStop(0, rgba(CL.purple, .78)); tg.addColorStop(.5, rgba(CL.purple, .22)); tg.addColorStop(1, rgba(CL.purple, .0));
    ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(cx, cy, pulse + 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#060314'; ctx.beginPath(); ctx.arc(cx, cy, a0 - 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CL.purple; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = rgba(CL.purple, .4); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, a0 - 2, 0, Math.PI * 2); ctx.stroke();
    if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = 'bold 8px Orbitron,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THROAT', cx, cy); }
    if (S.dims) {
      ln(ctx, cx, cy, cx + a0, cy, CL.purple, 1);
      ctx.fillStyle = CL.purple; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + a0, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = '11px Share Tech Mono'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('a₀', cx + 5, cy - 9); }
    }
    annC(ctx, cx + a0 + 20, cy - a0 - 12, '⑤', CL.red, S);
    ldrBox(ctx, cx + a0 + 8, cy - a0, W - 52, 338, '⑤ THROAT  a₀', 'Israel junc.  δä+2η_sδȧ+ω₀²δa=0', CL.red, S, CL);
    eqBx(ctx, W - 232, H - 120, '// ECHO SPECTRUM (9b)', 'Ḣ(f)=A₀(f/f₀)²e^(−η_sf/f₀²)', CL.purple, S, CL);
  }

  // Annotation ② ergosphere
  if (S.labels && S.layers.coupling) {
    const Re = 138;
    annC(ctx, cx + Re * 0.7, cy - Re * 0.7, '②', CL.gold, S);
    ldrBox(ctx, cx + Re * 0.72, cy - Re * 0.72, W - 52, 80, '② ERGOSPHERE', 'g_tt=0  co-rotation mandatory', CL.gold, S, CL);
  }

  corners(ctx, W, H, CL);
  if (S.labels) { ctx.fillStyle = rgba(CL.sub, .45); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText('NOT TO SCALE  |  GR GEOMETRY  |  BOYER–LINDQUIST COORDS', W - 12, H - 8); }
}

// ── LONGITUDINAL ─────────────────────────────────────────────────────────────
function longit(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, cx: number, cy: number,
  frame: number, S: DrawState, CL: ColCache
) {
  const t = frame * 0.012;
  grid(ctx, W, H, CL);
  ln(ctx, 20, cy, W - 20, cy, rgba(CL.gold, .4), 1, [6, 6]);
  ctx.fillStyle = CL.gold; ctx.font = 'bold 11px Share Tech Mono'; ctx.textAlign = 'left';
  ctx.fillText('→ SPIN AXIS  J', 26, cy - 9);
  ctx.beginPath(); ctx.moveTo(26, cy); ctx.lineTo(80, cy); ctx.stroke();
  ctx.fillStyle = CL.gold; ctx.beginPath(); ctx.moveTo(82, cy); ctx.lineTo(72, cy - 4); ctx.lineTo(72, cy + 4); ctx.closePath(); ctx.fill();

  if (S.layers.torus) {
    const tr = 54, sp = 188;
    ([-1, 1] as number[]).forEach(side => {
      const tx = cx + side * sp;
      const tg = ctx.createRadialGradient(tx - 12, cy - 12, 0, tx, cy, tr);
      tg.addColorStop(0, '#1e3e60'); tg.addColorStop(1, '#0a1e3a');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(tx, cy, tr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = CL.teal; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(tx, cy, tr, 0, Math.PI * 2); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(tx, cy, tr, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = rgba(CL.teal, .12); ctx.lineWidth = 0.6;
      for (let hx = tx - tr; hx < tx + tr; hx += 9) { ctx.beginPath(); ctx.moveTo(hx, cy - tr); ctx.lineTo(hx, cy + tr); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = rgba(CL.teal, .8); ctx.lineWidth = 1.2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(tx, cy, tr - 8, -Math.PI / 2, Math.PI / 2, side < 0); ctx.stroke();
      ctx.fillStyle = CL.teal;
      const aang = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const aax = tx + (tr - 8) * Math.cos(aang), aay = cy + (tr - 8) * Math.sin(aang);
      ctx.beginPath();
      ctx.moveTo(aax, aay);
      ctx.lineTo(aax - 8 * Math.cos(aang - 1.2 * side), aay - 8 * Math.sin(aang - 1.2 * side));
      ctx.lineTo(aax - 8 * Math.cos(aang + 0.4 * side), aay - 8 * Math.sin(aang + 0.4 * side));
      ctx.closePath(); ctx.fill();
      if (S.labels) { ctx.fillStyle = rgba(CL.teal, .8); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'center'; ctx.fillText(side < 0 ? '←Ω' : 'Ω→', tx, cy + tr + 16); }
    });
    ln(ctx, cx - sp + tr, cy - tr, cx + sp - tr, cy - tr, rgba(CL.teal, .22), 1, [4, 4]);
    ln(ctx, cx - sp + tr, cy + tr, cx + sp - tr, cy + tr, rgba(CL.teal, .22), 1, [4, 4]);
    ldrBox(ctx, cx - sp, cy - tr - 8, 90, 175, '① TORUS LOBE', 'Spin axis aligned  a→M', CL.teal, S, CL);
    dimLn(ctx, cx - sp - tr, cy + tr + 44, cx + sp + tr, cy + tr + 44, '2·R_total', CL.teal, S);
    dimLn(ctx, cx - sp - tr, cy, cx - sp - tr, cy - tr, 'r_min', CL.dim, S);
  }
  if (S.layers.coupling) {
    const Re = 138;
    const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Re);
    eg.addColorStop(0, rgba(CL.green, .0)); eg.addColorStop(.7, rgba(CL.green, .06)); eg.addColorStop(1, rgba(CL.green, .0));
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(CL.green, .4); ctx.lineWidth = 1; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ldrBox(ctx, cx + Re, cy - 20, W - 42, 195, '③ COUPLING ZONE', 'Max ω(r,θ)  ergosphere interior', CL.green, S, CL);
    dimLn(ctx, cx, cy, cx, cy - Re, 'R_erg', CL.green, S);
    eqBx(ctx, 12, H - 80, '// KERR SUPPRESSION', '|τ|~(c²/G)·a₀⁻²·√(1−a²/M²)', CL.gold, S, CL);
  }
  if (S.layers.casimir) {
    const rr = [96, 82, 68, 56];
    const cg = ctx.createRadialGradient(cx, cy, rr[3], cx, cy, rr[0]);
    cg.addColorStop(0, rgba(CL.purple, .2)); cg.addColorStop(1, rgba(CL.purple, .0));
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rr[0], 0, Math.PI * 2); ctx.fill();
    rr.forEach((r, i) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.2);
      ctx.strokeStyle = rgba(CL.purple, 0.55 - i * 0.08); ctx.lineWidth = i === 0 ? 1.5 : 0.9;
      ctx.setLineDash(i === 0 ? [] : [4, 5 + i * 2]);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    ldrBox(ctx, cx - rr[0] - 2, cy + 10, 74, 355, '④ CASIMIR ARRAY', 'd≪1μm  P_cas=−π²ℏc/240d⁴', CL.purple, S, CL);
    dimLn(ctx, cx, cy, cx - rr[0], cy, 'R_cas', CL.purple, S);
  }
  if (S.layers.throat) {
    const a0 = 40, pulse = a0 + 3.5 * Math.sin(frame * 0.024);
    const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse + 24);
    tg.addColorStop(0, rgba(CL.purple, .78)); tg.addColorStop(.5, rgba(CL.purple, .22)); tg.addColorStop(1, rgba(CL.purple, .0));
    ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(cx, cy, pulse + 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#060314'; ctx.beginPath(); ctx.arc(cx, cy, a0 - 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CL.purple; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2); ctx.stroke();
    if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = 'bold 8px Orbitron,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THROAT', cx, cy); }
    if (S.dims) {
      ln(ctx, cx, cy, cx + a0, cy, CL.purple, 1);
      ctx.fillStyle = CL.purple; ctx.beginPath(); ctx.arc(cx + a0, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = '11px Share Tech Mono'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('a₀', cx + 5, cy - 9); }
    }
    ldrBox(ctx, cx + a0 + 8, cy - a0, W - 52, 310, '⑤ THROAT  a₀', 'σ_throat  η_s  oscillation', CL.red, S, CL);
  }
  corners(ctx, W, H, CL);
  if (S.labels) { ctx.fillStyle = rgba(CL.sub, .45); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText('NOT TO SCALE  |  LONGITUDINAL SECTION  |  SPIN AXIS HORIZONTAL', W - 12, H - 8); }
}

// ── CUTAWAY ──────────────────────────────────────────────────────────────────
function cutaway(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, cx: number, cy: number,
  frame: number, S: DrawState, CL: ColCache
) {
  const t = frame * 0.012;
  grid(ctx, W, H, CL);
  ln(ctx, cx, 20, cx, H - 20, rgba(CL.gold, .2), 0.8, [4, 4]);
  if (S.labels) { ctx.fillStyle = rgba(CL.gold, .45); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'center'; ctx.fillText('CUT PLANE', cx, 16); }

  const layerDefs = [
    { key: 'torus'    as const, R: 185, c: CL.teal,   a: .7, lbl: 'L1 TORUS',        n: '①' },
    { key: 'coupling' as const, R: 138, c: CL.green,  a: .4, lbl: 'L2 ERGOSPHERE',   n: '③' },
    { key: 'casimir'  as const, R: 96,  c: CL.purple, a: .6, lbl: 'L3 CASIMIR',      n: '④' },
    { key: 'throat'   as const, R: 40,  c: CL.red,    a: .9, lbl: 'L4 THROAT',       n: '⑤' },
  ];

  layerDefs.forEach(({ key, R, c, a, lbl, n }) => {
    if (!S.layers[key]) return;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.lineTo(cx, cy); ctx.closePath();
    ctx.fillStyle = rgba(c, a * 0.15); ctx.fill();
    ctx.strokeStyle = rgba(c, a * 0.75); ctx.lineWidth = key === 'throat' ? 2 : 1.3; ctx.setLineDash([]); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI / 2, Math.PI * 3 / 2);
    ctx.strokeStyle = rgba(c, a * 0.3); ctx.lineWidth = 0.8; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 3, R, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, 0.1); ctx.strokeStyle = rgba(c, 0.55); ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.fill(); ctx.stroke(); ctx.restore();
    if (S.labels) {
      const lx = cx + R + 12, ly = cy - (R * 0.28);
      ctx.fillStyle = rgba(c, .85); ctx.font = 'bold 9px Share Tech Mono'; ctx.textAlign = 'left';
      ctx.fillText(`${n} ${lbl}`, lx + 4, ly);
      ln(ctx, cx + R, cy, lx + 2, ly - 3, rgba(c, .4), 0.7, [3, 3]);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx + R, cy, 2, 0, Math.PI * 2); ctx.fill();
    }
  });

  if (S.layers.coupling) {
    for (let i = 0; i < 6; i++) {
      const r = 22 + 106 * (i / 5);
      ctx.save(); ctx.strokeStyle = rgba(CL.green, 0.13); ctx.lineWidth = 0.8; ctx.setLineDash([3, 8]);
      ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI / 2, Math.PI * 3 / 2, false); ctx.stroke(); ctx.restore();
    }
  }

  if (S.layers.casimir) {
    for (let i = 0; i < 6; i++) {
      const yr = cy - (30 + i * 12);
      const xr = cx - Math.sqrt(Math.max(0, 96 * 96 - (yr - cy) * (yr - cy)));
      ctx.strokeStyle = rgba(CL.purple, .28 + i * .05); ctx.lineWidth = 0.9; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(cx, yr); ctx.lineTo(xr, yr); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 2 * cy - yr); ctx.lineTo(xr, 2 * cy - yr); ctx.stroke();
    }
  }

  if (S.layers.throat) {
    const a0 = 40, pulse = a0 + 3.5 * Math.sin(t * 2);
    const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse + 24);
    tg.addColorStop(0, rgba(CL.purple, .8)); tg.addColorStop(.5, rgba(CL.purple, .3)); tg.addColorStop(1, rgba(CL.purple, .0));
    ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(cx, cy, pulse + 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#060314'; ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CL.purple; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2); ctx.stroke();
    if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = 'bold 8px Orbitron,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THROAT', cx, cy); }
    if (S.dims) {
      ln(ctx, cx, cy, cx + a0, cy, CL.purple, 1);
      ctx.fillStyle = CL.purple; ctx.beginPath(); ctx.arc(cx + a0, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      if (S.labels) { ctx.fillStyle = CL.purple; ctx.font = '11px Share Tech Mono'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('a₀', cx + 5, cy - 9); }
    }
  }

  if (S.eqs) {
    eqBx(ctx, 12, H - 120, '// ISRAEL JUNCTION', '[K_ij]−h_ij[K] = −8πG·S_ij', CL.teal, S, CL);
    eqBx(ctx, 12, H - 78, '// THROAT OSCILLATOR', 'δä+2η_s·δȧ+(σ/a₀²)·δa = 0', CL.purple, S, CL);
    eqBx(ctx, W - 232, H - 78, '// ECHO SPECTRUM 9b', 'Ḣ(f)=A₀·(f/f₀)²·e^(−η_sf/f₀²)', CL.gold, S, CL);
  }
  corners(ctx, W, H, CL);
  if (S.labels) { ctx.fillStyle = rgba(CL.sub, .45); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText('NOT TO SCALE  |  CUTAWAY VIEW  |  LEFT HALF REMOVED', W - 12, H - 8); }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────
export function drawHifi(
  canvas: HTMLCanvasElement,
  frame: number,
  S: DrawState
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CL = buildColCache();
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CL.navy; ctx.fillRect(0, 0, W, H);
  if (S.view === 'axial')   axial(ctx, W, H, cx, cy, frame, S, CL);
  if (S.view === 'longit')  longit(ctx, W, H, cx, cy, frame, S, CL);
  if (S.view === 'cutaway') cutaway(ctx, W, H, cx, cy, frame, S, CL);
}

export function drawCasimir(canvas: HTMLCanvasElement, frame: number, S: DrawState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CL = buildColCache();
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CL.navy; ctx.fillRect(0, 0, W, H);
  const t = frame * 0.012;
  const plates = 8, sp = 38, sx = 22, ht = 78;
  for (let i = 0; i < plates; i++) {
    const x = sx + i * sp;
    ctx.fillStyle = rgba(CL.purple, .65 + Math.sin(t + i) * 0.1);
    ctx.fillRect(x - 2, H / 2 - ht / 2, 4, ht);
    ctx.strokeStyle = CL.purple; ctx.lineWidth = 0.8; ctx.setLineDash([]);
    ctx.strokeRect(x - 2, H / 2 - ht / 2, 4, ht);
    ctx.save(); ctx.beginPath(); ctx.rect(x - 2, H / 2 - ht / 2, 4, ht); ctx.clip();
    ctx.strokeStyle = rgba(CL.purple, .4); ctx.lineWidth = 0.6;
    for (let hy = H / 2 - ht / 2; hy < H / 2 + ht / 2; hy += 5) { ctx.beginPath(); ctx.moveTo(x - 4, hy); ctx.lineTo(x + 4, hy); ctx.stroke(); }
    ctx.restore();
    if (i < plates - 1) {
      const gg = ctx.createLinearGradient(x + 2, H / 2, x + sp - 2, H / 2);
      gg.addColorStop(0, rgba(CL.purple, .0)); gg.addColorStop(.5, rgba(CL.purple, .18)); gg.addColorStop(1, rgba(CL.purple, .0));
      ctx.fillStyle = gg; ctx.fillRect(x + 2, H / 2 - ht / 2 + 5, sp - 4, ht - 10);
      if (S.dims && i === 3) { dimLn(ctx, x + 2, H / 2 + ht / 2 + 12, x + sp - 2, H / 2 + ht / 2 + 12, 'd ≪ 1μm', CL.purple, S); }
    }
    if (S.labels && i === 0) { ctx.fillStyle = rgba(CL.purple, .7); ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'center'; ctx.fillText('CONDUCTOR', x, H / 2 - ht / 2 - 6); }
  }
  if (S.labels) {
    const mid = sx + plates * sp / 2;
    ctx.fillStyle = rgba(CL.purple, .6); ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'center';
    ctx.fillText('← Casimir attraction (negative energy density in gap) →', mid, H - 5);
  }
  if (S.eqs) { ctx.fillStyle = rgba(CL.purple, .75); ctx.font = '9px Share Tech Mono'; ctx.textAlign = 'right'; ctx.fillText('P = −π²ℏc / 240d⁴', W - 6, 13); }
}

export function drawOscillator(canvas: HTMLCanvasElement, frame: number, S: DrawState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CL = buildColCache();
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CL.navy; ctx.fillRect(0, 0, W, H);
  const eta = 0.15, w0 = 1.0, wd = Math.sqrt(Math.max(0, w0 * w0 - eta * eta));
  const pL = 32, pR = 16, pT = 16, pB = 28;
  const pW = W - pL - pR, pH = H - pT - pB;
  const ox = pL, oy = pT + pH / 2;
  ln(ctx, ox, pT, ox, pT + pH, rgba(CL.dim, .6), 0.8);
  ln(ctx, ox, oy, ox + pW, oy, rgba(CL.dim, .6), 0.8);
  if (S.labels) {
    ctx.fillStyle = rgba(CL.sub, .6); ctx.font = '8px Share Tech Mono';
    ctx.textAlign = 'center'; ctx.fillText('time →', ox + pW - 12, oy + 14);
    ctx.textAlign = 'right'; ctx.fillText('δa(t)', ox - 4, pT + 8);
  }
  ctx.strokeStyle = rgba(CL.dim, .2); ctx.lineWidth = 0.5; ctx.setLineDash([3, 4]);
  for (let i = 1; i < 4; i++) { const x = ox + i * pW / 4; ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + pH); ctx.stroke(); }
  ctx.setLineDash([]);
  ctx.strokeStyle = rgba(CL.gold, .35); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  ctx.beginPath(); for (let i = 0; i < 300; i++) { const tt = i / 300 * 14, env = Math.exp(-eta * tt), x = ox + i / 300 * pW, y = oy - env * (pH / 2 - 5); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 300; i++) { const tt = i / 300 * 14, env = -Math.exp(-eta * tt), x = ox + i / 300 * pW, y = oy - env * (pH / 2 - 5); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = CL.purple; ctx.lineWidth = 1.5;
  ctx.beginPath(); for (let i = 0; i < 300; i++) { const tt = i / 300 * 14, v = Math.exp(-eta * tt) * Math.cos(wd * tt), x = ox + i / 300 * pW, y = oy - v * (pH / 2 - 5); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  const nowT = (frame * 0.012 * 0.55) % 14;
  const nowV = Math.exp(-eta * nowT) * Math.cos(wd * nowT);
  const dx = ox + (nowT / 14) * pW, dy = oy - nowV * (pH / 2 - 5);
  const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 7);
  dg.addColorStop(0, rgba(CL.purple, 1)); dg.addColorStop(1, rgba(CL.purple, 0));
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = CL.purple; ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
  if (S.labels) {
    ctx.fillStyle = rgba(CL.gold, .6); ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'left'; ctx.fillText('exp(−η_s·t) envelope', ox + 4, pT + 11);
    ctx.fillStyle = rgba(CL.purple, .8); ctx.fillText('δa(t) throat oscillation', ox + 4, pT + 23);
  }
  if (S.eqs) { ctx.fillStyle = rgba(CL.purple, .7); ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'right'; ctx.fillText('δä + 2η_s δȧ + ω₀²δa = 0', W - 6, H - 5); }
}
