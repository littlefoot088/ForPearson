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
      expect(within(dialog).getByText("Record 1 of 5")).toBeVisible(),
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
      name: "Question for the keeper",
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
      screen.getByText(/Officer assessment:/).parentElement,
    ).toHaveTextContent("Not reviewed");
    expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
      "Not yet discussed",
    );
    await user.click(
      screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Edit question" }),
    );
    input = await screen.findByRole("textbox", {
      name: "Question for the keeper",
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
      await screen.findByRole("button", { name: "Check qualification" }),
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
      screen.getByRole("button", { name: "Check qualification" }),
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
  it("keeps career preferences unknown while allowing a contextual discussion draft", async () => {
    const user = setup();
    const discuss = screen.getByRole("button", {
      name: "Add preferences to discussion",
    });
    expect(
      screen.getByText("Career preferences not yet discussed"),
    ).toBeVisible();
    await user.click(discuss);
    const input = await screen.findByRole("textbox", {
      name: "Question for the keeper",
    });
    expect(input.value).toContain("What would you like to do next");
    await user.click(screen.getByRole("button", { name: "Save question" }));
    await waitFor(() => expect(discuss).toHaveFocus());
    expect(
      screen.getByText("Career preferences not yet discussed"),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
    );
    await user.click(await screen.findByRole("button", { name: "Remove" }));
    await waitFor(() => expect(discuss).toHaveFocus());
  });

  it("separates suggestion, simulated response and nomination with explicit gap acknowledgement", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Suggest to keeper" }));
    await user.click(
      await screen.findByRole("button", { name: "Record suggestion locally" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Awaiting keeper response")).toBeVisible();
    expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
      "Suggested to keeper",
    );
    expect(
      screen.queryByRole("button", { name: "Consider for nomination" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Record keeper response" }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", {
        name: "Simulated keeper response",
      }),
      "interested",
    );
    await user.click(
      screen.getByRole("button", { name: "Save simulated response" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
      "Interested · simulated response",
    );
    expect(
      screen.getByText("Career preferences not yet discussed"),
    ).toBeVisible();
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
      requirement(/Offshore medical fitness.*Not established/),
    ).toBeVisible();
    await user.click(
      await screen.findByRole("button", {
        name: "Record keeper response",
      }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", {
        name: "Simulated keeper response",
      }),
      "not-interested",
    );
    await user.click(
      screen.getByRole("button", { name: "Save simulated response" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Keeper declined · no nomination")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Review nomination decision" }),
    ).not.toBeInTheDocument();
  });

  it("records officer judgement separately and follows up a request for more information", async () => {
    const user = setup();
    await user.click(
      await screen.findByRole("button", {
        name: "Update officer assessment",
      }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Officer assessment" }),
      "worth-discussing",
    );
    await user.click(screen.getByRole("button", { name: "Save assessment" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Update officer assessment" }),
      ).toHaveFocus(),
    );
    expect(
      screen.getByText(/Officer assessment:/).parentElement,
    ).toHaveTextContent("Worth discussing");
    expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
      "Not yet discussed",
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Record keeper response",
      }),
    );
    await user.selectOptions(
      await screen.findByRole("combobox", {
        name: "Simulated keeper response",
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
      (await screen.findByRole("textbox", { name: "Question for the keeper" }))
        .value,
    ).toContain("What more would you like to know");
  });
});

it("keeps discussion topics unique and distinct from qualification checks", async () => {
  const user = setup();
  await user.click(requirement(/Sea survival.*Module recorded/));
  await user.click(
    await screen.findByRole("button", { name: "Check qualification" }),
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
    name: "Question for the keeper",
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
  expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
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
    name: "Question for the keeper",
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
  expect(screen.getByText(/Interest:/).parentElement).toHaveTextContent(
    "Not yet discussed",
  );
  expect(
    screen.getByRole("button", { name: "Suggest to keeper" }),
  ).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Discussion with Eimhin (1)" }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Edit question" }),
  );
  expect(
    await screen.findByRole("textbox", { name: "Question for the keeper" }),
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
