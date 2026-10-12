import test from "node:test";
import assert from "node:assert/strict";
import {
  initialWorkspace,
  workspaceReducer as reduce,
  createReferral,
  loadWorkspace,
  storageKey,
  persistWorkspace,
} from "../src/workspace.js";
import {
  workflowView,
  workflowTasks,
  verificationFor,
  qualificationSummary,
  summaryWithQualifications,
} from "../src/workflowState.js";
import { assessmentOverview } from "../src/people.js";
const verified = {
  issuer: "Training provider",
  reference: "CERT-123",
  verifiedOn: "2026-01-10",
  expiresOn: "2099-01-01",
  noExpiry: false,
  coverageConfirmed: true,
};
const positive = (s) =>
  reduce(s, {
    type: "opportunity",
    action: { type: "assessment", value: "worth-discussing" },
  });
const save = (s) =>
  reduce(s, {
    type: "referral-save",
    referral: createReferral(s.excludedRecordIds, s.verifications),
  });
test("shared next action follows precedence and preparation resolves without losing history", () => {
  let s = initialWorkspace();
  assert.equal(workflowView(s).primary.label, "Review suitability");
  s = positive(s);
  assert.equal(workflowView(s).primary.label, "Prepare candidate introduction");
  s = save(s);
  assert(workflowTasks(s).find((t) => t.id === "prepare-referral").done);
  assert.equal(workflowView(s).primary.label, "Review candidate introduction");
  const text = s.referral.pump;
  s = reduce(s, {
    type: "opportunity",
    action: { type: "assessment", value: "not-suitable" },
  });
  assert.equal(s.referral.pump, text);
  assert(s.referral.needsReview);
  assert.equal(workflowView(s).primary.label, "Reconsider suitability");
  assert.deepEqual(assessmentOverview(s), {
    progress: workflowView(s).progress,
    nextAction: workflowView(s).primary.label,
  });
  s = reduce(s, {
    type: "opportunity",
    action: { type: "response", value: "not-interested" },
  });
  assert.equal(workflowView(s).primary.action, "response");
});
test("manual edits and manually created lookalikes never auto-complete", () => {
  let s = initialWorkspace();
  s = reduce(s, {
    type: "task-save",
    task: {
      ...s.tasks.at(-1),
      title: "Prepare introduction with supporting documents",
    },
  });
  s = reduce(s, {
    type: "task-save",
    task: {
      id: "manual",
      title: "Prepare candidate introduction",
      done: false,
    },
  });
  s = save(s);
  assert.equal(
    workflowTasks(s).find((t) => t.id === "prepare-referral").done,
    false,
  );
  assert.equal(workflowTasks(s).find((t) => t.id === "manual").done, false);
  s = reduce(s, { type: "task-toggle", id: "manual" });
  assert(workflowTasks(s).find((t) => t.id === "manual").done);
});
test("verification requires actual document fields, expires, withdraws and preserves history and draft wording", () => {
  let s = save(positive(initialWorkspace()));
  const text = s.referral.qualifications;
  s = reduce(s, {
    type: "qualification-toggle",
    qualification: { id: "sea", title: "Sea survival" },
  });
  s = reduce(s, { type: "task-toggle", id: "qualification:sea" });
  assert(!verificationFor(s, "sea").current);
  for (const record of [
    { ...verified, reference: "" },
    { ...verified, coverageConfirmed: false },
    { ...verified, expiresOn: "" },
  ])
    assert.equal(
      reduce(s, { type: "verification-save", id: "sea", record }),
      s,
    );
  s = reduce(s, { type: "verification-save", id: "sea", record: verified });
  assert(verificationFor(s, "sea").current);
  assert(workflowTasks(s).find((t) => t.id === "qualification:sea").done);
  assert(s.referral.needsReview);
  assert.equal(s.referral.qualifications, text);
  assert.equal(s.ready, null);
  assert.match(
    createReferral([], s.verifications).qualifications,
    /Verified by the redeployment officer: Sea survival/,
  );
  s = reduce(s, {
    type: "verification-save",
    id: "sea",
    record: { ...verified, expiresOn: "2020-01-01" },
  });
  assert(!verificationFor(s, "sea").current);
  assert(!workflowTasks(s).find((t) => t.id === "qualification:sea").done);
  s = reduce(s, { type: "verification-withdraw", id: "sea" });
  assert.equal(s.verifications.sea.length, 3);
  assert.equal(verificationFor(s, "sea").label, "Verification withdrawn");
});
test("a saved working preference completes its linked checklist item", () => {
  let state = initialWorkspace();
  assert.equal(
    workflowTasks(state).find((task) => task.id === "career-preferences").done,
    false,
  );
  state = reduce(state, {
    type: "preferences-save",
    preference: {
      date: "2026-10-11",
      response: "Comfortable offshore with height work to discuss.",
      concerns: "",
    },
  });
  assert.equal(
    workflowTasks(state).find((task) => task.id === "career-preferences").done,
    true,
  );
});
test("certificate follow-up resolves from all four safety verifications while medical remains distinct", () => {
  let s = initialWorkspace();
  for (const id of ["sea", "fire", "first-aid", "height"])
    s = reduce(s, { type: "verification-save", id, record: verified });
  assert(workflowTasks(s).find((t) => t.id === "certificates").done);
  assert.match(
    qualificationSummary(s),
    /Still to verify: Offshore medical fitness/,
  );
  assert(!verificationFor(s, "medical").current);
});
test("v2 migration preserves manual work while moving the certificate check to verification-driven completion", () => {
  const old = initialWorkspace();
  delete old.verifications;
  old.tasks = old.tasks.map(({ origin, ...t }) => t);
  old.tasks[0].done = true;
  old.tasks[2].done = true;
  old.tasks[1].title = "My edited responsibility task";
  old.notes = [
    {
      id: "note",
      date: "2026-01-01",
      text: "Private note",
      followup: "Keep this",
    },
  ];
  const loaded = loadWorkspace({
    getItem: () =>
      JSON.stringify({
        version: 2,
        workspace: old,
        drafts: [],
        recordFlags: ["pump_2009-03-13"],
      }),
  });
  assert.equal(loaded.version, 11);
  assert.equal(loaded.workspace.tasks[0].origin, "system");
  assert(
    !workflowTasks(loaded.workspace).find((t) => t.id === "certificates").done,
  );
  assert.equal(loaded.workspace.tasks[1].origin, "manual");
  assert.equal(loaded.workspace.tasks[2].origin, "manual");
  assert.deepEqual(loaded.workspace.notes, old.notes);
  assert.equal(loaded.workspace.tasks.at(-1).origin, "system");
  let stored;
  persistWorkspace(
    {
      setItem: (k, v) => {
        assert.equal(k, storageKey);
        stored = v;
      },
    },
    loaded,
  );
  assert.deepEqual(
    loadWorkspace({ getItem: () => stored }).workspace,
    loaded.workspace,
  );
});

