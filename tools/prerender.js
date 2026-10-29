// Pre-render the content that js/site.js builds from data/content.js
// directly into the HTML files, so search engines (and visitors without
// JavaScript) see publications, courses, news and resources as plain HTML.
//
// Usage:  node tools/prerender.js        (needs: npm i playwright)
// It is also run automatically by .github/workflows/prerender.yml
// whenever data/content.js or the pages change.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PAGES = ["index.html", "research.html", "teaching.html", "resources.html", "news.html"];
const IDS = ["news-list", "selected-pubs", "news-all", "pubs-books", "pubs-articles",
  "pubs-chapters", "wip-list", "res-list", "stata-intro", "stata-links", "stata-routines",
  "stata-fun", "latex-intro", "latex-links", "latex-examples", "courses-current", "courses-past"];

// Replace the inner HTML of the element with the given id (div/p/ol, no nesting of same tag issues
// because every container's content is generated and contains no element with the same tag+id).
function replaceInner(html, id, inner) {
  const open = new RegExp(`<([a-z]+)([^>]*\\sid="${id}"[^>]*)>`);
  const m = html.match(open);
  if (!m) return html;
  const tag = m[1];
  let attrs = m[2];
  if (!/data-prerendered/.test(attrs)) attrs += " data-prerendered";
  const start = m.index;
  const contentStart = start + m[0].length;
  // find the matching close tag, counting nested tags of the same name
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, "g");
  re.lastIndex = contentStart;
  let depth = 1, mm, end = -1;
  while ((mm = re.exec(html))) {
    if (mm[0].startsWith("</")) { if (--depth === 0) { end = mm.index; break; } }
    else depth++;
  }
  if (end < 0) throw new Error("unclosed #" + id);
  return html.slice(0, start) + `<${tag}${attrs}>` + inner + html.slice(end);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let changed = 0;
  for (const file of PAGES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    await page.goto("file://" + full);
    await page.waitForLoadState("load");
    await page.waitForTimeout(300);
    const rendered = await page.evaluate(ids => {
      // without JavaScript the "show all" toggle cannot work: show every routine
      document.querySelectorAll("#stata-routines .toggle-more").forEach(n => n.remove());
      document.querySelectorAll("#stata-routines .collapsed").forEach(n => n.classList.remove("collapsed"));
      const out = {};
      ids.forEach(id => { const n = document.getElementById(id); if (n) out[id] = n.innerHTML; });
      return out;
    }, IDS);
    const src = fs.readFileSync(full, "utf8");
    let html = src;
    for (const [id, inner] of Object.entries(rendered)) html = replaceInner(html, id, inner);
    if (html !== src) { fs.writeFileSync(full, html); changed++; console.log("updated", file); }
  }
  await browser.close();
  console.log(changed ? `${changed} file(s) updated` : "nothing to update");
})();
