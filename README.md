# nishalangovender.com

Personal site and engineering portfolio for [Nishalan Govender](https://nishalangovender.com) — robotics engineer at [Ubundi](https://ubundi.com), working across AI, Physical AI, embedded systems, and the web.

Live at [**nishalangovender.com**](https://nishalangovender.com).

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** — design tokens via CSS variables; light theme plus a dark theme built from `nish-arc`, a terminal palette kept outside this repo and shared with ghostty and starship
- **Framer Motion** — page transitions and hero animation
- **MDX** — blog posts (`next-mdx-remote`, `rehype-pretty-code`, `shiki`)
- **Vitest + Testing Library** — unit tests for the interactive demos
- **Vercel** — hosting, preview deployments per branch
- **Formspree** — contact and CV-request form backend

No database. All content is static — typed data files and MDX.

## Local development

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

### Scripts

| Script               | What it does                         |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Next.js dev server                   |
| `npm run build`      | Production build                     |
| `npm run start`      | Serve the production build           |
| `npm run lint`       | ESLint (Next config + import plugin) |
| `npm run typecheck`  | TypeScript type check (no emit)      |
| `npm run test`       | Run the Vitest suite once            |
| `npm run test:watch` | Vitest in watch mode                 |

### Environment variables

Set `NEXT_PUBLIC_FORMSPREE_ID` to enable the contact and CV-request forms. Without it, the forms render a graceful fallback message.

## Project layout

```
src/
├── app/            # Routes (App Router) — pages, metadata, OG images, sitemap, robots
├── components/
│   ├── layout/     # Navbar, Footer, ThemeProvider
│   ├── sections/   # Page-specific sections (Hero, Timeline, EngineeringProcess, …)
│   ├── ui/         # Reusable primitives (cards, headings, reveal wrappers)
│   └── demos/      # Interactive project demos (park-bot, path-following, pen-plotter)
├── content/blog/   # MDX blog posts
├── data/           # Typed content: projects, skills, timeline, CV
└── lib/            # Site config, animation presets, shiki theme, demo simulation logic
```

## Highlights worth poking at

- **Interactive robotics demos** — `src/components/demos/` and `src/lib/` house standalone simulations (4WS path-following controller, pen-plotter, Park Bot) that share a common rendering and test harness.
- **Skills Venn** — `src/components/ui/SkillsVenn.tsx` visualises three disciplines (software, electronics, mechanical) and their intersections, with a grid listing underneath. The centre zone covers mechatronics and Physical AI.
- **Hero loop** — `src/components/sections/hero-loop/` is the animated homepage sequence.
- **Dynamic OG images** — per-project and per-post Open Graph images via edge-runtime `opengraph-image.tsx` routes. The site card embeds the avatar inline as a data URI, since Satori resolves no local paths.
- **Terminal motifs** — starship-style prompt chips on page heroes, a right-prompt footer status line, and a `command not found` 404. Code blocks use a custom shiki theme built from the same palette (`src/lib/shiki/nish-arc.ts`).

## Deployment

Pushes to `main` deploy to production via Vercel. Every branch gets a preview URL. DNS is on Cloudflare.

## License

[MIT](./LICENSE) — feel free to borrow patterns if anything here helps you.
