# AI Frontend Starter

Feature-based React 19 + Vite + TypeScript starter with TanStack Router, Query, and a Zod-first API layer.

## Quick start

```bash
pnpm install
pnpm msw:init
pnpm dev
```

## Scripts

- `pnpm dev` - start dev server
- `pnpm build` - production build
- `pnpm preview` - preview build
- `pnpm test` - run unit tests
- `pnpm lint` - biome check
- `pnpm typecheck` - tsc no-emit
- `pnpm routes:generate` - generate TanStack Router route tree

## Notes

- API base URL is configured via `.env` (default is `http://localhost:5173/api`).
- MSW is enabled only in development. Run `pnpm msw:init` once to generate `public/mockServiceWorker.js`.
- File-based routes live under `src/routes`.
