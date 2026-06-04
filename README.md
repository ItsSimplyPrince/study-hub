# Study Hub (public site)

Static study app for **BIO 166**, **CHE 444**, **CHE 344**, **CHE 249**, and **MAT 226**. No server or database — runs entirely in the browser.

## Live site

After you publish to GitHub (see below), anyone can open your public URL, for example:

`https://YOUR_GITHUB_USERNAME.github.io/study-hub/`

Share that link; classmates do not need your computer or any local setup.

## Publish to the internet (GitHub Pages)

### One-time setup (run in macOS Terminal, not inside a sandboxed agent)

1. Install [GitHub CLI](https://cli.github.com/) and sign in: `gh auth login`
2. Initialize git and push this folder:

```bash
cd ~/study-hub
chmod +x scripts/*.sh
rm -rf .git   # only if a broken partial .git exists
git init -b main
git add .
git commit -m "Initial Study Hub site for GitHub Pages"
gh repo create study-hub --public --source=. --remote=origin --push
```

3. On GitHub: **Settings → Pages → Build and deployment → Source** → **Deploy from a branch** → branch **`main`**, folder **`/ (root)`** → **Save**.

4. After ~1 minute, your public link is under **Settings → Pages** (format: `https://YOUR_USERNAME.github.io/study-hub/`).

**Share that HTTPS link** — anyone worldwide can use BIO 166 and the other courses in a normal browser.

### Update the live site after editing locally

If you still edit files in `~/study_hub.html` and `~/study_app_*.js`:

```bash
cd ~/study-hub
./scripts/publish-to-github.sh "Update study content"
```

GitHub Actions redeploys automatically.

## Files

| File | Role |
|------|------|
| `index.html` | Main app (entry URL for visitors) |
| `study_app_data.js` | Concepts, practice, exams |
| `study_app_ui.js` | Topics hub, schedule, exam UI |

## Other hosts

Any static host works (Netlify, Cloudflare Pages, school web space): upload these three files plus `.nojekyll` to the site root. Keep `index.html` as the default document.

## Privacy note

Progress (“Mark studied”) is stored in each visitor’s browser (`localStorage`), not on a server.
