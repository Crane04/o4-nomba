# O4

O4 is a payment reconciliation layer built for Nigerian businesses that receive bank transfers through virtual accounts.

It helps merchants connect invoices to incoming transfers, detect underpayments or ambiguous payments, and resolve flagged transactions from a simple dashboard.

## Problem

Bank transfer payments are common, but reconciliation is still painful. A customer may pay the wrong amount, pay late, use a different name, or send money without a clear reference. This creates manual work for operations teams and makes it harder for businesses to confirm payments quickly.

## Solution

O4 uses virtual account transactions, webhooks, fallback sync, and a confidence-based matching engine to help businesses reconcile payments automatically where possible and flag uncertain cases for human review.

When a transfer enters the system, O4 checks it against open invoices, scores possible matches, and either resolves the invoice automatically or sends it to a review queue with the reason it was flagged.

## Core Features

- Create and track invoices
- Receive virtual account transfer events from Nomba
- Match payments to invoices using confidence scoring
- Detect underpayments, overpayments, and ambiguous transfers
- Review flagged payments manually
- Confirm or reject suggested matches
- Sync transfers manually when webhooks are delayed or unavailable
- View payment and invoice status from a merchant dashboard

## How It Works

1. A merchant creates an invoice in O4.
2. O4 associates the invoice with a virtual account flow.
3. A customer pays through bank transfer.
4. Nomba sends a webhook event to the backend.
5. O4 stores the transaction and runs the matching engine.
6. If confidence is high, the invoice is reconciled automatically.
7. If confidence is low, the transaction is moved to the flagged payments queue.
8. A merchant can confirm or reject the match manually.

## Architecture

The system is designed around three core ideas:

- Webhooks first: incoming payment events should arrive automatically.
- Fallback sync: the backend can still pull transfers directly from Nomba when needed.
- Human review: uncertain payments are not forced into incorrect matches.

See `architecture.svg` and `sequence-diagram.md` for the full system flow.

## Matching Logic

O4 does not rely only on exact matches. It scores each transaction using signals such as:

- Amount similarity
- Invoice status
- Payment timing
- Customer or account metadata
- Existing transaction history

High-confidence matches are reconciled automatically. Low-confidence matches are flagged with a clear reason so the merchant can make the final call.

Example: a ₦100 transfer against a ₦2,000 invoice should not auto-resolve. O4 flags it as a possible underpayment instead of marking the invoice as paid.

## Tech Stack

- Frontend: ReactJS
- Backend: Node.js / TypeScript API
- Payment infrastructure: Nomba virtual accounts and webhooks
- Database: relational payment and invoice storage
- Matching engine: confidence-based reconciliation logic

## Documentation

- `architecture.svg` - system architecture diagram
- `sequence-diagram.md` - payment reconciliation sequence flow
- `api-documentation.md` - API endpoint reference
- `technical-decisions.md` - key engineering decisions
- `database-schema.md` - suggested data model
- `demo-flow.md` - recommended demo script

## Demo Flow

The strongest demo is:

1. Create an invoice.
2. Simulate or receive a bank transfer.
3. Show the transaction entering O4.
4. Show an automatic match for a clean payment.
5. Show a flagged payment for an underpayment or ambiguous transfer.
6. Confirm the match manually.
7. Show the invoice status update.

## Roadmap

- Multi-bank reconciliation support
- Better webhook retry and replay tooling
- Team roles and permissions
- Accounting and ERP integrations
- Reconciliation analytics
- Exportable reports
- AI-assisted payment investigation

## Links

- Deployed app: https://ohfour-nomba.netlify.app
- GitHub: Add your GitHub repository link here
