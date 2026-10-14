/**
 * Lesson-agnostic SVG rendering engine for system-design diagrams.
 *
 * A lesson's diagram.js imports { Canvas } from here and describes WHAT to draw
 * (boxes, arrows, steps). This file owns HOW it is drawn (SVG primitives, theme,
 * numbered badges, dimming groups). Nothing payment- or lesson-specific lives here.
 *
 * Usage in a lesson:
 *   const { Canvas } = require('../../engine/render');
 *   module.exports = {
 *     meta: { slug, title, subtitle, tagline, ... },
 *     W, H, BASE: ['title', ...],
 *     STEPS: [ { part, n, title, body, show: ['id', ...] }, ... ],
 *     draw(c) { c.title(...); c.box('id', ...); c.arrow('id', ...); ... },
 *   };
 */

const FONT = "'Noto Sans', 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";

// Default palette — a lesson may override colors via meta.theme / meta.palette.
const PALETTE = {
  bg: '#f6f4ef', panel: '#ffffff', panelBorder: '#e2ded4',
  chip: '#1434CB', ink: '#16181d', sub: '#6a6f7a',
  line: '#5b6270', dash: '#8a63d2', num: '#1434CB',
};

// Named box themes. Lessons reference these by key; extend per lesson via meta.theme.
const THEME = {
  blue:   { fill: '#eaf2fd', stroke: '#9cc2ec', title: '#14538f' },
  green:  { fill: '#eaf7ee', stroke: '#9dd6b2', title: '#1b6b3c' },
  indigo: { fill: '#eceffd', stroke: '#9fa9ea', title: '#1434CB' },
  amber:  { fill: '#fff3e1', stroke: '#f0c88c', title: '#9a5b08' },
  purple: { fill: '#f4edfc', stroke: '#c7b2e8', title: '#5b3a9b' },
  red:    { fill: '#fdecee', stroke: '#f0aab1', title: '#a32330' },
  gray:   { fill: '#f1f1f3', stroke: '#cbccd1', title: '#3b3f49' },
};

