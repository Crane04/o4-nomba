import type { NextFunction, Request, Response } from "express";
import {
  AccountProvisioningError,
  createAccount,
  listAccounts,
  listAccountTransfers,
} from "../services/accountService";
import { sendValidationError } from "../validators/validator";
import { validateCreateAccount } from "../validators/accountValidator";

export class AccountController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    const validation = validateCreateAccount(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    try {
      const account = await createAccount(req.org!.id, validation.data.identityId, validation.data.bankName);
      if (!account) return res.status(404).json({ error: "Identity not found" });

      res.status(201).json(account);
    } catch (error) {
      if (error instanceof AccountProvisioningError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      next(error);
    }
  };

  list = async (req: Request, res: Response) => {
    const accounts = await listAccounts(req.org!.id);
    res.json(accounts);
  };

  listTransfers = async (req: Request, res: Response) => {
    const transfers = await listAccountTransfers(req.org!.id, req.params.id);
    res.json(transfers);
  };
}
