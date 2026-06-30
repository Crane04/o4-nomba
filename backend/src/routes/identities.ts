import { Router } from "express";
import { IdentityController } from "../controllers/IdentityController.js";

export const identityRouter = Router();
const identityController = new IdentityController();

identityRouter.post("/", identityController.create);
identityRouter.get("/", identityController.list);
identityRouter.get("/:id", identityController.get);
identityRouter.get("/:id/history", identityController.history);
identityRouter.post("/:id/rename", identityController.rename);
identityRouter.post("/:id/kyc-tier", identityController.changeKycTier);
identityRouter.post("/:id/close", identityController.close);
