# nishalangovender.com

Personal site and engineering portfolio for [Nishalan Govender](https://nishalangovender.com) — robotics engineer who shipped production AGV fleets, now exploring Physical AI at [Ubundi](https://ubundi.com).

Live at [**nishalangovender.com**](https://nishalangovender.com).

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** — design tokens via CSS variables, derived from the `--tty-*` palette (see below)
- **three.js + React Three Fiber** — the 3D homepage hero (no drei)
- **Framer Motion** — page transitions and overlay animation
- **MDX** — blog posts (`next-mdx-remote`, `rehype-pretty-code`, `shiki`)
- **Vitest + Testing Library** — unit tests for the demos, the hero scene's maths, and content limits
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
- **3D hero** — `src/components/sections/hero-scene/` fills the homepage hero behind the headline and tells the notebook-to-factory story as one three.js scene. A kinematic diagram (world and body axes, heading θ, velocity V, ω) is inked in pen on the dotted right-hand page of an open, stitched hardcover notebook on a walnut desk; the robot's outline lifts into a wireframe AGV while the annotations stay on the page, and its electronics drop into the open chassis — battery, motor drivers, Pi, then the cabling. The camera pulls back to the monitor behind the notebook, where `nish_bot` builds and launches in a terminal and the AGV's status LEDs light as it boots. The AGV drives off the page, its wheels rolling — castor dipping off the notebook first, then the drive wheels — across the desk and down a ramp, materialising into a solid robot as it reaches the floor, while dots on the floor rise into a lidar point cloud that resolves into a lit production floor — racking with loaded pallets, lane lines, walls and columns, cut away like a model so the AGV stays in view — with the laser scan and an amber costmap left as an RViz overlay. The camera pulls up over the fleet and flies into the monitor on the desk, where the production dashboard runs live, then pulls back across the desk to the notebook, where the written sheet turns about the spine onto the left-hand stack, uncovering a fresh page. The desk, monitor and notebook share the factory's lighting and shadows, and the loop runs at an unhurried 37.5 s. Once the factory has formed, click or tap the floor during the deploy and system beats to send a nav goal: the loop pauses and pure pursuit drives there along the drawn path. The scene loads after the hero text, pauses offscreen, and falls back to a static notebook frame for reduced motion or no WebGL. In development, `?beat=1`–`6` holds the loop on one beat and `?t=S` freezes it at S seconds.
- **Skills Venn** — `src/components/ui/SkillsVenn.tsx` visualises three disciplines (software, electronics, mechanical) and their intersections, with a grid listing underneath. Fields still being learned carry an `exploring` tag instead of a proficiency bar.
- **Dynamic OG images** — per-project and per-post Open Graph images via edge-runtime `opengraph-image.tsx` routes. The site card embeds the avatar inline as a data URI, since Satori resolves no local paths.
- **Terminal motifs** — starship-style prompt chips on page heroes, a right-prompt footer status line, and a `command not found` 404. Code blocks use a custom shiki theme built from the same palette (`src/lib/shiki/nish-arc.ts`).

## Palette

Colours come from the nish-os TTY tokens (`--tty-*` in `src/app/globals.css`), copied verbatim from `nish-os/docs/design-system.md` so the site, the app and the terminal read as one surface. Only the `--tty-*` values change per theme; every other site token derives from them. A test (`src/app/__tests__/palette.test.ts`) checks both themes against the nish-os table.

## Deployment

Pushes to `main` deploy to production via Vercel. Every branch gets a preview URL. DNS is on Cloudflare.

## License

[MIT](./LICENSE) — feel free to borrow patterns if anything here helps you.
