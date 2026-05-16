# GameVault — Used Games & Gaming Services Marketplace (MVP)

A complete, expandable MVP for a dark, arcade-themed marketplace that sells used video games, gaming accounts, subscriptions, digital items, and gaming services.

> ⚠️ **Compliance note**: Reselling gaming accounts, subscriptions, or digital items may violate the rules of the original third-party platforms (Steam, PSN, Xbox, Riot, EA, etc.). Sellers are solely responsible for what they list. The admin can disable individual categories and payment methods at runtime from the admin dashboard.

---

## ✨ Features

- **Arcade neon UI** — black + neon pink/violet/cyan palette, scanlines, glow shadows, Press Start 2P / Orbitron / Tajawal fonts.
- **User-to-user marketplace** with employee/admin approval workflow.
- **Official platform store** with `Official Store` / `Sold by Platform` badges.
- **Website Guarantee / Escrow** middleman service in three tiers (Basic / Premium / Full Protection).
- **Real payments**:
  - **Stripe Checkout** for credit/debit cards (real charging once you add API keys, with webhook-driven fulfillment).
  - **PayPal** (sandbox or live) via REST API.
  - **Manual** methods (bank transfer, cash) fulfilled by admins.
- **Conversation-style support tickets** — both users and staff exchange messages on the same thread with status workflows (OPEN → IN_PROGRESS → RESOLVED → CLOSED).
- **Role-Based Access Control** — USER / EMPLOYEE / ADMIN with per-permission editing in the admin dashboard.
- **Admin dashboard** — stats, users, roles & permissions, categories, listings, official store, orders, guarantee packages/requests, payment methods (with provider toggling), employee/admin creation, all support tickets.
- **Employee dashboard** — review listings, handle support tickets, manage guarantee requests.
- **User dashboard** — my listings, my orders, my tickets, profile.
- **Auth** — NextAuth (email/password + Google OAuth) with bcrypt + Prisma adapter, password reset flow.
- **i18n** — full English + Arabic with RTL layout, runtime language switcher, persisted per-user.

---

## 🏗 Architecture

```
Next.js 14 (App Router, RSC + Route Handlers)
├─ Auth: next-auth v4 (Credentials + Google), bcryptjs
├─ DB: PostgreSQL via Prisma
├─ RBAC: Role + Permission tables, hasPermission() helper, middleware route gating
├─ Payments: Stripe Checkout, PayPal REST, manual; webhook-driven fulfillment
├─ Tickets: SupportTicket + SupportTicketMessage (chat-style)
├─ i18n: custom JSON translator + cookie + per-user locale
└─ Tailwind for styling (arcade neon theme)
```

### High-level flows

**Listing → Sale**
- A user creates a listing → status `PENDING` → an employee/admin approves → status `APPROVED`, public.
- A buyer places an order via the BuyForm:
  - **Stripe / PayPal** → server creates a checkout session and returns its URL → the client redirects → the gateway redirects back to `/orders/success` or `/orders/cancelled`. Stripe also calls the webhook to fulfill idempotently.
  - **Manual** → server immediately reserves the item; admin verifies and updates the order status.
  - With a guarantee package, the order moves into `IN_ESCROW` and creates a `GuaranteeRequest` for staff to release/refund.

**Support tickets**
- A user opens a ticket from `/support` → `/api/tickets` creates a `SupportTicket` plus the initial `SupportTicketMessage`.
- Both sides reply via `/api/tickets/[id]/messages`. First staff reply auto-assigns the ticket and bumps it to `IN_PROGRESS`.

**Admin overrides**
- Categories and payment methods carry `enabled` flags — disabling instantly removes them from the UI.
- High-risk categories carry a `riskWarning` flag with a yellow compliance badge.

---

## 📁 Project structure

```
prisma/
  schema.prisma          # full DB schema (with PaymentProvider, SupportTicketMessage, ...)
  seed.ts                # roles, permissions, categories, packages, payment methods, demo accounts
src/
  app/
    api/                 # Route handlers
      auth/...           # NextAuth + register/forgot/reset
      orders/            # POST /api/orders → returns checkoutUrl
      payments/
        stripe/webhook/  # Stripe webhook
        paypal/capture/  # PayPal return URL
      tickets/           # tickets + messages (conversation)
      admin/             # admin endpoints
    admin/               # Admin dashboard pages (sidebar layout)
    employee/            # Employee dashboard pages (shared sidebar)
    dashboard/           # User dashboard
    marketplace/         # Public marketplace
    categories/          # Categories listing
    product/[id]/        # Listing details + buy form
    official-store/      # Official store list + product page
    guarantee/           # Guarantee packages page
    payment-methods/     # Public payment methods page
    sell/                # Create listing
    my-listings/         # Manage own listings
    orders/              # Buyer orders + success/cancelled
    profile/             # Profile + locale
    support/             # Conversation-style support
    terms/               # Compliance + terms
    login, register, forgot-password, reset-password
    layout.tsx, page.tsx, providers.tsx, globals.css
  components/            # Reusable UI (Navbar, Footer, Badges, ListingCard, TicketConversation, ...)
  i18n/                  # messages/en.json, messages/ar.json, server/client helpers
  lib/                   # prisma, auth, rbac, api, mailer, format, stripe, paypal, orderFulfillment
  middleware.ts          # protects /admin, /employee, /dashboard, /sell, /support, ...
```

