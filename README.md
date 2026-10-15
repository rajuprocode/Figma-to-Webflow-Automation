# MX3 website

The MX3 Hydration Testing site, built pixel-for-pixel from the Figma file
[MX3 | Internal | 2026](https://www.figma.com/design/Ewgm1ZPVX4T8MqfU14M1pp/MX3-%257C-Internal-%257C-2026?node-id=7497-16210)
as a static site for Vercel, structured with Finsweet **Client First** so every
page can be rebuilt in Webflow with the same classes, variables and GSAP code.

## Run it

```bash
npm install
npm run dev        # builds to dist/ and serves http://localhost:4321
npm run build      # production build (what Vercel runs)
```

Vercel picks up `vercel.json`: build `npm run build`, output `dist/`, clean URLs.

## Layout

```
src/
  pages/            one HTML file per page (index.html = Homepage)
  partials/         navbar.html, footer.html  → <!-- @include name -->
  css/
    variables.css   MX3 design tokens (→ Webflow Variables)
    client-first.css  Client First globals: structure, type scale, utilities
    components.css  Button, Tag, Corner mark, Navbar, Footer
    home.css        Homepage section classes
  js/
    global.js       nav, marquee, scroll reveals (data-animate="…")
    home.js         Homepage-only GSAP (photo stream, stacks, counters, slider)
    vendor/         gsap + ScrollTrigger (Webflow ships these natively)
  assets/           fonts (Geist, SIL OFL), images
scripts/            build.mjs (partials → dist), serve.mjs (local preview)
docs/webflow-handoff.md   how each piece maps onto Webflow
```

## Assets

Images in `src/assets/images` are interim 1× renders taken through the Figma
MCP while `www.figma.com` was blocked by the environment's network policy.
Every slot still waiting on its original file is marked `data-asset-pending`
in the HTML. Once the host is allowed, they are replaced with the original
PNG/JPG/SVG exports at full resolution.
