-- Add insurer types and a normalized insurer directory while retaining the
-- legacy Policy.insurer text column for existing integrations and reports.
CREATE TYPE "InsurerType" AS ENUM ('UNITED', 'THIRD_PARTY');

CREATE TABLE "Insurer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Insurer_name_key" ON "Insurer"("name");
CREATE UNIQUE INDEX "Insurer_name_lower_key" ON "Insurer"(LOWER("name"));
CREATE INDEX "Insurer_isActive_name_idx" ON "Insurer"("isActive", "name");

ALTER TABLE "Policy"
  ADD COLUMN "insurerType" "InsurerType" NOT NULL DEFAULT 'THIRD_PARTY',
  ADD COLUMN "insurerId" UUID;

-- Seed one directory entry for each distinct legacy third-party insurer name.
-- Blank legacy names are kept on the policy for manual review and are not
-- assigned a misleading insurer record.
INSERT INTO "Insurer" ("id", "name", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), MIN(BTRIM("insurer")), true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Policy"
WHERE BTRIM("insurer") <> ''
  AND LOWER(BTRIM("insurer")) NOT IN ('united', 'united insurance', 'united insurance agency')
GROUP BY LOWER(BTRIM("insurer"));

UPDATE "Policy"
SET "insurerType" = 'UNITED',
    "insurerId" = NULL,
    "insurer" = 'United Insurance'
WHERE LOWER(BTRIM("insurer")) IN ('united', 'united insurance', 'united insurance agency');

UPDATE "Policy" AS policy
SET "insurerId" = insurer."id",
    "insurer" = insurer."name"
FROM "Insurer" AS insurer
WHERE policy."insurerId" IS NULL
  AND BTRIM(policy."insurer") <> ''
  AND LOWER(BTRIM(policy."insurer")) = LOWER(insurer."name");

ALTER TABLE "Policy"
  ADD CONSTRAINT "Policy_insurerId_fkey"
  FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Policy_insurerId_idx" ON "Policy"("insurerId");
CREATE INDEX "Policy_insurerType_idx" ON "Policy"("insurerType");
