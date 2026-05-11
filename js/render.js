/* render.js — fetches content.json and populates the current page */

const PAGE = document.body.dataset.page;

async function loadContent() {
  const res = await fetch('./content.json?v=' + Date.now());
  if (!res.ok) throw new Error('Could not load content.json');
  return res.json();
}

function nl2br(str) {
  return (str || '').replace(/\n/g, '<br>');
}

function esc(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── NAV ──────────────────────────────────────────────────────
function renderNav(data) {
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    const parts = data.meta.name.split(' ');
    const first = parts.slice(0, 2).join(' ');
    const rest  = parts.slice(2).join(' ');
    logo.innerHTML = `${esc(first)} <span>${esc(rest)}</span>`;
  }
  // Footer
  const fn = document.querySelector('.footer-name');
  if (fn) fn.textContent = data.meta.name;
  const fc = document.querySelector('.footer-copy');
  if (fc) fc.textContent = `© ${data.meta.year} · ${data.meta.university}`;
}

// ── HOME ─────────────────────────────────────────────────────
function renderHome(data) {
  const h = data.home;
  setText('#hero-eyebrow',  h.eyebrow);
  setText('#hero-headline', h.headline);
  setText('#hero-headline-em', h.headline_em);
  setText('#hero-subtitle', h.subtitle);
  setText('#hero-bio1', h.bio1);
  setText('#hero-bio2', h.bio2);
  setHTML('#hero-address', nl2br(esc(h.address)));
  const wsLink = document.querySelector('#hero-website');
  if (wsLink) { wsLink.href = h.website_url; wsLink.textContent = h.website_label; }

  // Featured research (first 3 WIP)
  const wipGrid = document.querySelector('#featured-research');
  if (wipGrid) {
    wipGrid.innerHTML = data.research.wip.slice(0,3).map(w => `
      <div class="card fade-in">
        <p class="card-tag">${esc(w.tag)}</p>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.description)}</p>
        <span class="card-link">${esc(w.status)}</span>
      </div>`).join('');
  }

  // Featured teaching (first course from each group, up to 4)
  const teachGrid = document.querySelector('#featured-teaching');
  if (teachGrid) {
    const cards = data.teaching.groups.slice(0,4).map(g => {
      const c = g.courses[0];
      return `
        <div class="card fade-in">
          <p class="card-tag">${esc(g.title)}</p>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.sub || 'University of Messina')}</p>
        </div>`;
    });
    teachGrid.innerHTML = cards.join('');
  }
}

// ── RESEARCH ─────────────────────────────────────────────────
function renderResearch(data) {
  setText('#research-intro', data.research.intro);

  const pubList = document.querySelector('#pub-list');
  if (pubList) {
    // Group by category
    const order = ['Books', 'Chapters in Books', 'Articles in Refereed Journals'];
    const groups = {};
    data.research.publications.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    let html = '';
    order.forEach(cat => {
      if (!groups[cat] || groups[cat].length === 0) return;
      html += `<li class="pub-category-header">${esc(cat)}</li>`;
      groups[cat].forEach(p => {
        html += `<li class="pub-item">
          <span class="pub-year">${esc(p.year)}</span>
          <div>
            <p class="pub-title">${esc(p.title)}</p>
            <p class="pub-authors">${esc(p.authors)}</p>
            <p class="pub-journal">${esc(p.journal)}</p>
            <div class="pub-links">
              ${p.pdf_url         ? `<a href="${esc(p.pdf_url)}" target="_blank" rel="noopener">[pdf]</a>` : '<span class="pub-link-placeholder">[pdf]</span>'}
              ${p.replication_url ? `<a href="${esc(p.replication_url)}" target="_blank" rel="noopener">[replication]</a>` : '<span class="pub-link-placeholder">[replication]</span>'}
            </div>
          </div>
        </li>`;
      });
    });
    pubList.innerHTML = html;
  }

  const wipGrid = document.querySelector('#wip-grid');
  if (wipGrid) {
    wipGrid.innerHTML = data.research.wip.map(w => `
      <div class="card">
        <p class="card-tag">${esc(w.tag)}</p>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.description)}</p>
        <span class="card-link">${esc(w.status)}</span>
      </div>`).join('');
  }
}

// ── TEACHING ─────────────────────────────────────────────────
function renderTeaching(data) {
  setText('#teaching-intro', data.teaching.intro);
  setText('#exams-text', data.teaching.exams_text);

  const container = document.querySelector('#teaching-groups');
  if (!container) return;

  container.innerHTML = data.teaching.groups.map(g => `
    <div class="course-group" id="${esc(g.id)}">
      <h2 class="course-group-title">${esc(g.title)}</h2>
      <ul class="course-list">
        ${g.courses.map(c => `
        <li class="course-item">
          <div class="course-name">
            ${esc(c.name)}
            ${c.sub ? `<small>${esc(c.sub)}</small>` : ''}
          </div>
          <span class="course-badge">${esc(c.badge)}</span>
        </li>`).join('')}
      </ul>
    </div>`).join('');
}

// ── RESOURCES ────────────────────────────────────────────────
function renderResources(data) {
  setText('#resources-intro', data.resources.intro);

  const container = document.querySelector('#resources-sections');
  if (!container) return;

  container.innerHTML = data.resources.sections.map((sec, i) => `
    <div ${i > 0 ? 'style="margin-top:4rem"' : ''}>
      <div class="section-header" id="${esc(sec.id)}">
        <span class="section-label">${esc(sec.label)}</span>
        <h2 class="section-title">${esc(sec.title)}</h2>
        <span class="section-rule"></span>
      </div>
      <div class="resource-grid">
        ${sec.blocks.map(b => `
        <div class="resource-block">
          <h3>${esc(b.title)}</h3>
          <p>${esc(b.description)}</p>
          ${b.links.length ? `<ul>${b.links.map(l =>
            `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.text)}</a></li>`
          ).join('')}</ul>` : ''}
        </div>`).join('')}
      </div>
    </div>
    ${i < data.resources.sections.length - 1 ? '<hr class="divider" style="margin:4rem 0">' : ''}`
  ).join('');
}

// ── CONTACT ──────────────────────────────────────────────────
function renderContact(data) {
  const c = data.contact;
  setText('#contact-position', c.position);
  setHTML('#contact-dept', nl2br(esc(c.dept_full)));
  setHTML('#contact-address', nl2br(esc(c.address)));
  setText('#contact-hours', c.office_hours);
  const iLink = document.querySelector('#contact-inst-link');
  if (iLink) { iLink.href = c.institution_url; iLink.textContent = c.institution_label; }
  const dLink = document.querySelector('#contact-dept-link');
  if (dLink) { dLink.href = c.dept_url; dLink.textContent = c.dept_label; }
}

// ── Helpers ───────────────────────────────────────────────────
function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = val || '';
}
function setHTML(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.innerHTML = val || '';
}

// ── Boot ──────────────────────────────────────────────────────
const renderers = { home: renderHome, research: renderResearch, teaching: renderTeaching, resources: renderResources, contact: renderContact };

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadContent();
    renderNav(data);
    if (renderers[PAGE]) renderers[PAGE](data);
    document.body.classList.add('loaded');
  } catch (e) {
    console.error('render.js:', e);
    document.body.classList.add('loaded');
  }
});
