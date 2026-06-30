import type { Request, Response } from "express";
import { createAccount, listAccounts, listAccountTransfers } from "../services/accountService.js";
import { sendValidationError } from "../validators/validator.js";
import { validateCreateAccount } from "../validators/accountValidator.js";

export class AccountController {
  create = async (req: Request, res: Response) => {
    const validation = validateCreateAccount(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const account = await createAccount(validation.data.identityId, validation.data.bankName);
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
