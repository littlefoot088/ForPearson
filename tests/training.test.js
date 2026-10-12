import test from "node:test";
import assert from "node:assert/strict";
import { initialWorkspace, workspaceReducer as reduce, createReferral, loadWorkspace, persistWorkspace, assessmentSignature } from "../src/workspace.js";
import { verificationFor, workflowTasks, qualificationCopy, qualificationSummary, introductionVersion, workflowView } from "../src/workflowState.js";
import { qualifications } from "../src/data.js";

const course = { course: "First aid certification", provider: "Example provider", reason: "not-held", status: "assigned", dueOn: "", completedOn: "" };
const assign = (s, changes = {}) => reduce(s, { type: "training-save", id: "first-aid", record: { ...course, ...changes } });
const save = (s) => reduce(s, { type: "referral-save", referral: createReferral(s.excludedRecordIds, s.verifications, s.training) });
const verified = { issuer: "Example provider", reference: "FA-1", verifiedOn: "2020-01-02", expiresOn: "2099-01-01", noExpiry: false, coverageConfirmed: true };

test("assignment validates a confirmed need and course, adds one linked task and never verifies", () => {
  const initial = initialWorkspace();
  for (const invalid of [{ course: " " }, { reason: "" }, { status: "completed", completedOn: "2020-01-01" }, { dueOn: "2026-02-30" }])
    assert.equal(assign(initial, invalid), initial);
  assert.equal(reduce(initial, { type: "training-save", id: "medical", record: course }), initial);
  assert.equal(reduce(initial, { type: "training-save", id: "pump-training", record: course }), initial);
  const existingVerification = reduce(initial, { type: "verification-save", id: "first-aid", record: verified });
  assert.equal(assign(existingVerification), existingVerification);
  const state = assign(initial);
  assert.equal(state.training["first-aid"].length, 1);
  assert.equal(state.tasks.filter((t) => t.trainingId === "first-aid").length, 1);
  assert.equal(verificationFor(state, "first-aid").current, false);
  assert.deepEqual(state.opportunity, initial.opportunity);
  assert.equal(qualificationCopy(qualifications.find((q) => q.id === "first-aid"), state).status, "Training assigned");
  assert.match(qualificationSummary(state), /First aid: training assigned/);
  assert.equal(assign(state), state);
});

test("completion checks the course task only; verification alone resolves the qualification check", () => {
  let state = assign(initialWorkspace());
  state = reduce(state, { type: "qualification-toggle", qualification: qualifications.find((q) => q.id === "first-aid") });
  state = reduce(state, { type: "task-toggle", id: "training:first-aid" });
  assert.equal(workflowTasks(state).find((t) => t.trainingId).done, false);
  state = assign(state, { status: "in-progress" });
  for (const completedOn of ["", "2099-01-01", "2020-02-30"])
    assert.equal(assign(state, { status: "completed", completedOn }), state);
  state = assign(state, { status: "completed", completedOn: "2020-01-01" });
  assert(workflowTasks(state).find((t) => t.trainingId).done);
  assert(!workflowTasks(state).find((t) => t.qualificationId === "first-aid").done);
  assert(!workflowTasks(state).find((t) => t.id === "certificates").done);
  assert(!verificationFor(state, "first-aid").current);
  assert.match(qualificationSummary(state), /training completed · certificate to verify/);
  state = reduce(state, { type: "verification-save", id: "first-aid", record: verified });
  assert(workflowTasks(state).find((t) => t.qualificationId === "first-aid").done);
  assert(verificationFor(state, "first-aid").current);
  assert(!qualificationSummary(state).includes("First aid: training completed"));
  state = reduce(state, { type: "verification-withdraw", id: "first-aid" });
  assert(!verificationFor(state, "first-aid").current);
  assert.equal(state.training["first-aid"].length, 3);
});

test("edited and removed training tasks retain manual ownership and removal across updates", () => {
  let state = assign(initialWorkspace());
  const task = state.tasks.find((t) => t.trainingId);
  state = reduce(state, { type: "task-save", task: { ...task, title: "Discuss course funding" } });
  state = assign(state, { status: "completed", completedOn: "2020-01-01" });
  assert.equal(workflowTasks(state).find((t) => t.trainingId).done, false);
  state = reduce(state, { type: "task-remove", id: task.id });
  state = assign(state, { status: "cancelled" });
  state = assign(state, { course: "Replacement course" });
  assert(!state.tasks.some((t) => t.trainingId));
  assert.equal(state.training["first-aid"].length, 4);
});

test("training changes invalidate saved wording without overwriting it or a sent snapshot", () => {
  let state = reduce(initialWorkspace(), { type: "opportunity", action: { type: "assessment", value: "worth-discussing" } });
  state = save(state);
  state = reduce(state, { type: "simulate-send", version: introductionVersion(state.referral), approved: true });
  const sent = structuredClone(state.sentIntroductions);
  const wording = state.referral.qualifications;
  state = assign(state);
  assert.equal(state.referral.qualifications, wording);
  assert(state.referral.needsReview);
  assert.equal(state.ready, null);
  assert.equal(workflowView(state).progress, "Reviewing introduction");
  assert.deepEqual(state.sentIntroductions, sent);
  assert.equal(reduce(state, { type: "simulate-send", version: introductionVersion(state.referral), approved: true }), state);
  state = save(state);
  assert.match(state.referral.qualifications, /First aid: training assigned/);
  assert.equal(state.referral.assessmentSignature, assessmentSignature([], state.verifications, state.training));
  let stored;
  persistWorkspace({ setItem: (_, v) => stored = v }, { workspace: state, drafts: [], recordFlags: [] });
  const loaded = loadWorkspace({ getItem: () => stored });
  assert.equal(loaded.message, "");
  assert.equal(loaded.workspace.referral.needsReview, false);
  assert.deepEqual(loaded.workspace.training, state.training);
  assert.deepEqual(loaded.workspace.sentIntroductions, sent);
});

test("version 10 adds empty training without changing saved work or document signatures", () => {
  const old = save(initialWorkspace());
  delete old.training;
  const snapshot = { version: 10, workspace: old, drafts: [], recordFlags: ["example-flag"] };
  const loaded = loadWorkspace({ getItem: () => JSON.stringify(snapshot) });
  assert.equal(loaded.version, 11);
  assert.deepEqual(loaded.workspace, { ...old, training: {} });
  assert.deepEqual(loaded.recordFlags, snapshot.recordFlags);
});
