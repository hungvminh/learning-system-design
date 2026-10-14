# learning-system-design

Interactive, step-through diagrams explaining how real systems work — a growing
collection of system-design lessons. Each lesson is a self-contained folder with
a short writeup, its diagram source, and generated artifacts (interactive HTML,
PNG, SVG). All lessons share one rendering **engine**, so adding a new lesson
means writing a small data file, not re-implementing the diagram machinery.

## Repository layout

```
learning-system-design/
├── engine/                     shared, lesson-agnostic diagram engine
│   ├── render.js               SVG primitives + Canvas API (box/arrow/panel/…)
│   ├── build.js                builds one or ALL lessons + docs + this catalog
│   ├── template.html           interactive page shell
│   └── package.json
│
├── lessons/
│   └── <slug>/
│       ├── README.md           the lesson writeup
│       ├── diagram.js          content only: actors, flows, walkthrough steps
│       └── dist/               generated — index.html, diagram.png, diagram.svg
│
├── docs/
│   └── index.html              generated landing page linking every lesson
│
└── CONTRIBUTING.md             how to add a new lesson
```

**Why this shape:** the ~250-line SVG/interaction engine lives once in
`engine/`. A lesson's `diagram.js` only *describes* its boxes, arrows and steps.
`node engine/build.js` discovers every `lessons/*/diagram.js`, regenerates each
lesson's `dist/`, and rebuilds the `docs/` index and the catalog below.

## Browse

Open [`docs/index.html`](docs/index.html) for the lesson gallery, or jump into a
lesson's `dist/index.html` directly.

## Lessons

<!-- CATALOG:START -->
| Lesson | Category | Artifacts |
|--------|----------|-----------|
| **[How does Visa Click to Pay work?](lessons/visa-click-to-pay/)** | Payments | [interactive](lessons/visa-click-to-pay/dist/index.html) · [png](lessons/visa-click-to-pay/dist/diagram.png) · [svg](lessons/visa-click-to-pay/dist/diagram.svg) |
<!-- CATALOG:END -->

## Build

```bash
cd engine
npm install            # only needed to rasterize PNGs (@resvg/resvg-js)
node build.js          # build every lesson + docs + README catalog
node build.js <slug>   # build a single lesson
```

The interactive HTML and SVG have **no runtime dependencies**; `npm install` is
only required for the PNG export.

## Add a lesson

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: copy an existing
`lessons/<slug>/` folder, edit `diagram.js` (metadata + `draw()` + `STEPS`),
and run the build.
