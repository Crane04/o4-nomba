import "dotenv/config";
import express from "express";
import cors from "cors";
import { webhookRouter } from "./routes/webhooks";
import { identityRouter } from "./routes/identities";
import { accountsRouter } from "./routes/accounts";
import { expectedPaymentsRouter } from "./routes/expectedPayments";
import { reconciliationRouter } from "./routes/reconciliation";

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

app.use("/webhooks", webhookRouter);
app.use("/identities", identityRouter);
app.use("/accounts", accountsRouter);
app.use("/expected-payments", expectedPaymentsRouter);
app.use("/reconciliation", reconciliationRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT);
