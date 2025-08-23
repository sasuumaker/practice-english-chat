# Repository Guidelines

## Project Structure & Module Organization
- `front/`: Next.js 15 app (TypeScript, App Router, Tailwind). Key paths: `app/` (routes, layouts, components), `lib/` (supabase, validation, types), `public/` (assets), `middleware.ts`.
- `docs/`: Planning and design docs (Japanese): API, DB, UI, requirements.
- Root: repository meta files. Development happens inside `front/`.

## Build, Test, and Development Commands
- Install: `cd front && npm install`
- Develop: `npm run dev` — start Next.js at `http://localhost:3000`.
- Build: `npm run build` — production build.
- Start: `npm run start` — run the production server.
- Lint: `npm run lint` — run ESLint (Next + TypeScript rules).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`). Indentation: 2 spaces.
- Components: PascalCase files in `app/components/` (e.g., `Header.tsx`).
- Routes: lowercase segment folders in `app/` (e.g., `login`, `signup`).
- Server Actions: `app/actions/*.ts` with `"use server"` directives.
- Types: `lib/types/*`. Validation: `lib/validation/*`.
- Linting: ESLint config extends `next/core-web-vitals` and `next/typescript`. Ensure `npm run lint` passes before PRs.

## Testing Guidelines
- No test runner is configured yet. If adding tests, place unit tests under `front/__tests__/` and component tests with React Testing Library. Use Playwright for E2E under `front/e2e/`.
- Name tests `*.test.ts(x)` and ensure they run in CI-friendly scripts (add `"test"` to `package.json`).

## Commit & Pull Request Guidelines
- Commits: short, imperative messages; include scope when useful. Example: `auth: サインアップのバリデーションを改善`.
- Branches: `feature/<topic>`, `fix/<topic>`.
- PRs: include description, linked issues, screenshots/gifs for UI changes, and steps to verify. Ensure dev build runs and lint passes.

## Security & Configuration Tips
- Env: `front/.env.local`. Example keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`.
- Note: `NEXT_PUBLIC_*` values are exposed to the browser—do not place secrets there. Never commit `.env.local`.
- Auth runs via Server Actions and Supabase; keep sensitive logic server-side.

## Requirements
- Node.js 18+ recommended. Run commands from `front/` directory.
