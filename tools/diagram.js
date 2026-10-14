/**
 * Shared layout for the "How does Visa Click to Pay work?" diagram.
 * Exports: svg(opts) -> string, STEPS -> step metadata used by the interactive HTML.
 */
const W = 1640, H = 1290;
const FONT = "'Noto Sans', 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";

const C = {
  bg: '#f6f4ef', panel: '#ffffff', panelBorder: '#e2ded4',
  chip: '#1434CB', ink: '#16181d', sub: '#6a6f7a', line: '#5b6270', dash: '#8a63d2', num: '#1434CB',
};

const THEME = {
  shopper:  { fill: '#eaf2fd', stroke: '#9cc2ec', title: '#14538f' },
  merchant: { fill: '#eaf7ee', stroke: '#9dd6b2', title: '#1b6b3c' },
  visa:     { fill: '#eceffd', stroke: '#9fa9ea', title: '#1434CB' },
  token:    { fill: '#fff3e1', stroke: '#f0c88c', title: '#9a5b08' },
  psp:      { fill: '#f4edfc', stroke: '#c7b2e8', title: '#5b3a9b' },
  issuer:   { fill: '#fdecee', stroke: '#f0aab1', title: '#a32330' },
};

function svg({ embedFont = true } = {}) {
  const out = [];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fam = embedFont ? FONT.replace(/'/g, '&apos;') : 'Noto Sans';

  const text = (x, y, s, o = {}) => {
    const { size = 14, weight = 400, fill = C.ink, anchor = 'middle', ls = 0 } = o;
    out.push(`<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`);
  };
  const rrect = (x, y, w, h, r, fill, stroke, sw = 2, extra = '') =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${extra}/>`);

  const group = (id, fn) => { out.push(`<g class="node" data-id="${id}">`); fn(); out.push('</g>'); };

  function panel(x, y, w, h, lab) {
    rrect(x, y, w, h, 18, C.panel, C.panelBorder, 2);
    const cw = lab.length * 10.2 + 36;
    rrect(x + 40, y - 18, cw, 36, 18, C.chip, null);
    text(x + 40 + cw / 2, y + 6, lab, { size: 15, weight: 700, fill: '#ffffff', ls: 1.1 });
  }

  function box(x, y, w, h, theme, title, lines = []) {
    const t = THEME[theme];
    rrect(x + 3, y + 4, w, h, 14, '#00000010', null);
    rrect(x, y, w, h, 14, t.fill, t.stroke, 2);
    text(x + w / 2, y + 34, title, { size: 20, weight: 700, fill: t.title });
    lines.forEach((l, i) => text(x + w / 2, y + 64 + i * 21, l, { size: 13.5, fill: '#454b55' }));
  }

  function head(x, y, dx, dy, color) {
    const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const px = -uy, py = ux, L = 13, Wd = 6.5, bx = x - ux * L, by = y - uy * L;
    out.push(`<polygon points="${x},${y} ${bx + px * Wd},${by + py * Wd} ${bx - px * Wd},${by - py * Wd}" fill="${color}"/>`);
  }

  function arrow(pts, { color = C.line, dashed = false, width = 2.4, both = false } = {}) {
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    out.push(`<path class="flow" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ' stroke-dasharray="9 7"' : ''}/>`);
    const n = pts.length, [ax, ay] = pts[n - 1], [bx, by] = pts[n - 2];
    head(ax, ay, ax - bx, ay - by, color);
    if (both) { const [sx, sy] = pts[0], [s2x, s2y] = pts[1]; head(sx, sy, sx - s2x, sy - s2y, color); }
  }

  const num = (cx, cy, n, color = C.num) => {
    out.push(`<circle cx="${cx}" cy="${cy}" r="15" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>`);
    text(cx, cy + 5.5, String(n), { size: 15, weight: 700, fill: '#ffffff' });
  };
  const label = (x, y, lines, o = {}) => {
    const { size = 13, anchor = 'middle', fill = '#3c424d' } = o;
    lines.forEach((l, i) => text(x, y + i * 17, l, { size, anchor, fill, weight: 600 }));
  };

  /* ======================= canvas ======================= */
  out.push(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);

  group('title', () => {
    text(70, 76, 'How does Visa Click to Pay work?', { size: 42, weight: 700, anchor: 'start' });
    text(70, 110, 'A one-click online checkout built on the EMV\u00AE Secure Remote Commerce (SRC) standard and Visa Token Service:', { size: 17, anchor: 'start', fill: C.sub });
    text(70, 134, 'the shopper never retypes a card, and the merchant never sees the real card number (PAN).', { size: 17, anchor: 'start', fill: C.sub });
  });

  /* ---------- PART 1 ---------- */
  group('panel1', () => panel(70, 196, 1500, 230, 'PART 1 \u00B7 ONE-TIME ENROLLMENT'));

  group('e1', () => box(180, 266, 300, 120, 'shopper', 'Cardholder', ['Enrolls once with email,', 'phone number and card']));
  group('e2', () => box(640, 266, 320, 120, 'visa', 'Visa Click to Pay', ['Issuer or Visa verifies the', 'card and creates an SRC', 'payment profile']));
  group('e3', () => box(1120, 266, 340, 120, 'token', 'Visa Token Service', ['Swaps the PAN for a network', 'token stored in the profile \u2014', 'only the last 4 stay visible']));

  group('p1', () => { arrow([[480, 326], [634, 326]]); num(528, 326, 1); label(575, 310, ['Enroll card'], { size: 12.5 }); });
  group('p2', () => { arrow([[960, 326], [1114, 326]]); num(1008, 326, 2); label(1055, 310, ['Tokenize'], { size: 12.5 }); });

  group('note1', () => text(1460, 410, 'The profile is reusable at every participating merchant \u2014 no card entry, no merchant-side account.', { size: 13, anchor: 'end', fill: C.sub }));

  /* ---------- PART 2 ---------- */
  group('panel2', () => panel(70, 486, 1500, 752, 'PART 2 \u00B7 CHECKOUT IN ONE CLICK'));

  group('shopper', () => box(180, 576, 300, 150, 'shopper', 'Shopper', ['On the merchant\u2019s site', 'or app, already signed', 'in to Click to Pay']));
  group('merchant', () => box(640, 576, 320, 150, 'merchant', 'Merchant checkout', ['Click to Pay button,', 'the SRC Initiator /', 'Visa Digital Terminal']));
  group('visa', () => box(1120, 576, 340, 150, 'visa', 'Visa Click to Pay', ['SRC System: device', 'fingerprint, risk decision,', 'shopper recognition']));

  group('a1', () => { arrow([[480, 651], [634, 651]]); num(528, 651, 1); label(557, 608, ['Taps the Click', 'to Pay button'], { size: 12 }); });
  group('a2', () => { arrow([[960, 636], [1114, 636]]); num(1008, 636, 2); label(1055, 600, ['Digital Terminal', 'initializes SRC'], { size: 12 }); });
  group('a4', () => { arrow([[1114, 696], [966, 696]]); num(1066, 696, 4); label(1037, 716, ['Network token +', 'one-time cryptogram', '(no PAN)'], { size: 12 }); });
  group('a3', () => {
    arrow([[300, 576], [300, 534], [1290, 534], [1290, 576]], { dashed: true, color: C.dash, both: true });
    num(360, 534, 3, C.dash);
    text(400, 522, 'Recognized by device, or verifies with a passkey / e-mail or SMS one-time code, then picks a masked card \u2014 all inside Visa\u2019s secure iframe', { size: 13, anchor: 'start', fill: '#5b3a9b' });
  });

  group('psp', () => box(180, 976, 300, 130, 'psp', 'PSP / Acquirer', ['Gets the token and', 'cryptogram instead of', 'the card number']));
  group('visanet', () => box(640, 976, 320, 130, 'visa', 'VisaNet', ['Validates the cryptogram', 'and the Token Service', 'detokenizes to the PAN']));
  group('issuer', () => box(1120, 976, 340, 130, 'issuer', 'Issuer / Bank', ['Sees its own PAN and', 'approves or declines the', 'authorization']));

  group('a5', () => { arrow([[720, 726], [720, 836], [250, 836], [250, 970]]); num(720, 762, 5); label(500, 824, ['Authorization request with token + cryptogram'], { size: 12.5 }); });
  group('a6', () => { arrow([[480, 1041], [634, 1041]]); num(528, 1041, 6); label(575, 1004, ['Routed over', 'VisaNet'], { size: 12 }); });
  group('a7', () => { arrow([[960, 1041], [1114, 1041]]); num(1008, 1041, 7); label(1037, 1004, ['Real PAN and', '3-D Secure data'], { size: 12 }); });
  group('a8', () => { arrow([[1290, 1106], [1290, 1166], [330, 1166], [330, 1112]]); num(1230, 1166, 8); label(790, 1158, ['Approve / decline response travels back the same path'], { size: 12.5 }); });
  group('a9', () => { arrow([[420, 970], [420, 896], [840, 896], [840, 732]]); num(420, 936, 9); label(640, 884, ['Approved \u2014 order confirmed to the shopper'], { size: 12.5 }); });

  group('callout', () => {
    rrect(1050, 800, 412, 146, 14, '#f8f7ff', '#b9bdf0', 2, ' stroke-dasharray="8 6"');
    text(1256, 831, 'Why this is safer than a card form', { size: 16, weight: 700, fill: '#1434CB' });
    [
      'The merchant stores a token, never the PAN',
      'The token is scoped to that merchant only',
      'The cryptogram is valid for one payment',
      'Issuer gets strong auth signals \u2014 fewer declines',
    ].forEach((l, i) => text(1072, 858 + i * 21, '\u2022  ' + l, { size: 13.5, anchor: 'start', fill: '#454b55' }));
  });

  group('footer', () => text(70, 1268, 'Key idea: the card number is replaced by a merchant-scoped network token plus a cryptogram that is valid for one transaction only \u2014 so stolen checkout data cannot be replayed elsewhere.', { size: 14, anchor: 'start', fill: C.sub }));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" id="diagram">\n${out.join('\n')}\n</svg>\n`;
}

