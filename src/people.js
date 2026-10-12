import { workflowView } from "./workflowState.js";
import { person, vacancy } from "./data.js";

export const assessmentHash = "#people/eimhin/wind-turbine-technician";
export const intentions = [
  "Not yet decided",
  "Seeking employment",
  "Planning retirement",
  "Employment arranged",
];
export function normalizeIntention(value) {
  return value === "Exploring options" || value === "Not yet discussed" ? "Not yet decided" : value;
}
function keeperIntention(person, saved, workspace) {
  const intention = normalizeIntention(saved?.intention ?? person.intention);
  const sent = person.currentPerson && workspace.sentIntroductions?.at(-1);
  const explicitAfterSend = saved?.intention && saved.updatedAt && sent &&
    Date.parse(saved.updatedAt) >= Date.parse(sent.sentAt);
  return intention === "Not yet decided" && sent && !explicitAfterSend
    ? "Seeking employment" : intention;
}
export function assessmentOverview(workspace) {
  const view = workflowView(workspace);
  return {
    progress: view.progress,
    nextAction: view.primary.action ? view.primary.label : null,
  };
}
// Workspace scenarios only: these associations and outcomes are not source evidence.
export const illustrativePeople = [
  {
    id: "K0847",
    name: "Aoife Ní Mhurchú",
    intention: "Seeking employment",
    opportunities: [
      {
        id: "coastguard",
        title: "Watch Officer",
        employer: "Northern Isles Coastguard Service",
        progress: "Interview invited",
        nextAction: "Confirm interview arrangements",
      },
    ],
  },
  {
    id: "K0147",
    name: "Coilean Ó Caomhthaigh",
    intention: "Not yet decided",
    opportunities: [
      {
        id: "survey",
        title: "Offshore Survey Technician",
        employer: "Deepline Offshore Ltd",
        progress: "To do",
        nextAction: "Review suitability",
      },
      {
        id: "marine",
        title: "Marine Electrician",
        employer: "Port of Cnoc Harbour Trust",
        progress: "To do",
        nextAction: "Review suitability",
      },
    ],
  },
  {
    id: "illustrative-support",
    name: "Nóra Ní Bhraonáin",
    intention: "Seeking employment",
    opportunities: [
      {
        id: "array-om",
        title: "Wind Turbine Technician",
        employer: "Carrowmore Array",
        progress: "Reviewing documents",
        nextAction: "Check certificates and discuss training support",
      },
    ],
  },
  {
    id: "illustrative-retirement",
    name: "Fintan Ó Ceallaigh",
    intention: "Planning retirement",
    opportunities: [],
  },
  {
    id: "illustrative-employed",
    name: "Cian Ó Dálaigh",
    intention: "Employment arranged",
    opportunities: [
      {
        id: "marine",
        title: "Marine Electrician",
        employer: "Port of Cnoc Harbour Trust",
        progress: "Employment arranged",
        nextAction: null,
      },
    ],
  },
];
export const keeperIds = [person.id, ...illustrativePeople.map((p) => p.id)];
export const vacancyOptions = [
  { id: vacancy.id, title: vacancy.title, employer: vacancy.employer },
  { id: "marine", title: "Marine Electrician", employer: "Port of Cnoc Harbour Trust" },
  { id: "coastguard", title: "Watch Officer", employer: "Northern Isles Coastguard Service" },
  { id: "survey", title: "Offshore Survey Technician", employer: "Deepline Offshore Ltd" },
];
export const profileHash = (id) => `#people/${id === person.id ? "eimhin" : id}`;
export const profileIdForHash = (hash) => keeperIds.find((id) => profileHash(id) === hash);

export function peopleForWorkspace(workspace) {
  const people = [
    {
      id: person.id,
      name: person.name,
      intention: person.careerIntention,
      currentPerson: true,
      opportunities: [
        { ...vacancy, ...assessmentOverview(workspace), implemented: true },
        {
          id: "marine",
          title: "Marine Electrician",
          employer: "Port of Cnoc Harbour Trust",
          progress: "To do",
          nextAction: "Review suitability",
        },
        {
          id: "coastguard",
          title: "Watch Officer",
          employer: "Northern Isles Coastguard Service",
          progress: "To do",
          nextAction: "Review suitability",
        },
      ],
    },
    ...illustrativePeople,
  ];
  const resolved = people.map((p) => {
    const saved = workspace.keeperProfiles?.[p.id];
    const intention = keeperIntention(p, saved, workspace);
    const opportunities = [...p.opportunities];
    for (const id of saved?.opportunityIds ?? []) {
      if (!opportunities.some((o) => o.id === id)) {
        const vacancy = vacancyOptions.find((v) => v.id === id);
        if (vacancy) opportunities.push({ ...vacancy, progress: "To do", nextAction: "Review suitability" });
      }
    }
    const inactive = intention === "Planning retirement" || intention === "Employment arranged";
    return { ...p, intention, careerPreferences: saved?.preferences ?? "",
      contextUpdatedAt: saved?.updatedAt,
      consideredOpportunities: opportunities,
      opportunities: intention === "Planning retirement" ? [] : opportunities.map((o) => inactive ? { ...o, nextAction: null } : o),
    };
  });
  return resolved.sort(
    (a, b) =>
      Number(a.intention === "Planning retirement") -
      Number(b.intention === "Planning retirement"),
  );
}
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
export function filterPeople(people, search, intention, attentionOnly) {
  return people.filter(
    (p) =>
      normalize(p.name).includes(normalize(search.trim())) &&
      (!intention || p.intention === intention) &&
      (!attentionOnly || p.opportunities.some((o) => o.nextAction)),
  );
}
