/**
 * Lesson: How does Visa Click to Pay work?
 *
 * Pure content: this module describes the actors, flows and walkthrough steps.
 * All rendering primitives come from ../../engine/render.js (the shared Canvas).
 * To add another lesson, copy this file's shape into lessons/<slug>/diagram.js.
 */

const W = 1640, H = 1290;

const meta = {
  slug: 'visa-click-to-pay',
  title: 'How does Visa Click to Pay work?',
  subtitle: 'A one-click online checkout built on the EMV\u00AE Secure Remote Commerce (SRC) standard.',
  category: 'Payments',
  summary: 'A one-click online checkout built on the EMV\u00AE SRC standard and Visa Token Service: the shopper never retypes a card, and the merchant never sees the real card number (PAN).',
  tags: ['payments', 'tokenization', 'EMV SRC', 'checkout', 'security'],
  references: [
    { label: 'Visa Click to Pay API introduction', url: 'https://developer.visa.com/capabilities/visa-secure-remote-commerce/introduction-to-visa-click-to-pay-api' },
    { label: 'Click to Pay with VICA overview', url: 'https://developer.visa.com/capabilities/visa-id-credential/click-to-pay-with-vica' },
  ],
};

function draw(c) {
  c.title('title', 70, 76, meta.title, [
    'A one-click online checkout built on the EMV\u00AE Secure Remote Commerce (SRC) standard and Visa Token Service:',
    'the shopper never retypes a card, and the merchant never sees the real card number (PAN).',
  ]);

  /* ---------- PART 1 : enrollment ---------- */
  c.panel('panel1', 70, 196, 1500, 230, 'PART 1 \u00B7 ONE-TIME ENROLLMENT');

  c.box('e1', 180, 266, 300, 120, 'blue', 'Cardholder', ['Enrolls once with email,', 'phone number and card']);
  c.box('e2', 640, 266, 320, 120, 'indigo', 'Visa Click to Pay', ['Issuer or Visa verifies the', 'card and creates an SRC', 'payment profile']);
  c.box('e3', 1120, 266, 340, 120, 'amber', 'Visa Token Service', ['Swaps the PAN for a network', 'token stored in the profile \u2014', 'only the last 4 stay visible']);

  c.arrow('p1', [[480, 326], [634, 326]], { n: 1, nAt: [528, 326], label: ['Enroll card'], labelAt: [575, 310], labelSize: 12.5 });
  c.arrow('p2', [[960, 326], [1114, 326]], { n: 2, nAt: [1008, 326], label: ['Tokenize'], labelAt: [1055, 310], labelSize: 12.5 });

  c.note('note1', 1460, 404, ['The profile is reusable at every participating merchant \u2014 no card entry, no merchant-side account.'], { anchor: 'end', size: 13 });

  /* ---------- PART 2 : checkout ---------- */
  c.panel('panel2', 70, 486, 1500, 752, 'PART 2 \u00B7 CHECKOUT IN ONE CLICK');

  c.box('shopper', 180, 576, 300, 150, 'blue', 'Shopper', ['On the merchant\u2019s site', 'or app, already signed', 'in to Click to Pay']);
  c.box('merchant', 640, 576, 320, 150, 'green', 'Merchant checkout', ['Click to Pay button,', 'the SRC Initiator /', 'Visa Digital Terminal']);
  c.box('visa', 1120, 576, 340, 150, 'indigo', 'Visa Click to Pay', ['SRC System: device', 'fingerprint, risk decision,', 'shopper recognition']);

  c.arrow('a1', [[480, 651], [634, 651]], { n: 1, nAt: [528, 651], label: ['Taps the Click', 'to Pay button'], labelAt: [557, 608], labelSize: 12 });
  c.arrow('a2', [[960, 636], [1114, 636]], { n: 2, nAt: [1008, 636], label: ['Digital Terminal', 'initializes SRC'], labelAt: [1055, 600], labelSize: 12 });
  c.arrow('a4', [[1114, 696], [966, 696]], { n: 4, nAt: [1066, 696], label: ['Network token +', 'one-time cryptogram', '(no PAN)'], labelAt: [1037, 716], labelSize: 12 });
  c.arrow('a3', [[300, 576], [300, 534], [1290, 534], [1290, 576]], {
    dashed: true, color: c.C.dash, both: true, n: 3, nAt: [360, 534], nColor: c.C.dash,
    label: ['Recognized by device, or verifies with a passkey / e-mail or SMS one-time code, then picks a masked card \u2014 all inside Visa\u2019s secure iframe'],
    labelAt: [400, 522], labelAnchor: 'start', labelSize: 13,
  });

  c.box('psp', 180, 976, 300, 130, 'purple', 'PSP / Acquirer', ['Gets the token and', 'cryptogram instead of', 'the card number']);
  c.box('visanet', 640, 976, 320, 130, 'indigo', 'VisaNet', ['Validates the cryptogram', 'and the Token Service', 'detokenizes to the PAN']);
  c.box('issuer', 1120, 976, 340, 130, 'red', 'Issuer / Bank', ['Sees its own PAN and', 'approves or declines the', 'authorization']);

  c.arrow('a5', [[720, 726], [720, 836], [250, 836], [250, 970]], { n: 5, nAt: [720, 762], label: ['Authorization request with token + cryptogram'], labelAt: [500, 824], labelSize: 12.5 });
  c.arrow('a6', [[480, 1041], [634, 1041]], { n: 6, nAt: [528, 1041], label: ['Routed over', 'VisaNet'], labelAt: [575, 1004], labelSize: 12 });
  c.arrow('a7', [[960, 1041], [1114, 1041]], { n: 7, nAt: [1008, 1041], label: ['Real PAN and', '3-D Secure data'], labelAt: [1037, 1004], labelSize: 12 });
  c.arrow('a8', [[1290, 1106], [1290, 1166], [330, 1166], [330, 1112]], { n: 8, nAt: [1230, 1166], label: ['Approve / decline response travels back the same path'], labelAt: [790, 1158], labelSize: 12.5 });
  c.arrow('a9', [[420, 970], [420, 896], [840, 896], [840, 732]], { n: 9, nAt: [420, 936], label: ['Approved \u2014 order confirmed to the shopper'], labelAt: [640, 884], labelSize: 12.5 });

  c.callout('callout', 1050, 800, 412, 146, 'Why this is safer than a card form', [
    'The merchant stores a token, never the PAN',
    'The token is scoped to that merchant only',
    'The cryptogram is valid for one payment',
    'Issuer gets strong auth signals \u2014 fewer declines',
  ]);

  c.note('footer', 70, 1264, ['Key idea: the card number is replaced by a merchant-scoped network token plus a cryptogram that is valid for one transaction only \u2014 so stolen checkout data cannot be replayed elsewhere.'], { size: 14 });
}

