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

![O4 Architecture](./docs/system-architecture.png)

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
