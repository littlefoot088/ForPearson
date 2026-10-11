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

afterEach(cleanup);
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
      "Not yet discussed",
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
  it("keeps interest read-only and prepares preference questions through the discussion", async () => {
    const user = setup();
    const interest = screen.getByRole("region", {
      name: "Eimhin’s interest in this role",
    });
    expect(
      within(interest).queryByRole("button", {
        name: "Record Eimhin’s response",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Prepare a question" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/His career plans/)).not.toBeInTheDocument();
    expect(screen.getByText(/Current role:/).parentElement).toHaveTextContent(
      "Lighthouse keeper · Carrowmore Light Authority",
    );
    expect(
      screen.getByText("Opportunity being assessed").parentElement,
    ).toHaveTextContent("Wind Turbine Technician · Carrowmore Array");
    await user.click(
      screen.getByRole("button", { name: "Prepare discussion" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Add topic: Interest and offshore working preferences",
      }),
    );
    const input = await screen.findByRole("textbox", {
      name: "Question for Eimhin",
    });
    expect(input.value).toContain("Would you like to explore");
    await user.click(screen.getByRole("button", { name: "Save question" }));
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Not yet discussed",
    );
  });

  it("separates suggestion, simulated response and nomination with explicit gap acknowledgement", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Suggest to Eimhin" }));
    await user.click(
      await screen.findByRole("button", { name: "Record suggestion locally" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Awaiting Eimhin’s response")).toBeVisible();
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Suggested to Eimhin",
    );
    expect(
      screen.queryByRole("button", { name: "Consider for nomination" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Record Eimhin’s response" }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", {
        name: "Simulated response from Eimhin",
      }),
      "interested",
    );
    await user.click(
      screen.getByRole("button", { name: "Save simulated response" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Interested · simulated response",
    );

    await user.click(
      screen.getByRole("button", { name: "Consider for nomination" }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Nomination decision" }),
      "recommend",
    );
    const save = screen.getByRole("button", {
      name: "Save nomination decision",
    });
    expect(save).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: "Decision rationale" }),
      "Relevant maintenance evidence; ask the employer to consider the recorded gaps.",
    );
    expect(save).toBeDisabled();
    await user.click(
      screen.getByRole("checkbox", {
        name: /I acknowledge the unresolved requirements/,
      }),
    );
    await user.click(save);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText("Nomination decision recorded · not submitted"),
    ).toBeVisible();
    expect(
      requirement(/Offshore medical fitness.*Clearance not established/),
    ).toBeVisible();
    await user.click(
      await screen.findByRole("button", {
        name: "Record Eimhin’s response",
      }),
    );
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
    expect(screen.getByText("Eimhin declined · no nomination")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Review nomination decision" }),
    ).not.toBeInTheDocument();
  });

  it("records officer judgement separately and follows up a request for more information", async () => {
    const user = setup();
    await user.click(
      await screen.findByRole("button", {
        name: "Update your assessment",
      }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Your assessment" }),
      "worth-discussing",
    );
    await user.click(screen.getByRole("button", { name: "Save assessment" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Update your assessment" }),
      ).toHaveFocus(),
    );
    expect(
      screen.getByText(/Your assessment:/).parentElement,
    ).toHaveTextContent("Worth discussing");
    expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
      "Not yet discussed",
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Record Eimhin’s response",
      }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", {
        name: "Simulated response from Eimhin",
      }),
      "more-information",
    );
    await user.click(
      screen.getByRole("button", { name: "Save simulated response" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "Prepare follow-up discussion" }),
    );
    expect(
      (await screen.findByRole("textbox", { name: "Question for Eimhin" }))
        .value,
    ).toContain("What more would you like to know");
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
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
    "Not yet discussed",
  );
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

it("prepares optional discussion topics without recording a suggestion or consent", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Prepare discussion" }));
  const dialog = await screen.findByRole("dialog");
  expect(
    within(dialog).queryByRole("button", { name: "Remove" }),
  ).not.toBeInTheDocument();
  await user.click(
    within(dialog).getByRole("button", {
      name: "Add topic: Existing offshore safety certificates",
    }),
  );
  const input = await screen.findByRole("textbox", {
    name: "Question for Eimhin",
  });
  expect(input).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Save question" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Edit question" })).toBeVisible(),
  );
  expect(screen.getByRole("dialog")).toContainElement(document.activeElement);
  expect(
    screen.queryByRole("button", {
      name: "Add topic: Existing offshore safety certificates",
    }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
    ).toHaveFocus(),
  );
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
    "Not yet discussed",
  );
  expect(
    screen.getByRole("button", { name: "Suggest to Eimhin" }),
  ).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Edit question" }),
  );
  expect(
    await screen.findByRole("textbox", { name: "Question for Eimhin" }),
  ).toHaveValue(input.value);
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
  const checks = screen.getByLabelText("Qualification checks");
  expect(checks).toHaveTextContent("No qualification has been verified");
  await user.click(
    within(checks).getByRole("button", { name: /Remove check:/ }),
  );
  expect(
    screen.queryByLabelText("Qualification checks"),
  ).not.toBeInTheDocument();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
    "Not yet discussed",
  );
});

it("saves editable personal notes independently of the assessment and Eimhin’s response", async () => {
  const user = setup();
  const workspace = screen.getByRole("complementary", {
    name: "Your review workspace",
  });
  const input = within(workspace).getByRole("textbox", {
    name: "Conversation notes and reminders",
  });
  const save = within(workspace).getByRole("button", { name: "Save notes" });
  expect(save).toBeDisabled();
  await user.type(
    input,
    "Ask Eimhin which certificates he can bring to our discussion.",
  );
  await user.click(save);
  expect(within(workspace).getByText("Notes saved.")).toBeVisible();
  expect(save).toBeDisabled();
  expect(screen.getByTestId("keeper-interest")).toHaveTextContent(
    "Not yet discussed",
  );
  expect(screen.getByText(/Your assessment:/).parentElement).toHaveTextContent(
    "Not reviewed",
  );
  await user.clear(input);
  await user.click(save);
  expect(input).toHaveValue("");
  expect(save).toBeDisabled();
});
