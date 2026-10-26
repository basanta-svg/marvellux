# Marvels Luxe Bhutan — Astro + Tailwind

Marketing site for Marvels Luxe Bhutan (https://marvelsbhutan.com), rebuilt in
[Astro](https://astro.build) with [Tailwind CSS v4](https://tailwindcss.com).
The original static site is untouched in `../marvels luxe bhutan`.

## Commands

| Command           | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Dev server at `http://localhost:4321`    |
| `npm run build`   | Static build to `./dist/`                |
| `npm run preview` | Preview the production build             |

## Structure

```
public/
  images/            only the images the site actually uses (lowercase, hyphenated names)
  docs/              tentative festival-date PDFs
src/
  layouts/BaseLayout.astro   <head> (title, description, canonical, Open Graph), header, footer
  components/                Header, Footer, PageHero, FinalCta, TourCard, BlogSlide, JourneyCard,
                             FaqItem, DayItem, ValueCard, TeamCard, QuoteForm, BhutanMap, carousels …
  pages/                     one file per page; URLs keep the original `.html` form
  data/nav.ts                single source for the header, mobile nav and footer links
  data/districts.ts          the 20 dzongkhags shown on the map
  scripts/                   small TypeScript modules, loaded only by the components that need them
  styles/global.css          Tailwind import, brand tokens (@theme) and the base reset
```

## Styling

All component styling is Tailwind utility classes in the markup. Brand tokens live in
`src/styles/global.css` under `@theme`: `brand-yellow`, `brand-yellow-dark`, `charcoal`,
`soft-white`, `white-line`, `charcoal-line`, `font-heading`, `font-body`, `rounded-pill`.
Tailwind's preflight is intentionally not imported; the small reset in `global.css` is
kept so default element styling matches the original site.

A few class names remain in the markup purely as JavaScript hooks (`faq-item`, `nav-item`,
`site-header`, `open`, `scrolled`, `is-visible`, …). They carry no styles.

## Notes

- The quote form and newsletter validate and show a confirmation but do not send data anywhere;
  the original site had no backend either. Connect them to a form service or API route before launch.
- Social-icon, legal-page and blog "Read more" links are still `#` placeholders, as in the original.
