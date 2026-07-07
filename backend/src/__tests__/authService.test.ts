import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "./mockPrisma";
import { loginOrg, registerOrg, verifyToken } from "../services/authService";

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("authService", () => {
  beforeEach(() => {
    resetPrismaMock();
    process.env.JWT_SECRET = "test-secret";
  });

  it("registers organizations with lowercase email and never returns passwordHash", async () => {
    prismaMock.organization.create.mockResolvedValue({
      id: "org-1",
      name: "Demo Org",
      email: "ops@example.com",
      passwordHash: "hashed-password",
      apiKey: "api-key",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const organization = await registerOrg("Demo Org", "OPS@Example.com", "password-123");

    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Demo Org",
        email: "ops@example.com",
      }),
    });
    expect(prismaMock.organization.create.mock.calls[0][0].data.passwordHash).not.toBe("password-123");
    expect(organization).not.toHaveProperty("passwordHash");
  });

  it("returns null for an unknown login email", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    await expect(loginOrg("missing@example.com", "password-123")).resolves.toBeNull();
  });

  it("returns null for an invalid password", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({
      id: "org-1",
      name: "Demo Org",
      email: "ops@example.com",
      passwordHash: await bcrypt.hash("correct-password", 4),
      apiKey: "api-key",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await expect(loginOrg("ops@example.com", "wrong-password")).resolves.toBeNull();
  });

  it("logs in with a signed token and safe organization payload", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({
      id: "org-1",
      name: "Demo Org",
      email: "ops@example.com",
      passwordHash: await bcrypt.hash("correct-password", 4),
      apiKey: "api-key",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await loginOrg("OPS@example.com", "correct-password");

    expect(result).not.toBeNull();
    expect(result?.organization).not.toHaveProperty("passwordHash");
    expect(jwt.verify(result!.token, "test-secret")).toMatchObject({
      orgId: "org-1",
      email: "ops@example.com",
    });
  });

  it("verifies valid auth tokens", () => {
    const token = jwt.sign({ orgId: "org-1", email: "ops@example.com" }, "test-secret");

    expect(verifyToken(token)).toEqual({
      orgId: "org-1",
      email: "ops@example.com",
    });
  });
});
