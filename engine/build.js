#!/usr/bin/env node
/**
 * Build pipeline for all lessons.
 *
 *   node engine/build.js            # build every lesson + docs site + README catalog
 *   node engine/build.js <slug>     # build a single lesson only
 *
 * For each lessons/<slug>/diagram.js it writes:
 *   lessons/<slug>/dist/index.html   (interactive, self-contained)
 *   lessons/<slug>/dist/diagram.svg
 *   lessons/<slug>/dist/diagram.png  (only if @resvg/resvg-js is installed)
 *
 * Then it regenerates the GitHub Pages site under docs/ (which is the published
 * site root, so everything it links to must live inside docs/):
 *   docs/index.html                      landing gallery linking every lesson
 *   docs/lessons/<slug>/index.html       copy of the lesson's interactive page
 *   docs/lessons/<slug>/diagram.{png,svg}
 *   README.md                            catalog table (between CATALOG markers)
 */
const fs = require('fs');
const path = require('path');
const { renderLesson } = require('./render');

const ROOT = path.resolve(__dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'lessons');
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function discoverLessons() {
  if (!fs.existsSync(LESSONS_DIR)) return [];
  return fs.readdirSync(LESSONS_DIR)
    .filter(d => fs.existsSync(path.join(LESSONS_DIR, d, 'diagram.js')))
    .sort();
}

function tryResvg() {
  try { return require('@resvg/resvg-js').Resvg; } catch { return null; }
}
const Resvg = tryResvg();

function buildLesson(slug) {
  const lesson = require(path.join(LESSONS_DIR, slug, 'diagram.js'));
  const m = lesson.meta;
  const distDir = path.join(LESSONS_DIR, slug, 'dist');
  fs.mkdirSync(distDir, { recursive: true });

  // static SVG (plain font name for resvg) + web SVG (embedded font stack)
  const plainSvg = renderLesson(lesson, { embedFont: false });
  const webSvg = renderLesson(lesson, { embedFont: true });
  fs.writeFileSync(path.join(distDir, 'diagram.svg'), plainSvg);

  let pngOk = false;
  if (Resvg) {
    const png = new Resvg(plainSvg, {
      fitTo: { mode: 'width', value: lesson.W * 2 },
      font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans' },
    }).render().asPng();
    fs.writeFileSync(path.join(distDir, 'diagram.png'), png);
    pngOk = true;
  }

  const refs = (m.references || [])
    .map(r => `<a href="${r.url}">${esc(r.label)}</a>`).join(' · ');
  const footnote = `Illustrative diagram of a publicly documented flow${refs ? '. Sources: ' + refs : ''}. ` +
    `Not affiliated with or endorsed by any trademark holder; wording is paraphrased.`;

  // Render the interactive page. `crumbHref` points back to the gallery and
  // differs by location: 3 levels up from lessons/<slug>/dist, 2 from docs/lessons/<slug>.
  const render = (crumbHref) => TEMPLATE
    .replace(/__TITLE__/g, esc(m.title))
    .replace(/__H1__/g, esc(m.title))
    .replace(/__CRUMBS__/g, `<a href="${crumbHref}">All lessons</a> &nbsp;›&nbsp; ` + esc(m.category || 'Lesson'))
    .replace(/__HINT__/g, esc(m.hint || 'Tip: click an actor box to jump to the next step that involves it.'))
    .replace(/__FOOTNOTE__/g, footnote)
    .replace(/__SLUG__/g, slug)
    .replace('__SVG__', webSvg.trim())
    .replace('__STEPS__', JSON.stringify(lesson.STEPS))
    .replace('__BASE__', JSON.stringify(lesson.BASE));

  // Source copy under lessons/<slug>/dist/ (crumb climbs to repo root, then docs/).
  fs.writeFileSync(path.join(distDir, 'index.html'), render('../../../docs/index.html'));

  // Published copy under docs/lessons/<slug>/ so the Pages site is self-contained.
  const pub = path.join(ROOT, 'docs', 'lessons', slug);
  fs.mkdirSync(pub, { recursive: true });
  fs.writeFileSync(path.join(pub, 'index.html'), render('../../index.html'));
  fs.copyFileSync(path.join(distDir, 'diagram.svg'), path.join(pub, 'diagram.svg'));
  if (pngOk) fs.copyFileSync(path.join(distDir, 'diagram.png'), path.join(pub, 'diagram.png'));

  console.log(`  ✓ ${slug}  (svg${pngOk ? ' + png' : ', png skipped'} + html, published to docs/)`);
  return { slug, meta: m };
}

