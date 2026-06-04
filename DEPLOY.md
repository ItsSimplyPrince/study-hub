# Go live in ~5 minutes

Your site files are in **`~/study-hub`**. Git is already initialized with one commit.

## Option A — GitHub Pages (recommended, free, permanent URL)

### 1. Create a GitHub repository

1. Log in at [github.com](https://github.com).
2. **New repository** → name it `study-hub` → **Public** → do **not** add a README (this folder already has one).
3. Copy the repo URL, e.g. `https://github.com/YOUR_USERNAME/study-hub.git`.

### 2. Push from your Mac (Terminal)

```bash
cd ~/study-hub
git remote add origin https://github.com/YOUR_USERNAME/study-hub.git
git push -u origin main
```

(Use SSH URL instead if you prefer SSH keys.)

### 3. Turn on GitHub Pages

1. Repo → **Settings** → **Pages**.
2. **Build and deployment** → **Source** → **Deploy from a branch**.
3. **Branch:** `main` → folder **`/ (root)`** → **Save**.
4. Wait ~1 minute, then copy the public URL, e.g.  
   `https://YOUR_USERNAME.github.io/study-hub/`

(No GitHub Actions workflow required — works with a basic repo token.)

Send that link to anyone. They open it in Chrome/Safari/Firefox — no install, no access to your Mac.

### 4. After you edit study content at home

```bash
cd ~/study-hub
./scripts/publish-to-github.sh "Describe your update"
```

That syncs from `~/study_hub.html` and `~/study_app_*.js`, commits, and pushes.

---

## Option B — GitHub CLI (if you install `gh`)

```bash
brew install gh
gh auth login
cd ~/study-hub
gh repo create study-hub --public --source=. --remote=origin --push
```

Then enable **Pages → GitHub Actions** as in step 3 above.

---

## Option C — Netlify Drop (fastest test, no git)

1. Zip the folder: `index.html`, `study_app_data.js`, `study_app_ui.js`, `.nojekyll`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drop the zip.
3. Netlify gives you a random `https://something.netlify.app` URL immediately.

Good for a quick share; GitHub Pages is better for long-term updates via git push.

---

## What visitors get

- Full Study Hub in the browser (BIO 166, CHE courses, MAT 226).
- Works on phones and laptops.
- “Mark studied” saves in **their** browser only.
