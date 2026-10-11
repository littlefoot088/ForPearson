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
  const discussionOptions = screen.queryAllByRole("button", {
    name: /Options for discussion:/,
  });
  if (discussionOptions.length) {
    await user.click(discussionOptions[0]);
    await user.click(
      await screen.findByRole("menuitem", { name: "Add discussion item" }),
    );
  } else {
    await user.click(
      screen.getByRole("button", {
        name: "Options for task: Check existing offshore certificates",
      }),
    );
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Prepare discussion questions",
      }),
    );
  }
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
    const entries = dialog.querySelectorAll(".evidence-timeline > li");
    expect(entries).toHaveLength(18);
    expect(
      within(dialog).getAllByRole("checkbox", { name: "Exclude this record" }),
    ).toHaveLength(18);
    expect(
      within(entries[0]).getByRole("checkbox"),
    ).toHaveAccessibleDescription(/Date needs checking/);
    expect(
      within(entries[2]).getByRole("checkbox"),
    ).not.toHaveAccessibleDescription();
    expect(
      within(dialog).queryByLabelText("Select supporting record"),
    ).not.toBeInTheDocument();
    const first = within(entries[0]);
    await waitFor(() => expect(first.getByRole("checkbox")).toBeVisible());
    expect(entries[0].querySelector("pre")).not.toBeVisible();
    expect(
      first.getByRole("button", {
        name: "Flag record for review",
        hidden: true,
      }),
    ).not.toBeVisible();
    await user.click(first.getByText("View source details"));
    expect(entries[0].querySelector("pre")).toBeVisible();
    await user.click(
      first.getByRole("button", { name: "Flag record for review" }),
    );
    expect(
      first.getByRole("button", { name: "Record flagged · undo" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(entries[1]).getByRole("button", {
        hidden: true,
        name: "Flag record for review",
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await user.click(
      first.getByRole("button", { name: "Record flagged · undo" }),
    );
    const quote = entries[0].querySelector("blockquote");
    const original = sourceRecords.find(
      (r) => r.original === quote.textContent,
    );
    expect(original).toBeDefined();
    expect(quote.querySelector("mark").textContent).toBe(original.highlight);
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
      screen.getByRole("button", {
        name: "Options for discussion: Pump maintenance & repair",
      }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit question" }),
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
    await user.click(requirement(/Sea survival.*Module passed/));
    await user.click(
      await screen.findByRole("button", { name: "View training record" }),
    );
    expect(await screen.findByText("LH500010")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /qualification check/i }),
    ).not.toBeInTheDocument();
  });
  it("shows interest from the agreed conversation scenario and keeps current and prospective roles explicit", async () => {
    setup();
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Interested",
    );
    expect(
      screen.getByRole("checkbox", {
        name: "Discuss Eimhin’s career and offshore working preferences",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Current role:/).parentElement).toHaveTextContent(
      "Lighthouse keeper · Carrowmore Light Authority",
    );
    expect(
      screen.getByText("Opportunity being assessed").parentElement,
    ).toHaveTextContent("Wind Turbine Technician · Carrowmore Array");
    expect(
      screen.queryByRole("button", { name: "Prepare candidate introduction" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Suggest to Eimhin" }),
    ).not.toBeInTheDocument();
  });
  it("keeps assessment and response editable without resolving evidence", async () => {
    const user = setup();
    const edit = screen.getByRole("button", { name: "Record decision" });
    await user.click(edit);
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Your assessment" }),
      "not-suitable",
    );
    await user.click(screen.getByRole("button", { name: "Save assessment" }));
    await waitFor(() => expect(edit).toHaveFocus());
    expect(
      screen.getByRole("heading", { name: "Not currently suitable" }),
    ).toHaveTextContent("Not currently suitable");
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
    expect(
      requirement(/Offshore medical fitness.*Clearance not recorded/),
    ).toBeVisible();
  });
});

it("keeps discussion topics unique and distinct from qualification checks", async () => {
  const user = setup();
  await writeQuestion(user, "sea");
  await writeQuestion(user, "sea");
  expect(
    screen.getByRole("checkbox", { name: "Discuss Sea survival" }),
  ).not.toBeChecked();
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
    const records = getSources(
      claims.find((c) => c.id === prefix.slice(0, -1)),
    );
    const entries = dialog.querySelectorAll(".evidence-timeline > li");
    expect(entries).toHaveLength(records.length);
    for (const [index, record] of [...records]
      .sort((a, b) => a.date.localeCompare(b.date))
      .entries()) {
      const quote = entries[index].querySelector("blockquote");
      expect(quote.textContent).toBe(record.original);
      expect(quote.querySelector("mark").textContent).toBe(record.highlight);
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
    screen.getByRole("checkbox", {
      name: "Discuss Pump maintenance & repair",
    }),
  ).not.toBeChecked();
  expect(
    screen.getByRole("checkbox", {
      name: "Discuss Electrical fault-finding & control",
    }),
  ).not.toBeChecked();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent("Interested");
});

it("keeps all four training records reachable in their experience or qualification context", async () => {
  const user = setup();
  for (const [row, id, supporting] of [
    [/Sea survival.*Module passed/, "LH500010", false],
    [/Fire prevention and response.*Attendance only/, "LH500003", false],
    [maintenance, "LH500008", true],
    [/Electrical fault-finding & control/, "LH500001", true],
  ]) {
    await user.click(requirement(row));
    await user.click(
      await screen.findByRole("button", { name: "View training record" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByText("View source details"));
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
      name: "Options for task: Check Sea survival",
    }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Remove task" }),
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

  expect(
    within(panel).getByText(/18 repair and maintenance entries/),
  ).toBeVisible();
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

it("puts qualification gaps in scan view and keeps optional experience in role details", async () => {
  const user = setup();
  expect(
    screen.getByRole("heading", { name: "Why this could work" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("heading", { name: "Additional employer preferences" }),
  ).not.toBeInTheDocument();
  expect(requirement(/Sea survival.*Module passed/)).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(requirement(/Safe-work planning.*Employer preference/)).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: /Working conditions.*Not yet discussed/,
    }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "View role details" }));
  await waitFor(() =>
    expect(
      within(screen.getByRole("dialog")).getByText(
        /Took the AK round the plant/,
      ),
    ).toBeVisible(),
  );
});

it("reviews suitability before promoting introduction preparation", async () => {
  const user = setup();
  const earlyDraft = screen.queryByRole("button", {
    name: "Prepare candidate introduction",
  });
  expect(earlyDraft).not.toBeInTheDocument();
  expect(
    screen.queryByText("Candidate introduction", { exact: true }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Not prepared", { exact: true }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Record decision" }));
  await user.selectOptions(
    await screen.findByRole("combobox", { name: "Your assessment" }),
    "worth-discussing",
  );
  await user.click(screen.getByRole("button", { name: "Save assessment" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole("button", { name: "Prepare candidate introduction" }),
  ).not.toHaveAttribute("data-variant", "subtle");
  await user.click(screen.getByRole("button", { name: "Change decision" }));
  await user.selectOptions(
    await screen.findByRole("combobox", { name: "Your assessment" }),
    "needs-clarification",
  );
  await user.click(screen.getByRole("button", { name: "Save assessment" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Prepare follow-up discussion" }),
    ).toBeVisible(),
  );
});

it("separates manager appraisal from logbooks and hides technical provenance", async () => {
  const user = setup();
  await openPump(user);
  const dialog = await screen.findByRole("dialog");
  expect(dialog.querySelector("pre")).not.toBeVisible();
  expect(
    within(dialog).queryByRole("button", { name: "Next evidence record" }),
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(within(dialog).getByText("Manager appraisal · 2026")).toBeVisible(),
  );
  expect(
    dialog.querySelector('[aria-label="Manager appraisal"] blockquote'),
  ).toHaveTextContent("go-to for the pumps");
  expect(
    dialog.querySelector('[aria-label="Manager appraisal"] blockquote'),
  ).not.toHaveTextContent("switchgear");
  await user.click(
    within(dialog.querySelector('[aria-label="Manager appraisal"]')).getByText(
      "View source details",
    ),
  );
  expect(within(dialog).getByText(/AP000013/)).toBeVisible();
});