---

## 🔧 Local setup

### 1) Requirements

- Node.js 18.18+ (recommended 20+)
- A PostgreSQL database — free tiers: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or local Postgres.

### 2) Install

```bash
npm install
```

### 3) Environment variables

Copy `.env.example` → `.env` and fill in the values. The complete list:

```env
# --- Required ---
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# --- Optional: Google sign-in ---
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# --- Optional: real card payments via Stripe ---
STRIPE_SECRET_KEY=""              # sk_test_... while developing
STRIPE_WEBHOOK_SECRET=""          # whsec_... from Stripe CLI / dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# --- Optional: PayPal ---
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_ENV="sandbox"              # "sandbox" or "live"
```

> If you skip Stripe/PayPal env vars, those payment methods will appear disabled at the API layer — manual payment methods (bank transfer / cash) keep working.

### 4) Database — connect, migrate, seed

```bash
# Generate Prisma client
npx prisma generate

# Create the schema in your DB
npx prisma migrate dev --name init

# Seed roles, permissions, categories, guarantee packages, payment methods, and demo users
npm run db:seed
```

This creates three demo accounts (password `Password123!`):

| Role     | Email                |
|----------|----------------------|
| ADMIN    | admin@example.com    |
| EMPLOYEE | employee@example.com |
| USER     | user@example.com     |

> ⚠️ **Change these passwords or create a fresh admin** before exposing your site.

### 5) Run

```bash
npm run dev          # http://localhost:3000
npx prisma studio    # inspect the DB visually
```

---

## 💳 Setting up Stripe (test mode)