/* Always-visible scaffolding (never dimmed). */
const BASE = ['title', 'panel1', 'panel2', 'footer'];

const STEPS = [
  {
    part: 'Enrollment', n: 1, title: 'Enroll the card once',
    show: ['e1', 'e2', 'p1', 'note1'],
    body: 'The cardholder registers once with an email address, mobile number and card. Many issuers auto-enroll their cardholders, so the profile often already exists the first time a shopper meets a Click to Pay button. The profile is identity-based, so it follows the shopper to every participating merchant.',
  },
  {
    part: 'Enrollment', n: 2, title: 'Replace the card number with a token',
    show: ['e2', 'e3', 'p2', 'note1'],
    body: 'Visa Token Service swaps the 16-digit PAN for a network token held inside the SRC profile. From this point on, shoppers and merchants only see the masked card: brand plus the last four digits.',
  },
  {
    part: 'Checkout', n: 1, title: 'Shopper taps Click to Pay',
    show: ['shopper', 'merchant', 'a1'],
    body: 'At checkout the shopper chooses the Click to Pay button instead of filling in a card form. No card number, no expiry, no CVV, and no merchant account to create.',
  },
  {
    part: 'Checkout', n: 2, title: 'The Digital Terminal initializes SRC',
    show: ['merchant', 'visa', 'a2'],
    body: 'The merchant page is the SRC Initiator: it loads Visa\u2019s Digital Terminal in a hidden iframe. On load, the SRC system does device fingerprinting, makes a risk decision, spins up the passkey service, and hands back an initialization session id.',
  },
  {
    part: 'Checkout', n: 3, title: 'Recognize or authenticate the shopper',
    show: ['shopper', 'visa', 'a3'],
    body: 'If Visa recognizes the device, the shopper is asked for nothing at all. Otherwise they verify with a passkey (biometric) or a one-time code sent by email or SMS, then pick a masked card from the candidate list. All of this happens inside Visa\u2019s iframe, so the merchant page never touches the credential.',
  },
  {
    part: 'Checkout', n: 4, title: 'Visa returns a payment credential',
    show: ['visa', 'merchant', 'a4', 'callout'],
    body: 'The merchant receives a network token plus a cryptogram that is unique to this one transaction \u2014 never the real card number. That is what makes stolen checkout data useless to replay.',
  },
  {
    part: 'Checkout', n: 5, title: 'Authorization request goes out',
    show: ['merchant', 'psp', 'a5'],
    body: 'The merchant passes the token and cryptogram to its payment service provider or acquirer exactly as it would a normal card payment \u2014 no new authorization plumbing is required.',
  },
  {
    part: 'Checkout', n: 6, title: 'Routed over VisaNet',
    show: ['psp', 'visanet', 'a6'],
    body: 'The acquirer routes the authorization over VisaNet, where the token and cryptogram are checked before the request reaches the issuer.',
  },
  {
    part: 'Checkout', n: 7, title: 'Detokenize, then the issuer decides',
    show: ['visanet', 'issuer', 'a7'],
    body: 'VisaNet validates the cryptogram and Visa Token Service maps the token back to the real PAN. The issuer sees its own card number together with strong authentication data, which typically means fewer false declines than a raw card form.',
  },
  {
    part: 'Checkout', n: 8, title: 'Response travels back',
    show: ['issuer', 'psp', 'a8'],
    body: 'The approve or decline decision returns along the same path: issuer, VisaNet, acquirer.',
  },
  {
    part: 'Checkout', n: 9, title: 'Order confirmed',
    show: ['psp', 'merchant', 'a9', 'footer'],
    body: 'The merchant gets the result and confirms the order to the shopper. Clearing and settlement then run as they do for any other Visa transaction.',
  },
];

module.exports = { svg, STEPS, BASE, W, H };
