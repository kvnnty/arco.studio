-- Rename Stripe billing columns to Polar equivalents.
ALTER TABLE "User" RENAME COLUMN "stripeCustomerId" TO "polarCustomerId";
ALTER TABLE "User" RENAME COLUMN "stripeSubscriptionId" TO "polarSubscriptionId";
