import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../services/authService";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const bearerToken = getBearerToken(req);
  if (bearerToken) {
    try {
      const payload = verifyToken(bearerToken);
      const organization = await prisma.organization.findUnique({ where: { id: payload.orgId } });
      if (!organization) return res.status(401).json({ error: "Invalid authorization token" });

      req.org = { id: organization.id, name: organization.name, email: organization.email };
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid authorization token" });
    }
  }

  const apiKey = req.header("x-api-key");
  if (apiKey) {
    const organization = await prisma.organization.findUnique({ where: { apiKey } });
    if (organization) {
      req.org = { id: organization.id, name: organization.name, email: organization.email };
      return next();
    }
  }

  return res.status(401).json({ error: "Authentication required" });
}

function getBearerToken(req: Request) {
  const header = req.header("authorization");
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
