# O4 / OhFour

O4 is a payment reconciliation platform built for businesses using Nomba virtual accounts.

It helps businesses automatically match incoming bank transfers to invoices, detect underpayments or mismatched payments, and send uncertain transactions to a review queue instead of leaving teams to reconcile payments manually.

## What it does

- Creates invoices
- Tracks virtual account transfers
- Receives Nomba payment webhooks
- Syncs transactions when webhooks are missed
- Matches payments to invoices
- Calculates confidence scores
- Auto-reconciles strong matches
- Flags uncertain payments for manual review

## Live Demo

https://ohfour-nomba.netlify.app

## Repository

https://github.com/Crane04/o4-nomba

## Documentation

See the full documentation here:

[View O4 Documentation](./docs)

## Architecture

![O4 Architecture](./docs/architecture.png)

## Status

Functional MVP completed.

The current version supports invoice creation, payment tracking, transfer sync, matching, confidence scoring, flagged payments, and manual confirmation.

## Tech Stack

- React + Vite frontend
- Node.js + TypeScript backend API
- Prisma + PostgreSQL database
- Nomba virtual accounts API
- Payment webhooks
- Confidence-based matching engine

## Project Structure

```text
backend/  Backend API, database, webhooks, and reconciliation logic
portal/   Merchant-facing web application
docs/     Product and technical documentation
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Docker and Docker Compose

### 1. Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install portal dependencies:

```bash
cd ../portal
npm install
```

### 2. Configure environment variables

Create local environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp portal/.env.example portal/.env
```

The backend uses:

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

The portal uses:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Do not commit real `.env` files.

### 3. Start the database

```bash
cd backend
npm run db:up
```

### 4. Run migrations and seed demo data

```bash
npm run prisma:setup
```

This starts Postgres, runs Prisma migrations, and seeds demo organizations, retailers, virtual accounts, invoices, transfer history, matched payments, and flagged payments.

Demo login accounts:

```text
Eko Supplies Ltd
admin@ekosupplies.com
demo1234

Kano Distributors
admin@kanodist.com
demo1234
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

Backend URL:

```text
http://localhost:4000
```

Start the portal:

```bash
cd portal
npm run dev
```

Portal URL:

```text
http://localhost:5173
```

## Useful Commands

Run backend tests:

```bash
cd backend
npm run test
```

Run portal tests:

```bash
cd portal
npm run test
```

Build backend:

```bash
cd backend
npm run build
```

Build portal:

```bash
cd portal
npm run build
```

Open Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Stop local Postgres:

```bash
cd backend
npm run db:down
```

## Future Plans

- Multi-bank support
- More advanced reconciliation rules
- Team permissions
- Analytics
- Accounting integrations
- API access for businesses

## Submission Links

Link to working prototype:

https://ohfour-nomba.netlify.app

Link to code repository:

https://github.com/Crane04/o4-nomba

Designs / presentations / documentation:

Project documentation:

https://github.com/Crane04/o4-nomba/tree/main/docs

Architecture and technical overview:

https://github.com/Crane04/o4-nomba/blob/main/docs/architecture.md
