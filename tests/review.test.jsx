import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import App from "../src/App";
import { theme } from "../src/theme";
import { sources as sourceRecords } from "../src/records";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
function setup() {
  const user = userEvent.setup();
  render(
    <MantineProvider theme={theme} forceColorScheme="light">
      <App />
    </MantineProvider>,
  );
  return user;
}
const requirement = (name) => screen.getByRole("button", { name });
const maintenance = /Pump maintenance & repair.*Repeated pump repairs/;

async function openPump(user) {
  await user.click(requirement(maintenance));
  const inspect = await screen.findByRole("button", {
    name: "View supporting records (5)",
  });
  await user.click(inspect);
  return inspect;
}

describe("Mantine review interactions", () => {
  it("starts collapsed and opens one named assessment across all groups", async () => {
    const user = setup();
    expect(
      screen.queryByRole("button", { name: "View supporting records (5)" }),
    ).not.toBeInTheDocument();
    const control = requirement(maintenance);
    control.focus();
    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("region", { name: maintenance }),
    ).toBeInTheDocument();
    await user.click(requirement(/Electrical fault-finding & control/));
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(
      await screen.findByRole("button", {
        name: "View supporting records (4)",
      }),
    ).toBeVisible();
    await user.click(
      requirement(/Safe-work planning & permits.*Planning and permit issuing/),
    );
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "View supporting records (5)" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", {
        name: "View supporting records (2)",
      }),
    ).toBeVisible();
  });

  it("navigates exact source text, retains original fields, traps focus and returns to the expanded row", async () => {
    const user = setup();
    const inspect = await openPump(user);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByText("Record 2 of 5")).toBeVisible(),
    );
    expect(
      within(dialog).queryByText(/Confirm it belongs to him/),
    ).not.toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous evidence record" }),
    );
    expect(within(dialog).getByText("Needs checking:")).toBeVisible();
    expect(
      within(dialog).getByText(
        /5 selected supporting records.*1 needs attribution/,
      ),
    ).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "View source details" }),
    ).toHaveAttribute("aria-expanded", "false");
    await user.click(
      within(dialog).getByRole("button", { name: "Flag record for review" }),
    );
    expect(
      within(dialog).getByRole("button", { name: "Record flagged · undo" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByText(/Confirm it belongs to him/)).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Record flagged · undo" }),
    );
    const quote = dialog.querySelector("blockquote");
    const original = sourceRecords.find(
      (r) => r.original === quote.textContent,
    );
    expect(original).toBeDefined();
    expect(quote.querySelector("mark").textContent).toBe(original.highlight);
    await user.click(
      within(dialog).getByRole("button", { name: "Next evidence record" }),
    );
    expect(within(dialog).getByText("Record 2 of 5")).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous evidence record" }),
    );
    await waitFor(() =>
      expect(within(dialog).getByText("Record 1 of 5")).toBeVisible(),
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "View source details",
      }),
    );
    await waitFor(() => expect(dialog.querySelector("pre")).toBeVisible());
    const close = within(dialog).getByRole("button", {
      name: "Close evidence",
    });
    close.focus();
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(inspect).toHaveFocus());
    expect(requirement(maintenance)).toHaveAttribute("aria-expanded", "true");
  });

  it("saves, edits and removes a draft without altering assessment or interest", async () => {
    const user = setup();
    await user.click(requirement(maintenance));
    await user.click(
      (await screen.findAllByRole("button", { name: "Add to discussion" }))[0],
    );
    let input = await screen.findByRole("textbox", {
      name: "Question for Eimhin",
    });
    await user.clear(input);
    expect(
      screen.getByRole("button", { name: "Save question" }),
    ).toBeDisabled();
    await user.type(
      input,
      "Which pump repairs did you complete independently?",
    );
    await user.click(screen.getByRole("button", { name: "Save question" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Your assessment:/).parentElement,
    ).toHaveTextContent("Not reviewed");
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Interested",
    );
    await user.click(
      screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Edit question" }),
    );
    input = await screen.findByRole("textbox", {
      name: "Question for Eimhin",
    });
    expect(input).toHaveValue(
      "Which pump repairs did you complete independently?",
    );
    expect(input).toHaveFocus();
    await user.type(input, " Please give an example.");
    await user.click(screen.getByRole("button", { name: "Save question" }));
    expect(
      screen.getByText(
        "Which pump repairs did you complete independently? Please give an example.",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(requirement(maintenance)).toHaveFocus());
    expect(
      screen.queryByRole("button", { name: "Discussion with Eimhin (1)" }),
    ).not.toBeInTheDocument();
  });

  it("retains qualification records, verification flags and supporting modules", async () => {
    const user = setup();
    await user.click(requirement(/Sea survival.*Module recorded/));
    await user.click(
      await screen.findByRole("button", { name: "Add qualification check" }),
    );
    expect(
      screen.getByRole("button", { name: "Qualification check added" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", { name: "View training record" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "View source details" }),
    );
    await waitFor(() => expect(screen.getByText("LH500010")).toBeVisible());
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "Qualification check added" }),
    );
    expect(
      screen.getByRole("button", { name: "Add qualification check" }),
    ).toHaveAttribute("aria-pressed", "false");
    await user.click(requirement(maintenance));
    await user.click(
      await screen.findByRole("button", {
        name: "Related training (1)",
      }),
    );
    expect(
      await screen.findAllByRole("button", { name: "View training record" }),
    ).toHaveLength(1);
  });
  it("labels illustrative interest once and keeps current and prospective roles explicit", async () => {
    setup();
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Interested",
    );
    expect(
      screen.getByText(/Interested is illustrative scenario data/),
    ).toBeVisible();
    expect(screen.getByText(/Current role:/).parentElement).toHaveTextContent(
      "Lighthouse keeper · Carrowmore Light Authority",
    );
    expect(
      screen.getByText("Opportunity being assessed").parentElement,
    ).toHaveTextContent("Wind Turbine Technician · Carrowmore Array");
    expect(
      screen.getByRole("button", { name: "Prepare referral" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Suggest to Eimhin" }),
    ).not.toBeInTheDocument();
  });
  it("keeps assessment and response editable without resolving evidence", async () => {
    const user = setup();
    const edit = screen.getByRole("button", { name: "Edit assessment" });
    await user.click(edit);
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Your assessment" }),
      "not-suitable",
    );
    await user.click(screen.getByRole("button", { name: "Save assessment" }));
    await waitFor(() => expect(edit).toHaveFocus());
    expect(screen.getByText("Referral on hold")).toBeVisible();
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
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Not interested",
    );
    expect(
      requirement(/Offshore medical fitness.*Clearance not established/),
    ).toBeVisible();
  });
});

