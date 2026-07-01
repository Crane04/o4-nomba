import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const SALT_ROUNDS = 12;

export interface AuthTokenPayload {
  orgId: string;
  email: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

function withoutPasswordHash<T extends { passwordHash: string }>(organization: T) {
  const { passwordHash: _passwordHash, ...safeOrganization } = organization;
  return safeOrganization;
}

export async function registerOrg(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const organization = await prisma.organization.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  return withoutPasswordHash(organization);
}

export async function loginOrg(email: string, password: string) {
  const organization = await prisma.organization.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!organization) return null;

  const validPassword = await bcrypt.compare(password, organization.passwordHash);
  if (!validPassword) return null;

  const token = jwt.sign(
    { orgId: organization.id, email: organization.email } satisfies AuthTokenPayload,
    getJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    token,
    organization: withoutPasswordHash(organization),
  };
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded !== "object" || !("orgId" in decoded) || !("email" in decoded)) {
    throw new Error("Invalid token payload");
  }

  return {
    orgId: String(decoded.orgId),
    email: String(decoded.email),
  };
}
