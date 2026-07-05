import "dotenv/config";
import express from "express";
import cors from "cors";
import { webhookRouter } from "./routes/webhooks";
import { identityRouter } from "./routes/identities";
import { accountsRouter } from "./routes/accounts";
import { expectedPaymentsRouter } from "./routes/expectedPayments";
import { reconciliationRouter } from "./routes/reconciliation";
import { transfersRouter } from "./routes/transfers";
import { demoRouter } from "./routes/demo";
import { authRouter } from "./routes/auth";
import { authenticate } from "./middleware/authenticate";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());

// Capture the raw request body so webhook signature verification can
// hash the exact bytes received, not a re-serialized JSON object.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "o4" }));

app.use("/auth", authRouter);
app.use("/webhooks", webhookRouter);
app.use("/webhook", webhookRouter);
app.use("/identities", authenticate, identityRouter);
app.use("/accounts", authenticate, accountsRouter);
app.use("/transfers", authenticate, transfersRouter);
app.use("/expected-payments", authenticate, expectedPaymentsRouter);
app.use("/reconciliation", authenticate, reconciliationRouter);
app.use("/demo", authenticate, demoRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
