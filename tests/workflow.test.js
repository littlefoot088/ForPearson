import test from "node:test";
import assert from "node:assert/strict";
import {
  initialOpportunity,
  opportunityReducer,
  interestLabel,
} from "../src/workflow.js";
import { person, vacancy } from "../src/data.js";
const reduce = opportunityReducer;
const interested = reduce(initialOpportunity, {
  type: "response",
  value: "interested",
});
const recommendation = {
  type: "nomination",
  decision: "recommend",
  rationale: "Relevant experience; employer must assess outstanding gaps.",
  acknowledged: true,
};

test("person intentions and preferences remain unknown; forty interview candidates is not a vacancy count", () => {
  assert.equal(person.careerIntention, "Not yet discussed");
  assert.equal(person.careerPreferences, null);
  assert.equal(vacancy.openings, undefined);
});
test("suggestion does not manufacture interest, assessment or employer progression", () => {
  const suggested = reduce(initialOpportunity, { type: "suggest" });
  assert.equal(suggested.suggested, true);
  assert.equal(suggested.interest, "not-discussed");
  assert.equal(suggested.responseOrigin, null);
  assert.equal(suggested.assessment, "not-reviewed");
  assert.equal(suggested.employerProgression, "not-submitted");
  assert.equal(
    interestLabel(suggested),
    "Suggested to Eimhin · awaiting response",
  );
  assert.equal(initialOpportunity.suggested, false);
});
test("nomination needs explicit interest, rationale and acknowledgement", () => {
  for (const value of ["not-discussed", "not-interested", "more-information"]) {
    const state = reduce(initialOpportunity, { type: "response", value });
    assert.equal(reduce(state, recommendation), state);
  }
  assert.equal(
    reduce(interested, { ...recommendation, rationale: "  " }),
    interested,
  );
  assert.equal(
    reduce(interested, { ...recommendation, acknowledged: false }),
    interested,
  );
  assert.equal(
    reduce(interested, { ...recommendation, decision: "unexpected" }),
    interested,
  );
  const saved = reduce(interested, recommendation);
  assert.equal(saved.assessment, "worth-nominating");
  assert.equal(saved.nominationDecision.acknowledged, true);
  assert.equal(saved.employerProgression, "not-submitted");
});
test("revised keeper interest clears a stale nomination and allows later reconsideration", () => {
  const saved = reduce(interested, recommendation);
  const declined = reduce(saved, { type: "response", value: "not-interested" });
  assert.equal(declined.nominationDecision, null);
  assert.equal(declined.assessment, "not-reviewed");
  assert.equal(declined.responseOrigin, "manually-recorded");
  assert.equal(declined.employerProgression, "not-submitted");
  const reconsidered = reduce(declined, {
    type: "response",
    value: "interested",
  });
  assert.equal(reconsidered.nominationDecision, null);
  assert.equal(
    reduce(reconsidered, recommendation).assessment,
    "worth-nominating",
  );
  const reset = reduce(saved, { type: "response", value: "not-discussed" });
  assert.equal(reset.responseOrigin, null);
});
test("your assessment cannot bypass nomination gates or manufacture a response", () => {
  assert.equal(
    reduce(initialOpportunity, {
      type: "assessment",
      value: "worth-nominating",
    }),
    initialOpportunity,
  );
  const discussed = reduce(initialOpportunity, {
    type: "assessment",
    value: "worth-discussing",
  });
  assert.equal(discussed.interest, "not-discussed");
  assert.equal(discussed.suggested, false);
  const unsuitable = reduce(discussed, {
    type: "assessment",
    value: "not-suitable",
  });
  assert.equal(reduce(unsuitable, { type: "suggest" }), unsuitable);
  const deferred = reduce(interested, {
    type: "nomination",
    decision: "defer",
    rationale: "Resolve medical clearance first.",
  });
  assert.equal(deferred.assessment, "needs-clarification");
  assert.equal(deferred.interest, "interested");
  assert.equal(deferred.employerProgression, "not-submitted");
});
