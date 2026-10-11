import { workflowView } from "./workflowState.js";
import { person, vacancy } from "./data.js";

export const assessmentHash = "#people/eimhin/wind-turbine-technician";
export const intentions = [
  "Seeking employment",
  "Exploring options",
  "Planning retirement",
  "Employment arranged",
  "Not yet discussed",
];
export function assessmentOverview(workspace) {
  const view = workflowView(workspace);
  return {
    progress: view.progress,
    nextAction: view.primary.action ? view.primary.label : null,
  };
}
// Workspace scenarios only: these associations and outcomes are not source evidence.
const illustrativePeople = [
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
    intention: "Exploring options",
    opportunities: [
      {
        id: "survey",
        title: "Offshore Survey Technician",
        employer: "Deepline Offshore Ltd",
        progress: "Exploring",
        nextAction: "Discuss working preferences",
      },
      {
        id: "marine",
        title: "Marine Electrician",
        employer: "Port of Cnoc Harbour Trust",
        progress: "Suggested",
        nextAction: null,
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
        progress: "Qualification check needed",
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
export function peopleForWorkspace(workspace) {
  return [
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
          progress: "Exploring",
          nextAction: "Review role requirements",
        },
        {
          id: "coastguard",
          title: "Watch Officer",
          employer: "Northern Isles Coastguard Service",
          progress: "Suggested",
          nextAction: "Discuss interest in this role",
        },
      ],
    },
    ...illustrativePeople,
  ];
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