test("work stage is independent of suitability and does not invalidate saved wording", () => {
  let state = positive(initialWorkspace());
  assert.equal(workflowView(state).progress, "To do");
  state = reduce(state, { type: "opportunity", action: { type: "work-stage", value: "discussing" } });
  assert.equal(workflowView(state).progress, "Discussing with keeper");
  assert.equal(workflowView(state).assessment, "worth-discussing");
  assert.equal(workflowView(state).primary.action, "discussion");
  assert.equal(assessmentOverview(state).progress, workflowView(state).progress);
  state = reduce(state, { type: "referral-save", referral: createReferral() });
  const referral = state.referral;
  state = reduce(state, { type: "opportunity", action: { type: "work-stage", value: "preparing" } });
  assert.deepEqual(state.referral, referral);
  assert.equal(workflowView(state).progress, "Preparing introduction");
  assert.equal(reduce(state, { type: "opportunity", action: { type: "work-stage", value: "sent" } }).opportunity.workStage, "preparing");
});

test("v6 migration adds work stage without inferring discussion or changing stored judgement", () => {
  const old = initialWorkspace();
  delete old.opportunity.workStage;
  old.opportunity.assessment = "needs-clarification";
  const loaded = loadWorkspace({ getItem: () => JSON.stringify({ version: 6, workspace: old, drafts: [], recordFlags: [] }) });
  assert.equal(loaded.workspace.opportunity.workStage, "reviewing");
  assert.equal(loaded.workspace.opportunity.assessment, "needs-clarification");
  assert.equal(workflowView(loaded.workspace).primary.action, "discussion");
  assert.deepEqual(loaded.workspace.notes, old.notes);
});

test('conversation topic snapshots persist without promoting private notes to evidence or erasing earlier wording',()=>{
 const draft={id:'pump',title:'Pump maintenance & repair',text:'Which repairs?',requirementId:'maintenance',completed:false};
 const original=initialWorkspace();
 const state=reduce(original,{type:'note-save',note:{id:'multi',date:'2026-10-12',text:'Private discussion',followup:'',topics:[{id:draft.id,title:draft.title,text:draft.text}]}});
 assert.deepEqual(state.tasks,original.tasks);
 assert.deepEqual(state.reports,original.reports);
 assert.deepEqual(state.verifications,original.verifications);
 assert.deepEqual(state.opportunity,original.opportunity);
 let raw;persistWorkspace({setItem:(_,value)=>raw=value},{workspace:state,drafts:[{...draft,text:'Updated question'}],recordFlags:[]});
 const restored=loadWorkspace({getItem:()=>raw});
 assert.equal(restored.workspace.notes[0].topics[0].text,'Which repairs?');
 assert.equal(restored.drafts[0].text,'Updated question');
});
