import type { Request, Response } from "express";
import {
  changeKycTier,
  closeIdentity,
  createIdentity,
  getIdentity,
  getIdentityHistory,
  listIdentities,
  renameIdentity,
} from "../services/identityService.js";

export class IdentityController {
  create = async (req: Request, res: Response) => {
    const { name, kycTier } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const identity = await createIdentity(name.trim(), kycTier ?? 1);
    res.status(201).json(identity);
  };

  list = async (_req: Request, res: Response) => {
    const identities = await listIdentities();
    res.json(identities);
  };

  get = async (req: Request, res: Response) => {
    const identity = await getIdentity(req.params.id);
    if (!identity) return res.status(404).json({ error: "Not found" });

    res.json(identity);
  };

  history = async (req: Request, res: Response) => {
    const history = await getIdentityHistory(req.params.id);
    res.json(history);
  };

  rename = async (req: Request, res: Response) => {
    const { newName, reason } = req.body ?? {};
    if (typeof newName !== "string" || !newName.trim()) {
      return res.status(400).json({ error: "newName is required" });
    }

    const result = await renameIdentity(req.params.id, newName.trim(), reason);
    res.json(result);
  };

  changeKycTier = async (req: Request, res: Response) => {
    const { newTier, reason } = req.body ?? {};
    if (typeof newTier !== "number" || newTier < 1 || newTier > 3) {
      return res.status(400).json({ error: "newTier must be 1, 2, or 3" });
    }

    const result = await changeKycTier(req.params.id, newTier, reason);
    res.json(result);
  };

  close = async (req: Request, res: Response) => {
    const { reason } = req.body ?? {};
    const result = await closeIdentity(req.params.id, reason);
    res.json(result);
  };
}
