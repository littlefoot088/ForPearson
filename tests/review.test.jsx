import React from "react";
import { assessmentHash } from "../src/people";
beforeEach(() => window.history.replaceState(null, "", assessmentHash));
import { beforeEach, afterEach, describe, expect, it } from "vitest";
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
import { claims, getSources } from "../src/data";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
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
    name: "View evidence",
  });
  await user.click(inspect);
  return inspect;
}

async function writeQuestion(user, topic = "pump") {
  await user.click(
    screen.getByRole("button", { name: /Discussion with Eimhin/ }),
  );
  await user.selectOptions(
    await screen.findByLabelText("Question topic"),
    topic,
  );
  await user.click(screen.getByRole("button", { name: "Write question" }));
  await user.click(
    await screen.findByRole("button", { name: "Save question" }),
  );
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
}

describe("Mantine review interactions", () => {
  it("starts collapsed and opens one named assessment across all groups", async () => {
    const user = setup();
    expect(requirement(maintenance)).toHaveAttribute("aria-expanded", "false");
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
        name: "View evidence",
      }),
    ).toBeVisible();
    await user.click(
      requirement(/Safe-work planning & permits.*Planning and permit issuing/),
    );
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(requirement(maintenance)).toHaveAttribute("aria-expanded", "false");
    expect(
      await screen.findByRole("button", {
        name: "View evidence",
      }),
    ).toBeVisible();
  });

  it("navigates exact source text, retains original fields, traps focus and returns to the expanded row", async () => {
    const user = setup();
    const inspect = await openPump(user);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByText("Record 3 of 18")).toBeVisible(),
    );
    expect(
      within(dialog).queryByText(/date discrepancy is unresolved/),
    ).not.toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous evidence record" }),
    );
    await user.selectOptions(
      within(dialog).getByLabelText("Select supporting record"),
      "0",
    );
    expect(within(dialog).getByText("Needs checking:")).toBeVisible();
    expect(
      within(dialog).getByText(/18 matching logbook entries/),
    ).toBeVisible();
    expect(within(dialog).getByText("Source details")).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Flag record for review" }),
    );
    expect(
      within(dialog).getByRole("button", { name: "Record flagged · undo" }),
    ).toBeVisible();
    expect(
      within(dialog).getByText(/date discrepancy is unresolved/),
    ).toBeVisible();
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
    expect(within(dialog).getByText("Record 2 of 18")).toBeVisible();
    await user.click(
      within(dialog).getByRole("button", { name: "Previous evidence record" }),
    );
    await waitFor(() =>
      expect(within(dialog).getByText("Record 1 of 18")).toBeVisible(),
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
    await writeQuestion(user);
    await user.click(
      screen.getByRole("button", { name: /Discussion with Eimhin/ }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Edit question" }),
    );
    const input = await screen.findByRole("textbox", {
      name: "Question for Eimhin",
    });
    await user.clear(input);
    await user.type(input, "Which repairs did you complete independently?");
    await user.click(screen.getByRole("button", { name: "Save question" }));
    expect(
      within(screen.getByRole("dialog")).getByText(
        "Which repairs did you complete independently?",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Interested",
    );
  });

  it("retains qualification records, verification flags and supporting modules", async () => {
    const user = setup();
    await user.click(requirement(/Sea survival.*Training recorded/));
    await user.click(
      await screen.findByRole("button", { name: "View training record" }),
    );
    expect(await screen.findByText("LH500010")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /qualification check/i }),
    ).not.toBeInTheDocument();
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
      screen.getByRole("button", { name: "Prepare candidate introduction" }),
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
    expect(
      screen.getByText(/Your assessment:/).parentElement,
    ).toHaveTextContent("Not currently suitable");
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
      requirement(/Offshore medical fitness.*No clearance record found/),
    ).toBeVisible();
  });
});

