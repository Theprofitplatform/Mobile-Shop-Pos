# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies. The primary app is Phone Shop POS, a full-stack point-of-sale system for a mobile phone shop.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Phone Shop POS

- **Artifact**: `artifacts/phone-shop-pos` served at `/`
- **Purpose**: Manage phone/accessory/parts inventory, customers, POS checkout, sales receipts, repair tickets, low-stock alerts, inventory adjustments, business reports, and dashboard summaries.
- **Backend**: Shared Express API server in `artifacts/api-server`
- **Data model**: Products, customers, sales, sale items, repair tickets, and stock adjustments in PostgreSQL via Drizzle schema `lib/db/src/schema/pos.ts`
- **Inventory control**: `/stock-control` records restocks, returns, damaged/lost items, and manual corrections with previous/new stock audit trail. The API exposes `/api/stock-adjustments` and dashboard recent activity includes stock adjustment events.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
