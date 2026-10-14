# Visa Click to Pay

How **Visa Click to Pay** works — a one-click online checkout built on the
EMV® Secure Remote Commerce (SRC) standard and Visa Token Service. The shopper
never retypes a card, and the merchant never sees the real card number (PAN).

| Artifact | |
|----------|--|
| [`dist/index.html`](dist/index.html) | **Interactive** step-through diagram (open in a browser) |
| [`dist/diagram.png`](dist/diagram.png) | Static image, 3280 × 2580 (2×) |
| [`dist/diagram.svg`](dist/diagram.svg) | Static vector |
| [`diagram.js`](diagram.js) | Source: actors, flows and walkthrough steps |

## The flow

**Part 1 — one-time enrollment**

1. **Enroll** — the cardholder registers once (email, phone, card); issuers often auto-enroll.
2. **Tokenize** — Visa Token Service replaces the PAN with a network token in the SRC profile; only the last 4 digits stay visible.

**Part 2 — checkout in one click**

1. Shopper taps the **Click to Pay** button instead of a card form.
2. The merchant's **Digital Terminal** (SRC Initiator) initializes the SRC system in a hidden iframe.
3. Visa **recognizes the device** or the shopper verifies with a passkey / one-time code, then picks a masked card — all inside Visa's iframe.
4. Visa returns a **network token + one-time cryptogram** to the merchant (never the PAN).
5. The merchant sends the **authorization** with token + cryptogram to its PSP/acquirer.
6. Routed over **VisaNet**.
7. VisaNet validates the cryptogram, **detokenizes** to the real PAN, and the issuer decides.
8. The **approve/decline** response travels back the same path.
9. The merchant **confirms the order**.

## Key idea

The card number is replaced by a **merchant-scoped network token** plus a
**single-use cryptogram** — so stolen checkout data cannot be replayed elsewhere.

## Regenerate

```bash
cd engine
npm install                       # only needed for PNG
node build.js visa-click-to-pay   # rebuilds this lesson's dist/
```

## References

- [Visa Click to Pay API introduction](https://developer.visa.com/capabilities/visa-secure-remote-commerce/introduction-to-visa-click-to-pay-api)
- [Click to Pay with VICA overview](https://developer.visa.com/capabilities/visa-id-credential/click-to-pay-with-vica)

*Illustrative diagram of a publicly documented flow. Not affiliated with or
endorsed by Visa; EMV® is a registered trademark of EMVCo. Wording is paraphrased.*
