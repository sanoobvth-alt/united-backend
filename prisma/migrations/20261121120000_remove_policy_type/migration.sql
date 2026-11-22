-- Policy Type duplicated the existing InsuranceClass field and had no
-- independent business rules. InsuranceClass remains the canonical field.
ALTER TABLE "Policy" DROP COLUMN "policyType";
