import React from "react";
import { assessmentHash } from "../src/people";
beforeEach(() => window.history.replaceState(null, "", assessmentHash));
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import App from "../src/App";
import { theme } from "../src/theme";
import {
  storageKey,
  initialWorkspace,
  workspaceReducer,
  createReferral,
} from "../src/workspace";
import { introductionVersion } from "../src/workflowState";
const mount = () =>
  render(
    <MantineProvider theme={theme} forceColorScheme="light">
      <App />
    </MantineProvider>,
  );
const close = async (user) => {
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
};
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  vi.restoreAllMocks();
});

it("treats a current simulated send as the end of the workflow", () => {
  let workspace = workspaceReducer(initialWorkspace(), {
    type: "opportunity",
    action: { type: "assessment", value: "worth-discussing" },
  });
  workspace = workspaceReducer(workspace, {
    type: "referral-save",
    referral: createReferral(),
  });
  workspace = workspaceReducer(workspace, {
    type: "simulate-send",
    approved: true,
    version: introductionVersion(workspace.referral),
  });
  localStorage.setItem(
    storageKey,
    JSON.stringify({ version: 6, workspace, drafts: [], recordFlags: [] }),
  );

  mount();

  expect(
    screen.getByRole("heading", { name: "Introduction sent" }),
  ).toBeVisible();
  expect(screen.getByText("Potential match")).toBeVisible();
  expect(screen.queryByText("Next action")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "View sent introduction" }),
  ).toBeVisible();
});

