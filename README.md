# Kyrodi website

Marketing site for **Kyrodi**: *Everyday Services, with a Personal Touch.*
It's a single landing page (Hero, Services, Why Kyrodi, How It Works, Install, Get Started), and every CTA points to `https://app.kyrodi.com`.

Plain static HTML/CSS/JS. There's no build step and nothing to install.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Upload the folder as-is to any static host (GitHub Pages, Netlify, Vercel, S3). It's served from the domain root at `https://kyrodi.com/`. If the domain changes, update `canonical`, `og:url`, `og:image`, the JSON-LD URLs in `index.html`, and `robots.txt` / `sitemap.xml`.

## Structure

| Path | What |
|---|---|
| `index.html` | Landing page with inline SVG icon sprite, SEO meta, Open Graph and JSON-LD |
| `css/style.css` | Design tokens, layout, phone mockups, animations |
| `js/main.js` | Nav, scroll reveal, OS-aware install tabs, smart install button, in-app-browser notice |
| `manifest.webmanifest`, `sw.js` | Make the site installable so the smart install button can use Chrome's prompt |
| `images/photos/` | Stock photos (Pexels licence, free for commercial use) |
| `images/icons/`, `images/favicon.svg` | Kyrodi "K" mark: favicon, apple-touch and PWA icons |
| `images/og-image.jpg` | 1200×630 share image for WhatsApp and social link previews |

## Brand

- Colours: evergreen `#0F3D3A`, cream `#FBF7F0`, saffron `#E8A33D`, terracotta `#C8643B`
- Type: Fraunces (headings), Plus Jakarta Sans (body), both from Google Fonts

## Photo credits (Pexels)

Tima Miroshnichenko (vehicle washing), cottonbro studio (ironing), Teona Swift (plant care), Erik Mclean (foam car).
