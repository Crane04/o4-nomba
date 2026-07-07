# O4 Database Schema

This is a suggested schema for the O4 reconciliation system.

## Entities

```mermaid
erDiagram
    MERCHANT ||--o{ INVOICE : creates
    MERCHANT ||--o{ VIRTUAL_ACCOUNT : owns
    VIRTUAL_ACCOUNT ||--o{ TRANSFER : receives
    INVOICE ||--o{ MATCH_RESULT : has
    TRANSFER ||--o{ MATCH_RESULT : produces
    TRANSFER ||--o{ WEBHOOK_EVENT : source

    MERCHANT {
        string id
        string businessName
        string email
        datetime createdAt
    }

    VIRTUAL_ACCOUNT {
        string id
        string merchantId
        string provider
        string accountNumber
        string accountName
        string callbackUrl
        datetime createdAt
    }

    INVOICE {
        string id
        string merchantId
        string customerName
        string customerEmail
        number amount
        string currency
        string status
        datetime dueDate
        datetime createdAt
    }

    TRANSFER {
        string id
        string merchantId
        string virtualAccountId
        string providerReference
        number amount
        string currency
        string senderName
        string status
        datetime paidAt
        datetime createdAt
    }

    MATCH_RESULT {
        string id
        string invoiceId
        string transferId
        number confidence
        string status
        string reason
        datetime createdAt
        datetime resolvedAt
    }

    WEBHOOK_EVENT {
        string id
        string provider
        string providerEventId
        string eventType
        json payload
        string processingStatus
        datetime receivedAt
    }
```

## Important Status Values

### Invoice Status

- `pending`
- `paid`
- `partially_paid`
- `flagged`
- `cancelled`

### Transfer Status

- `unmatched`
- `matched`
- `flagged`
- `ignored`

### Match Status

- `auto_confirmed`
- `needs_review`
- `confirmed`
- `rejected`

## Indexes to Add

```txt
invoices.merchantId
invoices.status
transfers.providerReference unique
transfers.virtualAccountId
transfers.status
match_results.invoiceId
match_results.transferId
webhook_events.providerEventId unique
```

## Why This Schema Works

- It separates invoices from transfers.
- It keeps raw webhook events for debugging.
- It supports duplicate webhook prevention.
- It allows many possible match attempts before final confirmation.
- It gives the review queue a clear data model.
