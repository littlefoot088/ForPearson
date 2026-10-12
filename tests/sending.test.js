import test from "node:test";
import assert from "node:assert/strict";
import {
  initialWorkspace,
  workspaceReducer as reduce,
  createReferral,
  loadWorkspace,
  persistWorkspace,
} from "../src/workspace.js";
import {
  introductionVersion,
  canSendIntroduction,
  currentSend,
  workflowView,
} from "../src/workflowState.js";
const prepare = () => {
  let s = initialWorkspace();
  s = reduce(s, {
    type: "opportunity",
    action: { type: "assessment", value: "worth-discussing" },
  });
  return reduce(s, { type: "referral-save", referral: createReferral() });
};
const send = (s, approved = true, version = introductionVersion(s.referral)) =>
  reduce(s, { type: "simulate-send", approved, version });
test("simulated sending requires explicit approval, positive suitability and the current saved version", () => {
  let s = prepare();
  assert(canSendIntroduction(s));
  assert.equal(send(s, false), s);
  assert.equal(send(s, true, "old"), s);
  for (const assessment of [
    "not-reviewed",
    "needs-clarification",
    "not-suitable",
  ]) {
    const other = reduce(s, {
      type: "opportunity",
      action: { type: "assessment", value: assessment },
    });
    assert.equal(send(other), other);
  }
  const declined = reduce(s, {
    type: "opportunity",
    action: { type: "response", value: "not-interested" },
  });
  assert.equal(send(declined), declined);
  const missing = initialWorkspace();
  assert.equal(send(missing), missing);
  s = send(s);
  assert.equal(s.sentIntroductions.length, 1);
  assert.equal(send(s), s);
  assert.equal(workflowView(s).primary.action, null);
  assert.equal(workflowView(s).primary.label, null);
  assert.equal(s.opportunity.employerProgression, "not-submitted");
});
test("sent snapshots exclude internal data, survive changes and permit only a freshly approved changed version", () => {
  let s = prepare();
  s.notes = [
    { id: "private", text: "Never share", date: "2026-10-11", followup: "" },
  ];
  s = send(s);
  const first = structuredClone(s.sentIntroductions[0]);
  assert(!JSON.stringify(first).includes("Never share"));
  assert(!("sourceIds" in first.document));
  s = reduce(s, {
    type: "referral-save",
    referral: { ...s.referral, recommendation: "Updated recommendation" },
  });
  assert(!currentSend(s));
  assert.equal(send(s, false), s);
  s = send(s);
  assert.equal(s.sentIntroductions.length, 2);
  assert.deepEqual(s.sentIntroductions[0], first);
  s = reduce(s, {
    type: "record-inclusion",
    id: "pump_2009-03-13",
    included: false,
  }); // Source changes require review, preserving the sent document
  assert.deepEqual(s.sentIntroductions[0], first);
  assert(s.referral.needsReview);
  assert.equal(send(s), s);
  let stored;
  persistWorkspace(
    { setItem: (_, v) => (stored = v) },
    { workspace: s, drafts: [], recordFlags: [] },
  );
  assert.deepEqual(
    loadWorkspace({ getItem: () => stored }).workspace.sentIntroductions,
    s.sentIntroductions,
  );
});
test("v3 workspaces gain no assumed approval or sending history", () => {
  const s = prepare();
  delete s.sentIntroductions;
  const loaded = loadWorkspace({
    getItem: () =>
      JSON.stringify({ version: 3, workspace: s, drafts: [], recordFlags: [] }),
  });
  assert.equal(loaded.version, 10);
  assert.deepEqual(loaded.workspace.sentIntroductions, []);
  assert.equal(loaded.workspace.referral.why, s.referral.why);
});
