-- Drop legacy Stripe launch-offer flag (unused with Polar Intro product).
ALTER TABLE "User" DROP COLUMN IF EXISTS "hadLaunchOffer";
