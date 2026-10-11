import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
import { assessmentHash } from "../src/people";
import { storageKey } from "../src/workspace";
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});
const mount = () =>
  render(
    <MantineProvider theme={theme} forceColorScheme="light">
      <App />
    </MantineProvider>,
  );
it("opens a people-first list and combines search, intention and attention filters", async () => {
  const user = userEvent.setup();
  mount();
  expect(
    screen.getByRole("heading", { name: "Redeployment workspace" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Wind Turbine Technician" }),
  ).toHaveAttribute("href", assessmentHash);
  expect(
    screen.queryByRole("link", { name: "Marine Electrician" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("No employment recommendations")).toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Search by name" }),
    "aoife ni mhurchu",
  );
  expect(
    screen.getByRole("heading", { name: "Aoife Ní Mhurchú" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Eimhin Mac Neidhe" }),
  ).not.toBeInTheDocument();
  await user.clear(screen.getByRole("textbox", { name: "Search by name" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Employment intention" }),
    "Planning retirement",
  );
  expect(
    screen.getByRole("heading", { name: "Fintan Ó Ceallaigh" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Needs attention" }));
  expect(
    screen.getByText("No people match these filters."),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByText("4 people shown")).toBeInTheDocument();
});
it("navigates directly to the assessment and back without resetting tasks or saved state", async () => {
  const user = userEvent.setup();
  mount();
  await user.type(
    screen.getByRole("textbox", { name: "Search by name" }),
    "Eimhin",
  );
  await user.click(screen.getByRole("checkbox", { name: "Needs attention" }));
  await user.click(
    screen.getByRole("link", { name: "Wind Turbine Technician" }),
  );
  await screen.findByRole("heading", { name: "Relevant experience" });
  expect(document.getElementById("main")).toHaveFocus();
  await user.click(
    screen.getByRole("checkbox", {
      name: "Check existing offshore certificates",
    }),
  );
  await user.click(screen.getByRole("link", { name: "People" }));
  await screen.findByRole("heading", { name: "Redeployment workspace" });
  expect(screen.getByRole("textbox", { name: "Search by name" })).toHaveValue(
    "Eimhin",
  );
  expect(
    screen.getByRole("checkbox", { name: "Needs attention" }),
  ).toBeChecked();
  const eimhin = screen.getByRole("region", { name: "Eimhin Mac Neidhe" });
  expect(
    within(eimhin).getByText("Discuss Eimhin’s maintenance experience"),
  ).toBeInTheDocument();
  expect(
    within(eimhin).queryByText("Check existing offshore certificates"),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("link", { name: "Wind Turbine Technician" }),
  );
  expect(
    await screen.findByRole("checkbox", {
      name: "Check existing offshore certificates",
    }),
  ).toBeChecked();
  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.tasks[0].done,
  ).toBe(true);
  // Skip link must not be interpreted as a route back to People.
  await user.click(
    screen.getByRole("link", { name: "Skip to opportunity assessment" }),
  );
  await waitFor(() => expect(window.location.hash).toBe(assessmentHash));
  expect(
    screen.getByRole("heading", { name: "Relevant experience" }),
  ).toBeInTheDocument();
});
