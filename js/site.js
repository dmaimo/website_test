// Shared rendering logic. Reads SITE_CONTENT from data/content.js.

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------- nav toggle ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }
  renderAll();
  initBackToTop();
});

/* ---------- back-to-top button ---------- */
function initBackToTop() {
  const topBtn = el("button", "back-to-top", "&uarr;");
  topBtn.type = "button";
  topBtn.setAttribute("aria-label", "Back to top");
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("visible", window.scrollY > 500);
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- renderers ---------- */

function pubItem(p) {
  const li = el("li", "pub");
  li.appendChild(el("div", "year", esc(p.year)));
  const body = el("div");
  body.appendChild(el("div", "title",
    p.link
      ? '<a class="title-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>"
      : esc(p.title)
  ));
  const meta = el("div", "meta",
    (p.authors ? p.authors + ". " : "") +
    '<span class="outlet">' + esc(p.outlet || "") + "</span>" +
    (p.dataLink ? ' — <a class="doc-link" href="' + esc(p.dataLink) + '" target="_blank" rel="noopener">[Data and replication files]</a>' : "")
  );
  body.appendChild(meta);
  li.appendChild(body);
  return li;
}

function wipItem(p) {
  const li = el("li", "pub pub-flat");
  const body = el("div");
  body.appendChild(el("div", "title", esc(p.title)));
  body.appendChild(el("div", "meta",
    (p.authors || "") +
    (p.status ? ' <span class="outlet">(' + esc(p.status) + ')</span>' : "")
  ));
  li.appendChild(body);
  return li;
}

function renderList(targetId, items, mapper) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const ol = el("ol", "pub-list");
  items.forEach(p => ol.appendChild(mapper(p)));
  target.appendChild(ol);
}

function renderAll() {
  if (typeof SITE_CONTENT === "undefined") return;
  const C = SITE_CONTENT;

  // Home: selected publications
  const sel = document.getElementById("selected-pubs");
  if (sel) {
    const all = [...C.publications.books, ...C.publications.chapters, ...C.publications.articles];
    const picked = C.selectedPublications
      .map(id => all.find(p => p.id === id))
      .filter(Boolean);
    const ol = el("ol", "pub-list");
    picked.forEach(p => ol.appendChild(pubItem(p)));
    sel.appendChild(ol);
  }

  // Home: news (only entries from the last 12 months are shown)
  const newsBox = document.getElementById("news-list");
  if (newsBox) {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const fresh = C.news
      .filter(n => new Date(n.date) >= cutoff)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    const ul = el("ul");
    if (fresh.length === 0) {
      ul.appendChild(el("li", null, "No recent announcements."));
    } else {
      fresh.forEach(n => {
        const li = el("li");
        li.appendChild(el("span", "news-date", esc(formatDate(n.date))));
        li.appendChild(document.createTextNode(n.text));
        ul.appendChild(li);
      });
    }
    newsBox.appendChild(ul);
  }

  // Research page
  renderList("pubs-articles", C.publications.articles, pubItem);
  renderList("pubs-books", C.publications.books, pubItem);
  renderList("pubs-chapters", C.publications.chapters, pubItem);
  renderList("wip-list", C.workInProgress, wipItem);

  // Teaching page
  renderCourses("courses-current", C.courses.current);
  renderCourses("courses-past", C.courses.past);

  // Resources page — Data
  renderResCards("res-list", C.dataResources);

  // Resources page — Stata
  if (C.stataResources) {
    setIntro("stata-intro", C.stataResources.intro);
    renderResCards("stata-links", C.stataResources.links);
    renderRoutines("stata-routines", C.stataResources.routines);
    renderResCards("stata-fun", C.stataResources.fun);
  }

  // Resources page — LaTeX
  if (C.latexResources) {
    setIntro("latex-intro", C.latexResources.intro);
    renderResCards("latex-links", C.latexResources.links);
    renderResCards("latex-examples", C.latexResources.examples);
  }
}

function setIntro(id, text) {
  const t = document.getElementById(id);
  if (t && text) t.textContent = text;
}

function renderResCards(targetId, items) {
  const target = document.getElementById(targetId);
  if (!target || !items) return;
  const grid = el("div", "res-grid");
  items.forEach(r => {
    const card = el("div", "res-card");
    card.appendChild(el("h4", null,
      r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a>" : esc(r.name)));
    card.appendChild(el("p", null, r.desc || ""));
    grid.appendChild(card);
  });
  target.appendChild(grid);
}

function renderRoutines(targetId, items) {
  const target = document.getElementById(targetId);
  if (!target || !items) return;
  const dl = el("dl", "routine-list");
  const SHOW = 5;
  items.forEach((r, i) => {
    const dt = el("dt", i >= SHOW ? "extra" : null,
      r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a>" : esc(r.name));
    dl.appendChild(dt);
    dl.appendChild(el("dd", i >= SHOW ? "extra" : null, r.desc || ""));
  });
  target.appendChild(dl);
  if (items.length > SHOW) {
    dl.classList.add("collapsed");
    const btn = el("button", "toggle-more");
    btn.type = "button";
    const label = () => dl.classList.contains("collapsed")
      ? "SHOW ALL " + items.length + " ROUTINES ↓" : "SHOW FEWER ↑";
    btn.textContent = label();
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      dl.classList.toggle("collapsed");
      btn.textContent = label();
      btn.setAttribute("aria-expanded", String(!dl.classList.contains("collapsed")));
    });
    target.appendChild(btn);
  }
}

function renderCourses(targetId, courses) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const ul = el("ul", "course-list");
  courses.forEach(c => {
    const li = el("li", "course");
    const name = c.page
      ? '<a href="' + esc(c.page) + '">' + esc(c.name) + "</a>"
      : esc(c.name);
    li.appendChild(el("span", "cname", name));
    const tags = el("span", "tags");
    if (c.level) tags.appendChild(el("span", null, esc(c.level)));
    if (c.lang) tags.appendChild(el("span", null, esc(c.lang)));
    li.appendChild(tags);
    ul.appendChild(li);
  });
  target.appendChild(ul);
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}


/* Resources: highlight the section in view + item counts */
document.addEventListener("DOMContentLoaded", () => setTimeout(function () {
  const bar = document.querySelector(".subnav-bar");
  if (!bar) return;
  const hdr = document.querySelector(".site-header");
  if (hdr) document.documentElement.style.setProperty("--header-h", hdr.offsetHeight + "px");
  const count = (sel) => document.querySelectorAll(sel).length;
  const set = (k, n) => { const s = bar.querySelector('[data-count="' + k + '"]'); if (s && n) s.textContent = "· " + n; };
  set("res-list", count("#res-list .res-card"));
  set("stata", count("#stata .res-card, #stata dt"));
  set("latex", count("#latex .res-card"));
  const links = [...bar.querySelectorAll("a")];
  const secs = links.map(a => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    const y = window.scrollY + (hdr ? hdr.offsetHeight : 64) + 80;
    let idx = 0;
    secs.forEach((s, i) => { if (s && s.offsetTop <= y) idx = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === idx));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}, 0));