1. Sign up at [https://dashboard.stripe.com](https://dashboard.stripe.com) (free, no card needed for test mode).
2. Go to **Developers → API keys** and copy:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Webhooks** — Stripe needs to call your server when a payment completes:

   **Locally (recommended for dev):**
   ```bash
   # Install the Stripe CLI: https://stripe.com/docs/stripe-cli
   stripe login
   stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
   ```
   The CLI prints a `whsec_...` value — paste it into `STRIPE_WEBHOOK_SECRET`.

   **In production:** in the Stripe dashboard go to **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.com/api/payments/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel.

4. **Test cards**: `4242 4242 4242 4242`, any future expiry, any CVC, any zip. Full list in [Stripe docs](https://stripe.com/docs/testing).

### 💸 Setting up PayPal (sandbox)

1. Go to [https://developer.paypal.com](https://developer.paypal.com) → **Apps & Credentials** → **Sandbox**.
2. Create a new app → copy `Client ID` and `Secret`.
3. Set in `.env`:
   ```env
   PAYPAL_CLIENT_ID="..."
   PAYPAL_CLIENT_SECRET="..."
   PAYPAL_ENV="sandbox"
   ```
4. PayPal also creates **sandbox personal accounts** (test buyers) automatically — find them in the dashboard.
5. The PayPal flow does **not** need a webhook in this MVP — the buyer is redirected back to `/api/payments/paypal/capture?orderId=...&token=...`, which captures the payment server-side and redirects to `/orders/success`.
6. To go live: change `PAYPAL_ENV` to `live` and use live API credentials.

### 🛠 Configuring payment methods

After seeding, four payment methods exist by default:

| Key            | Provider | Notes                             |
|----------------|----------|-----------------------------------|
| `stripe_card`  | STRIPE   | Real card payment via Stripe      |
| `paypal`       | PAYPAL   | Real PayPal checkout              |
| `bank_transfer`| MANUAL   | Admin verifies offline            |
| `manual_cash`  | MANUAL   | In-person settlement              |

Toggle their enabled status and provider from `/admin/payment-methods`.

---

## 🌐 Free deployment

### Vercel (recommended)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), click **New Project** → import the repo.
3. **Environment Variables** — add the same keys as your `.env` (set `NEXTAUTH_URL` to your `https://...vercel.app`). Add Stripe / PayPal keys here too if you want to test real payments.
4. **Build command** stays default (`next build`). The `postinstall` script runs `prisma generate`.
5. After the first deploy, run a one-time migration & seed against the remote DB:
   ```bash
   DATABASE_URL="...prod url..." npx prisma migrate deploy
   DATABASE_URL="...prod url..." npm run db:seed
   ```
6. **Add the Stripe webhook** in Stripe dashboard pointing at `https://<your-deploy>/api/payments/stripe/webhook`.
7. **Update Google OAuth redirect URIs** to include `https://<your-deploy>/api/auth/callback/google`.

### Database hosting (free tiers)

- **Neon** — serverless Postgres, generous free tier, scale-to-zero. Use the **pooled** connection string for serverless runtime.
- **Supabase** — Postgres + storage + auth in one (you only need the connection string here).
- **Railway / Render** — small free Postgres tiers.

### Custom domain

1. Vercel → **Settings → Domains** → add your domain.
2. Configure the DNS records (CNAME or A/AAAA) at your registrar.
3. SSL is provisioned automatically.
4. Update `NEXTAUTH_URL` and **redeploy**.
5. Update Google OAuth, Stripe webhook URL, and PayPal return URLs to use the new domain.

### Free hosting limitations

- Vercel free tier: ~100 GB bandwidth/month, ~10s function timeout, limited concurrency.
- Free DB tiers: storage and connection limits; serverless DBs may cold-start.
- No built-in object storage — wire S3/R2/Supabase Storage for image uploads.
- The naive in-memory rate limiter resets per cold start — replace with Upstash Redis for production.

---

## 🔐 Security notes & best practices

- Passwords hashed with **bcryptjs** (cost 10).
- Sessions use **JWT**; the JWT contains roles + permissions for fast checks.
- API routes do **server-side validation** with Zod + permission checks via `requirePermission()`.
- Owner-only edits on listings; non-owner edit/delete requires `listing.edit.any` / `listing.delete.any`.
- Categories & payment methods are filtered through `enabled` flags everywhere they appear.
- Forgot-password endpoint never leaks user existence and is rate-limited.
- `middleware.ts` redirects unauthenticated users from `/admin`, `/employee`, `/dashboard`, `/sell`, `/profile`, `/orders`, `/my-listings`, `/support` and re-routes by role.
- **Stripe webhooks are signature-verified** with `STRIPE_WEBHOOK_SECRET`. Order fulfillment via `fulfillOrder()` is idempotent — multiple webhook deliveries won't double-charge stock or listings.
- **PayPal capture** happens server-side with a verified access token; the buyer never lands on `/orders/success` without a successful capture.
- `NEXTAUTH_SECRET` must be strong; never commit `.env`.
- Replace the in-memory rate limiter with Upstash Redis for production.
- Always set HTTPS (Vercel handles it automatically).

---

## 🚀 Suggested future improvements

- **Two-factor auth** (TOTP / passkeys).
- **Image uploads** via Supabase Storage / Cloudinary / R2 with signed URLs and image moderation.
- **Search** powered by Postgres full-text or Meilisearch / Typesense.
- **Notifications** — email + in-app, queued via Upstash QStash or BullMQ.
- **Reputation system** beyond simple reviews; verified seller flow / KYC for high-value sellers.
- **Audit log UI** for admins (the `AuditLog` table is already wired).
- **Per-listing chat** between buyer and seller, mediated by support during disputes.
- **Wishlist & price alerts.**
- **Anti-fraud heuristics** — velocity checks, IP reputation, device fingerprinting.
- **Refund flows** through the gateway (Stripe Refunds / PayPal refunds via REST).
- **Mobile apps** (React Native / Expo) sharing this same API.
- **More languages** — extend `src/i18n/messages/*.json`.

---

## 🧪 Quick smoke test

1. Sign in as `admin@example.com` / `Password123!`.
2. In `/admin/categories`, toggle the "Accounts" category off — it disappears from `/marketplace` and `/sell`.
3. In `/admin/payment-methods`, disable "PayPal" — it stops appearing on the buy form.
4. Sign in as `user@example.com`, go to `/sell`, create a listing.
5. Sign in as `employee@example.com`, go to `/employee/listings`, approve it.
6. Buy it from `/product/<id>` (try the Stripe option using `4242 4242 4242 4242`).
7. After redirect you should land on `/orders/success`. The order should be `PAID` (or `IN_ESCROW` if you picked a guarantee package).
8. Open a support ticket from `/support`, then reply as employee → conversation should update live for both sides.

Have fun. 🕹️
