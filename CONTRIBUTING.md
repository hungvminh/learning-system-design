# Adding a lesson

Every lesson is a folder under `lessons/<slug>/`. The shared engine in `engine/`
does all the rendering — a lesson only provides **content**.

## 1. Scaffold

```bash
cp -r lessons/visa-click-to-pay lessons/my-new-lesson
rm -rf lessons/my-new-lesson/dist
```

## 2. Edit `lessons/my-new-lesson/diagram.js`

The file exports five things:

```js
const W = 1640, H = 1290;              // canvas size

const meta = {
  slug: 'my-new-lesson',
  title: 'How does X work?',
  subtitle: 'One-line description.',
  category: 'Payments',                // grouping shown on cards/crumbs
  summary: 'Card blurb for the index.',
  tags: ['tag-a', 'tag-b'],
  references: [{ label: 'Source', url: 'https://…' }],
};

function draw(c) {
  // `c` is a Canvas from engine/render.js. Everything you draw must be in a
  // group with a stable id — that id is what STEPS reference to highlight it.
  c.title('title', 70, 76, meta.title, ['subtitle line 1', 'subtitle line 2']);
  c.panel('panel1', 70, 196, 1500, 230, 'PART 1 · …');
  c.box('a', 180, 266, 300, 120, 'blue', 'Actor A', ['line', 'line']);
  c.box('b', 640, 266, 320, 120, 'green', 'Actor B', ['line']);
  c.arrow('p1', [[480, 326], [634, 326]], {
    n: 1, nAt: [528, 326], label: ['does thing'], labelAt: [575, 310],
  });
  c.callout('why', 1050, 800, 412, 146, 'Heading', ['bullet 1', 'bullet 2']);
  c.note('footer', 70, 1264, ['Key idea …']);
}

const BASE = ['title', 'panel1', 'footer'];   // never dimmed

const STEPS = [
  { part: 'Part 1', n: 1, title: 'Step title', show: ['a', 'b', 'p1'],
    body: 'What happens in this step.' },
  // …
];

module.exports = { meta, W, H, BASE, STEPS, draw };
```

### Canvas API (`engine/render.js`)

| Method | Draws |
|--------|-------|
| `c.title(id, x, y, title, [subLines])` | page title block |
| `c.panel(id, x, y, w, h, label)` | labelled container panel |
| `c.box(id, x, y, w, h, themeKey, title, [lines])` | actor box |
| `c.arrow(id, points, opts)` | poly-line arrow + optional `n`/`label` |
| `c.callout(id, x, y, w, h, heading, bullets)` | dashed info card |
| `c.note(id, x, y, lines, opts)` | free text |

Box theme keys: `blue green indigo amber purple red gray` (extend via `meta.theme`).
Arrow `opts`: `color dashed width both n nAt nColor label labelAt labelSize labelAnchor`.

### How interactivity works

- Each drawing call is wrapped in `<g class="node" data-id="…">`.
- A `STEPS[i].show` array lists the ids lit for that step; everything not in
  `show` or `BASE` is dimmed. Clicking an actor jumps to the next step that
  shows it. No per-lesson JS required.

## 3. Build

```bash
cd engine
node build.js my-new-lesson    # this lesson only
node build.js                  # everything + docs + README catalog
```

The build regenerates `lessons/<slug>/dist/`, `docs/index.html`, and the catalog
table in the root `README.md`. Commit the `dist/` output along with the source.

## Conventions

- `slug` is kebab-case and matches the folder name.
- Keep `diagram.js` free of raw SVG — use the Canvas API so lessons stay uniform.
- Diagrams illustrate **publicly documented** flows; add a `references` list and
  keep wording paraphrased, not copied.