function buildDocsIndex(built) {
  const cards = built.map(({ slug, meta }) => {
    const tags = (meta.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    return `    <a class="card" href="lessons/${slug}/index.html">
      <div class="cat">${esc(meta.category || 'Lesson')}</div>
      <h2>${esc(meta.title)}</h2>
      <p>${esc(meta.summary || meta.subtitle || '')}</p>
      <div class="tags">${tags}</div>
    </a>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>System Design Lessons</title>
<style>
  :root { --bg:#f1efe9; --card:#fff; --border:#e2ded4; --ink:#16181d; --sub:#6a6f7a; --accent:#1434CB; }
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);
    font-family:'Noto Sans','Segoe UI',system-ui,-apple-system,Helvetica,Arial,sans-serif;line-height:1.5}
  header{max-width:1100px;margin:0 auto;padding:46px 28px 10px}
  h1{font-size:34px;margin:0 0 8px;letter-spacing:-.5px}
  header p{color:var(--sub);font-size:16px;margin:0;max-width:720px}
  .grid{max-width:1100px;margin:0 auto;padding:24px 28px 60px;
    display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
  .card{display:block;background:var(--card);border:1px solid var(--border);border-radius:16px;
    padding:20px;text-decoration:none;color:inherit;transition:.16s}
  .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px #0000000f;border-color:#c7c1b2}
  .cat{font-size:11px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
  .card h2{font-size:19px;margin:0 0 8px}
  .card p{color:var(--sub);font-size:14px;margin:0 0 14px}
  .tags{display:flex;flex-wrap:wrap;gap:6px}
  .tag{font-size:11.5px;background:#eceffd;color:#2436a7;border-radius:20px;padding:3px 10px}
  footer{max-width:1100px;margin:0 auto;padding:0 28px 50px;color:var(--sub);font-size:12.5px}
</style>
</head>
<body>
<header>
  <h1>System Design Lessons</h1>
  <p>Interactive, step-through diagrams of how real systems work. Pick a lesson to walk through its flow,
     highlight each actor, and export the diagram.</p>
</header>
<main class="grid">
${cards}
</main>
<footer>Built with the shared diagram engine in <code>/engine</code>. Each lesson lives in <code>/lessons/&lt;slug&gt;</code>.</footer>
</body>
</html>
`;
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'index.html'), html);
  console.log('  ✓ docs/index.html');
}

function updateReadmeCatalog(built) {
  const readmePath = path.join(ROOT, 'README.md');
  const rows = built.map(({ slug, meta }) =>
    `| **[${esc(meta.title)}](lessons/${slug}/)** | ${esc(meta.category || '')} | [interactive](lessons/${slug}/dist/index.html) · [png](lessons/${slug}/dist/diagram.png) · [svg](lessons/${slug}/dist/diagram.svg) |`
  ).join('\n');
  const table = `| Lesson | Category | Artifacts |\n|--------|----------|-----------|\n${rows}`;

  let md = fs.readFileSync(readmePath, 'utf8');
  const START = '<!-- CATALOG:START -->', END = '<!-- CATALOG:END -->';
  const block = `${START}\n${table}\n${END}`;
  if (md.includes(START) && md.includes(END)) {
    md = md.replace(new RegExp(START + '[\\s\\S]*?' + END), block);
  } else {
    md += `\n\n## Lessons\n\n${block}\n`;
  }
  fs.writeFileSync(readmePath, md);
  console.log('  ✓ README.md catalog');
}

function main() {
  const only = process.argv[2];
  let slugs = discoverLessons();
  if (only) {
    if (!slugs.includes(only)) { console.error(`Lesson not found: ${only}`); process.exit(1); }
    slugs = [only];
  }
  if (!slugs.length) { console.error('No lessons found under lessons/*/diagram.js'); process.exit(1); }

  console.log(`Building ${slugs.length} lesson(s)${Resvg ? '' : '  (PNG disabled — run `npm i` in engine/)'}:`);
  const built = slugs.map(buildLesson);

  // Regenerate the index + catalog from the FULL set, not just the one rebuilt.
  const all = discoverLessons().map(slug => ({ slug, meta: require(path.join(LESSONS_DIR, slug, 'diagram.js')).meta }));
  buildDocsIndex(all);
  updateReadmeCatalog(all);
  console.log('Done.');
}

main();
