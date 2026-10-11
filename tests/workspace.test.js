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
  reduce(
    reduce(initialWorkspace(), {
      type: "opportunity",
      action: { type: "response", value: "interested" },
    }),
    {
      type: "referral-save",
      referral: createReferral(),
    },
  );
const markReady = (state) =>
  reduce(state, {
    type: "ready",
    rationale:
      "Relevant experience, with requirements disclosed for employer consideration.",
    acknowledged: true,
  });

test("initial interest reflects the agreed conversation scenario; referral provenance excludes both disputed early records", () => {
  const state = initialWorkspace();
  assert.equal(state.opportunity.responseOrigin, "scenario-confirmed");
  assert.equal(state.opportunity.interest, "interested");
  assert.deepEqual(state.notes, []);
  assert.deepEqual(state.reports, {});
  const draft = createReferral();
  assert.equal(draft.sourceIds.length, 9);
  for (const id of draft.sourceIds)
    assert.ok(sources.find((s) => s.id === id).date >= person.joined);
  assert.match(draft.qualifications, /Sea-survival training is recorded/);
  assert.match(
    draft.qualifications,
    /complete offshore safety certification and medical fitness still need verification/,
  );
  assert.match(draft.qualifications, /before mobilisation/);
  assert.doesNotMatch(draft.qualifications, /2022|2028|LH500/);
  assert.deepEqual(draft.includedReports, []);
});
test("saving a draft never grants review readiness; a saved introduction and interest are required", () => {
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
  assert.ok(
    markReady({
      ...state,
      opportunity: { ...state.opportunity, assessment: "not-suitable" },
    }).ready,
  );
  assert.ok(reduce(state, { type: "ready" }).ready);
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
      "scenario-confirmed",
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

test("legacy referrals retain their wording and never become approved or ready for person review automatically", () => {
  const old = {
    candidate: "Eimhin",
    why: "My manually written recommendation",
    experience: "Previous detailed wording",
    qualifications: "Previous checks",
    questions: "Private assessment questions",
    includedReports: [],
    sourceIds: [],
  };
  const payload = {
    version: 1,
    workspace: {
      ...initialWorkspace(),
      referral: old,
      ready: { rationale: "Old referral rationale", acknowledged: true },
    },
    drafts: [],
    recordFlags: [],
  };
  const loaded = loadWorkspace({ getItem: () => JSON.stringify(payload) });
  assert.equal(loaded.message, "");
  assert.equal(loaded.workspace.referral.why, old.why);
  assert.equal(
    loaded.workspace.referral.previousReadiness.rationale,
    "Old referral rationale",
  );
  assert.equal(loaded.workspace.ready, null);
  assert.equal(readinessAllowed(loaded.workspace), false);
  assert.equal(
    loaded.workspace.opportunity.employerProgression,
    "not-submitted",
  );
});
test("changed fixture context requests review without overwriting edited introduction text", () => {
  const state = markReady(draftState());
  state.referral.why = "Officer-authored wording";
  state.referral.assessmentSignature = "previous fixture";
  const loaded = loadWorkspace({
    getItem: () =>
      JSON.stringify({
        version: 2,
        workspace: state,
        drafts: [],
        recordFlags: [],
      }),
  });
  assert.equal(loaded.message, "");
  assert.equal(loaded.workspace.referral.why, "Officer-authored wording");
  assert.equal(loaded.workspace.referral.needsReview, true);
  assert.equal(loaded.workspace.ready, null);
});

test("legacy example responses are cleared without discarding saved work; manual responses survive", () => {
  for (const origin of ["illustrative", "simulated", "manually-recorded"]) {
    const workspace = draftState();
    workspace.opportunity.responseOrigin = origin;
    workspace.notes = [
      { id: "note", date: "2026-10-11", text: "Retain my note", followup: "" },
    ];
    const before = workspace.referral.why;
    const loaded = loadWorkspace({
      getItem: () =>
        JSON.stringify({ version: 2, workspace, drafts: [], recordFlags: [] }),
    });
    assert.equal(loaded.workspace.referral.why, before);
    assert.equal(loaded.workspace.notes[0].text, "Retain my note");
    assert.equal(
      loaded.workspace.opportunity.interest,
      origin === "manually-recorded" ? "interested" : "not-discussed",
    );
    if (origin !== "manually-recorded")
      assert.equal(loaded.workspace.ready, null);
  }
});

test("agreed interest restores the previous blank scenario once without replacing later responses", () => {
  const saved = {
    version: 2,
    workspace: initialWorkspace(),
    drafts: [],
    recordFlags: [],
  };
  delete saved.workspace.interestScenarioVersion;
  saved.workspace.opportunity.interest = "not-discussed";
  saved.workspace.opportunity.responseOrigin = null;
  const load = (value) =>
    loadWorkspace({ getItem: () => JSON.stringify(value) });
  const restored = load(saved);
  assert.equal(restored.workspace.opportunity.interest, "interested");
  assert.equal(
    restored.workspace.opportunity.responseOrigin,
    "scenario-confirmed",
  );
  assert.equal(restored.workspace.ready, null);
  restored.workspace = reduce(restored.workspace, {
    type: "opportunity",
    action: { type: "response", value: "not-discussed" },
  });
  assert.equal(load(restored).workspace.opportunity.interest, "not-discussed");
  saved.workspace.opportunity.interest = "not-interested";
  saved.workspace.opportunity.responseOrigin = "manually-recorded";
  assert.equal(load(saved).workspace.opportunity.interest, "not-interested");
});
