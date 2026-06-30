import { Router } from "express";
import { DemoController } from "../controllers/DemoController";

export const demoRouter = Router();
const demoController = new DemoController();

demoRouter.post("/transfers", demoController.simulateTransfer);
