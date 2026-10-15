# Webflow handoff

How this codebase maps onto a Webflow (Client First) project.

## 1. Variables (Style panel → Variables)

Create one collection per group in `src/css/variables.css`, same names:

| Group | Variables |
| --- | --- |
| Colors / Brand | `color-primary` #47C3D4, `color-secondary` #FF4500, `color-tan` #F4F4F2, `color-tan-dark` #EEECE8, `color-white`, `color-black` #0B0B0B |
| Colors / Text | `text-color-primary` #0B0B0B, `text-color-secondary` #5D5D5D, `text-color-secondary-dark` #919191, `text-color-muted` #ADADAD |
| Colors / Border | `border-color-light` #E0E0E0, `border-color-dark` #404040, `border-color-divider` #DCDCDC |
| Size | `site-margin` 2rem / 1.5rem (tablet) / 1rem (mobile), `container-large` 86rem, `nav-height` 3.875rem |

## 2. Fonts

Upload Geist Regular 400, Medium 500, SemiBold 600, Bold 700 (`src/assets/fonts`)
under Site Settings → Fonts, family name `Geist`.

## 3. Global classes (Client First)

Structure on every section:

```
section_[name]
  padding-global
    container-large
      padding-section-medium
        [name]_component
```

Type: `heading-style-h1…h6` (Style Guide), plus MX3 display styles
`heading-style-display` (120/104), `heading-style-section` (76/70),
`heading-style-footer` (64/64), `heading-style-card` (48/52),
`heading-style-stat` (44/44), `heading-style-feature` (36/42),
`heading-style-quote` (32/32). Body: `text-size-xlarge|large|medium|regular|small|tiny`.

Breakpoints: Desktop base, Tablet 991, Mobile landscape 767, Mobile portrait 479
(same as Webflow).

## 4. Components

| Webflow component | Classes | Props to expose |
| --- | --- | --- |
| Button | `button` + `button_label` + `button_icon-box` > `icon-embed-arrow`; combos `is-primary`, `is-white`, `is-black`, `is-outline-white`, `is-outline-black`, `is-text` | Label, Link, Variant |
| Tag | `tag` | Text |
| Navbar | `navbar_*` | – |
| Footer | `footer_*` | – |

`icon-embed-*` use a CSS mask so the icon follows the text colour. In Webflow,
replace with an Embed holding the SVG and `fill="currentColor"`.

## 5. Interactions

Turn on GSAP + ScrollTrigger in Site Settings → GSAP, then paste
`src/js/global.js` into Site Settings → Custom Code (footer) and
`src/js/home.js` into the Homepage's Page Settings → Before `</body>`.
All animation hooks are custom attributes, so no class changes are needed:

| Attribute | Effect | Classic IX2 equivalent |
| --- | --- | --- |
| `data-animate="fade-up"` | fade + 32px rise on enter | Scroll into view → Move Y 32→0, Opacity 0→100 |
| `data-animate="stagger"` | children fade up 0.12s apart | Same, with child stagger |
| `data-animate="split-lines"` | heading lines rise from a mask | GSAP only (SplitText-style) |
| `data-animate="image-reveal"` | clip-path wipe from bottom | GSAP only |
| `data-parallax="0.12"` | image drifts while scrolling | While scrolling in view → Move Y |
| `data-marquee` | infinite logo strip | Page load → loop Move X −50% |
| `data-about-stream` | pinned 4-lane photo stream (Figma 7651:5188) | GSAP only |
| `data-why-stack` | sticky cards; earlier card scales to 0.94 | CSS sticky + While scrolling → Scale |
| `data-usecases` | pinned, switches tab halfway; click to switch | Tabs + GSAP pin |
| `data-count` | stat counts from 0 | GSAP only |
| `data-slider` | customer stories prev / next | Webflow Slider or GSAP |

Every animation respects `prefers-reduced-motion`.

## 6. Assets

All homepage images come straight from the Figma file (no screenshots):

| Folder | Contents | Webflow |
| --- | --- | --- |
| `assets/images/logos` | 27 "Trusted by" logos, each pre-sized to its Figma slot (so every marquee item is a plain Image), plus dark story logos | Upload as-is |
| `assets/images/global` | Nav + footer MX3 logos, badges (HIPAA, SOC 2, OSHA), arrow/chevron/cart/corner-mark icons, `grain.png` (64px tile, 10% opacity) | SVGs can be pasted into an Embed with `currentColor` |
| `assets/images/icons` | Feature-chip and social icons | Upload or Embed |
| `assets/images/home` | Section photos at 2× their Figma frame, already cropped the way Figma crops them | Upload; keep `object-fit: cover` |

The four "Why MX3" visuals are layered, not flattened: a background-colour
block (`background-color-brand / -accent / -secondary`), transparent WebP
product renders positioned in % (`home-why_layer is-*`), glass chips
(`home-why_chip`, backdrop blur 12px) and badges (`home-why_badge`, backdrop
blur 24px). Rebuild them in Webflow as a relative div with absolutely
positioned children using the same % values.

Known Figma gap: the Elite Sports use-case background (`usecase-background-sports.jpg`)
is only 564×705 in Figma; the design notes already ask for a higher-resolution photo.
