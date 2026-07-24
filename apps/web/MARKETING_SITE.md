# Marketing Site — Implementation Progress

This document tracks the marketing site build for Arco. Design aesthetic: **dark charcoal + Arco lime**, inspired by Linear, Vercel, and Raycast — minimal, enterprise-grade, developer-friendly.

## Design System

- **Layout**: `(marketing)` route group with shared nav, announcement bar, footer
- **Colors**: `#07080a` background, `#e5ff00` primary accent, subtle white borders
- **Typography**: Figtree headings, generous whitespace, max-width containers
- **Components**: Reusable sections in `src/components/marketing/`

## Completed (Hurdle 1)

### Core pages

| Page             | Route                   | Status |
| ---------------- | ----------------------- | ------ |
| Home             | `/`                     | Done   |
| Pricing          | `/pricing`              | Done   |
| Features         | `/features`             | Done   |
| Blog             | `/blog`, `/blog/[slug]` | Done   |
| Changelog        | `/changelog`            | Done   |
| Contact (mailto) | `mailto:hello@arco.app` | Done   |
| Company info     | `/` (landing section)   | Done   |
| Privacy          | `/privacy`              | Done   |
| Terms            | `/terms`                | Done   |
| Cookies          | `/cookies`              | Done   |

### Layout systems

- Marketing layout (nav + footer + announcement)
- Legal page template (sticky TOC, section numbering)
- Blog (index with search/filter, article page with TOC + related)

### Reusable components

- `Hero`, `SectionHeader`, `CtaBand`, `FaqSection`
- `FeatureGrid`, `LogoCloud`, `TestimonialGrid`
- `PricingCards`, `FeatureComparisonTable`
- `CodeBlock`
- `LegalPageLayout`, `BlogCard`, `BlogIndex`

### Already existed (unchanged)

- Sign In `/sign-in`, Sign Up `/sign-up`
- Dashboard `/dashboard/*` (billing, settings, usage, etc.)

## Remaining (Future hurdles)

### Hurdle 2 — Conversion & product pages

- [x] Passwordless magic-link and OAuth authentication
- [ ] Verify email standalone page
- [ ] Checkout / subscription success pages
- [ ] Book a demo page
- [ ] Public integrations page

### Hurdle 3 — Content & SEO

- [ ] MDX or CMS for blog content
- [ ] `sitemap.xml` and `robots.txt`
- [ ] Per-page Open Graph images
- [ ] RSS feed for blog

### Hurdle 4 — Trust & enterprise

- [ ] Trust center / compliance hub
- [ ] DPA and Refund Policy pages
- [ ] Status page integration
- [ ] Customer logos / case studies

### Hurdle 5 — Polish

- [ ] Product demo video in hero
- [ ] Scroll animations (respect reduced motion)
- [ ] Analytics on conversion CTAs
- [ ] Wire contact form to email/API

## File structure

```
src/
  app/(marketing)/
    layout.tsx
    page.tsx              # Home
    pricing/page.tsx
    features/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    changelog/page.tsx
    privacy/page.tsx
    terms/page.tsx
    cookies/page.tsx
  components/marketing/
    announcement-bar.tsx
    marketing-header.tsx
    marketing-footer.tsx
    hero.tsx
    section-header.tsx
    cta-band.tsx
    faq-section.tsx
    feature-grid.tsx
    pricing-cards.tsx
    code-block.tsx
    ...
  lib/marketing/
    site-config.ts
    pricing.ts
    features.ts
    blog.ts
    changelog.ts
    legal.ts
```
