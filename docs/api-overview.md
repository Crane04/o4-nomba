# O4 API Overview

The O4 backend exposes APIs for authentication, organization-scoped business data, virtual accounts, expected payments, reconciliation, and webhooks.

## Main Areas

- Authentication: register, log in, and fetch the current user.
- Identities: create and manage customer identities.
- Virtual accounts: provision and inspect Nomba virtual accounts.
- Expected payments: create and track invoices or expected transfers.
- Reconciliation: view the review queue and resolve or reject matches.
- Webhooks: receive Nomba transfer events.
- Demo tools: simulate transfers for prototype flows.

## Important Behaviors

- Business data routes are scoped to the current organization.
- Webhook processing resolves the organization from the virtual account.
- Duplicate provider events should be acknowledged without duplicate processing.
- Reconciliation results include enough context for manual review.

For endpoint-level details, see [API Documentation](./api-documentation.md).
