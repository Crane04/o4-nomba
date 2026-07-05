import { Router } from "express";
import { TransferController } from "../controllers/TransferController";

export const transfersRouter = Router();
const transferController = new TransferController();

transfersRouter.get("/", transferController.list);
