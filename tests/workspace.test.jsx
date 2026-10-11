import React from "react";
import { afterEach, expect, it, vi } from "vitest";
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
import { storageKey } from "../src/workspace";
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
  localStorage.clear();
  vi.restoreAllMocks();
});

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
    screen.getByRole("button", { name: "Edit task: Review certificate dates" }),
  );
  await user.clear(await screen.findByRole("textbox", { name: "Task" }));
  await user.type(
    screen.getByRole("textbox", { name: "Task" }),
    "Ask the provider",
  );
  await user.click(screen.getByRole("button", { name: "Save task" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await user.click(
    screen.getByRole("button", { name: "Remove task: Ask the provider" }),
  );
  expect(
    screen.queryByRole("checkbox", { name: "Ask the provider" }),
  ).not.toBeInTheDocument();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});
it("saves dated private notes with follow-up, edits them and excludes their text from referrals", async () => {
  const user = userEvent.setup();
  mount();
  expect(screen.getByText("No conversation recorded yet.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Add note" }));
  fireEvent.change(await screen.findByLabelText(/Conversation or note date/), {
    target: { value: "2026-12-31" },
  });
  await user.type(
    screen.getByRole("textbox", { name: "Private note" }),
    "Private conversation reminder",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Follow-up (optional)" }),
    "Ask about travel",
  );
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
  expect(screen.getByText(/Ask about travel/)).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("article")).not.toHaveTextContent(
    "Private conversation",
  );
});
it("previews a concise document, supports edit/review/save and marks ready only for Eimhin's review", async () => {
  const user = userEvent.setup();
  mount();
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
  expect(screen.getByText("Preparing candidate introduction")).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Mark ready for Eimhin’s review" }),
  );
  dialog = await screen.findByRole("dialog");
  expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
  await user.click(
    within(dialog).getByRole("button", {
      name: "Mark ready for Eimhin’s review",
    }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("Ready for Eimhin’s review")).toBeVisible();
  await user.click(
    screen.getByRole("checkbox", {
      name: "Check existing offshore certificates",
    }),
  );
  expect(screen.getByText("Ready for Eimhin’s review")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Edit response" }));
  await user.selectOptions(
    await screen.findByRole("combobox", {
      name: "Simulated response from Eimhin",
    }),
    "not-interested",
  );
  await user.click(
    screen.getByRole("button", { name: "Save simulated response" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("Introduction on hold")).toBeVisible();
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
  await user.click(
    await screen.findByRole("button", { name: "Record Eimhin’s account" }),
  );
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
  expect(
    screen.getByText(/Recorded by you; not independently verified/),
  ).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Edit introduction" }),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Include Eimhin-reported responsibilities (optional)",
    }),
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
it("confirms reset, clears persisted review data and restores the illustrative scenario", async () => {
  const user = userEvent.setup();
  mount();
  await user.click(
    screen.getByRole("checkbox", { name: "Prepare candidate introduction" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Reset prototype workspace" }),
  );
  let dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("checkbox", { name: "Prepare candidate introduction" }),
  ).toBeChecked();
  await user.click(
    screen.getByRole("button", { name: "Reset prototype workspace" }),
  );
  dialog = await screen.findByRole("dialog");
  await user.click(
    within(dialog).getByRole("button", { name: "Reset workspace" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("checkbox", { name: "Prepare candidate introduction" }),
  ).not.toBeChecked();
  expect(
    screen.getByText(/Interested is illustrative scenario data/),
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
  expect(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  ).toBeVisible();
});

it("cancels edits, confirms regeneration and preserves previous manual wording across refresh", async () => {
  const user = userEvent.setup();
  let view = mount();
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
    screen.getByRole("button", { name: "Review candidate introduction" }),
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
  await user.click(screen.getByRole("button", { name: "Reset to assessment" }));
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
});

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
    screen.getByRole("button", { name: "Review candidate introduction" }),
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
