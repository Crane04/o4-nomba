# O4 API Documentation

This document describes the main API surface for O4, a payment reconciliation system for invoices and bank transfers.

## Base URL

```txt
https://your-backend-url.com
```

Replace this with the deployed backend URL.

## Authentication

Most merchant-facing endpoints should require authentication.

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Webhook endpoints should verify requests from the payment provider using a shared secret, signature, or provider-specific verification method.

---

## Invoices

### Create Invoice

Creates a new invoice that can later be matched against incoming bank transfers.

```http
POST /api/invoices
```

### Request Body

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "amount": 2000,
  "currency": "NGN",
  "description": "Website subscription",
  "dueDate": "2026-07-10"
}
```

### Response

```json
{
  "id": "inv_123",
  "customerName": "John Doe",
  "amount": 2000,
  "currency": "NGN",
  "status": "pending",
  "createdAt": "2026-07-06T10:00:00.000Z"
}
```

---

### List Invoices

Returns invoices for the current merchant.

```http
GET /api/invoices
```

### Optional Query Parameters

```txt
status=pending|paid|flagged|cancelled
page=1
limit=20
```

---

### Get Invoice

Returns a single invoice and its related payment/match history.

```http
GET /api/invoices/:invoiceId
```

---

## Transfers

### List Transfers

Returns incoming transfers stored by O4.

```http
GET /api/transfers
```

### Optional Query Parameters

```txt
status=unmatched|matched|flagged
virtualAccount=9864995091
startDate=2026-07-01
endDate=2026-07-06
```

---

### Sync Transfers

Pulls recent virtual account transactions directly from Nomba. This is useful when webhooks are delayed, missing, or need to be verified manually.

```http
POST /api/transfers/sync
```

### Request Body

```json
{
  "virtualAccount": "9864995091",
  "dateFrom": "2026-07-01",
  "dateTo": "2026-07-06"
}
```

### Response

```json
{
  "synced": 3,
  "created": 1,
  "duplicates": 2
}
```

---

## Webhooks

### Nomba Transfer Webhook

Receives payment events from Nomba.

```http
POST /api/webhooks/nomba/transfers
```

### Expected Flow

1. Verify the webhook request.
2. Store the event payload.
3. Check if the transaction already exists.
4. Store the transfer if it is new.
5. Run the reconciliation engine.
6. Update invoice or flag the payment.
7. Return a successful response quickly.

### Response

```json
{
  "received": true
}
```

---

## Matching

### Run Match Manually

Runs the matching engine for a specific transfer.

```http
POST /api/matches/run
```

### Request Body

```json
{
  "transferId": "trf_123"
}
```

### Response

```json
{
  "transferId": "trf_123",
  "bestInvoiceId": "inv_123",
  "confidence": 0.72,
  "status": "needs_review",
  "reason": "Amount paid is significantly lower than invoice amount."
}
```

---

### Confirm Match

Manually confirms a flagged match.

```http
POST /api/matches/:matchId/confirm
```

### Response

```json
{
  "matchId": "match_123",
  "status": "confirmed",
  "invoiceStatus": "paid"
}
```

---

### Reject Match

Rejects a suggested match and keeps the transfer unresolved.

```http
POST /api/matches/:matchId/reject
```

### Response

```json
{
  "matchId": "match_123",
  "status": "rejected",
  "transferStatus": "unmatched"
}
```

---

## Review Queue

### List Flagged Payments

Returns payments that need manual review.

```http
GET /api/review/flagged-payments
```

### Response

```json
[
  {
    "matchId": "match_123",
    "transferAmount": 100,
    "invoiceAmount": 2000,
    "confidence": 0.41,
    "reason": "Possible underpayment. Transfer amount is lower than invoice amount.",
    "suggestedInvoiceId": "inv_123"
  }
]
```

---

## Health Check

### Check API Status

```http
GET /api/health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-07-06T10:00:00.000Z"
}
```
