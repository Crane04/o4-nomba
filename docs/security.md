# O4 Security

O4 handles payment-related data, so the system should protect organization boundaries, webhook authenticity, credentials, and reconciliation decisions.

## Current Security Model

- Business data is organization-scoped.
- Authenticated API routes use JWT-based access.
- Nomba webhook requests are verified with `NOMBA_WEBHOOK_SECRET`.
- Real Nomba credentials belong only in backend environment variables.
- `.env.example` files should contain placeholders only.

## Operational Notes

- Never commit real `.env` files.
- Rotate webhook secrets and API credentials if they are exposed.
- Store raw webhook events for auditability, but avoid exposing them unnecessarily in user-facing views.
- Keep manual reconciliation actions traceable so finance teams can audit who confirmed or rejected a payment.

## Future Security Work

- Team roles and permissions
- Audit logs for sensitive actions
- More granular API keys
- Webhook replay tooling
- Rate limits on public endpoints
- Stronger production monitoring and alerting
