# O4 Payment Flow

The payment flow starts when a business creates an invoice and ends when the related bank transfer is either reconciled automatically or reviewed manually.

## Standard Flow

1. A merchant creates an invoice in O4.
2. O4 tracks the invoice as an expected payment.
3. The customer pays into the assigned Nomba virtual account.
4. Nomba sends a webhook event to O4.
5. O4 verifies and stores the webhook event.
6. O4 stores the transfer if it has not already been processed.
7. The reconciliation engine compares the transfer with open invoices.
8. A strong match is auto-reconciled.
9. An uncertain match is sent to the flagged payments queue.

## Fallback Sync

If a webhook is delayed or missed, O4 can fetch transfers directly from Nomba and run the same reconciliation process.

Fallback sync helps the merchant recover from webhook configuration issues, provider retries, network delays, or missed callback events.

## Manual Review

Flagged payments are reviewed by a merchant or finance officer. The reviewer can confirm or reject the suggested match.

Confirmed matches update the invoice and transfer status. They can also improve future matching by saving trusted sender names for that customer.

See the detailed sequence in [Sequence Diagram](./sequence-diagram.md).
