-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Backfill tenant for existing local development data.
INSERT INTO "Organization" ("id", "name", "email", "passwordHash", "apiKey")
VALUES (
    'org_legacy_local',
    'Legacy Local Organization',
    'legacy@o4.local',
    '$2b$12$dummypasswordhashfordevonly000000000000000000000000000',
    'legacy-local-api-key'
);

-- AlterTable
ALTER TABLE "CustomerIdentity" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "ExpectedPayment" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "VirtualAccount" ADD COLUMN "organizationId" TEXT;

UPDATE "CustomerIdentity" SET "organizationId" = 'org_legacy_local' WHERE "organizationId" IS NULL;
UPDATE "ExpectedPayment" SET "organizationId" = 'org_legacy_local' WHERE "organizationId" IS NULL;
UPDATE "VirtualAccount" SET "organizationId" = 'org_legacy_local' WHERE "organizationId" IS NULL;

ALTER TABLE "CustomerIdentity" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "ExpectedPayment" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "VirtualAccount" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_apiKey_key" ON "Organization"("apiKey");

-- CreateIndex
CREATE INDEX "CustomerIdentity_organizationId_idx" ON "CustomerIdentity"("organizationId");

-- CreateIndex
CREATE INDEX "ExpectedPayment_organizationId_idx" ON "ExpectedPayment"("organizationId");

-- CreateIndex
CREATE INDEX "VirtualAccount_organizationId_idx" ON "VirtualAccount"("organizationId");

-- AddForeignKey
ALTER TABLE "CustomerIdentity" ADD CONSTRAINT "CustomerIdentity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedPayment" ADD CONSTRAINT "ExpectedPayment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
