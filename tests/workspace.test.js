import test from "node:test";
import assert from "node:assert/strict";
import {
  initialWorkspace,
  workspaceReducer as reduce,
  createReferral,
  readinessAllowed,
  loadWorkspace,
  persistWorkspace,
  storageKey,
} from "../src/workspace.js";
import { sources } from "../src/records.js";
import { person } from "../src/data.js";
const draftState = () =>
  reduce(initialWorkspace(), {
    type: "referral-save",
    referral: createReferral(),
  });
const markReady = (state) =>
  reduce(state, {
    type: "ready",
    rationale:
      "Relevant experience, with requirements disclosed for employer consideration.",
    acknowledged: true,
  });

test("initial interest is illustrative; referral provenance excludes both disputed early records", () => {
  const state = initialWorkspace();
  assert.equal(state.opportunity.responseOrigin, "illustrative");
  assert.equal(state.opportunity.interest, "interested");
  assert.deepEqual(state.notes, []);
  assert.deepEqual(state.reports, {});
  const draft = createReferral();
  assert.equal(draft.sourceIds.length, 9);
  for (const id of draft.sourceIds)
    assert.ok(sources.find((s) => s.id === id).date >= person.joined);
  assert.match(draft.qualifications, /attendance recorded/i);
  assert.match(
    draft.qualifications,
    /No complete required qualification has been verified/,
  );
  assert.match(draft.qualifications, /before mobilisation/);
  assert.match(draft.qualifications, /expired 14 July 2022/);
  assert.deepEqual(draft.includedReports, []);
});
test("saving a draft never grants readiness; guards require interest, rationale and gap acknowledgement", () => {
  const state = draftState();
  assert.equal(state.ready, null);
  assert.equal(
    reduce(initialWorkspace(), {
      type: "ready",
      rationale: "yes",
      acknowledged: true,
    }).ready,
    null,
  );
  for (const interest of [
    "not-discussed",
    "not-interested",
    "more-information",
  ])
    assert.equal(
      markReady({ ...state, opportunity: { ...state.opportunity, interest } })
        .ready,
      null,
    );
  assert.equal(
    markReady({
      ...state,
      opportunity: { ...state.opportunity, assessment: "not-suitable" },
    }).ready,
    null,
  );
  assert.equal(
    reduce(state, { type: "ready", rationale: " ", acknowledged: true }).ready,
    null,
  );
  assert.equal(
    reduce(state, { type: "ready", rationale: "reviewed", acknowledged: false })
      .ready,
    null,
  );
  assert.ok(markReady(state).ready);
  assert.equal(
    markReady(state).opportunity.employerProgression,
    "not-submitted",
  );
});
test("changed response, assessment and saved wording invalidate readiness without discarding the draft", () => {
  const ready = markReady(draftState());
  for (const action of [
    { type: "response", value: "not-interested" },
    { type: "assessment", value: "needs-clarification" },
  ]) {
    const changed = reduce(ready, { type: "opportunity", action });
    assert.equal(changed.ready, null);
    assert.equal(changed.referral.why, ready.referral.why);
    assert.equal(changed.referral.needsReview, true);
    assert.equal(readinessAllowed(changed), false);
  }
  const edited = reduce(ready, {
    type: "referral-save",
    referral: { ...ready.referral, why: "Reviewed summary" },
  });
  assert.equal(edited.ready, null);
  assert.ok(
    reduce(ready, { type: "referral-save", referral: ready.referral }).ready,
  );
});
test("tasks and private notes stay independent and do not enter the generated referral", () => {
  const ready = markReady(draftState());
  const note = {
    id: "n",
    date: "2026-12-31",
    text: "Private sensitive conversation",
    followup: "Call Eimhin",
  };
  const withNote = reduce(ready, { type: "note-save", note });
  assert.deepEqual(withNote.ready, ready.ready);
  let state = reduce(withNote, {
    type: "qualification-toggle",
    qualification: { id: "sea", title: "Sea survival" },
  });
  state = reduce(state, { type: "task-toggle", id: "qualification:sea" });
  assert.equal(
    state.tasks.find((t) => t.id === "qualification:sea").done,
    true,
  );
  assert.deepEqual(state.referral, ready.referral);
  assert.ok(!JSON.stringify(state.referral).includes(note.text));
  state = reduce(state, {
    type: "qualification-toggle",
    qualification: { id: "sea", title: "Sea survival" },
  });
  assert.equal(state.tasks.filter((t) => t.qualificationId).length, 0);
  assert.equal(state.opportunity.employerProgression, "not-submitted");
  assert.equal(
    reduce(state, { type: "note-save", note: { ...note, date: "2026-02-31" } }),
    state,
  );
});
test("reported responsibilities are opt-in snapshots and only included changes invalidate readiness", () => {
  const report = {
    id: "pump",
    date: "2026-12-31",
    text: "I carried out pump repairs independently.",
  };
  let state = reduce(markReady(draftState()), { type: "report-save", report });
  assert.ok(state.ready);
  assert.deepEqual(state.referral.includedReports, []);
  state = reduce(state, {
    type: "referral-save",
    referral: { ...state.referral, includedReports: [report] },
  });
  state = markReady(state);
  const updated = reduce(state, {
    type: "report-save",
    report: { ...report, text: "I assisted with pump repairs." },
  });
  assert.equal(updated.ready, null);
  assert.equal(updated.referral.needsReview, true);
  assert.equal(updated.referral.includedReports[0].text, report.text);
  assert.equal(updated.reports.pump.text, "I assisted with pump repairs.");
});
test("versioned storage round-trips workspace state; corruption and unavailable storage recover safely", () => {
  let raw;
  const storage = {
    getItem: (key) => {
      assert.equal(key, storageKey);
      return raw;
    },
    setItem: (key, value) => {
      raw = value;
    },
  };
  const snapshot = {
    workspace: markReady(draftState()),
    drafts: [],
    recordFlags: ["pump_2009"],
  };
  assert.ok(persistWorkspace(storage, snapshot));
  assert.deepEqual(loadWorkspace(storage).workspace, snapshot.workspace);
  for (const invalid of [
    "{",
    '{"version":99}',
    JSON.stringify({
      ...snapshot,
      version: 1,
      workspace: { ...snapshot.workspace, tasks: [null] },
    }),
  ]) {
    raw = invalid;
    assert.match(loadWorkspace(storage).message, /could not be loaded/);
    assert.equal(
      loadWorkspace(storage).workspace.opportunity.responseOrigin,
      "illustrative",
    );
  }
  assert.equal(
    persistWorkspace(
      {
        setItem() {
          throw Error("blocked");
        },
      },
      snapshot,
    ),
    false,
  );
  assert.equal(
    loadWorkspace({
      getItem() {
        throw Error("blocked");
      },
    }).workspace.notes.length,
    0,
  );
  assert.deepEqual(
    reduce(snapshot.workspace, { type: "reset" }),
    initialWorkspace(),
  );
});
