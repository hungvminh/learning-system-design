# learning-system-design

System design learning materials and diagrams.

## Visa Click to Pay

An illustration of how **Visa Click to Pay** works — a one-click online checkout
built on the EMV® Secure Remote Commerce (SRC) standard and Visa Token Service.
The shopper never retypes a card, and the merchant never sees the real card
number (PAN).

### Files

| File | Description |
|------|-------------|
| [`visa-click-to-pay.html`](visa-click-to-pay.html) | **Interactive** single-file diagram — step through the flow, highlight actors, and export PNG/SVG. Open in any browser; no network required. |
| [`visa-click-to-pay.png`](visa-click-to-pay.png) | Static image, 3280 × 2580 (2×). |
| [`visa-click-to-pay.svg`](visa-click-to-pay.svg) | Static vector version. |
| `tools/` | Generator source (`diagram.js` layout, `build.js`, `template.html`). |

### Regenerating

```bash
cd tools
npm install          # only needed for the PNG (@resvg/resvg-js)
node build.js        # writes the .svg, .png and interactive .html
```

The HTML and SVG have **no dependencies**; `npm install` is only required to
rasterize the PNG.

### Interactive controls

- Click any step (or an actor in the diagram) to isolate that part of the flow.
- **Play** walks the whole payment; **Prev / Next / Show everything** navigate.
- Keyboard: `←` `→` step, `space` play/pause, `Esc` reset.
- Built-in **⬇ PNG / SVG / HTML** download buttons.

---

*Illustrative diagram of the publicly documented Click to Pay / EMV® SRC flow,
based on Visa's developer documentation. Not affiliated with or endorsed by Visa;
EMV® is a registered trademark of EMVCo.*
