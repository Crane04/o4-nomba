import type { Request, Response } from "express";
import {
  changeKycTier,
  closeIdentity,
  createIdentity,
  getIdentity,
  getIdentityHistory,
  listIdentities,
  renameIdentity,
} from "../services/identityService";
import {
  validateChangeKycTier,
  validateCloseIdentity,
  validateCreateIdentity,
  validateRenameIdentity,
} from "../validators/identityValidator";
import { sendValidationError } from "../validators/validator";

export class IdentityController {
  create = async (req: Request, res: Response) => {
    const validation = validateCreateIdentity(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const identity = await createIdentity(validation.data.name, validation.data.kycTier ?? 1);
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
    const validation = validateRenameIdentity(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await renameIdentity(req.params.id, validation.data.newName, validation.data.reason);
    res.json(result);
  };

  changeKycTier = async (req: Request, res: Response) => {
    const validation = validateChangeKycTier(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await changeKycTier(req.params.id, validation.data.newTier, validation.data.reason);
    res.json(result);
  };

  close = async (req: Request, res: Response) => {
    const validation = validateCloseIdentity(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await closeIdentity(req.params.id, validation.data.reason);
    res.json(result);
  };
}
