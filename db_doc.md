# Database Setup Guide

This guide explains how to set up the PostgreSQL database, connect the app, and test the login/register features — both on your local machine and through Expo Go on a physical device.

---

## Prerequisites

- **Node.js** v20 or higher
- **pnpm** — install with `npm install -g pnpm`
- **PostgreSQL** v14 or higher — [download here](https://www.postgresql.org/download/)

---

## Step 1 — Create the PostgreSQL Database

Open a terminal and connect to PostgreSQL as a superuser:

```bash
psql -U postgres
```

Then run:

```sql
-- Create a dedicated database user
CREATE ROLE slapp WITH LOGIN PASSWORD 'yourpassword';

-- Create the database
CREATE DATABASE sl_marketplace OWNER slapp;

-- Grant full privileges
GRANT ALL PRIVILEGES ON DATABASE sl_marketplace TO slapp;

-- Exit
\q
```

You can use any username, password, and database name you like — just keep note of them for the next step.

---

## Step 2 — Configure Environment Files

You need to create two `.env` files — one for the API server and one for the database migration tool. They both need `DATABASE_URL`, but are separate because they are run from different directories.

### 2a — API Server: `artifacts/api-server/.env`

Create this file:

```env
DATABASE_URL=postgresql://slapp:yourpassword@localhost:5432/sl_marketplace
PORT=5000
JWT_SECRET=any-random-secret-string
```

| Variable       | Description                                          |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | Full PostgreSQL connection string                    |
| `PORT`         | Port the API server listens on (keep it `5000`)      |
| `JWT_SECRET`   | Secret used to sign login tokens — can be any string |

### 2b — Database tool: `lib/db/.env`

The migration command (`drizzle-kit push`) runs from inside the `lib/db/` directory and reads its own `.env` from that same location. Create this file with just the database URL:

```env
DATABASE_URL=postgresql://slapp:yourpassword@localhost:5432/sl_marketplace
```

> Use the same `DATABASE_URL` value as in `artifacts/api-server/.env` — they both point to your local PostgreSQL database.

---

## Step 3 — Install Dependencies

From the root of the project, run:

```bash
pnpm install
```

---

## Step 4 — Create the Database Tables

The project uses **Drizzle ORM** to manage the schema. Run this command to push the schema to your database (it creates all tables automatically — no SQL files needed):

```bash
pnpm --filter @workspace/db run push
```

This creates the following tables:

### `users`
Stores registered user accounts.

| Column          | Type      | Notes                  |
| --------------- | --------- | ---------------------- |
| `id`            | serial PK | Auto-incremented       |
| `name`          | text      | Full name              |
| `email`         | text      | Unique                 |
| `password_hash` | text      | bcrypt-hashed password |
| `phone`         | text      | Optional               |
| `role`          | enum      | `user` or `admin`      |
| `created_at`    | timestamp | Auto-set on insert     |

### `properties`
Stores real estate listings (for sale or rent).

| Column             | Type      | Notes                                         |
| ------------------ | --------- | --------------------------------------------- |
| `id`               | serial PK |                                               |
| `title`            | text      |                                               |
| `description`      | text      |                                               |
| `listing_type`     | enum      | `sale` or `rent`                              |
| `property_type`    | enum      | `house`, `land`, `apartment`, or `commercial` |
| `district`         | text      |                                               |
| `latitude`         | numeric   | Optional, for map display                     |
| `longitude`        | numeric   | Optional, for map display                     |
| `price_npr`        | numeric   | Price in Nepali Rupees                        |
| `area_dhur`        | numeric   | Optional land area                            |
| `bedrooms`         | integer   | Optional                                      |
| `bathrooms`        | integer   | Optional                                      |
| `build_year`       | integer   | Optional                                      |
| `amenities`        | jsonb     | Array of amenity strings                      |
| `photos`           | jsonb     | Array of photo URLs                           |
| `video_url`        | text      | Optional                                      |
| `status`           | enum      | `pending`, `approved`, or `rejected`          |
| `featured`         | boolean   | Whether shown in featured section             |
| `owner_name`       | text      |                                               |
| `owner_phone`      | text      |                                               |
| `owner_whatsapp`   | text      | Optional                                      |
| `rejection_reason` | text      | Optional, set by admin                        |
| `created_at`       | timestamp |                                               |
| `updated_at`       | timestamp |                                               |

### `construction_services`
Stores contractor and construction service listings.

| Column          | Type      | Notes                        |
| --------------- | --------- | ---------------------------- |
| `id`            | serial PK |                              |
| `business_name` | text      |                              |
| `service_type`  | text      | e.g. "Plumber", "Contractor" |
| `phone`         | text      |                              |
| `whatsapp`      | text      | Optional                     |
| `district`      | text      |                              |
| `description`   | text      | Optional                     |
| `created_at`    | timestamp |                              |

### `favorites`
Tracks which properties a user has saved.

| Column        | Type      | Notes                                    |
| ------------- | --------- | ---------------------------------------- |
| `id`          | serial PK |                                          |
| `user_id`     | text      | References the user                      |
| `property_id` | integer   | FK → `properties.id`, cascades on delete |
| `created_at`  | timestamp |                                          |

### `about`
Stores the company's About page content (single row).

| Column          | Type      | Notes                        |
| --------------- | --------- | ---------------------------- |
| `id`            | serial PK |                              |
| `mission`       | text      |                              |
| `vision`        | text      |                              |
| `contact_phone` | text      |                              |
| `contact_email` | text      |                              |
| `address`       | text      |                              |
| `social_links`  | jsonb     | e.g. `{ "facebook": "..." }` |
| `updated_at`    | timestamp |                              |

---

## Step 5 — Start the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

You should see:

```
Server listening on port 5000
```

---

## Step 6 — Start the Expo App

### Option A — Testing in a Web Browser (simplest)

```bash
cd artifacts/sl-marketplace
EXPO_PUBLIC_DOMAIN=localhost:5000 pnpm exec expo start --localhost --port 8080 --web
```

Then open `http://localhost:8080` in your browser. Login and register will work immediately.

---

### Option B — Testing on a Physical Device with Expo Go

The Expo Go app on your phone connects to the Metro bundler running on your computer. For the API calls (login, register, etc.) to reach your local backend, the app needs your computer's **local network IP address**.

**1. Find your local IP address:**

```bash
# macOS / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Look for an address like `192.168.1.x` or `10.0.0.x`.

**2. Start the app with your IP:**

```bash
cd artifacts/sl-marketplace
EXPO_PUBLIC_DOMAIN=192.168.1.XXX:5000 \
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.XXX \
pnpm exec expo start --port 8080
```

Replace `192.168.1.XXX` with your actual IP.

**3. Scan the QR code** in the terminal with the Expo Go app (Android) or the Camera app (iOS).

> **Important:** Your phone and computer must be on the **same Wi-Fi network** for this to work.

---

## Seeding an Admin User (Optional)

To create an admin account for testing the admin panel, you can insert one directly into the database:

```bash
# Connect to your local DB
psql postgresql://slapp:yourpassword@localhost:5432/sl_marketplace
```

```sql
-- First hash a password using Node.js (run in a terminal):
-- node -e "const b=require('bcryptjs'); console.log(b.hashSync('Admin@1234', 10))"
-- Then paste the hash below:

INSERT INTO users (name, email, password_hash, phone, role)
VALUES (
  'Admin',
  'admin@example.com',
  '$2b$10$PASTE_YOUR_HASH_HERE',
  '9800000000',
  'admin'
);
```

Or simply register through the app normally — the first user can be promoted to admin by updating the `role` column:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Quick Reference

| Task                 | Command                                                      |
| -------------------- | ------------------------------------------------------------ |
| Install dependencies | `pnpm install`                                               |
| Push schema to DB    | `pnpm --filter @workspace/db run push`                       |
| Start API server     | `pnpm --filter @workspace/api-server run dev`                |
| Start app (web)      | `EXPO_PUBLIC_DOMAIN=localhost:5000 pnpm exec expo start --web` |
| Start app (Expo Go)  | `EXPO_PUBLIC_DOMAIN=YOUR_IP:5000 pnpm exec expo start`       |
| API health check     | `curl http://localhost:5000/api/health`                      |
| Test register        | `curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"t@t.com","password":"Test@123"}'` |
| Test login           | `curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"t@t.com","password":"Test@123"}'` |

---

## Troubleshooting

### `require is not defined in ES module scope`

**Full error:**
```
drizzle-kit push --config ./drizzle.config.ts
require is not defined in ES module scope, you can use import instead
```

**Cause:** The `lib/db` package uses `"type": "module"` in its `package.json`, which means all files are treated as ES modules. The original `drizzle.config.ts` used `__dirname` — a CommonJS-only global — which does not exist in ES module scope.

**Fix:** Open `lib/db/drizzle.config.ts` and replace the `path.join(__dirname, ...)` call with a plain relative path string:

```diff
- import path from "path";
-
  export default defineConfig({
-   schema: path.join(__dirname, "./src/schema/index.ts"),
+   schema: "./src/schema/index.ts",
  });
```

Drizzle Kit resolves the `schema` path relative to the config file's location, so a relative path works correctly without needing `__dirname`.

---

### `DATABASE_URL, ensure the database is provisioned` on `pnpm run push`

**Full error:**
```
Reading config file '.../lib/db/drizzle.config.ts'
DATABASE_URL, ensure the database is provisioned
```

**Cause:** The `push` command runs from the `lib/db/` directory. It does not automatically pick up the `.env` file from `artifacts/api-server/` — it can only read a `.env` file in its own directory (`lib/db/`).

**Fix — two parts:**

**Part 1:** Make sure `lib/db/drizzle.config.ts` starts with this import so dotenv is loaded automatically:

```ts
import "dotenv/config";   // ← must be first line
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

**Part 2:** Create `lib/db/.env` with your database connection string:

```env
DATABASE_URL=postgresql://slapp:yourpassword@localhost:5432/sl_marketplace
```

After both changes, `pnpm --filter @workspace/db run push` will load the `.env` automatically and succeed.

---

### Login/Register fails with "Network request failed" in Expo Go

This means the app cannot reach the API server. Check:

1. The API server is running (`pnpm --filter @workspace/api-server run dev`)
2. You started Expo with your machine's local IP, not `localhost`:
   ```bash
   EXPO_PUBLIC_DOMAIN=192.168.1.XXX:5000 pnpm exec expo start
   ```
3. Your phone and computer are on the **same Wi-Fi network**
4. Your firewall is not blocking port `5000`
