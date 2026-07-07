# O4 Demo Flow

## Goal

Show that O4 can receive transfer data, match payments to invoices, and safely handle uncertain payments.

## Demo 1: Clean Payment Auto-Match

1. Open the O4 dashboard.
2. Create a new invoice for a clear amount, for example ₦2,000.
3. Trigger or sync a transfer for the same amount.
4. Show the transaction entering the system.
5. Show the invoice automatically marked as paid.
6. Explain that the confidence score was high because the amount and invoice data matched cleanly.

## Demo 2: Underpayment Flagged for Review

1. Create an invoice for ₦2,000.
2. Trigger or sync a transfer for ₦100.
3. Show that O4 does not mark the invoice as paid.
4. Open the flagged payments queue.
5. Show the reason: possible underpayment or low confidence.
6. Click confirm match if you want to treat it as a partial/accepted payment.
7. Show the updated status.

## Demo 3: Webhook or Sync Reliability

1. Explain that webhooks are the primary flow.
2. Show the manual sync action as a fallback.
3. Pull transfers from the provider.
4. Show that O4 can still reconcile payments even when webhook delivery needs to be checked manually.

## Closing Pitch

O4 gives Nigerian businesses a safer way to automate bank transfer reconciliation. It does not blindly mark payments as successful. It combines webhook automation, fallback sync, and human review so teams can move faster without losing control.

## Next

[Previous: Roadmap](./roadmap.md) | [Documentation Home](./README.md)
