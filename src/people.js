import { person, vacancy } from "./data.js";
import { interestLabel } from "./workflow.js";

export const assessmentHash = "#people/eimhin/wind-turbine-technician";
export const intentions = [
  "Seeking employment",
  "Exploring options",
  "Planning retirement",
  "Employment arranged",
  "Not yet discussed",
];
// Names from clean/keepers.json; associations and intentions below are illustrative only.
// The retirement example is wholly illustrative, as specified in the product brief.
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
        progress: "Exploring",
        nextAction: "Discuss working preferences",
      },
      {
        id: "survey",
        title: "Offshore Survey Technician",
        employer: "Deepline Offshore Ltd",
        progress: "Suggested",
        nextAction: "Discuss interest",
      },
    ],
  },
  {
    id: "K0147",
    name: "Coilean Ó Caomhthaigh",
    intention: "Exploring options",
    opportunities: [
      {
        id: "marine",
        title: "Marine Electrician",
        employer: "Port of Cnoc Harbour Trust",
        progress: "Exploring",
        nextAction: null,
      },
    ],
  },
  {
    id: "illustrative-retirement",
    name: "Fintan Ó Ceallaigh",
    intention: "Planning retirement",
    illustrativeIdentity: true,
    opportunities: [],
  },
];
export function assessmentOverview(workspace) {
  const { opportunity, referral, ready, tasks } = workspace;
  if (opportunity.interest === "not-interested")
    return { progress: "Not interested", nextAction: null };
  if (opportunity.assessment === "not-suitable")
    return { progress: "Not currently suitable", nextAction: null };
  if (ready)
    return {
      progress: "Ready for Eimhin’s review",
      nextAction: "Review introduction with Eimhin",
    };
  const progress = referral
    ? "Preparing introduction"
    : interestLabel(opportunity);
  const nextAction = referral?.needsReview
    ? "Review introduction after assessment changes"
    : (tasks.find((t) => !t.done)?.title ?? null);
  return { progress, nextAction };
}
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
          nextAction: "Review qualifications",
        },
        {
          id: "coastguard",
          title: "Watch Officer",
          employer: "Northern Isles Coastguard Service",
          progress: "Suggested",
          nextAction: "Discuss interest",
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
