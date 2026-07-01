import type { Request, Response } from "express";
import { loginOrg, registerOrg } from "../services/authService";
import { sendValidationError } from "../validators/validator";
import { validateLoginOrg, validateRegisterOrg } from "../validators/authValidator";

export class AuthController {
  register = async (req: Request, res: Response) => {
    const validation = validateRegisterOrg(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const organization = await registerOrg(validation.data.name, validation.data.email, validation.data.password);
    res.status(201).json({ organization, apiKey: organization.apiKey });
  };

  login = async (req: Request, res: Response) => {
    const validation = validateLoginOrg(req.body);
    if (!validation.ok) return sendValidationError(res, validation);

    const result = await loginOrg(validation.data.email, validation.data.password);
    if (!result) return res.status(401).json({ error: "Invalid email or password" });

    res.json(result);
  };

  me = async (req: Request, res: Response) => {
    res.json({ organization: req.org });
  };
}
