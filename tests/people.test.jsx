import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import App from "../src/App";
import { theme } from "../src/theme";
import { assessmentHash, profileHash } from "../src/people";
import { initialWorkspace, persistWorkspace, storageKey } from "../src/workspace";
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
const openProfileRoute = async (id) => {
  await act(async () => {
    window.location.hash = profileHash(id);
    window.dispatchEvent(new Event('hashchange'));
  });
};
it("opens a people-first list and combines search, intention and attention filters", async () => {
  const user = userEvent.setup();
  mount();
  expect(
    screen.getByRole("heading", { name: "Redeployment workspace" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Wind Turbine Technician" }),
  ).toHaveAttribute("href", assessmentHash);
  expect(screen.queryByRole('link', {name: /View profile/})).not.toBeInTheDocument();
  const eimhin = screen.getByRole('region', { name: 'Eimhin Mac Neidhe' });
  expect(within(eimhin).getByText('Seeking employment')).toBeVisible();
  expect(within(eimhin).getByText('Marine Electrician')).toBeVisible();
  expect(within(eimhin).getByText('Watch Officer')).toBeVisible();
  const coilean = screen.getByRole('region', { name: 'Coilean Ó Caomhthaigh' });
  expect(within(coilean).getByText('Clarify employment plans')).toBeVisible();
  expect(within(coilean).queryByText('Offshore Survey Technician')).not.toBeInTheDocument();
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
  const workspace = initialWorkspace();
  workspace.keeperProfiles.K0104 = { intention: 'Seeking employment', preferences: '' };
  persistWorkspace(localStorage, { workspace, drafts: [], recordFlags: [] });
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
  expect(screen.queryByRole('link', {name:'Eimhin Mac Neidhe'})).not.toBeInTheDocument();
  expect(screen.getByRole('link', {name:'People'})).toHaveAttribute('href', '#people');
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

it("explains the profile, preserves selections and edits career context across the assessment journey", async () => {
  const user = userEvent.setup();
  const workspace = initialWorkspace();
  workspace.keeperProfiles.K0104 = { intention: 'Seeking employment', preferences: '', opportunityIds: ['survey'] };
  workspace.tasks[1].done = true;
  persistWorkspace(localStorage, { workspace, drafts: [], recordFlags: [] });
  mount();
  await user.type(screen.getByRole('textbox', {name:'Search by name'}), 'Eimhin');
  await openProfileRoute('K0104');
  await screen.findByRole('heading', {name:'Career context'});
  expect(screen.getByRole('heading', {name:'About Eimhin'})).toBeVisible();
  expect(screen.getByRole('heading', {name:'Career planning and opportunities'})).toBeVisible();
  expect(screen.getByText('Conceptual view')).toBeVisible();
  expect(screen.queryByRole('button', {name:'Explore opportunities'})).not.toBeInTheDocument();
  expect(screen.queryByText('Marine Electrician')).not.toBeInTheDocument();
  expect(screen.queryByText('Offshore Survey Technician')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', {name:'Edit career context'}));
  await user.selectOptions(await screen.findByRole('combobox', {name:'Employment intention'}),'Seeking employment');
  await user.type(screen.getByRole('textbox', {name:'Career preferences'}),'Shore-based maintenance');
  await user.click(screen.getByRole('button', {name:'Save career context'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByText('Shore-based maintenance')).toBeVisible();
  expect(JSON.parse(localStorage.getItem(storageKey)).workspace.keeperProfiles.K0104.opportunityIds).toEqual(['survey']);
  await user.click(screen.getByRole('link', {name:'Explore Wind Turbine Technician assessment'}));
  await screen.findByRole('heading',{name:'Relevant experience'});
  expect(screen.getByRole('checkbox', {name:'Discuss Eimhin’s maintenance experience'})).toBeChecked();
  await openProfileRoute('K0104');
  await screen.findByRole('heading',{name:'Career context'});
  expect(screen.getByText('Shore-based maintenance')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Edit career context'}));
  await user.keyboard('{Escape}');
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(screen.getByRole('link',{name:'People'}));
  await screen.findByRole('heading',{name:'Redeployment workspace'});
  expect(screen.getByRole('textbox',{name:'Search by name'})).toHaveValue('Eimhin');
  expect(screen.getByText('Offshore Survey Technician')).toBeVisible();
}, 15000);

it('other keeper profiles retain context without invented assessment destinations',async()=>{
 const user=userEvent.setup();mount();
 for (const [id, intention] of [['K0847','Seeking employment'], ['K0147','Not yet decided'], ['illustrative-support','Seeking employment'], ['illustrative-retirement','Planning retirement'], ['illustrative-employed','Employment arranged']]) {
   await openProfileRoute(id);
   await screen.findByRole('heading',{name:'Career context'});
   expect(screen.getByText(intention)).toBeVisible();
   expect(screen.getByText('Conceptual view')).toBeVisible();
   expect(screen.queryByRole('button',{name:'Explore opportunities'})).not.toBeInTheDocument();
   expect(screen.queryByRole('link',{name:'Explore Wind Turbine Technician assessment'})).not.toBeInTheDocument();
   await user.click(screen.getByRole('link',{name:'People'}));
 }
}, 15000);
