import { Router } from "express";
import { AccountController } from "../controllers/AccountController.js";

export const accountsRouter = Router();
const accountController = new AccountController();

accountsRouter.post("/", accountController.create);
accountsRouter.get("/", accountController.list);
accountsRouter.get("/:id/transfers", accountController.listTransfers);
