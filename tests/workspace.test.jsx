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
  await user.click(screen.getByRole("button", { name: "Prepare referral" }));
  const dialog = await screen.findByRole("dialog");
  expect(
    [...dialog.querySelectorAll("textarea")].map((t) => t.value).join(" "),
  ).not.toContain("Private conversation");
});
it("preserves referral edits through source inspection, saves separately from readiness and invalidates on response change", async () => {
  const user = userEvent.setup();
  mount();
  const launch = screen.getByRole("button", { name: "Prepare referral" });
  await user.click(launch);
  const why = await screen.findByRole("textbox", {
    name: "Why consider Eimhin",
  });
  await user.type(why, " Additional employer-facing context.");
  await user.click(
    screen.getByRole("button", {
      name: "Sources behind the draft · for your review",
    }),
  );
  const source = await screen.findByRole("button", {
    name: "Pump maintenance & repair · inspect records",
  });
  await user.click(source);
  await waitFor(() =>
    expect(screen.getByRole("dialog")).toHaveTextContent("Record 2 of 5"),
  );
  await user.keyboard("{Escape}");
  await waitFor(() => expect(source).toHaveFocus());
  expect(
    screen.getByRole("textbox", { name: "Why consider Eimhin" }).value,
  ).toContain("Additional employer-facing context.");
  await user.click(screen.getByRole("button", { name: "Save referral draft" }));
  await close(user);
  expect(screen.getByText("Assessing referral readiness")).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Mark ready for referral" }),
  );
  let dialog = await screen.findByRole("dialog");
  const save = within(dialog).getByRole("button", {
    name: "Mark ready for referral",
  });
  expect(save).toBeDisabled();
  await user.type(
    within(dialog).getByRole("textbox", {
      name: "Rationale for referral readiness",
    }),
    "Relevant maintenance; unresolved requirements disclosed.",
  );
  expect(save).toBeDisabled();
  await user.click(
    within(dialog).getByRole("checkbox", { name: /I acknowledge/ }),
  );
  await user.click(save);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("Ready for referral")).toBeVisible();
  await user.click(
    screen.getByRole("checkbox", {
      name: "Check existing offshore certificates",
    }),
  );
  expect(screen.getByText("Ready for referral")).toBeVisible();
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
  expect(screen.getByText("Referral on hold")).toBeVisible();
  expect(screen.queryByText("Ready for referral")).not.toBeInTheDocument();
  const snapshot = JSON.parse(localStorage.getItem(storageKey));
  expect(snapshot.workspace.opportunity.employerProgression).toBe(
    "not-submitted",
  );
  expect(snapshot.workspace.referral.why).toContain(
    "Additional employer-facing context.",
  );
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
  await user.click(screen.getByRole("button", { name: "Prepare referral" }));
  const include = await screen.findByRole("checkbox", {
    name: /Include Eimhin’s account/,
  });
  expect(include).not.toBeChecked();
  await user.click(include);
  expect(
    screen.getByRole("textbox", {
      name: "Referral wording: Pump maintenance & repair",
    }),
  ).toHaveValue("I replaced pump seals independently.");
  await user.click(screen.getByRole("button", { name: "Save referral draft" }));
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
    screen.getByRole("checkbox", { name: "Prepare the referral" }),
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
    screen.getByRole("checkbox", { name: "Prepare the referral" }),
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
    screen.getByRole("checkbox", { name: "Prepare the referral" }),
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
    screen.getByRole("button", { name: "Prepare referral" }),
  ).toBeVisible();
});
