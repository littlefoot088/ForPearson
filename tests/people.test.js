import test from "node:test";
import assert from "node:assert/strict";
import {
  assessmentOverview,
  filterPeople,
  peopleForWorkspace,
} from "../src/people.js";
import {
  initialWorkspace,
  createReferral,
  workspaceReducer,
} from "../src/workspace.js";

test("workspace uses pair tasks and progress without inferring overall intention", () => {
  let state = initialWorkspace();
  assert.deepEqual(assessmentOverview(state), {
    progress: "Interested",
    nextAction: "Review suitability",
  });
  assert.equal(peopleForWorkspace(state)[0].intention, "Not yet discussed");
  state = workspaceReducer(state, { type: "task-toggle", id: "certificates" });
  assert.equal(
    assessmentOverview(state).nextAction,
    "Review suitability",
  );
  state = workspaceReducer(state, {
    type: "opportunity",
    action: { type: "response", value: "interested" },
  });
  state = workspaceReducer(state, {type:"opportunity", action:{type:"assessment",value:"worth-discussing"}});
  state = workspaceReducer(state, {
    type: "referral-save",
    referral: createReferral(),
  });
  assert.equal(assessmentOverview(state).progress, "Introduction draft saved");
  state = workspaceReducer(state, { type: "ready" });
  assert.equal(assessmentOverview(state).progress, "Ready for Eimhin’s review");
  state = workspaceReducer(state, {
    type: "opportunity",
    action: { type: "response", value: "not-interested" },
  });
  assert.deepEqual(assessmentOverview(state), {
    progress: "Not interested",
    nextAction: "Review Eimhin’s response",
  });
});
test("search ignores accents, filters combine, retirement has no recommendations", () => {
  const people = peopleForWorkspace(initialWorkspace());
  assert.equal(people.length, 6);
  assert.equal(people[0].opportunities.length, 3);
  assert.equal(filterPeople(people, "EIMHIN", null, false).length, 1);
  assert.equal(
    filterPeople(people, "", "Planning retirement", false).length,
    1,
  );
  assert.equal(filterPeople(people, "", null, true).length, 4);
  assert.equal(
    filterPeople(people, "Eimhin", "Seeking employment", false).length,
    0,
  );
  assert.equal(
    people.flatMap((p) => p.opportunities).filter((o) => o.implemented).length,
    1,
  );
});

test("six workspace scenarios stay separate from evidence and have only one assessment link", () => {
  const people = peopleForWorkspace(initialWorkspace());
  assert.equal(
    people.find((p) => p.intention === "Planning retirement").opportunities
      .length,
    0,
  );
  assert.equal(filterPeople(people, "Aoife Ni Mhurchu", null, false).length, 1);
  const progress = people.flatMap((p) =>
    p.opportunities.map((o) => o.progress),
  );
  for (const status of [
    "Interview invited",
    "Qualification check needed",
    "Exploring",
    "Employment arranged",
  ])
    assert.ok(progress.includes(status));
  assert.ok(people.every((p) => p.opportunities.length <= 3));
});