it("keeps discussion topics unique and distinct from qualification checks", async () => {
  const user = setup();
  await user.click(requirement(/Sea survival.*Module recorded/));
  await user.click(
    await screen.findByRole("button", { name: "Add qualification check" }),
  );
  await user.click(screen.getByRole("button", { name: "Add to discussion" }));
  await user.click(
    await screen.findByRole("button", { name: "Save question" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await user.click(
    screen.getByRole("button", { name: "Edit discussion question" }),
  );
  const input = await screen.findByRole("textbox", {
    name: "Question for Eimhin",
  });
  await user.clear(input);
  await user.type(input, "Which current offshore certificates do you hold?");
  await user.click(screen.getByRole("button", { name: "Save question" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Qualification check added" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(requirement(/Sea survival.*Module recorded/)).toBeVisible();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
  await user.click(
    screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
  );
  await waitFor(() =>
    expect(
      screen.getByText("Which current offshore certificates do you hold?"),
    ).toBeVisible(),
  );
});

it("opens every selected log with its exact highlight through the requirement assessment", async () => {
  const user = setup();
  for (const [row, count, prefix] of [
    [maintenance, 5, "pump_"],
    [/Electrical fault-finding & control/, 4, "electrical_"],
    [/Safe-work planning & permits.*Planning and permit issuing/, 2, "safety_"],
  ]) {
    const control = requirement(row);
    if (control.getAttribute("aria-expanded") !== "true")
      await user.click(control);
    await user.click(
      await screen.findByRole("button", {
        name: `View supporting records (${count})`,
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const previous = within(dialog).getByRole("button", {
      name: "Previous evidence record",
    });
    while (!previous.disabled) await user.click(previous);
    for (const record of sourceRecords
      .filter((r) => r.id.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date))) {
      const quote = dialog.querySelector("blockquote");
      expect(quote.textContent).toBe(record.original);
      expect(quote.querySelector("mark").textContent).toBe(record.highlight);
      const next = within(dialog).getByRole("button", {
        name: "Next evidence record",
      });
      if (!next.disabled) await user.click(next);
    }
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  }
});

it("keeps optional discussion prompts available after saving a contextual question", async () => {
  const user = setup();
  await user.click(requirement(maintenance));
  await user.click(
    await screen.findByRole("button", { name: "Add to discussion" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Save question" }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  const launch = screen.getByRole("button", {
    name: "Discussion with Eimhin (1)",
  });
  await user.click(launch);
  await user.click(
    await screen.findByRole("button", {
      name: "Add topic: Existing offshore safety certificates",
    }),
  );
  expect(
    await screen.findByRole("textbox", { name: "Question for Eimhin" }),
  ).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Save question" }));
  expect(
    screen.queryByRole("button", {
      name: "Add topic: Existing offshore safety certificates",
    }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Discussion with Eimhin (2)" }),
    ).toHaveFocus(),
  );
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});

it("keeps all four training records reachable in their experience or qualification context", async () => {
  const user = setup();
  for (const [row, id, supporting] of [
    [/Sea survival.*Module recorded/, "LH500010", false],
    [/Fire prevention and response.*Attendance recorded/, "LH500003", false],
    [maintenance, "LH500008", true],
    [/Electrical fault-finding & control/, "LH500001", true],
  ]) {
    await user.click(requirement(row));
    if (supporting)
      await user.click(
        await screen.findByRole("button", { name: "Related training (1)" }),
      );
    await user.click(
      await screen.findByRole("button", { name: "View training record" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "View source details" }),
    );
    await waitFor(() => expect(within(dialog).getByText(id)).toBeVisible());
    expect(dialog.querySelector("pre").textContent).toContain(id);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  }
});

it("gives every section one purpose and keeps qualification tasks discoverable", async () => {
  const user = setup();
  expect(screen.queryByLabelText("Quick assessment")).not.toBeInTheDocument();
  expect(screen.queryByText(/Career intention:/)).not.toBeInTheDocument();
  const preferred = screen.getByRole("region", {
    name: "Additional employer preferences",
  });
  expect(
    within(preferred).getByRole("button", { name: /Safe-work planning/ }),
  ).toBeVisible();
  expect(
    within(preferred).getByRole("button", { name: /Training and supporting/ }),
  ).toBeVisible();
  await user.click(requirement(/Sea survival.*Module recorded/));
  await user.click(
    await screen.findByRole("button", { name: "Add qualification check" }),
  );
  await user.click(requirement(maintenance));
  const checks = screen.getByRole("region", { name: "Next steps" });
  expect(checks).toHaveTextContent(
    "Completing a task does not verify evidence or qualifications.",
  );
  await user.click(
    within(checks).getByRole("button", {
      name: /Remove task: Check Sea survival/,
    }),
  );
  expect(
    screen.queryByRole("checkbox", { name: "Check Sea survival" }),
  ).not.toBeInTheDocument();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});

it("separates experience clarification from source coverage and optional module follow-up", async () => {
  const user = setup();
  await user.click(requirement(maintenance));
  const panel = await screen.findByRole("region", { name: maintenance });
  expect(
    within(panel).getByRole("heading", { name: "Experience recorded" }),
  ).toBeVisible();
  expect(
    within(panel).getByRole("heading", { name: "What to clarify with Eimhin" }),
  ).toBeVisible();
  const coverage = within(panel).getByRole("button", {
    name: "Record coverage and involvement",
  });
  expect(coverage).toHaveAttribute("aria-expanded", "false");
  await user.click(coverage);
  await waitFor(() =>
    expect(within(panel).getByText("Selected date range")).toBeVisible(),
  );
  await user.click(
    within(panel).getByRole("button", { name: "Related training (1)" }),
  );
  const followup = await within(panel).findByRole("button", {
    name: "Follow up this module",
  });
  expect(followup).toHaveAttribute("aria-expanded", "false");
  await user.click(followup);
  await user.click(
    await within(panel).findByRole("button", {
      name: "Add qualification check",
    }),
  );
  expect(
    within(panel).getByRole("button", { name: "Qualification check added" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});
