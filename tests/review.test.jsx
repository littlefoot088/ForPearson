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
const maintenance = /Mechanical or electrical maintenance.*Evidence found/;

async function openPump(user) {
  await user.click(requirement(maintenance));
  const inspect = await screen.findByRole("button", {
    name: "Inspect 5 records",
  });
  await user.click(inspect);
  return inspect;
}

describe("Mantine review interactions", () => {
  it("starts collapsed and opens one named assessment across all groups", async () => {
    const user = setup();
    expect(
      screen.queryByRole("button", { name: "Inspect 5 records" }),
    ).not.toBeInTheDocument();
    const control = requirement(maintenance);
    control.focus();
    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("region", { name: maintenance }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Inspect 4 records" }),
    ).toBeVisible();
    await user.click(
      requirement(/Permit-system experience.*Needs clarification/),
    );
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "Inspect 5 records" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Inspect 2 records" }),
    ).toBeVisible();
  });

  it("navigates exact source text, retains original fields, traps focus and returns to the expanded row", async () => {
    const user = setup();
    const inspect = await openPump(user);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByText("Record 1 of 5")).toBeVisible(),
    );
    expect(within(dialog).getByText("Employment-date context")).toBeVisible();
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
        name: "View original record fields",
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
    await openPump(user);
    await user.click(
      await screen.findByRole("button", { name: "Draft a clarification" }),
    );
    let input = await screen.findByRole("textbox", {
      name: "Question for the keeper",
    });
    await user.clear(input);
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDisabled();
    await user.type(
      input,
      "Which pump repairs did you complete independently?",
    );
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Officer assessment:/).parentElement,
    ).toHaveTextContent("Not reviewed");
    expect(screen.getByText(/Keeper interest:/)).toHaveTextContent(
      "Not yet discussed",
    );
    await user.click(screen.getByRole("button", { name: "Review draft (1)" }));
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
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(
      screen.getByText(
        "Which pump repairs did you complete independently? Please give an example.",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(requirement(maintenance)).toHaveFocus());
    expect(
      screen.queryByRole("button", { name: "Review draft (1)" }),
    ).not.toBeInTheDocument();
  });

  it("retains qualification records, verification flags and supporting modules", async () => {
    const user = setup();
    await user.click(requirement(/Sea survival.*Module recorded/));
    await user.click(
      await screen.findByRole("button", { name: "Flag for verification" }),
    );
    expect(
      screen.getByRole("button", { name: "Flagged for verification" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(
      screen.getByRole("button", { name: "View training record" }),
    );
    await waitFor(() => expect(screen.getByText("LH500010")).toBeVisible());
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "Flagged for verification" }),
    );
    expect(
      screen.getByRole("button", { name: "Flag for verification" }),
    ).toHaveAttribute("aria-pressed", "false");
    await user.click(requirement(maintenance));
    await user.click(
      await screen.findByRole("button", {
        name: "Related training records (2)",
      }),
    );
    expect(
      await screen.findAllByRole("button", { name: "View training record" }),
    ).toHaveLength(2);
  });
  it("keeps career preferences unknown while allowing a contextual discussion draft", async () => {
    const user = setup();
    const discuss = screen.getByRole("button", { name: "Discuss preferences" });
    expect(
      screen.getByText("Career preferences not yet discussed"),
    ).toBeVisible();
    await user.click(discuss);
    const input = await screen.findByRole("textbox", {
      name: "Question for the keeper",
    });
    expect(input.value).toContain("What would you like to do next");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(discuss).toHaveFocus());
    expect(
      screen.getByText("Career preferences not yet discussed"),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Review draft (1)" }));
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
    expect(screen.getByText(/Keeper interest:/)).toHaveTextContent(
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
    expect(screen.getByText(/Keeper interest:/)).toHaveTextContent(
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
      screen.getByRole("button", { name: "More opportunity actions" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Record or revise keeper response",
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
      screen.getByRole("button", { name: "More opportunity actions" }),
    );
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
        screen.getByRole("button", { name: "More opportunity actions" }),
      ).toHaveFocus(),
    );
    expect(
      screen.getByText(/Officer assessment:/).parentElement,
    ).toHaveTextContent("Worth discussing");
    expect(screen.getByText(/Keeper interest:/)).toHaveTextContent(
      "Not yet discussed",
    );
    await user.click(
      screen.getByRole("button", { name: "More opportunity actions" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Record or revise keeper response",
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
    await user.click(screen.getByRole("button", { name: "Draft follow-up" }));
    expect(
      (await screen.findByRole("textbox", { name: "Question for the keeper" }))
        .value,
    ).toContain("What more would you like to know");
  });
});
