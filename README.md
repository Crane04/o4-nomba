# o4-nomba
Identity-aware virtual account infrastructure with confidence-scored reconciliation for inbound transfers.

## Backend database setup

Start Postgres with Docker:

```bash
cd backend
npm run db:up
```

Create `backend/.env` from `backend/.env.example`, then run Prisma migrations and seed data:

```bash
npm run prisma:migrate
npm run seed
```

Or run everything together:

```bash
npm run prisma:setup
```

Stop the database:

```bash
npm run db:down
```
