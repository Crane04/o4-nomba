# O4 Reconciliation Engine

The reconciliation engine decides whether an incoming transfer belongs to an invoice.

O4 does not rely only on exact amount matches. Bank transfers are often messy: customers can underpay, overpay, pay late, use a different sender name, or send money without a clean reference.

## Matching Signals

The engine scores possible matches using signals such as:

- Transfer amount compared with invoice amount
- Sender name similarity
- Payment timing
- Invoice status
- Virtual account identity
- Customer history
- Trusted sender names from previous manual confirmations

## Match Outcomes

High-confidence payments are reconciled automatically.

Low-confidence payments are flagged for review with a reason, such as:

- Possible underpayment
- Possible overpayment
- Ambiguous sender name
- Multiple possible invoice matches
- No strong invoice candidate

## Why Confidence Scoring Matters

An exact-match-only system can miss legitimate payments. A fully automatic system can incorrectly mark unpaid invoices as paid.

O4 uses confidence scoring to keep automation useful while protecting the business from risky reconciliation decisions.

See also [Technical Decisions](./technical-decisions.md).
