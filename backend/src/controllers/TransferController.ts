import type { Request, Response } from "express";
import { listTransfers } from "../services/transferService";

export class TransferController {
  list = async (req: Request, res: Response) => {
    const transfers = await listTransfers(req.org!.id);
    res.json(transfers);
  };
}
