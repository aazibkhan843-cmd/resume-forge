# ResumeForge

A resume builder that runs entirely in the browser. Fill in the form, watch the live preview, and use **Print PDF** (choose "Save as PDF") to download the resume. Everything you type is saved in the visitor's own browser. There is no server and no database.

## Deploy

This is a static site. Upload the whole folder as it is. There is no build step.

| Host | How |
| --- | --- |
| Netlify | Drag the folder onto app.netlify.com/drop. `_headers` is applied automatically. |
| Cloudflare Pages | Create a project, upload the folder. `_headers` is applied automatically. |
| Vercel | Run `vercel --prod` in this folder. `vercel.json` adds the security headers. |
| GitHub Pages | Push the folder contents to a repository, then Settings > Pages > Deploy from branch. |

After deploying, open the site once and try: edit your name, switch template, upload a photo, and use Print PDF.

## Files

- `index.html` – the page and its content
- `assets/style.css` – all styling
- `assets/app.js` – all behaviour (form, preview, saving, export and import)
- `logo.svg`, `favicon-32.png`, `apple-touch-icon.png` – icons
- `_headers`, `vercel.json` – security headers for the hosts above
- `robots.txt` – allows search engines to index the page

## Things to know

- **Security policy.** `index.html` carries a strict Content-Security-Policy. It allows only your own files plus Google Fonts. If you add a new script, stylesheet or font host, add it to the policy in `index.html`, `_headers` and `vercel.json`, or the browser will block it.
- **Fonts.** The four typefaces load from Google Fonts. Visitors need an internet connection for them; without it the page falls back to system fonts. To avoid the Google request, download the fonts, put them in `assets/fonts/`, and replace the Google link with `@font-face` rules in `assets/style.css`.
- **Privacy.** No resume data is sent anywhere. Visitors can back up their data with Download and restore it with Import.
- **Updating.** When you change a file, upload the folder again. If a returning visitor still sees the old version, a hard refresh clears it.
