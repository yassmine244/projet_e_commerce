/**
 * Build DOCUMENTATION.pdf from DOCUMENTATION.md.
 *
 * Uses `marked` to convert MD → HTML, then Microsoft Edge in headless mode
 * to print that HTML to PDF. No Chromium download required.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { marked } = require('marked');

const HERE = __dirname;
const MD = path.join(HERE, 'DOCUMENTATION.md');
const HTML = path.join(HERE, 'DOCUMENTATION.html');
const PDF = path.join(HERE, 'DOCUMENTATION.pdf');

const md = fs.readFileSync(MD, 'utf8');
const body = marked.parse(md);

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  :root {
    --primary: #2563eb; --muted: #64748b; --border: #e2e8f0;
    --bg: #f8fafc; --text: #0f172a; --code-bg: #f1f5f9;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--text);
    line-height: 1.55;
    font-size: 11pt;
    margin: 0;
  }
  h1, h2, h3, h4, h5 {
    color: var(--text);
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
  }
  h1 {
    font-size: 22pt;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 0.3em;
    margin-top: 1.4em;
  }
  h1:first-child { margin-top: 0; }
  h2 {
    font-size: 16pt;
    color: var(--primary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.25em;
  }
  h3 { font-size: 13pt; }
  h4 { font-size: 11.5pt; }
  p, ul, ol { margin: 0.5em 0 0.7em; }
  ul, ol { padding-left: 1.4em; }
  li { margin: 0.15em 0; }
  a { color: var(--primary); text-decoration: none; }
  blockquote {
    margin: 0.7em 0;
    padding: 0.5em 0.9em;
    background: var(--bg);
    border-left: 3px solid var(--primary);
    color: var(--muted);
  }
  code {
    font-family: "Consolas", "Courier New", monospace;
    background: var(--code-bg);
    color: #be185d;
    padding: 0.1em 0.35em;
    border-radius: 3px;
    font-size: 0.92em;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.85em 1em;
    border-radius: 6px;
    overflow-x: auto;
    page-break-inside: avoid;
    font-size: 9.5pt;
    line-height: 1.45;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.7em 0;
    page-break-inside: avoid;
    font-size: 10pt;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.45em 0.7em;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--bg);
    font-weight: 600;
    color: var(--muted);
  }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.5em 0;
  }
  /* Title page */
  .cover {
    text-align: center;
    padding: 40mm 0 0;
    page-break-after: always;
  }
  .cover h1 {
    font-size: 30pt;
    border: none;
    margin-bottom: 0.1em;
  }
  .cover .sub {
    color: var(--muted);
    font-size: 13pt;
    margin-bottom: 4em;
  }
  .cover .meta {
    margin-top: 20mm;
    color: var(--muted);
    font-size: 10pt;
  }
`;

const today = new Date().toLocaleDateString('en-CA');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MERN E-commerce — Complete Documentation</title>
  <style>${css}</style>
</head>
<body>
  <section class="cover">
    <h1>MERN E-commerce</h1>
    <p class="sub">Complete Documentation</p>
    <p>A full-stack online store: storefront, admin panel, reviews,<br>
       wishlist, search, image uploads and Stripe payments.</p>
    <p class="meta">
      Generated ${today}<br>
      React 18 · Vite · Redux Toolkit · Express · Mongoose · Stripe
    </p>
  </section>
  ${body}
</body>
</html>
`;

fs.writeFileSync(HTML, html);
console.log(`Wrote ${HTML} (${(html.length / 1024).toFixed(1)} KB)`);

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const edge = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!edge) {
  console.error('Microsoft Edge not found at the standard locations.');
  console.error('Open DOCUMENTATION.html in any browser and use File → Print → Save as PDF.');
  process.exit(2);
}

const fileUrl = 'file:///' + HTML.replace(/\\/g, '/');
console.log(`Printing with Edge headless: ${edge}`);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${PDF}`,
  fileUrl,
];

const result = spawnSync(edge, args, { stdio: 'inherit' });
if (result.status !== 0) {
  console.error(`Edge exited with code ${result.status}`);
  process.exit(result.status || 1);
}

const stat = fs.statSync(PDF);
console.log(`\nPDF written: ${PDF} (${(stat.size / 1024).toFixed(1)} KB)`);
