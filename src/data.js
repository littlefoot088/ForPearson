import { sources, trainingRecords } from "./records.js";
export const reviewDate = "2026-12-31";
export const person = {
  id: "K0104",
  name: "Eimhin Mac Neidhe",
  role: "Lighthouse keeper",
  joined: "2009-11-06",
  payrollRef: "0012801",
};
export const vacancy = {
  id: "array-om",
  title: "Wind Turbine Technician",
  employer: "Carrowmore Array",
  openings: "Approx. 40 openings",
  base: "Cnoc Operations Base",
  pattern: "14 days on / 14 days off",
  source: "employers/carrowmore-array-om-technician.md",
};
export const requirementGroups = [
  { id: "experience", label: "Essential experience & working conditions" },
  { id: "clearance", label: "Required safety coverage & clearance" },
  { id: "preferred", label: "Additional employer preferences" },
];
export const assessmentStates = {
  evidence: { label: "Evidence found", icon: "file", tone: "evidence" },
  module: { label: "Module recorded", icon: "module", tone: "neutral" },
  attendance: { label: "Attendance recorded", icon: "clock", tone: "neutral" },
  clarify: {
    label: "Needs clarification",
    icon: "question",
    tone: "attention",
  },
  unknown: { label: "Not established", icon: "circle", tone: "neutral" },
  documented: { label: "Documented", icon: "check", tone: "documented" },
};
export const requirements = [
  {
    id: "maintenance",
    text: "Mechanical or electrical maintenance",
    required: true,
    group: "experience",
    type: "experience",
    assessment: "evidence",
    claimIds: ["pump", "electrical"],
    qualificationIds: ["pumped", "generator"],
    detail:
      "The employer accepts either mechanical or electrical maintenance on plant the candidate was responsible for. Generating-plant experience and electrical fault-finding are also valued.",
  },
  {
    id: "environment",
    text: "Comfort at height, in enclosed spaces and on boats in a swell",
    required: true,
    group: "experience",
    type: "clarification",
    assessment: "clarify",
    detail:
      "The role involves tower climbs, enclosed turbine spaces and transfers from a moving vessel. The selected records do not establish Eimhin’s current comfort with these conditions.",
    question:
      "Are you comfortable working at height, in enclosed spaces and on small boats in a swell? Please describe relevant recent experience and any working conditions you would like to discuss.",
  },
  {
    id: "sea",
    text: "Sea survival",
    required: true,
    group: "clearance",
    type: "qualification",
    assessment: "module",
    qualificationIds: ["sea"],
  },
  {
    id: "fire",
    text: "Fire prevention and response",
    required: true,
    group: "clearance",
    type: "qualification",
    assessment: "attendance",
    qualificationIds: ["fire"],
  },
  {
    id: "first-aid",
    text: "First aid",
    required: true,
    group: "clearance",
    type: "qualification",
    assessment: "unknown",
    qualificationIds: ["first-aid"],
  },
  {
    id: "height",
    text: "Working-at-height certification",
    required: true,
    group: "clearance",
    type: "qualification",
    assessment: "unknown",
    qualificationIds: ["height"],
  },
  {
    id: "medical",
    text: "Offshore medical fitness",
    required: true,
    group: "clearance",
    type: "qualification",
    assessment: "unknown",
    qualificationIds: ["medical"],
  },
  {
    id: "permits",
    text: "Permit-system experience",
    required: false,
    group: "preferred",
    type: "experience",
    assessment: "clarify",
    claimIds: ["safety"],
    detail:
      "The employer values permit-system experience. Planning and permit-issuing responsibility are recorded; the scope and currency of that authority need clarification.",
  },
  {
    id: "mentoring",
    text: "Training and supporting colleagues",
    required: false,
    group: "preferred",
    type: "clarification",
    assessment: "unknown",
    detail:
      "The employer values people who have trained and supported younger colleagues. This is not established by the selected records; it is not evidence that Eimhin lacks this experience.",
    question:
      "Have you trained or supported less experienced colleagues? Please describe your role and a recent example.",
  },
];
export const initialReview = { progressing: false, clarification: false };
export function toggleReview(state, field) {
  return { ...state, [field]: !state[field] };
}
export const claims = [
  {
    id: "pump",
    number: "01",
    title: "Pump maintenance & repair",
    summary:
      "Repeated records of replacing seals, aligning couplings and rebuilding pumps.",
    pattern: "Repeated practical work",
    requirementId: "maintenance",
    relevance:
      "Relevant to maintaining pumps and replacing worn turbine components.",
    involvement: "Hands-on work recorded",
    limitation:
      "The entries describe repairs, but do not establish how independently Eimhin worked or his present competence.",
    question:
      "The records describe pump repairs from 2009 to 2026. Was this a regular responsibility? Which repairs did you carry out independently, and when did you last do this work?",
    sourceIds: [
      "pump_2009-03-13",
      "pump_2010-08-06",
      "pump_2024-09-27",
      "pump_2025-10-10",
      "pump_2026-04-21",
    ],
  },
  {
    id: "electrical",
    number: "02",
    title: "Electrical fault-finding & control",
    summary:
      "Records describe tracing faults, rebuilding changeover logic and correcting charger settings.",
    pattern: "Historical and recent evidence",
    requirementId: "maintenance",
    relevance:
      "Relevant to diagnosing faults and maintaining electrical plant.",
    involvement: "Hands-on work recorded",
    limitation:
      "Transfer to turbine systems needs assessment. These records do not establish 33kV competence or authorisation.",
    question:
      "Which electrical systems and voltages have you worked on? Please describe your independent fault-finding responsibilities and the limits of your authorisation.",
    sourceIds: [
      "electrical_2009-05-27",
      "electrical_2011-09-21",
      "electrical_2018-01-01",
      "electrical_2026-12-26",
    ],
  },
  {
    id: "safety",
    number: "03",
    title: "Safe-work planning & permits",
    summary:
      "One entry describes planning a confined-space task; another records issuing permits.",
    pattern: "Two different responsibilities",
    requirementId: "permits",
    relevance:
      "Relevant to the employer’s preference for permit-system experience.",
    involvement: "Planning / issuing authority",
    limitation:
      "Planning or authorising a task does not establish who performed it. Current authority and its scope need confirmation.",
    question:
      "A 2025 entry records you acting as issuing authority for three permits. What did your authorisation cover, and is it still current?",
    sourceIds: ["safety_2014-04-15", "safety_2025-08-19"],
  },
];
export const qualifications = [
  {
    id: "sea",
    title: "Sea survival",
    required: true,
    status: "Pass recorded · within expiry",
    tone: "positive",
    recordId: "LH500010",
    detail:
      "Module expires 3 May 2028. Full offshore certificate still needs verification.",
    question:
      "Please provide your current offshore safety certificate so we can check its award, coverage and expiry.",
  },
  {
    id: "fire",
    title: "Fire prevention & response",
    required: true,
    status: "Attendance only",
    tone: "attention",
    recordId: "LH500003",
    detail:
      "Completion is not established. The record’s expiry field is 18 August 2025.",
    question:
      "The fire-response record shows attendance, rather than a pass. Do you have a completed certificate or a more recent record?",
  },
  {
    id: "first-aid",
    title: "First aid",
    required: true,
    status: "Not established",
    tone: "neutral",
    detail: "No completion evidence in the selected records.",
    question:
      "Do you hold a current first-aid qualification? Please provide the certificate and expiry date if available.",
  },
  {
    id: "height",
    title: "Working at height",
    required: true,
    status: "Not established",
    tone: "neutral",
    detail:
      "No certificate in the selected records. Confirm which height coverage the employer accepts.",
    question:
      "Do you hold current working-at-height certification? Please share the certificate and describe your recent experience at height.",
  },
  {
    id: "medical",
    title: "Offshore medical fitness",
    required: true,
    status: "Not established",
    tone: "neutral",
    detail:
      "Current fitness clearance needs verification; no medical details are needed here.",
    question:
      "Can you provide confirmation of current offshore medical clearance and its expiry date? Please do not include clinical details.",
  },
  {
    id: "pumped",
    title: "Fluid transfer & pumped systems",
    required: false,
    status: "Pass recorded · within expiry",
    tone: "positive",
    recordId: "LH500008",
    detail:
      "Module expires 5 December 2028. This does not establish a complete maintenance certificate.",
    question:
      "Do you have the award record for your pumped-systems module and any related maintenance certification?",
  },
  {
    id: "generator",
    title: "Rotating plant & generator control",
    required: false,
    status: "Recorded module expired",
    tone: "attention",
    recordId: "LH500001",
    detail: "Expired 14 July 2022. This does not negate practical experience.",
    question:
      "Have you renewed your generator-control qualification since July 2022? Please share any current record.",
  },
];
export const interpretations = {
  "pump_2009-03-13":
    "Describes replacing a fire-pump seal and re-aligning its coupling. This remains relevant maintenance evidence despite preceding the personnel joining date.",
  "electrical_2009-05-27":
    "Describes identifying an incorrect charger setting and recording the correction. The personnel joining date does not invalidate this recorded work.",
  "pump_2010-08-06":
    "Describes replacing a fire-pump seal and re-aligning its coupling.",
  "pump_2024-09-27":
    "A later record again describes seal replacement and coupling alignment.",
  "pump_2025-10-10":
    "Describes hands-on repair. The source is marked “self”; this is not independent competence verification.",
  "pump_2026-04-21":
    "Describes a pump rebuild and a recorded return of delivery pressure.",
  "electrical_2011-09-21":
    "Describes rebuilding control logic and planning the sequence before starting.",
  "electrical_2018-01-01":
    "Describes tracing a lighting-ring earth fault by splitting the circuit.",
  "electrical_2026-12-26":
    "Describes identifying an incorrect charger setting and recording the correction.",
  "safety_2014-04-15":
    "Describes planning and preparing for entry, not necessarily entering the sump or performing a rescue.",
  "safety_2025-08-19":
    "Describes permit-issuing responsibility. It does not state the scope or currency of authorisation.",
};
export function getSources(claim) {
  return claim.sourceIds.map((id) =>
    sources.find((source) => source.id === id),
  );
}
export function dateLabel(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
export { sources, trainingRecords };
