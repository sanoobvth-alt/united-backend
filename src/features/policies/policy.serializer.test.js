import test from "node:test";
import assert from "node:assert/strict";
import { serializePolicy } from "./policy.serializer.js";

const policy = {
  id: "policy-id",
  branchId: "branch-id",
  customerId: "customer-id",
  policyNumber: "POL-1001",
  insurerType: "UNITED",
  insurerRecord: null,
};

test("serializes the linked customer's name", () => {
  const result = serializePolicy({ ...policy, customer: { name: "Jamie Doe" } });

  assert.equal(result.customerName, "Jamie Doe");
});

test("serializes a missing linked customer as null", () => {
  const result = serializePolicy({ ...policy, customer: null });

  assert.equal(result.customerName, null);
});
