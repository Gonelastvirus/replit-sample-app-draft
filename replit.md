const password = "P@ssw0rd@laxmi123";
const hash = bcrypt.hashSync(password, 10);
console.log(hash);

has: $2b$10$pC1kHkgs3JmKAteRXvXjZ.olsWfYYLCFjf0EMbAI7qRiSYg11CCdO

details:

INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
VALUES
(1,'Admin','admin@sl.com','$2b$10$pC1kHkgs3JmKAteRXvXjZ.olsWfYYLCFjf0EMbAI7qRiSYg11CCdO','9845141603','admin','2026-03-11T18:16:50.562Z');

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

CREATE ROLE lastvirus WITH LOGIN PASSWORD 'supersecurepassword';

CREATE DATABASE subhalaxmi_db OWNER lastvirus;

GRANT ALL PRIVILEGES ON DATABASE subhalaxmi_db TO lastvirus;

Connect as new user

Now you can connect:

```
psql -U lastvirus -d subhalaxmi_db
# It will ask for password -> enter: supersecurepassword
```

If this works, your `DATABASE_URL` becomes:

```
postgresql://lastvirus:supersecurepassword@localhost:5432/subhalaxmi_db
```

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

pnpm --filter @workspace/api-server dev

pnpm exec expo start

api-server --->package.json:

 "dev": "NODE_ENV=development tsx -r dotenv/config ./src/index.ts",

create .env file: 

DATABASE_URL=postgresql://lastvirus:supersecurepassword@localhost:5432/subhalaxmi_db
PORT=5000
JWT_SECRET=supersecuresecret



/home/lastvirus/Desktop/replit-sample-app-draft/artifacts/api-server/src/index.ts

import 'dotenv/config'; // automatically loads .env

The error:

```
sh: 1: tsx: not found
spawn ENOENT
```

means **`tsx` is not installed or not available in your project's dependencies**, so `pnpm` cannot find the command.

Fix:

pnpm add -D tsx --filter @workspace/api-server

Now the error changed. That’s good — it means **`tsx` is fixed**, but another dependency is missing.

The important part of your error is:

```
Error: Cannot find module 'dotenv/config'
```

Fix:

pnpm add dotenv --filter @workspace/api-server

still not then:

pnpm install can fix it.





# DB Table creation:

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE about (
    id SERIAL PRIMARY KEY,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(150),
    address TEXT,
    social_links JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE construction_services (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    district VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    listing_type VARCHAR(20) NOT NULL,      
    property_type VARCHAR(30) NOT NULL,     
    district VARCHAR(100),

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    price_npr NUMERIC(15,2),
    area_dhur NUMERIC(10,2),

    bedrooms INT,
    bathrooms INT,
    build_year INT,

    amenities JSONB,
    photos JSONB,
    video_url TEXT,

    status VARCHAR(20) DEFAULT 'pending',  
    featured BOOLEAN DEFAULT FALSE,

    owner_name VARCHAR(150),
    owner_phone VARCHAR(20),
    owner_whatsapp VARCHAR(20),

    rejection_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

```
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property
        FOREIGN KEY(property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_favorite UNIQUE (user_id, property_id)
);
```

pql commands:

\dt

\d table name

\q : quit
