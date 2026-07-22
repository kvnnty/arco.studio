-- Clerk is the sole identity and session authority. Product data remains on User.
ALTER TABLE "User" ADD COLUMN "clerkUserId" TEXT;
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

DROP TABLE IF EXISTS "AuthSession" CASCADE;
DROP TABLE IF EXISTS "MagicLinkToken" CASCADE;
DROP TABLE IF EXISTS "AuthIdentity" CASCADE;
DROP TABLE IF EXISTS "AuthAuditLog" CASCADE;

ALTER TABLE "User"
  DROP COLUMN IF EXISTS "passwordHash",
  DROP COLUMN IF EXISTS "emailVerified",
  DROP COLUMN IF EXISTS "emailVerifiedAt";
