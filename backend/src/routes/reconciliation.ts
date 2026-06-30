import { Router } from "express";
import { ReconciliationController } from "../controllers/ReconciliationController.js";

export const reconciliationRouter = Router();
const reconciliationController = new ReconciliationController();

reconciliationRouter.get("/queue", reconciliationController.queue);
reconciliationRouter.post("/matches/:id/resolve", reconciliationController.resolve);
reconciliationRouter.post("/matches/:id/reject", reconciliationController.reject);
