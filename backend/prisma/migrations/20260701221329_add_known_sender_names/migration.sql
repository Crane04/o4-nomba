-- AlterTable
ALTER TABLE "CustomerIdentity" ADD COLUMN     "knownSenderNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
