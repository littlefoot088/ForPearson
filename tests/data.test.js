import test from "node:test";
import assert from "node:assert/strict";
import {
  assessmentStates,
  requirementGroups,
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
  assert.equal(fire.status, "Listed expiry: 18 August 2025 (past)");
  assert.match(fire.detail, /Attendance was recorded/);
  assert.match(fire.detail, /requirement is unknown/);
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
    assert.equal(q.status === "Pass recorded", r.expires_on > reviewDate);
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

test("requirement-led assessment keeps every source and training record reachable", () => {
  const reachableClaims = requirements.flatMap((r) => r.claimIds ?? []);
  const reachableQualifications = requirements.flatMap(
    (r) => r.qualificationIds ?? [],
  );
  assert.deepEqual(new Set(reachableClaims), new Set(claims.map((c) => c.id)));
  assert.deepEqual(
    new Set(reachableQualifications),
    new Set(qualifications.map((q) => q.id)),
  );
  assert.equal(requirements.length, 9);
  assert.equal(requirements.filter((r) => r.id === "maintenance").length, 1);
  assert.match(
    requirements.find((r) => r.id === "maintenance").text,
    /mechanical or electrical/i,
  );
  for (const requirement of requirements) {
    assert.ok(assessmentStates[requirement.assessment]);
    assert.ok(
      requirementGroups.some((group) => group.id === requirement.group),
    );
  }
  assert.ok(requirements.every((r) => r.assessment !== "documented"));
  assert.equal(requirements.find((r) => r.id === "sea").assessment, "module");
  assert.equal(
    requirements.find((r) => r.id === "fire").assessment,
    "attendance",
  );
});

test("candidate narrative and experience rows retain traceable requirement links", async () => {
  const { candidateSummary, experienceRows, getSources } =
    await import("../src/data.js");
  assert.equal(candidateSummary.vacancyId, "array-om");
  assert.ok(
    candidateSummary.sourceIds.every((id) => {
      const source = claims.flatMap(getSources).find((r) => r.id === id);
      return (
        source && source.date >= person.joined && source.date <= reviewDate
      );
    }),
  );
  assert.deepEqual(
    experienceRows.map((row) => row.sourceRequirementId),
    ["maintenance", "maintenance", "permits"],
  );
  assert.deepEqual(
    experienceRows.flatMap((row) => row.qualificationIds),
    ["pumped", "generator"],
  );
  assert.match(candidateSummary.text, /accepts experience from other plant/);
  assert.doesNotMatch(
    candidateSummary.text,
    /interest in offshore work need discussion/,
  );
});

test("full-log counts use unique traceable rows and retain ambiguous dates without guessing", async () => {
  const { evidenceAudit, getSources, dateLabel } =
    await import("../src/data.js");
  assert.equal(evidenceAudit.matchedLogCount, 1095);
  assert.equal(evidenceAudit.payrollLinkRecords, 7);
  for (const [id, count, years, recent] of [
    ["pump", 18, 10, 5],
    ["electrical", 48, 13, 9],
    ["safety", 2, 2, 1],
  ]) {
    const rows = getSources(claims.find((c) => c.id === id));
    assert.equal(rows.length, count);
    assert.equal(new Set(rows.map((r) => r.source + r.recordId)).size, count);
    assert.equal(new Set(rows.map((r) => r.date.slice(0, 4))).size, years);
    assert.equal(
      rows.filter((r) => r.date.slice(0, 4) >= "2024").length,
      recent,
    );
    for (const r of rows) {
      assert.equal(
        r.original,
        typeof r.rawRecord === "string"
          ? r.rawRecord.split("|")[6]
          : (r.rawRecord.description ?? r.rawRecord.Activity),
      );
      assert.ok(r.original.includes(r.highlight));
      if (r.date.length === 4) {
        assert.ok(r.dateNote);
        assert.match(dateLabel(r.date), /day\/month unclear/);
      }
    }
    for (const selected of sources.filter((s) => s.id.startsWith(id + "_")))
      assert.ok(rows.includes(selected));
  }
});
