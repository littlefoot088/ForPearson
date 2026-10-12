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
  expect(screen.getByText("Fintan Ó Ceallaigh")).toBeInTheDocument();
  await user.type(
    screen.getByRole("textbox", { name: "Search by name" }),
    "Eimhin",
  );
  expect(
    screen.getByRole("heading", { name: "Eimhin Mac Neidhe" }),
  ).toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Employment intention" }),
    "Planning retirement",
  );
  await user.click(screen.getByRole("checkbox", { name: "Needs attention" }));
  expect(
    screen.getByText("No people match these filters."),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByText("6 people shown")).toBeInTheDocument();
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
  expect(document.documentElement.dataset.carrowmoreIdentity).toBe("quiet");
  expect(document.getElementById("main")).toHaveFocus();
  await user.click(
    screen.getByRole("checkbox", {
      name: "Discuss Eimhin’s maintenance experience",
    }),
  );
  await user.click(screen.getByRole("link", { name: "People" }));
  await screen.findByRole("heading", { name: "Redeployment workspace" });
  expect(document.documentElement.dataset.carrowmoreIdentity).toBe("quiet");
  expect(screen.getByRole("textbox", { name: "Search by name" })).toHaveValue(
    "Eimhin",
  );
  expect(
    screen.getByRole("checkbox", { name: "Needs attention" }),
  ).toBeChecked();
  const eimhin = screen.getByRole("region", { name: "Eimhin Mac Neidhe" });
  expect(within(eimhin).getAllByText("Review suitability")).toHaveLength(3);
  expect(
    within(eimhin).queryByText("Check existing offshore certificates"),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("link", { name: "Wind Turbine Technician" }),
  );
  expect(
    await screen.findByRole("checkbox", {
      name: "Discuss Eimhin’s maintenance experience",
    }),
  ).toBeChecked();
  expect(
    JSON.parse(localStorage.getItem(storageKey)).workspace.tasks[1].done,
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

it("opens a profile, edits career context, adds an opportunity and returns through the assessment without losing filters", async () => {
  const user = userEvent.setup();
  mount();
  await user.type(screen.getByRole('textbox', {name:'Search by name'}), 'Eimhin');
  await user.click(screen.getByRole('link', {name:'View profile for Eimhin Mac Neidhe'}));
  await screen.findByRole('heading', {name:'Career context'});
  expect(screen.getByRole('heading', {name:'Opportunities under consideration'})).toBeVisible();
  await user.click(screen.getByRole('button', {name:'Edit career context'}));
  await user.selectOptions(await screen.findByRole('combobox', {name:'Employment intention'}),'Seeking employment');
  await user.type(screen.getByRole('textbox', {name:'Career preferences'}),'Shore-based maintenance');
  await user.click(screen.getByRole('button', {name:'Save career context'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('Shore-based maintenance')).toBeVisible();
  await user.click(screen.getByRole('button', {name:'Explore opportunities'}));
  expect(await screen.findByRole('combobox', {name:'Opportunity'})).toHaveValue('survey');
  await user.click(screen.getByRole('button', {name:'Add opportunity'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('Offshore Survey Technician')).toBeVisible();
  expect(screen.queryByRole('link',{name:'Offshore Survey Technician'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', {name:'Wind Turbine Technician'}));
  await screen.findByRole('heading',{name:'Relevant experience'});
  await user.click(screen.getByRole('link',{name:'Eimhin Mac Neidhe'}));
  await screen.findByRole('heading',{name:'Career context'});
  expect(screen.getByText('Shore-based maintenance')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Explore opportunities'}));
  await waitFor(()=>expect(screen.getByText('All available vacancies have already been considered for this keeper.')).toBeVisible());
  await user.keyboard('{Escape}');
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(screen.getByRole('link',{name:'People'}));
  await screen.findByRole('heading',{name:'Redeployment workspace'});
  expect(screen.getByRole('textbox',{name:'Search by name'})).toHaveValue('Eimhin');
  expect(screen.getByText('Offshore Survey Technician')).toBeVisible();
}, 15000);

it('retirement and employment-arranged profiles do not prompt another search',async()=>{
 const user=userEvent.setup();mount();
 await user.click(screen.getByRole('link',{name:'View profile for Fintan Ó Ceallaigh'}));
 await screen.findByRole('heading',{name:'Career context'});
 expect(screen.queryByRole('button',{name:'Explore opportunities'})).not.toBeInTheDocument();
 expect(screen.getByText('Planning retirement. No placement opportunities are being suggested.')).toBeVisible();
 await user.click(screen.getByRole('link',{name:'People'}));
 await user.click(await screen.findByRole('link',{name:'View profile for Cian Ó Dálaigh'}));
 await screen.findByRole('heading',{name:'Career context'});
 expect(screen.getByText('Employment arranged. No further job search is needed.')).toBeVisible();
 expect(screen.queryByRole('button',{name:'Explore opportunities'})).not.toBeInTheDocument();
});
