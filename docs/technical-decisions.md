# O4 Technical Decisions

## 1. Confidence Scoring Instead of Exact Matching

Bank transfers are messy. Customers may pay the wrong amount, use a different name, or send money without a clean reference. Exact matching alone would either miss valid payments or wrongly mark bad payments as successful.

O4 uses confidence scoring so the system can separate clear matches from uncertain cases.

High-confidence payments are reconciled automatically. Low-confidence payments are sent to a review queue with a reason.

## 2. Webhooks First, Fallback Sync Second

The ideal flow is webhook-driven. When Nomba receives a transfer, it sends an event to O4 and reconciliation starts immediately.

However, webhooks can fail because of configuration issues, network problems, provider downtime, or missing callback URLs. O4 supports manual sync as a fallback so the merchant can still pull transfers directly from the provider and reconcile them.

## 3. Human Review for Ambiguous Payments

Some payments should not be resolved automatically.

For example, if an invoice is ₦2,000 and the customer sends ₦100, the system should not mark the invoice as paid. O4 flags this as a possible underpayment and asks the merchant to confirm or reject the match.

This keeps automation useful without making it risky.

## 4. Idempotent Webhook Handling

Payment providers may retry webhook events. O4 should avoid creating duplicate transfers or running duplicate reconciliation actions.

Each incoming event should be stored with a provider reference. If the same reference is received again, the system should acknowledge it without duplicating the transaction.

## 5. Event Storage for Debugging

Webhook payloads should be stored before processing. This gives the team a reliable audit trail for debugging, replaying failed events, and understanding what happened during payment disputes.

## 6. Manual Resolution as a Product Feature

The review queue is not a failure state. It is part of the product.

Businesses need a safe way to handle underpayments, overpayments, delayed transfers, and uncertain matches. O4 gives them a controlled workflow instead of forcing everything into automatic reconciliation.

## 7. Provider-Agnostic Future

The current implementation focuses on Nomba, but the architecture should support additional providers later.

A provider adapter layer can normalize transactions from Nomba, bank APIs, and other payment processors into a single internal transaction format.
