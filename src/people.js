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
      ],
    },
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
