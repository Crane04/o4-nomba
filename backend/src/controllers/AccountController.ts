import type { Request, Response } from "express";
import { createAccount, listAccounts, listAccountTransfers } from "../services/accountService.js";

export class AccountController {
  create = async (req: Request, res: Response) => {
    const { identityId, bankName } = req.body ?? {};
    if (typeof identityId !== "string") {
      return res.status(400).json({ error: "identityId is required" });
    }

    const account = await createAccount(identityId, bankName);
    if (!account) return res.status(404).json({ error: "Identity not found" });

    res.status(201).json(account);
  };

  list = async (_req: Request, res: Response) => {
    const accounts = await listAccounts();
    res.json(accounts);
  };

  listTransfers = async (req: Request, res: Response) => {
    const transfers = await listAccountTransfers(req.params.id);
    res.json(transfers);
  };
}