class Canvas {
  constructor({ W, H, embedFont = true, palette = {}, theme = {} } = {}) {
    this.W = W; this.H = H;
    this.out = [];
    this.C = { ...PALETTE, ...palette };
    this.THEME = { ...THEME, ...theme };
    this.fam = embedFont ? FONT.replace(/'/g, '&apos;') : 'Noto Sans';
    this.out.push(`<rect width="${W}" height="${H}" fill="${this.C.bg}"/>`);
  }

  _esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  _text(x, y, s, o = {}) {
    const { size = 14, weight = 400, fill = this.C.ink, anchor = 'middle', ls = 0 } = o;
    this.out.push(`<text x="${x}" y="${y}" font-family="${this.fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${this._esc(s)}</text>`);
  }

  _rrect(x, y, w, h, r, fill, stroke, sw = 2, extra = '') {
    this.out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${extra}/>`);
  }

  _head(x, y, dx, dy, color) {
    const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const px = -uy, py = ux, L = 13, Wd = 6.5, bx = x - ux * L, by = y - uy * L;
    this.out.push(`<polygon points="${x},${y} ${bx + px * Wd},${by + py * Wd} ${bx - px * Wd},${by - py * Wd}" fill="${color}"/>`);
  }

  // Wrap any drawing in a dimmable, identifiable group.
  group(id, fn) { this.out.push(`<g class="node" data-id="${id}">`); fn(); this.out.push('</g>'); }

  // --- public drawing API (each call is wrapped in its own group) ---

  title(id, x, y, title, subtitleLines = []) {
    this.group(id, () => {
      this._text(x, y, title, { size: 42, weight: 700, anchor: 'start' });
      subtitleLines.forEach((l, i) => this._text(x, y + 34 + i * 24, l, { size: 17, anchor: 'start', fill: this.C.sub }));
    });
  }

  panel(id, x, y, w, h, label) {
    this.group(id, () => {
      this._rrect(x, y, w, h, 18, this.C.panel, this.C.panelBorder, 2);
      const cw = label.length * 10.2 + 36;
      this._rrect(x + 40, y - 18, cw, 36, 18, this.C.chip, null);
      this._text(x + 40 + cw / 2, y + 6, label, { size: 15, weight: 700, fill: '#ffffff', ls: 1.1 });
    });
  }

  box(id, x, y, w, h, themeKey, title, lines = []) {
    this.group(id, () => {
      const t = this.THEME[themeKey] || this.THEME.gray;
      this._rrect(x + 3, y + 4, w, h, 14, '#00000010', null);
      this._rrect(x, y, w, h, 14, t.fill, t.stroke, 2);
      this._text(x + w / 2, y + 34, title, { size: 20, weight: 700, fill: t.title });
      lines.forEach((l, i) => this._text(x + w / 2, y + 64 + i * 21, l, { size: 13.5, fill: '#454b55' }));
    });
  }

  // arrow with optional numbered badge + multi-line label, all in one group.
  arrow(id, pts, o = {}) {
    const { color = this.C.line, dashed = false, width = 2.4, both = false, n, nAt, nColor, label, labelAt, labelSize = 13, labelAnchor = 'middle' } = o;
    this.group(id, () => {
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
      this.out.push(`<path class="flow" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ' stroke-dasharray="9 7"' : ''}/>`);
      const k = pts.length, [ax, ay] = pts[k - 1], [bx, by] = pts[k - 2];
      this._head(ax, ay, ax - bx, ay - by, color);
      if (both) { const [sx, sy] = pts[0], [s2x, s2y] = pts[1]; this._head(sx, sy, sx - s2x, sy - s2y, color); }
      if (label && labelAt) {
        const [lx, ly] = labelAt;
        (Array.isArray(label) ? label : [label]).forEach((t, i) =>
          this._text(lx, ly + i * 17, t, { size: labelSize, anchor: labelAnchor, fill: '#3c424d', weight: 600 }));
      }
      if (n != null && nAt) this._badge(nAt[0], nAt[1], n, nColor || this.C.num);
    });
  }

  _badge(cx, cy, n, color) {
    this.out.push(`<circle cx="${cx}" cy="${cy}" r="15" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>`);
    this._text(cx, cy + 5.5, String(n), { size: 15, weight: 700, fill: '#ffffff' });
  }

  // free-floating text block
  note(id, x, y, lines, o = {}) {
    const { size = 13, anchor = 'start', fill = this.C.sub, weight = 400 } = o;
    this.group(id, () => (Array.isArray(lines) ? lines : [lines]).forEach((l, i) =>
      this._text(x, y + i * 20, l, { size, anchor, fill, weight })));
  }

  // dashed callout card with a heading and bullet list
  callout(id, x, y, w, h, heading, bullets, o = {}) {
    const { headColor = this.C.chip } = o;
    this.group(id, () => {
      this._rrect(x, y, w, h, 14, '#f8f7ff', '#b9bdf0', 2, ' stroke-dasharray="8 6"');
      this._text(x + w / 2, y + 31, heading, { size: 16, weight: 700, fill: headColor });
      bullets.forEach((l, i) => this._text(x + 22, y + 58 + i * 21, '\u2022  ' + l, { size: 13.5, anchor: 'start', fill: '#454b55' }));
    });
  }

  toSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}" id="diagram">\n${this.out.join('\n')}\n</svg>\n`;
  }
}

/** Render a lesson module to an SVG string. */
function renderLesson(lesson, { embedFont = true } = {}) {
  const c = new Canvas({
    W: lesson.W, H: lesson.H, embedFont,
    palette: lesson.meta && lesson.meta.palette,
    theme: lesson.meta && lesson.meta.theme,
  });
  lesson.draw(c);
  return c.toSVG();
}

module.exports = { Canvas, renderLesson, THEME, PALETTE, FONT };
