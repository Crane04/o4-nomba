# O4 API Overview

The O4 backend exposes APIs for authentication, organization-scoped business data, virtual accounts, expected payments, reconciliation, webhooks, and demo transfer simulation.

## Base URL

```text
http://localhost:4000
```

Use the deployed backend URL in production.

## Authentication

Most merchant-facing endpoints require authentication.

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Webhook endpoints verify requests from Nomba using the configured webhook secret.

## Main Areas

- Authentication: register, log in, and fetch the current user.
- Identities: create and manage customer identities.
- Virtual accounts: provision and inspect Nomba virtual accounts.
- Expected payments: create and track invoices or expected transfers.
- Reconciliation: view the review queue and resolve or reject matches.
- Webhooks: receive Nomba transfer events.
- Demo tools: simulate transfers for prototype flows.

## Endpoint Summary

### Auth

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Identities

```http
GET  /identities
POST /identities
GET  /identities/:id
GET  /identities/:id/history
POST /identities/:id/rename
POST /identities/:id/kyc-tier
POST /identities/:id/close
```

### Virtual Accounts

```http
GET  /accounts
POST /accounts
GET  /accounts/:id/transfers
```

### Expected Payments

```http
GET  /expected-payments
GET  /expected-payments?status=pending
POST /expected-payments
```

### Reconciliation

```http
GET  /reconciliation/queue
POST /reconciliation/matches/:id/resolve
POST /reconciliation/matches/:id/reject
```

### Webhooks and Demo

```http
POST /webhooks/transfers
POST /demo/transfers
```

## Important Behaviors

- Business data routes are scoped to the current organization.
- Webhook processing resolves the organization from the virtual account.
- Duplicate provider events should be acknowledged without duplicate processing.
- Reconciliation results include enough context for manual review.
- Low-confidence matches are sent to the review queue instead of being forced into a paid state.

## Example Reconciliation Response

```json
{
  "transferId": "trf_123",
  "bestInvoiceId": "inv_123",
  "confidence": 0.72,
  "status": "needs_review",
  "reason": "Amount paid is significantly lower than invoice amount."
}
```

## Next

[Previous: Database Schema](./database-schema.md) | [Next: Security](./security.md)
