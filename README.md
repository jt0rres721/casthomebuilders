# CAST Home Builders — Website

Marketing website for **casthomebuilders.com** — built as a static site, deployable to GitHub Pages or Cloudflare Pages with zero cost.

---

## File Structure

```
casthomebuilders/
├── index.html          ← Main (and only) page
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Nav, scroll animations, form handling
├── images/             ← Add your photos here (see list below)
└── README.md
```

---

## Before Going Live — Required Updates

Search the HTML for these placeholders and replace them all:

| Placeholder | Replace with |
|---|---|
| `[YOUR-EMAIL]` | Your business email |
| `[YOUR-LICENSE-NUMBER]` | Utah GC license number | 
| `[X]+` | Real project counts / review count |
| Review placeholders | Real Google review text + names |
| Gallery captions | Real project descriptions |

---

## Images to Add

Save all images in the `/images/` folder. Recommended sizes:

| Filename | Size | Description |
|---|---|---|
| `hero-bg.jpg` | 1920×1080 | Hero background — best finished kitchen or bathroom |
| `why-us.jpg` | 700×900 | Team photo or nice interior shot |
| `service-kitchen.jpg` | 800×600 | Kitchen remodel |
| `service-bathroom.jpg` | 800×600 | Bathroom remodel |
| `service-basement.jpg` | 800×600 | Finished basement |
| `service-flooring.jpg` | 800×600 | Flooring install |
| `gallery-1.jpg` through `gallery-6.jpg` | 800×600 | Project photos |
| `og-image.jpg` | 1200×630 | Social share image (can reuse hero) |
| `favicon.png` | 32×32 | Browser tab icon |

**Tip:** Compress images before uploading. Use [Squoosh](https://squoosh.app) or [TinyPNG](https://tinypng.com) to keep file sizes under 300KB each. This is important for mobile load speed.

---

## Setting Up the Contact Form (Formspree)

The form uses [Formspree](https://formspree.io) — free for up to 50 submissions/month.

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form → copy the endpoint URL (looks like `https://formspree.io/f/xyzabcde`)
3. In `index.html`, find the `<form>` tag and replace the action:
   ```html
   action="https://formspree.io/f/xyzabcde"
   ```
4. That's it — form submissions go straight to your email.

**Alternative options:**
- [Web3Forms](https://web3forms.com) — also free, similar setup
- [EmailJS](https://www.emailjs.com) — client-side only, no backend needed

---

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repository (public or private)
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project
3. Connect your GitHub repo
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (root)
5. Click **Save and Deploy**
6. Go to **Custom Domains** → add `casthomebuilders.com`
7. Update your domain's nameservers to Cloudflare (if not already) — SSL is automatic

Every time you push to your `main` branch, Cloudflare auto-deploys.

---

## Redirecting cast-es.com → casthomebuilders.com

In your cast-es.com hosting control panel (cPanel or similar):

**Option A — .htaccess redirect (Apache)**
Create or edit `.htaccess` in the root of cast-es.com:
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?cast-es\.com$ [NC]
RewriteRule ^(.*)$ https://casthomebuilders.com/$1 [R=301,L]
```

**Option B — cPanel Redirects tool**
Go to cPanel → Redirects → Add a permanent (301) redirect from `cast-es.com` to `https://casthomebuilders.com`.

---

## SEO Checklist

- [ ] Replace all `[placeholder]` text in `index.html`
- [ ] Add all images (especially hero-bg.jpg)
- [ ] Set up Google Search Console and submit your sitemap
- [ ] Link your Google Business Profile (CAST Home Builders) to `casthomebuilders.com`
- [ ] Add real Google reviews to the Reviews section
- [ ] Update the Local Business schema with your real phone, address, and Google CID
- [ ] Set up Google Analytics or [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (free)

---

## Making Updates

The site is plain HTML/CSS/JS — no build tools, no framework. To make changes:

1. Edit files locally
2. `git add . && git commit -m "your message" && git push`
3. Cloudflare auto-deploys in ~30 seconds
