DROP TABLE IF EXISTS "InsuranceSettings";

CREATE UNIQUE INDEX IF NOT EXISTS "AccountEntry_one_payment_per_policy_key"
    ON "AccountEntry" ("policyId")
    WHERE "policyId" IS NOT NULL AND "type" = 'PAYMENT';