it("assigns a missing certificate course through the existing drawer, persists it and verifies only after document review", async () => {
  const user = userEvent.setup();
  let view = mount();
  await user.click(screen.getByRole("button", { name: /First aidCertificate not recorded/ }));
  const verifyTrigger = await screen.findByRole("button", { name: "Record verification" });
  await user.click(verifyTrigger);
  await user.click(await screen.findByRole("button", { name: "Assign training" }));
  let dialog = await screen.findByRole("dialog", { name: "Training to support job search" });
  expect(within(dialog).getByRole("button", { name: "Assign training" })).toBeDisabled();
  await user.selectOptions(within(dialog).getByLabelText(/Reason for training/), "not-held");
  await user.type(within(dialog).getByLabelText(/Course name/), "First aid certification course");
  await user.type(within(dialog).getByLabelText("Training provider"), "Example provider");
  await user.click(within(dialog).getByRole("button", { name: "Assign training" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(verifyTrigger).toHaveFocus());
  expect(screen.getByRole("checkbox", { name: "Complete First aid training" })).not.toBeChecked();
  expect(screen.getByRole("button", { name: /First aidTraining assigned/ })).toBeVisible();
  view.unmount();
  view = mount();
  await user.click(screen.getByRole("checkbox", { name: "Complete First aid training" }));
  dialog = await screen.findByRole("dialog", { name: "Training to support job search" });
  expect(within(dialog).getByLabelText(/Course name/)).toHaveValue("First aid certification course");
  await user.selectOptions(within(dialog).getByLabelText("Training progress"), "completed");
  expect(within(dialog).getByRole("button", { name: "Save training update" })).toBeDisabled();
  fireEvent.change(within(dialog).getByLabelText(/Completion date/), { target: { value: "2020-01-01" } });
  await user.click(within(dialog).getByRole("button", { name: "Save training update" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("checkbox", { name: "Complete First aid training" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Check existing offshore certificates" })).not.toBeChecked();
  await user.click(screen.getByRole("button", { name: "Verify certificate" }));
  dialog = await screen.findByRole("dialog", { name: "Qualification verification" });
  await user.type(within(dialog).getByLabelText(/Issuer or provider/), "Example provider");
  await user.type(within(dialog).getByLabelText(/Document reference/), "FA-CERT-1");
  fireEvent.change(within(dialog).getByLabelText(/Expiry date/), { target: { value: "2099-01-01" } });
  await user.click(within(dialog).getByRole("checkbox", { name: /I checked the document/ }));
  await user.click(within(dialog).getByRole("button", { name: "Save verification" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: /First aidVerified by you/ })).toBeVisible();
  expect(screen.getByRole("checkbox", { name: "Check existing offshore certificates" })).not.toBeChecked();
  await user.click(screen.getByRole("button", { name: /Offshore medical fitness/ }));
  await user.click(await screen.findByRole("button", { name: "Record verification" }));
  dialog = await screen.findByRole("dialog");
  expect(within(dialog).queryByRole("button", { name: "Assign training" })).not.toBeInTheDocument();
  await close(user);
});

async function recordPositiveDecision(user) {
  if (!screen.queryByRole("button", { name: "Record decision" })) return;
  await user.click(screen.getByRole("button", { name: "Record decision" }));
  await user.selectOptions(
    await screen.findByRole("combobox", { name: "Your assessment" }),
    "worth-discussing",
  );
  await user.click(screen.getByRole("button", { name: "Save assessment" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
}

it("adds, edits, completes, reopens and removes a task and persists across remount", async () => {
  const user = userEvent.setup();
  let view = mount();
  await user.click(screen.getByRole("button", { name: "Add task" }));
  const input = await screen.findByRole("textbox", { name: "Task" });
  await user.type(input, "Review certificate dates");
  await user.click(screen.getByRole("button", { name: "Save task" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Review certificate dates" }),
  );
  view.unmount();
  view = mount();
  expect(
    screen.getByRole("checkbox", { name: "Review certificate dates" }),
  ).toBeChecked();
  await user.click(
    screen.getByRole("checkbox", { name: "Review certificate dates" }),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Options for task: Review certificate dates",
    }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Edit task" }));
  await user.clear(await screen.findByRole("textbox", { name: "Task" }));
  await user.type(
    screen.getByRole("textbox", { name: "Task" }),
    "Ask the provider",
  );
  await user.click(screen.getByRole("button", { name: "Save task" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  // Verify edited wording persists before removing the restored task.
  view.unmount();
  view = mount();
  await user.click(
    screen.getByRole("button", { name: "Options for task: Ask the provider" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Remove task" }),
  );
  expect(
    screen.queryByRole("checkbox", { name: "Ask the provider" }),
  ).not.toBeInTheDocument();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});
it("saves dated private notes with follow-up, edits them and excludes their text from referrals", async () => {
  const user = userEvent.setup();
  mount();
  expect(screen.getByText("No conversation recorded.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Record conversation" }));
  fireEvent.change(await screen.findByLabelText(/Conversation or note date/), {
    target: { value: "2026-12-31" },
  });
  await user.type(
    screen.getByRole("textbox", { name: "Private note" }),
    "Private conversation reminder",
  );
  expect(
    screen.queryByRole("textbox", { name: "Follow-up (optional)" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Save note" }));
  await user.click(
    await screen.findByRole("button", { name: "Edit note from 31 Dec 2026" }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Private note" }),
    " — updated",
  );
  await user.click(screen.getByRole("button", { name: "Save note" }));
  await close(user);
  expect(
    screen.getByText("Private conversation reminder — updated"),
  ).toBeVisible();

  await recordPositiveDecision(user);
  await user.click(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("article")).not.toHaveTextContent(
    "Private conversation",
  );
});
it("previews a concise document, supports edit/review/save and marks ready only for Eimhin's review", async () => {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      version: 2,
      workspace: workspaceReducer(initialWorkspace(), {
        type: "opportunity",
        action: { type: "response", value: "interested" },
      }),
      drafts: [],
      recordFlags: [],
    }),
  );
  const user = userEvent.setup();
  mount();
  await user.click(screen.getByRole("button", { name: "Record decision" }));
  await user.selectOptions(
    await screen.findByRole("combobox", { name: "Your assessment" }),
    "worth-discussing",
  );
  await user.click(screen.getByRole("button", { name: "Save assessment" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );

  const launch = screen.getByRole("button", {
    name: "Prepare candidate introduction",
  });
  await user.click(launch);
  let dialog = await screen.findByRole("dialog");
  expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
  const preview = within(dialog).getByRole("article", {
    name: "Candidate introduction preview",
  });
  expect(preview).toHaveTextContent("Current role: Lighthouse keeper");
  expect(preview).not.toHaveTextContent(
    /LH500|selected records|attribution|KLOG/,
  );
  expect(preview.textContent.split(/\s+/).length).toBeLessThan(240);
  await waitFor(() =>
    expect(
      within(dialog).getByText("Candidate CV: Not attached"),
    ).toBeVisible(),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Edit introduction" }),
  );
  const why = await screen.findByRole("textbox", {
    name: "Why we recommend Eimhin",
  });
  expect(why).toHaveFocus();
  await user.type(why, " Discuss practical examples at interview.");
  await user.click(screen.getByRole("button", { name: "Review introduction" }));
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.getByRole("article")).toHaveTextContent(
    "Discuss practical examples at interview.",
  );
  await user.click(
    screen.getByRole("button", { name: "Save introduction draft" }),
  );
  expect(
    screen.getByText("Candidate introduction saved on this browser."),
  ).toBeVisible();
  await close(user);
  expect(screen.getByText("Introduction draft saved")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Review with Eimhin" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", {
      name: /^(Review candidate introduction|View introduction)$/,
    }),
  );
  dialog = await screen.findByRole("dialog");
  expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
  await user.click(
    within(dialog).getByRole("button", {
      name: "Review with Eimhin",
    }),
  );
  await close(user);
  expect(screen.getByText("Ready for Eimhin’s review")).toBeVisible();
  expect(
    screen.getByRole("checkbox", {
      name: "Check existing offshore certificates",
    }),
  ).not.toBeChecked();
  expect(screen.queryByText("Verified by you")).not.toBeInTheDocument();
  expect(screen.getByText("Ready for Eimhin’s review")).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Update Eimhin’s interest" }),
  );
  await user.selectOptions(
    await screen.findByRole("combobox", {
      name: "Response from Eimhin",
    }),
    "not-interested",
  );
  await user.click(screen.getByRole("button", { name: "Save response" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
    "Not interested",
  );
  const snapshot = JSON.parse(localStorage.getItem(storageKey));
  expect(snapshot.workspace.ready).toBeNull();
  expect(snapshot.workspace.opportunity.employerProgression).toBe(
    "not-submitted",
  );
  expect(snapshot.workspace.referral.why).toContain(
    "Discuss practical examples at interview.",
  );
  expect(snapshot.workspace.referral.editedFields).toContain("why");
});

it("records responsibilities separately and includes them only on explicit selection", async () => {
  const user = userEvent.setup();
  mount();
  await user.click(
    screen.getByRole("button", { name: /Pump maintenance & repair.*Repeated/ }),
  );
  await user.click(screen.getByRole("button", { name: "View conversation history (0)" }));
  await user.click(await screen.findByRole("button", { name: "Record account: Pump maintenance & repair" }));
  fireEvent.change(await screen.findByLabelText(/Date reported/), {
    target: { value: "2026-12-31" },
  });
  await user.type(
    screen.getByRole("textbox", {
      name: "Responsibilities described by Eimhin",
    }),
    "I replaced pump seals independently.",
  );
  await user.click(
    screen.getByRole("button", { name: "Save Eimhin’s account" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(within(screen.getByRole("region", { name: "Conversations" })).getByText("I replaced pump seals independently.")).toBeVisible();
  expect(within(screen.getByRole("region", { name: "Next steps" })).queryByText("I replaced pump seals independently.")).not.toBeInTheDocument();
  expect(
    screen.getByText(/Recorded by you; not independently verified/),
  ).toBeVisible();
  await recordPositiveDecision(user);
  await user.click(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Edit introduction" }),
  );
  const include = await screen.findByRole("checkbox", {
    name: /Include Eimhin’s account/,
  });
  expect(include).not.toBeChecked();
  await user.click(include);
  expect(
    screen.getByRole("textbox", {
      name: "Eimhin-reported wording: Pump maintenance & repair",
    }),
  ).toHaveValue("I replaced pump seals independently.");
  await user.click(screen.getByRole("button", { name: "Review introduction" }));
  await user.click(
    screen.getByRole("button", { name: "Save introduction draft" }),
  );
  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.referral
      .includedReports,
  ).toHaveLength(1);
  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.notes,
  ).toHaveLength(0);
});
it("confirms reset, clears persisted review data and restores the agreed interest scenario", async () => {
  const user = userEvent.setup();
  mount();
  await user.click(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s maintenance experience",
    }),
  );
  await user.click(screen.getByRole("button", { name: "Reset workspace" }));
  let dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s maintenance experience",
    }),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Reset workspace" }));
  dialog = await screen.findByRole("dialog");
  await user.click(
    within(dialog).getByRole("button", { name: "Reset workspace" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s maintenance experience",
    }),
  ).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s career and offshore working preferences",
    }),
  ).toBeVisible();
});
it("keeps the app usable when browser persistence is unavailable", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error("blocked");
  });
  mount();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "will not survive refresh",
  );
  expect(screen.getByRole("button", { name: "Record decision" })).toBeVisible();
});

it("cancels edits, confirms regeneration and preserves previous manual wording across refresh", async () => {
  const user = userEvent.setup();
  let view = mount();
  await recordPositiveDecision(user);
  await user.click(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Edit introduction" }),
  );
  const field = screen.getByRole("textbox", { name: "Recommendation" });
  await user.clear(field);
  await user.type(
    field,
    "Please explore his independent repair responsibilities at interview.",
  );
  await user.click(screen.getByRole("button", { name: "Review introduction" }));
  await user.click(
    screen.getByRole("button", { name: "Save introduction draft" }),
  );
  await close(user);
  view.unmount();
  view = mount();
  await user.click(
    screen.getByRole("button", {
      name: /^(Review candidate introduction|View introduction)$/,
    }),
  );
  expect(await screen.findByRole("article")).toHaveTextContent(
    "Please explore his independent repair responsibilities at interview.",
  );
  await user.click(screen.getByRole("button", { name: "Edit introduction" }));
  await user.clear(screen.getByRole("textbox", { name: "Recommendation" }));
  await user.type(
    screen.getByRole("textbox", { name: "Recommendation" }),
    "Discard me",
  );
  await user.click(screen.getByRole("button", { name: "Cancel edits" }));
  expect(screen.getByRole("article")).not.toHaveTextContent("Discard me");
  await user.click(
    screen.getByRole("button", { name: "Replace wording from assessment" }),
  );
  const confirm = await screen.findByRole("dialog", {
    name: "Replace introduction wording?",
  });
  await user.click(
    within(confirm).getByRole("button", { name: "Replace wording" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Replace introduction wording?" }),
    ).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("article")).not.toHaveTextContent(
    "Please explore his independent repair responsibilities at interview.",
  );
  await user.click(
    screen.getByRole("button", { name: "Previous draft · internal reference" }),
  );
  await waitFor(() =>
    expect(
      screen.getByText(
        "Please explore his independent repair responsibilities at interview.",
      ),
    ).toBeVisible(),
  );
  await user.click(
    screen.getByRole("button", { name: "Save introduction draft" }),
  );
  const previousPreview = screen.getByRole("article", {
    name: "Previous introduction preview",
  });
  expect(
    within(previousPreview).getByRole("heading", { name: "Recommendation" }),
  ).toBeInTheDocument();
  expect(previousPreview).not.toHaveTextContent("assessmentSignature");
  const stored = JSON.parse(localStorage.getItem(storageKey));
  expect(stored.workspace.referral.previousDraft.recommendation).toContain(
    "Please explore",
  );
  expect(stored.workspace.ready).toBeNull();
}, 10000);

it("does not replace a legacy referral until explicitly requested", async () => {
  const { initialWorkspace } = await import("../src/workspace");
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      version: 1,
      workspace: {
        ...initialWorkspace(),
        referral: {
          candidate: "Eimhin",
          why: "Original manual wording",
          experience: "Original experience",
          qualifications: "Original qualifications",
          questions: "Original questions",
          includedReports: [],
          sourceIds: [],
        },
      },
      drafts: [],
      recordFlags: [],
    }),
  );
  const user = userEvent.setup();
  mount();
  await user.click(
    screen.getByRole("button", {
      name: /^(Review candidate introduction|View introduction)$/,
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByText(/previous referral draft has been retained/),
    ).toBeVisible(),
  );
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Previous draft · internal reference" }),
  );
  const previousPreview = await screen.findByRole("article", {
    name: "Previous introduction preview",
  });
  for (const heading of [
    "Candidate and opportunity",
    "Why we recommend Eimhin",
    "Relevant experience",
    "Qualifications and readiness",
    "Items to confirm",
  ]) {
    expect(
      within(previousPreview).getByRole("heading", { name: heading }),
    ).toBeInTheDocument();
  }
  for (const wording of [
    "Original manual wording",
    "Original experience",
    "Original qualifications",
    "Original questions",
  ]) {
    expect(previousPreview).toHaveTextContent(wording);
  }
  expect(
    within(previousPreview).queryByRole("heading", { name: "Recommendation" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Previous draft · internal reference" }),
  );

  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.referral.why,
  ).toBe("Original manual wording");
  await user.click(
    screen.getByRole("button", { name: "Create introduction from assessment" }),
  );
  const modal = await screen.findByRole("dialog", {
    name: "Create a shorter introduction?",
  });
  await user.click(
    within(modal).getByRole("button", { name: "Create introduction" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Create a shorter introduction?" }),
    ).not.toBeInTheDocument(),
  );
  await waitFor(() =>
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement),
  );
  expect(screen.getByRole("article")).toHaveTextContent(
    "Why we recommend Eimhin",
  );
  await user.click(
    screen.getByRole("button", { name: "Save introduction draft" }),
  );
  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.referral
      .previousDraft.why,
  ).toBe("Original manual wording");
});

it("preserves legacy note follow-ups when editing without creating tasks", async () => {
  const { initialWorkspace } = await import("../src/workspace");
  const workspace = initialWorkspace();
  workspace.notes = [
    {
      id: "old-note",
      date: "2026-12-01",
      text: "Private original",
      followup: "Ask about travel",
      recordedAt: 1,
    },
  ];
  localStorage.setItem(
    storageKey,
    JSON.stringify({ version: 2, workspace, drafts: [], recordFlags: [] }),
  );
  const user = userEvent.setup();
  mount();
  await user.click(screen.getByRole("button", { name: "View conversation history (1)" }));
  await user.click(
    await screen.findByRole("button", { name: "Edit note from 1 Dec 2026" }),
  );
  expect(
    screen.queryByLabelText("Follow-up (optional)"),
  ).not.toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Private note" }),
    " edited",
  );
  await user.click(screen.getByRole("button", { name: "Save note" }));
  const saved = JSON.parse(localStorage.getItem(storageKey)).workspace;
  expect(saved.notes[0].followup).toBe("Ask about travel");
  expect(saved.tasks).toEqual(workspace.tasks);
});

it("records, edits and cancels working preferences and completes the linked task", async () => {
  const user = userEvent.setup();
  mount();
  await user.click(
    screen.getByRole("button", {
      name: /Working conditions.*Not yet discussed/,
    }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Record working preferences" }),
  );
  expect(
    await screen.findByRole("button", { name: "Save preferences" }),
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/Discussion date/), {
    target: { value: "2026-10-11" },
  });
  await user.type(
    await screen.findByRole("textbox", {
      name: /Eimhin’s working preferences/,
    }),
    "Comfortable on boats; heights need discussion.",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Concerns or conditions" }),
    "Discuss height work.",
  );
  await user.click(
    await screen.findByRole("button", { name: "Save preferences" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("button", {
      name: /Working conditions.*Preferences recorded/,
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s career and offshore working preferences",
    }),
  ).toBeChecked();
  await user.click(
    screen.getByRole("button", { name: "Edit working preferences" }),
  );
  await user.clear(
    await screen.findByRole("textbox", {
      name: /Eimhin’s working preferences/,
    }),
  );
  await user.type(
    await screen.findByRole("textbox", {
      name: /Eimhin’s working preferences/,
    }),
    "Unsaved wording",
  );
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByText("Comfortable on boats; heights need discussion."),
  ).toBeVisible();
  expect(screen.queryByText("Unsaved wording")).not.toBeInTheDocument();
});

it("prepares multiple questions and records one conversation without turning notes into tasks or evidence", async () => {
  const user = userEvent.setup();
  let view = mount();
  await user.click(screen.getByRole('button',{name:'Prepare questions'}));
  const topics = await screen.findByRole('combobox',{name:'Question topics'});
  await waitFor(() => expect(topics).toBeVisible());
  await user.click(topics);
  await user.keyboard('{ArrowDown}');
  // JSDOM has no layout for Floating UI; live dropdown visibility is browser-checked.
  fireEvent.click(screen.getAllByRole('option',{hidden:true}).find((o)=>o.textContent==='Pump maintenance & repair'));
  await user.click(topics);
  fireEvent.click(screen.getAllByRole('option',{hidden:true}).find((o)=>o.textContent==='Electrical fault-finding & control'));
  await user.click(screen.getByRole('button',{name:'Add selected questions'}));
  await user.keyboard('{Escape}');
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('2 questions prepared · 0 discussed')).toBeVisible();
  const tasksBefore = JSON.parse(localStorage.getItem(storageKey)).workspace.tasks;
  expect(within(screen.getByRole('region',{name:'Next steps'})).queryByText('Discuss Pump maintenance & repair')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Record conversation'}));
  fireEvent.change(await screen.findByLabelText(/Conversation or note date/),{target:{value:'2026-10-12'}});
  await user.click(screen.getByRole('checkbox',{name:'Pump maintenance & repair'}));
  await user.click(screen.getByRole('checkbox',{name:'Electrical fault-finding & control'}));
  await user.type(screen.getByRole('textbox',{name:'Private note'}),'We discussed both areas. This is private.');
  await user.click(screen.getByRole('button',{name:'Save note'}));
  await close(user);
  expect(screen.getByText('0 questions prepared · 2 discussed')).toBeVisible();
  expect(within(screen.getByRole('region',{name:'Conversations'})).getByText('We discussed both areas. This is private.')).toBeVisible();
  let saved = JSON.parse(localStorage.getItem(storageKey));
  expect(saved.workspace.notes[0].topics).toHaveLength(2);
  expect(saved.workspace.tasks).toEqual(tasksBefore);
  expect(saved.workspace.reports).toEqual({});
  expect(saved.workspace.verifications).toEqual({});
  expect(saved.workspace.opportunity.interest).toBe('interested');
  view.unmount();view=mount();
  expect(screen.getByText('0 questions prepared · 2 discussed')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'View questions'}));
  await user.click((await screen.findAllByRole('button',{name:'Remove'}))[0]);
  saved=JSON.parse(localStorage.getItem(storageKey));
  expect(saved.workspace.notes[0].topics).toHaveLength(2);
  expect(saved.drafts).toHaveLength(1);
}, 12000);
