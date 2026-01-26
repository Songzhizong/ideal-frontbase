# Tech Stack

## Core Technologies

- **Language**: TypeScript 5+ (strict mode, no `any`)
- **Framework**: React 19
- **Build Tool**: Vite
- **Package Manager**: pnpm (strict dependency management)

## Key Libraries

### Routing & Data Fetching
- **TanStack Router**: File-based routing with type-safe parameters
- **TanStack Query v5**: Server state management (replaces useEffect for data fetching)
- **Ky**: HTTP client (~3kb, built on Fetch API)

### UI & Styling
- **Tailwind CSS 4.0**: Atomic CSS utility classes
- **shadcn/ui**: Accessible components built on Radix UI
- **Lucide React**: Icon library
- **Motion**: Animations (Framer Motion)

### Forms & Validation
- **Zod**: Schema validation and type inference
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Zod integration for forms

### State Management
- **TanStack Query**: Server state
- **Zustand**: Global UI state (sidebar, modals, etc.)
- **Nuqs**: Type-safe URL state (filters, pagination)

### Development Tools
- **Vitest**: Unit testing (Vite-native)
- **Testing Library**: Component testing
- **MSW**: API mocking
- **Biome**: Linting and formatting (replaces ESLint + Prettier)
- **@t3-oss/env-core**: Environment variable validation

### Utilities
- **date-fns v4**: Date manipulation (tree-shakable)
- **Recharts**: Charts (used by shadcn/ui charts)
- **ts-reset**: TypeScript type improvements

## Common Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Production build
pnpm preview            # Preview production build

# Testing & Quality
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm typecheck          # Type checking (tsc --noEmit)
pnpm lint               # Run Biome checks
pnpm format             # Format code with Biome

# Setup & Utilities
pnpm install            # Install dependencies
pnpm msw:init           # Initialize MSW (run once)
pnpm routes:generate    # Generate TanStack Router route tree
```

## Build Configuration

- **Vite Config**: Uses TanStack Router plugin, React plugin, and Tailwind plugin
- **Path Alias**: `@/*` maps to `src/*`
- **Test Environment**: jsdom with global test utilities
- **Pre-commit Hooks**: Runs lint and typecheck before commits

## Environment Setup

- **Node**: >=20.0.0
- **pnpm**: >=9.0.0
- **Environment Variables**: Defined in `.env`, validated with @t3-oss/env-core
- **API Base URL**: Configured via `VITE_API_BASE_URL` (defaults to `http://localhost:5173/api`)

## Code Style

- **Formatter**: Biome with tab indentation
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Import Organization**: Auto-organized by Biome
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