const BASE = ['title', 'panel1', 'panel2', 'footer'];

const STEPS = [
  { part: 'Enrollment', n: 1, title: 'Enroll the card once', show: ['e1', 'e2', 'p1', 'note1'],
    body: 'The cardholder registers once with an email address, mobile number and card. Many issuers auto-enroll their cardholders, so the profile often already exists the first time a shopper meets a Click to Pay button. The profile is identity-based, so it follows the shopper to every participating merchant.' },
  { part: 'Enrollment', n: 2, title: 'Replace the card number with a token', show: ['e2', 'e3', 'p2', 'note1'],
    body: 'Visa Token Service swaps the 16-digit PAN for a network token held inside the SRC profile. From this point on, shoppers and merchants only see the masked card: brand plus the last four digits.' },
  { part: 'Checkout', n: 1, title: 'Shopper taps Click to Pay', show: ['shopper', 'merchant', 'a1'],
    body: 'At checkout the shopper chooses the Click to Pay button instead of filling in a card form. No card number, no expiry, no CVV, and no merchant account to create.' },
  { part: 'Checkout', n: 2, title: 'The Digital Terminal initializes SRC', show: ['merchant', 'visa', 'a2'],
    body: 'The merchant page is the SRC Initiator: it loads Visa\u2019s Digital Terminal in a hidden iframe. On load, the SRC system does device fingerprinting, makes a risk decision, spins up the passkey service, and hands back an initialization session id.' },
  { part: 'Checkout', n: 3, title: 'Recognize or authenticate the shopper', show: ['shopper', 'visa', 'a3'],
    body: 'If Visa recognizes the device, the shopper is asked for nothing at all. Otherwise they verify with a passkey (biometric) or a one-time code sent by email or SMS, then pick a masked card from the candidate list. All of this happens inside Visa\u2019s iframe, so the merchant page never touches the credential.' },
  { part: 'Checkout', n: 4, title: 'Visa returns a payment credential', show: ['visa', 'merchant', 'a4', 'callout'],
    body: 'The merchant receives a network token plus a cryptogram that is unique to this one transaction \u2014 never the real card number. That is what makes stolen checkout data useless to replay.' },
  { part: 'Checkout', n: 5, title: 'Authorization request goes out', show: ['merchant', 'psp', 'a5'],
    body: 'The merchant passes the token and cryptogram to its payment service provider or acquirer exactly as it would a normal card payment \u2014 no new authorization plumbing is required.' },
  { part: 'Checkout', n: 6, title: 'Routed over VisaNet', show: ['psp', 'visanet', 'a6'],
    body: 'The acquirer routes the authorization over VisaNet, where the token and cryptogram are checked before the request reaches the issuer.' },
  { part: 'Checkout', n: 7, title: 'Detokenize, then the issuer decides', show: ['visanet', 'issuer', 'a7'],
    body: 'VisaNet validates the cryptogram and Visa Token Service maps the token back to the real PAN. The issuer sees its own card number together with strong authentication data, which typically means fewer false declines than a raw card form.' },
  { part: 'Checkout', n: 8, title: 'Response travels back', show: ['issuer', 'psp', 'a8'],
    body: 'The approve or decline decision returns along the same path: issuer, VisaNet, acquirer.' },
  { part: 'Checkout', n: 9, title: 'Order confirmed', show: ['psp', 'merchant', 'a9', 'footer'],
    body: 'The merchant gets the result and confirms the order to the shopper. Clearing and settlement then run as they do for any other Visa transaction.' },
];

module.exports = { meta, W, H, BASE, STEPS, draw };
