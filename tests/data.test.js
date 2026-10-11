import test from "node:test";
import assert from "node:assert/strict";
import {
  claims,
  sources,
  trainingRecords,
  qualifications,
  requirements,
  person,
  reviewDate,
  interpretations,
} from "../src/data.js";

test("every selected claim has traceable, verbatim highlightable evidence", () => {
  assert.equal(sources.length, 11);
  assert.equal(new Set(sources.map((s) => s.id)).size, sources.length);
  for (const claim of claims) {
    assert.ok(requirements.some((r) => r.id === claim.requirementId));
    for (const id of claim.sourceIds) {
      const source = sources.find((s) => s.id === id);
      assert.ok(source, id);
      assert.ok(
        source.highlight.length > 0 &&
          source.original.includes(source.highlight),
      );
      assert.ok(source.source.startsWith("raw/"));
      assert.ok(source.recordId);
      assert.ok(interpretations[id]);
      const rawText =
        typeof source.rawRecord === "string"
          ? source.rawRecord.split("|")[6]
          : (source.rawRecord.description ?? source.rawRecord.Activity);
      assert.equal(source.original, rawText);
      assert.ok(source.date <= reviewDate);
    }
  }
});

test("attendance remains distinct from passing and full certification", () => {
  const fire = qualifications.find((q) => q.id === "fire");
  assert.equal(
    trainingRecords.find((r) => r.id === fire.recordId).outcome,
    "Attended",
  );
  assert.equal(fire.status, "Attendance only");
  assert.match(fire.detail, /Completion is not established/);
  assert.ok(
    qualifications
      .filter((q) => ["first-aid", "height", "medical"].includes(q.id))
      .every((q) => q.status === "Not established" && !q.recordId),
  );
});

test("expiry labels agree with the fixed review date for recorded passes", () => {
  for (const q of qualifications.filter((q) => q.recordId && q.id !== "fire")) {
    const r = trainingRecords.find((r) => r.id === q.recordId);
    assert.equal(r.keeper_code, person.id);
    assert.equal(r.outcome, "Pass");
    assert.equal(q.status.includes("within expiry"), r.expires_on > reviewDate);
  }
  assert.equal(qualifications.find((q) => q.id === "pumped").required, false);
  assert.equal(
    qualifications.find((q) => q.id === "generator").required,
    false,
  );
});

test("earlier experience is retained despite the personnel joining date", () => {
  const earlier = sources.filter((source) => source.date < person.joined);
  assert.equal(earlier.length, 2);
  for (const source of earlier) {
    assert.equal(source.personRef, person.id);
    assert.ok(claims.some((claim) => claim.sourceIds.includes(source.id)));
  }
});
