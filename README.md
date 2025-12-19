## BuildCalc

BuildCalc is a production-ready catalog of construction calculators (concrete, paint, flooring, tile, roofing, drywall, wallpaper, brick/cement). Every calculator renders on the server for SEO, adapts to the visitor’s country, and emits results in both SI and local units.

### Tech stack

- Next.js 16 App Router + TypeScript
- TailwindCSS 3 + shadcn/ui
- Zod-backed validation inside the calculation engine
- i18n routing for `en` and `ru`
- Prisma schema kept for future DB usage, but **current build loads everything from static JSON seeds** (no database required)

### Getting started

```bash
pnpm install
pnpm dev
```

> Prisma migrations/seeds are optional right now: data already ships in the repo. If you want to re-enable persistence later, copy `env.sample` to `.env`, run `pnpm prisma migrate dev` and `pnpm prisma db seed`, and flip the data sources back to Prisma.

### Available scripts

- `pnpm dev` – run Next.js locally
- `pnpm build` / `pnpm start` – production build & serve
- `pnpm lint` – lint via ESLint
- `pnpm prisma migrate dev` / `pnpm prisma db seed` – optional, only if you switch back to a real database

### Data sources

- 8 calculator definitions (`lib/calc/definitions.ts`) with JSON-driven forms, FAQs, guides, default waste keys
- Country profiles (`lib/constants/countries.ts`) for US, GB, DE, RU, IN, CA (unit system, currency, coverage defaults, waste factors, etc.)

### Features

- **Dynamic forms** – every calculator comes from Prisma JSON and renders client-side with shadcn inputs.
- **Unit-aware engine** – inputs convert to SI, formulas run in `lib/calc/engine.ts`, outputs re-render in user units + SI tabs.
- **Geo detection** – detects country via Vercel/Cloudflare headers, Accept-Language, or a manual selector persisted in cookies + localStorage.
- **Copy link** – share current parameters with a single click (`Copy link with parameters`).
- **SEO/i18n** – `/[locale]` routes, localized metadata per calculator, SSR pages for bots.
- **FAQ + guides** – each calculator embeds “How it works”, FAQ accordion, and optional Markdown-like guide page.

### Example routes

- Catalog home: `http://localhost:3000/en`
- Concrete calculator: `http://localhost:3000/en/calc/concrete`
- Guide screenshot reference: visit `http://localhost:3000/en/calc/brick/guide`

### Testing

- `pnpm lint` – primary CI gate
- Example calculation snapshots live in `lib/calc/engine.ts` comments (see inline samples for quick verification).

### Deploy notes

- No DB dependency by default. If you want persistence, re-enable Prisma and point `DATABASE_URL` to PostgreSQL before deploying (`pnpm prisma migrate deploy`).
- Shadcn uses the New York theme + TailwindCSS 3 – adjust `tailwind.config.ts` if you add more UI primitives.
- When running Prisma commands later, ensure outbound HTTPS so the CLI can download native engines.

