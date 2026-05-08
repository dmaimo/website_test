# dariomap.com — Static Academic Site

## Setup (one time, ~15 minutes)

### 1. Create a GitHub repository

1. Go to https://github.com/new
2. Create a **public** repository (e.g. `dariomap-site`)
3. Upload all files from this zip into that repository (drag-and-drop in the GitHub web interface)

### 2. Deploy on Netlify

1. Go to https://netlify.com and create a free account
2. Click **Add new site → Import an existing project → GitHub**
3. Select your repository
4. Leave all build settings blank (no build command needed)
5. Click **Deploy** — your site will be live at a `.netlify.app` URL within seconds
6. To use your own domain (dariomap.com): go to **Site settings → Domain management** and follow the instructions to point your domain's DNS to Netlify

### 3. Connect the Admin Panel

1. Go to https://github.com/settings/tokens/new
2. Give it a name (e.g. "dariomap admin")
3. Check **repo** scope
4. Click Generate and copy the token
5. Open `yoursite.netlify.app/admin.html`
6. Fill in: GitHub username, repository name, your token, and choose an admin password
7. Click **Connect** — you're done

### Editing content

- Open `/admin.html` on your live site or locally
- Log in with your admin password
- Edit any field
- Click **Save to GitHub** — Netlify rebuilds automatically in ~30 seconds

### File structure

```
site/
├── content.json       ← ALL your content lives here
├── index.html         ← Homepage shell
├── research.html      ← Research page shell
├── teaching.html      ← Teaching page shell
├── resources.html     ← Resources page shell
├── contact.html       ← Contact page shell
├── admin.html         ← Content editor (password protected)
├── css/style.css      ← All styles
├── js/
│   ├── render.js      ← Fetches content.json and renders pages
│   └── main.js        ← Nav toggle, active links
└── netlify.toml       ← Netlify config
```

### Contact form

The contact form currently shows a visual confirmation but does not deliver emails.
To activate it:
1. Create a free account at https://formspree.io
2. Create a new form and copy the endpoint URL (e.g. `https://formspree.io/f/xxxxxxxx`)
3. In `contact.html`, add `action="https://formspree.io/f/xxxxxxxx" method="POST"` to the form element
