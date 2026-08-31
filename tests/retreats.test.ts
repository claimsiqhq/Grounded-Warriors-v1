import assert from "node:assert/strict";
import test from "node:test";
import { getRetreat, getRetreatPrice } from "../server/retreats";

test("only an explicitly open offering with capacity can be purchased", () => {
  assert.equal(getRetreatPrice(3, "full"), 499);
  assert.equal(getRetreat(3)?.capacity, 12);
  assert.equal(getRetreat(3)?.onlineSalesOpen, true);
});

test("past and unreleased offerings fail closed", () => {
  assert.equal(getRetreatPrice(1, "full"), null);
  assert.equal(getRetreatPrice(6, "full"), null);
  assert.equal(getRetreatPrice(8, "full"), null);
});

test("deposits are disabled until balance collection exists", () => {
  assert.equal(getRetreatPrice(3, "deposit"), null);
});
