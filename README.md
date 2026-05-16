# GameVault — Used Games & Gaming Services Marketplace (MVP)

A complete, expandable MVP for a dark-themed online marketplace that sells used video games, gaming accounts, game subscriptions, digital gaming items, and gaming services.

> ⚠️ **Compliance note**: Reselling gaming accounts, subscriptions, or digital items may violate the rules of the original third-party platforms (Steam, PSN, Xbox, Riot, EA, etc.). Sellers are solely responsible for what they list. The admin can disable individual categories and payment methods from the admin dashboard.

---

## ✨ Features

- **User-to-user marketplace** with employee/admin approval workflow.
- **Official platform store** (sold by the website) with `Official Store` / `Sold by Platform` badges.
- **Website Guarantee / Escrow** middleman service with three tiers: Basic, Premium, Full Protection.
- **Role-Based Access Control**: USER, EMPLOYEE, ADMIN; granular permissions stored in DB.
- **Admin dashboard**: stats, users, roles & permissions, categories, listings, official store, orders, guarantee packages/requests, payment methods, employee/admin creation.
- **Employee dashboard**: review listings, handle support tickets, manage guarantee requests.
- **User dashboard**: my listings, my orders, profile.
- **Auth**: NextAuth (email/password + Google OAuth) with bcrypt + Prisma adapter, password reset flow.
- **i18n**: English + Arabic with RTL layout, runtime language switcher, persisted per-user.
- **Payment Methods page** with admin enable/disable for: bank transfer, card, digital wallet, manual cash.
- **Dark theme** with a black + silver + purple gaming aesthetic.

---

## 🏗 Architecture

```
Next.js 14 (App Router, RSC + Route Handlers)
├─ Auth: next-auth v4 (Credentials + Google), bcryptjs
├─ DB: PostgreSQL via Prisma
├─ RBAC: Role + Permission tables, hasPermission() helper, middleware route gating
├─ i18n: custom JSON-based translator + cookie + per-user locale
└─ Tailwind for styling
```

### High-level flow

- A user creates a listing → status `PENDING` → an employee/admin approves → status `APPROVED`, public.
- A buyer places an order:
  - Direct payment (placeholder) → `PENDING_PAYMENT`.
  - With guarantee package → `IN_ESCROW`, a `GuaranteeRequest` is created (status `AWAITING_FUNDS` → `HELD_IN_ESCROW` → `RELEASED` / `REFUNDED` / `DISPUTED`).
- Admin can globally disable categories or payment methods at runtime.

---

## 📁 Project structure

```
prisma/
  schema.prisma          # full DB schema
  seed.ts                # roles, permissions, categories, packages, payment methods, demo accounts
src/
  app/
    api/                 # Route handlers (NextAuth, listings, orders, admin endpoints, ...)
    admin/               # Admin dashboard pages (with sidebar layout)
    employee/            # Employee dashboard pages
    dashboard/           # User dashboard
    marketplace/         # Public marketplace
    categories/          # Categories listing
    product/[id]/        # Listing details + buy form
    official-store/      # Official store list + product page
    guarantee/           # Guarantee packages page
    payment-methods/     # Public payment methods page
    sell/                # Create listing
    my-listings/         # Manage own listings
    orders/              # Buyer orders
    profile/             # Profile + locale
    contact/             # Support ticket form
    terms/               # Compliance + terms
    login, register, forgot-password, reset-password
    layout.tsx, page.tsx, providers.tsx, globals.css
  components/            # Reusable UI (Navbar, Footer, Badges, ListingCard, ...)
  i18n/                  # messages/en.json, messages/ar.json, server/client helpers
  lib/                   # prisma, auth, rbac, api helpers, mailer, format
  middleware.ts          # protects /admin, /employee, /dashboard, /sell, ...
```

---

## 🔧 Local setup

### 1) Requirements

- Node.js 18.18+ (or 20+)
- A PostgreSQL database (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or local Postgres)

### 2) Install

```bash
npm install
```

### 3) Environment variables

Copy `.env.example` → `.env` and fill in the values:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""        # optional
GOOGLE_CLIENT_SECRET=""    # optional
```

For **Google OAuth**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth client ID** (Web application).
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your prod URL).
4. Copy the client ID/secret into `.env`.

### 4) Database — connect, migrate, seed

```bash
# Generate the Prisma client
npx prisma generate

# Create the schema in your DB (creates a migration in prisma/migrations)
npx prisma migrate dev --name init

