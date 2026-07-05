# O4

O4 is a virtual-account reconciliation layer for businesses that collect bank transfers from many customers.

It provisions dedicated virtual accounts through Nomba, records expected payments, receives inbound transfer webhooks, and uses a confidence-scored matching engine to reconcile money against the right invoice/customer. When confidence is low, the payment moves into a manual review queue where a finance officer can confirm or reject candidate matches.

The portal is fully multi-tenant: any organization can sign up, create customers, provision virtual accounts, issue invoices, and reconcile transfers inside its own isolated workspace.

## What O4 Does

- Creates multi-tenant business workspaces called organizations.
- Provisions customer-specific virtual accounts through Nomba.
- Tracks expected payments/invoices per customer.
- Receives transfer webhooks and links transfers to virtual accounts.
- Scores transfer candidates using amount, sender name, timing, identity history, and trusted sender history.
- Auto-matches high-confidence payments.
- Sends low-confidence payments to manual review.
- Learns from manual resolutions by storing trusted sender names for future matches.

## Project Structure

```text
backend/    Node.js + TypeScript + Express + Prisma API
dashboard/  O4 operations dashboard
portal/     Multi-tenant customer collections portal
```

## Tech Stack

- Node.js, TypeScript, Express
- Prisma + PostgreSQL
- Nomba Virtual Accounts API
- fastest-validator
- Vitest
- React + Vite + Tailwind CSS
- Docker Compose for local Postgres

## Backend Architecture

The backend follows:

```text
route -> controller -> service -> helper
```

Controllers stay thin. Business logic lives in services. Nomba integration, matching, and shared utilities live in helpers.

Key backend areas:

- `src/routes` - Express route definitions
- `src/controllers` - class-based request handlers
- `src/services` - business logic
- `src/helpers/nombaClient.ts` - Nomba API client
- `src/helpers/matchingEngine.ts` - matching engine export
- `src/lib/matchingEngine.ts` - scoring logic
- `src/validators` - fastest-validator schemas
- `prisma/schema.prisma` - database schema
- `prisma/seed.ts` - demo data

## Local Setup

### 1. Clone and Install

Install dependencies in each app:

```bash
cd backend
npm install

cd ../dashboard
npm install

cd ../portal
npm install
```

### 2. Configure Environment

Create env files from examples:

```bash
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
cp portal/.env.example portal/.env
```

Backend required values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/o4?schema=public"
PORT=4000
JWT_SECRET="replace_with_a_long_random_secret"
NOMBA_WEBHOOK_SECRET="replace_with_real_secret"
NOMBA_BASE_URL=https://sandbox.nomba.com
NOMBA_AUTH_URL=https://api.nomba.com
NOMBA_CLIENT_ID=
NOMBA_PRIVATE_KEY=
NOMBA_PARENT_ACCOUNT_ID=
NOMBA_SUB_ACCOUNT_ID=
NOMBA_TRANSFERS_PATH=/v1/transactions/virtual?virtual_account={accountNumber}
NOMBA_SYNC_ON_REQUEST=true
NOMBA_SYNC_TTL_MS=10000
NOMBA_ACCOUNT_ID=
AUTO_MATCH_THRESHOLD=0.85
```

React apps use:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Do not commit real `.env` files.

### 3. Start Postgres

```bash
cd backend
npm run db:up
```

### 4. Run Migrations and Seed Data

```bash
npm run prisma:migrate
npm run seed
```

Or run the combined setup:

```bash
npm run prisma:setup
```

The seed creates two demo organizations with retailers, virtual accounts, invoices, transfer history, matched payments, manually resolved payments, and flagged payments.

Seeded demo logins:

```text
Eko Supplies Ltd
admin@ekosupplies.com
demo1234

Kano Distributors
admin@kanodist.com
demo1234
```

## Running the Apps

Start the backend:

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

Start the O4 operations dashboard:

```bash
cd dashboard
npm run dev
```

Dashboard runs on:

```text
http://localhost:5173
```

Start the tenant portal:

```bash
cd portal
npm run dev
```

Portal runs on:

```text
http://localhost:5174
```

## Demo Flow

1. Log into the portal with a seeded organization or create a new organization.
2. Create a retailer.
3. O4 creates the customer identity.
4. O4 provisions a Nomba virtual account for that retailer.
5. Create an invoice on the retailer detail page.
6. Simulate or receive a transfer.
7. O4 either auto-matches it or sends it to Flagged Payments.
8. Confirm or reject candidate matches in the portal.
9. Manual confirmations are remembered as trusted sender names for future matching.

## Webhook URL

Local Nomba transfer webhook endpoint:

```text
http://localhost:4000/webhooks/transfers
```

When using a tunnel such as ngrok:

```text
https://your-public-domain.ngrok-free.app/webhooks/transfers
```

Webhook requests are verified with `NOMBA_WEBHOOK_SECRET`.

## API Overview

Auth:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

Identities:

```text
GET  /identities
POST /identities
GET  /identities/:id
GET  /identities/:id/history
POST /identities/:id/rename
POST /identities/:id/kyc-tier
POST /identities/:id/close
```

Virtual accounts:

```text
GET  /accounts
POST /accounts
GET  /accounts/:id/transfers
```

Expected payments:

```text
GET  /expected-payments
GET  /expected-payments?status=pending
POST /expected-payments
```

Reconciliation:

```text
GET  /reconciliation/queue
POST /reconciliation/matches/:id/resolve
POST /reconciliation/matches/:id/reject
```

Webhooks and demo:

```text
POST /webhooks/transfers
POST /demo/transfers
```

All business data routes are organization-scoped through JWT or API key authentication. Webhook processing resolves the organization internally from the virtual account.

## Testing

Run backend tests:

```bash
cd backend
npm run test
```

Build backend:

```bash
npm run build
```

Build frontend apps:

```bash
cd dashboard
npm run build

cd ../portal
npm run build
```

## Database Tools

Open Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Stop Postgres:

```bash
npm run db:down
```

View Postgres logs:

```bash
npm run db:logs
```

## Migrations

Prisma migrations are committed and should stay in source control:

```text
backend/prisma/migrations/
backend/prisma/schema.prisma
```

Apply migrations in production with:

```bash
npx prisma migrate deploy
```

## Notes

- Real Nomba credentials belong only in `backend/.env`.
- `.env.example` files should contain placeholders only.
- The matching engine is unit-tested and intentionally separate from HTTP/API code.
- Manual reconciliation decisions improve future matching through `knownSenderNames`.
