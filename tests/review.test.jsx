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

  it("saves, edits and removes a draft without altering either decision", async () => {
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
      screen.getByRole("button", { name: "Worth progressing" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Clarification needed" }),
    ).toHaveAttribute("aria-pressed", "false");
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

  it("keeps both decisions independently reversible and requirements unchanged", async () => {
    const user = setup();
    const progress = screen.getByRole("button", { name: "Worth progressing" });
    const clarify = screen.getByRole("button", {
      name: "Clarification needed",
    });
    for (const [button, values] of [
      [progress, ["true", "false"]],
      [clarify, ["true", "true"]],
      [progress, ["false", "true"]],
      [clarify, ["false", "false"]],
    ]) {
      await user.click(button);
      expect(progress).toHaveAttribute("aria-pressed", values[0]);
      expect(clarify).toHaveAttribute("aria-pressed", values[1]);
      expect(
        requirement(/Offshore medical fitness.*Not established/),
      ).toBeInTheDocument();
    }
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
});