# Seed roles, permissions, categories, guarantee packages, payment methods, and demo users
npm run db:seed
```

This creates three demo accounts (password `Password123!`):

| Role     | Email                   |
|----------|-------------------------|
| ADMIN    | admin@example.com       |
| EMPLOYEE | employee@example.com    |
| USER     | user@example.com        |

### 5) Run

```bash
npm run dev
# http://localhost:3000
```

To inspect data:

```bash
npx prisma studio
```

---

## 🌐 Free deployment

### Vercel (recommended)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), click **New Project** → import the GitHub repo.
3. **Environment Variables** — add the same keys as your `.env`. Set `NEXTAUTH_URL` to your Vercel URL (e.g. `https://your-project.vercel.app`).
4. **Build command**: leave default (`next build`). The `postinstall` script runs `prisma generate`.
5. After the first deploy, run a one-time migration against your remote DB:
   ```bash
   DATABASE_URL="...prod url..." npx prisma migrate deploy
   DATABASE_URL="...prod url..." npm run db:seed
   ```
   You can also run these from a Vercel "Deploy Hook" or your local machine.

### Database (free tier options)

- **Neon** — serverless Postgres, great free tier, scale-to-zero.
- **Supabase** — Postgres + auth + storage; you only need the connection string.
- **Railway / Render** — small free Postgres tiers.

Use the connection string they provide as `DATABASE_URL`. For Neon, prefer the **pooled** connection for serverless runtime.

### Custom domain

1. In Vercel project → **Settings → Domains** → add your domain.
2. Vercel will show DNS records (CNAME or A/AAAA). Update them at your registrar.
3. Wait for SSL to be issued automatically.
4. Update `NEXTAUTH_URL` to `https://your-domain.com` and re-deploy.
5. If using Google OAuth, add the new redirect URI: `https://your-domain.com/api/auth/callback/google`.

### Free hosting limitations

- Vercel free tier: 100 GB bandwidth/month, ~10s function timeout, limited concurrency.
- Neon/Supabase free DB: storage and connection limits; serverless DBs may cold-start.
- No persistent file storage (use S3/R2/Supabase Storage when adding image uploads).
- Cron jobs limited (Vercel Cron is free up to a few/day on hobby).
- The naive in-memory rate limiter resets per cold start; replace with Upstash Redis for prod.

---

## 🔐 Security notes & best practices

- Passwords are hashed with **bcryptjs** (cost 10).
- Sessions use **JWT** strategy; the JWT contains roles + permissions for fast checks.
- All API routes do **server-side validation** with Zod and check permissions via `requirePermission()`.
- Owner-only edits on listings; non-owner edit/delete requires `listing.edit.any` / `listing.delete.any`.
- Categories and payment methods are filtered through `enabled` flags everywhere they appear.
- Forgot-password endpoint does **not** leak user existence and is rate-limited.
- `middleware.ts` redirects unauthenticated users from `/admin`, `/employee`, `/dashboard`, `/sell`, etc., and re-routes by role.
- `NEXTAUTH_SECRET` must be strong; never commit `.env`.
- Replace the in-memory rate limiter with Upstash Redis (or similar) before going to production.
- Treat the payment provider as a **placeholder** — wire Stripe/PayPal/Tap before accepting real funds.
- Always set a strict CSP and HTTPS at the platform level (Vercel handles HTTPS automatically).
- Add CSRF tokens if you ever expose mutating GET endpoints (we use POST/PATCH/DELETE only).

---

## 🚀 Suggested future improvements

- **Real payments**: Stripe Checkout / Tap / PayPal, webhook-driven `Payment.status` updates.
- **Image uploads**: Supabase Storage / Cloudinary / S3 with signed URLs and image moderation.
- **Search**: Postgres full-text or Meilisearch / Typesense for fuzzy search and filters.
- **Notifications**: email + in-app, queueing via Upstash QStash or BullMQ.
- **Two-factor auth** (TOTP / passkeys).
- **Reputation system** beyond simple star reviews; verified-seller flow, KYC for high-value sellers.
- **Audit log UI** for admins (the `AuditLog` model is already wired).
- **Per-listing chat** between buyer and seller, mediated by support during disputes.
- **Wishlist & price alerts.**
- **Anti-fraud heuristics**: velocity checks, IP reputation, device fingerprinting.
- **More languages**: extend `src/i18n/messages/*.json`.
- **Mobile apps** via React Native or Expo, sharing the same API.
- **Stricter compliance**: per-category disclaimers, KYC for sellers of accounts/subscriptions.
- **Proper rate limiting**: `@upstash/ratelimit`.

---

## 🧪 Quick smoke test

1. Sign in as `admin@example.com` / `Password123!`.
2. In `/admin/categories`, toggle the "Accounts" category off — it disappears from `/marketplace` and `/sell`.
3. In `/admin/payment-methods`, disable "card" — it stops appearing on the buy form.
4. Sign in as `user@example.com`, go to `/sell`, create a listing.
5. Sign in as `employee@example.com`, go to `/employee/listings`, approve it.
6. Buy it (with or without a guarantee package) from `/product/<id>`.
7. Check it on `/orders` and on the admin/employee guarantee pages.

Have fun. 🎮
