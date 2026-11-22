-- Ensure every legacy third-party policy has a related insurer before
-- removing the denormalized Policy.insurer value.
INSERT INTO "Insurer" ("id", "name", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Legacy insurer (needs review)', false,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM "Policy"
  WHERE "insurerType" = 'THIRD_PARTY' AND "insurerId" IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM "Insurer"
  WHERE LOWER("name") = LOWER('Legacy insurer (needs review)')
);

UPDATE "Policy"
SET "insurerId" = (
  SELECT "id" FROM "Insurer"
  WHERE LOWER("name") = LOWER('Legacy insurer (needs review)')
  LIMIT 1
)
WHERE "insurerType" = 'THIRD_PARTY' AND "insurerId" IS NULL;

ALTER TABLE "Policy"
  ADD CONSTRAINT "Policy_insurer_type_relation_check"
  CHECK (
    ("insurerType" = 'UNITED' AND "insurerId" IS NULL)
    OR ("insurerType" = 'THIRD_PARTY' AND "insurerId" IS NOT NULL)
  );

CREATE INDEX "Policy_insurerId_idx" ON "Policy"("insurerId");

ALTER TABLE "Policy" DROP COLUMN "insurer";
