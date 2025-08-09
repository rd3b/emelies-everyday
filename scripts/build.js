import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "notes.json");
const PUB = path.join(ROOT, "public");
const NOTES_DIR = path.join(PUB, "notes");

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); }
function formatDate(iso){ try { return new Date(iso).toLocaleDateString(undefined,{year:"numeric", month:"short", day:"numeric"}); } catch { return ""; } }
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

const baseHead = (title, desc, url, ogImage) => `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css" />
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(desc)}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${escapeHtml(url)}"/>
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}"/>` : ""}
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(desc)}"/>
</head>`;

const header = `
<header class="site-header">
  <div class="container">
    <a class="brand" href="/">Notes by Emelie</a>
    <nav class="nav">
      <a href="/" class="nav-link">All Notes</a>
      <button id="themeToggle" aria-label="Toggle theme" class="toggle">◐</button>
    </nav>
  </div>
</header>`;

const footer = `
<footer class="site-footer">
  <div class="container">
    <a href="/">← Back to all notes</a>
  </div>
</footer>`;

function layout(head, body){
  return `${head}
<body>
${header}
<main class="container">${body}</main>
${footer}
<script src="/script.js" defer></script>
</body>
</html>`;
}

function build(){
  ensureDir(PUB);
  ensureDir(NOTES_DIR);
  const data = JSON.parse(fs.readFileSync(DATA, "utf-8"));
  const items = (data.items || []).slice().sort((a,b)=> new Date(b.publishedAt||0) - new Date(a.publishedAt||0));

  const listHtml = items.map(n => `
    <article class="card">
      <h2 class="title"><a href="/notes/${n.slug}.html">${escapeHtml(n.title)}</a></h2>
      <time class="meta">${formatDate(n.publishedAt)}</time>
      <p class="excerpt">${escapeHtml(n.excerpt)}</p>
    </article>`).join("\n");

  const home = layout(
    baseHead("Notes by Emelie", "A minimalist mirror of Substack Notes.", "https://example.com/", null),
    `
    <section class="grid">
      ${listHtml}
    </section>`
  );
  fs.writeFileSync(path.join(PUB, "index.html"), home);

  for (const n of items){
    const article = layout(
      baseHead(`${n.title} — Notes by Emelie`, n.excerpt || n.title, `https://example.com/notes/${n.slug}.html`, null),
      `
      <article class="post">
        <h1 class="post-title">${escapeHtml(n.title)}</h1>
        <time class="meta">${formatDate(n.publishedAt)}</time>
        <div class="post-body">${n.body || ""}</div>
      </article>`
    );
    fs.writeFileSync(path.join(NOTES_DIR, `${n.slug}.html`), article);
  }

  // Write styles and script
  fs.writeFileSync(path.join(PUB, "styles.css"), `:root{--bg:#0a0a0a;--fg:#f5f5f5;--muted:#9ca3af;--accent:#fff;--grid-gap:24px;}
*{box-sizing:border-box}html,body{margin:0;padding:0}html{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}body{background:var(--bg);color:var(--fg)}.container{max-width:1000px;margin:0 auto;padding:24px}.site-header{position:sticky;top:0;border-bottom:1px solid #1f2937;background:rgba(10,10,10,.9);backdrop-filter:saturate(180%) blur(8px);z-index:10}.brand{font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--fg);text-decoration:none}.nav{display:flex;gap:16px;align-items:center}.nav-link{color:var(--muted);text-decoration:none}.nav-link:hover{color:var(--fg)}.toggle{all:unset;cursor:pointer;padding:8px;border:1px solid #262626;border-radius:6px}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:var(--grid-gap)}.card{grid-column:span 12;border:1px solid #262626;padding:24px;border-radius:10px;background:#0d0d0d}.title{margin:0 0 8px;font-size: clamp(20px, 3vw, 28px);font-weight:800}.title a{color:var(--fg);text-decoration:none}.title a:hover{border-bottom:2px solid var(--fg)}.meta{display:block;color:var(--muted);margin-bottom:8px}.excerpt{margin:0;color:#d1d5db}.post{max-width:800px;margin:0 auto}.post-title{font-size: clamp(28px, 5vw, 44px);margin:0 0 12px;font-weight:800}.post-body{line-height:1.7;font-weight:300;color:#e5e7eb}.post-body p{margin:16px 0}.site-footer{border-top:1px solid #1f2937;margin-top:48px}.site-footer a{color:var(--muted);text-decoration:none}.site-footer a:hover{color:var(--fg)}@media (min-width: 720px){.card{grid-column:span 6}}@media (min-width: 1100px){.card{grid-column:span 4}}
/* light mode */
.light body{background:#fff;color:#0a0a0a}.light .site-header{background:rgba(255,255,255,.9);border-bottom:1px solid #e5e7eb}.light .brand{color:#0a0a0a}.light .nav-link{color:#6b7280}.light .nav-link:hover{color:#111827}.light .card{background:#fff;border-color:#e5e7eb}.light .excerpt{color:#374151}.light .meta{color:#6b7280}.light .post-body{color:#111827}`);

  fs.writeFileSync(path.join(PUB, "script.js"), `(() => {
    const html = document.documentElement;
    const key = 'ee-theme';
    function apply(theme){
      if(theme === 'light'){ html.classList.add('light'); html.classList.remove('dark'); }
      else { html.classList.add('dark'); html.classList.remove('light'); }
    }
    const saved = localStorage.getItem(key) || 'dark';
    apply(saved);
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const next = html.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(key, next);
      apply(next);
    });
  })();`);

  console.log(`Built ${items.length} notes → public/`);
}

build();