it("keeps discussion topics unique and distinct from qualification checks", async () => {
  const user = setup();
  await writeQuestion(user, "sea");
  await writeQuestion(user, "sea");
  expect(
    screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("checkbox", { name: "Check Sea survival" }),
  ).not.toBeInTheDocument();
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
        name: "View evidence",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const previous = within(dialog).getByRole("button", {
      name: "Previous evidence record",
    });
    while (!previous.disabled) await user.click(previous);
    for (const record of getSources(
      claims.find((c) => c.id === prefix.slice(0, -1)),
    )) {
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
  await writeQuestion(user, "pump");
  await writeQuestion(user, "electrical");
  expect(
    screen.getByRole("button", { name: "Discussion with Eimhin (2)" }),
  ).toBeVisible();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});

it("keeps all four training records reachable in their experience or qualification context", async () => {
  const user = setup();
  for (const [row, id, supporting] of [
    [/Sea survival.*Training recorded/, "LH500010", false],
    [/Fire prevention and response.*Attendance recorded/, "LH500003", false],
    [maintenance, "LH500008", true],
    [/Electrical fault-finding & control/, "LH500001", true],
  ]) {
    await user.click(requirement(row));
    await user.click(
      await screen.findByRole("button", { name: "View training record" }),
    );
    const dialog = await screen.findByRole("dialog");
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
  await user.click(screen.getByRole("button", { name: "Add task" }));
  await user.type(
    await screen.findByRole("textbox", { name: "Task" }),
    "Check Sea survival",
  );
  await user.click(screen.getByRole("button", { name: "Save task" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  const checks = screen.getByRole("region", { name: "Next steps" });
  expect(
    within(checks).getByRole("checkbox", { name: "Check Sea survival" }),
  ).toBeVisible();
  await user.click(
    within(checks).getByRole("button", {
      name: "Remove task: Check Sea survival",
    }),
  );
  expect(
    screen.queryByRole("checkbox", { name: "Check Sea survival" }),
  ).not.toBeInTheDocument();
});

it("shows experience facts directly and keeps supporting-module actions in the inspector", async () => {
  const user = setup();
  await user.click(requirement(maintenance));
  const panel = await screen.findByRole("region", { name: maintenance });
  expect(
    within(panel).queryByText(
      /This work is relevant|assisted or supervised|Supporting module/,
    ),
  ).not.toBeInTheDocument();
  expect(
    within(panel).getByText(
      "Passed on 4 May 2023. Training record expires 5 December 2028.",
    ),
  ).toBeVisible();

  expect(within(panel).getByText(/18 matching logbook entries/)).toBeVisible();
  expect(within(panel).queryByText(/joining date/)).not.toBeInTheDocument();
  expect(within(panel).getByText(/Five are from 2024–2026/)).toBeVisible();
  expect(
    within(panel).queryByRole("button", {
      name: /follow-up|qualification check/i,
    }),
  ).not.toBeInTheDocument();
  await user.click(
    within(panel).getByRole("button", { name: "View training record" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(
    within(dialog).queryByRole("button", {
      name: /follow-up|qualification check/i,
    }),
  ).not.toBeInTheDocument();
  expect(
    within(dialog).queryByText(/Fictional assessment:/),
  ).not.toBeInTheDocument();
});

it("uses plain qualification copy and visible buttons without redundant headings", async () => {
  const user = setup();
  for (const name of [
    /Sea survival/,
    /Fire prevention and response/,
    /First aid/,
    /Working-at-height certification/,
    /Offshore medical fitness/,
  ]) {
    await user.click(requirement(name));
    const panel = (await screen.findAllByRole("region", { name }))[0];
    expect(
      within(panel).queryByText("Available qualification evidence"),
    ).not.toBeInTheDocument();
    expect(within(panel).queryByText(/Next step:/)).not.toBeInTheDocument();
    expect(within(panel).queryByText(/As of/)).not.toBeInTheDocument();
    expect(
      within(panel).queryByRole("button", {
        name: /follow-up|qualification check/i,
      }),
    ).not.toBeInTheDocument();
    for (const button of within(panel).queryAllByRole("button"))
      expect(button).toHaveAttribute("data-variant", "default");
  }
});
