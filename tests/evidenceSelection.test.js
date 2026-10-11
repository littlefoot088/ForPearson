import test from "node:test";
import assert from "node:assert/strict";
import { claims, getSources } from "../src/data.js";
import { includedRecords, selectedClaim } from "../src/evidenceSelection.js";
test("included evidence counts and summaries remove excluded sources and recover on restore", () => {
  const claim = claims.find((c) => c.id === "pump");
  const all = getSources(claim);
  const excluded = [all.at(-1).id];
  assert.equal(includedRecords(claim, excluded).length, all.length - 1);
  assert.match(selectedClaim(claim, excluded).evidenceSummary, /17 included/);
  assert(
    !selectedClaim(claim, excluded).workSummary.includes(all.at(-1).highlight),
  );
  assert.equal(selectedClaim(claim, []), claim);
  const none = selectedClaim(
    claim,
    all.map((r) => r.id),
  );
  assert.equal(
    none.evidenceSummary,
    "No logbook entries are included in this assessment.",
  );
});
