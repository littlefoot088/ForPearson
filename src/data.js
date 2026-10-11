import { sources, trainingRecords } from "./records.js";
export const reviewDate = "2026-12-31";
export const person = {
  id: "K0104",
  name: "Eimhin Mac Neidhe",
  role: "Lighthouse keeper",
  joined: "2009-11-06",
  payrollRef: "0012801",
  careerIntention: "Not yet discussed",
  careerPreferences: null,
};
export const vacancy = {
  id: "array-om",
  title: "Wind Turbine Technician",
  employer: "Carrowmore Array",
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
      "Eimhin’s comfort with offshore working conditions has not been discussed.",
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
    detail: "Permit-system experience is an employer preference.",
  },
  {
    id: "mentoring",
    text: "Training and supporting colleagues",
    required: false,
    group: "preferred",
    type: "clarification",
    assessment: "unknown",
    detail:
      "No supporting records were selected. Ask about this employer preference if Eimhin wants to pursue the role.",
    question:
      "Have you trained or supported less experienced colleagues? Please describe your role and a recent example.",
  },
];
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
      "Confirm which repairs Eimhin carried out independently and whether this was a regular responsibility.",
    question:
      "Was pump maintenance a regular responsibility? Which repairs did you carry out independently, and when did you last do this work?",
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
      "Confirm Eimhin’s regular fault-finding duties and independent responsibilities.",
    question:
      "Was electrical maintenance part of your regular duties? Which faults did you diagnose and repair independently?",
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
      "Confirm the scope of Eimhin’s permit authority and whether it is current.",
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
    "Describes replacing a fire-pump seal and re-aligning its coupling.",
  "electrical_2009-05-27":
    "Describes identifying an incorrect charger setting and recording the correction.",
  "pump_2010-08-06":
    "Describes replacing a fire-pump seal and re-aligning its coupling.",
  "pump_2024-09-27":
    "A later record again describes seal replacement and coupling alignment.",
  "pump_2025-10-10": "Describes repairing a pump; the entry is marked “self”.",
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

export const requirementNextSteps = {
  maintenance: "Discuss responsibilities",
  environment: "Discuss working preferences",
  sea: "Verify full certificate",
  fire: "Confirm completion",
  "first-aid": "Check certificate",
  height: "Check accepted coverage",
  medical: "Check clearance",
  permits: "Confirm current authority",
};

// Curated conclusions grounded in the linked claims and O&M vacancy, not a score.
export const candidateSummary = {
  text: "Eimhin’s pump repairs and electrical fault-finding provide a practical starting point for turbine maintenance. Carrowmore Array welcomes maintenance experience from other kinds of plant and does not require previous wind experience. His independent responsibilities and interest in offshore work need discussion, while safety certification and medical fitness still need checking.",
  interestKnownText:
    "Eimhin’s pump repairs and electrical fault-finding provide a practical starting point for turbine maintenance. Carrowmore Array welcomes maintenance experience from other kinds of plant and does not require previous wind experience. His independent responsibilities need discussion, while safety certification and medical fitness still need checking.",
  claimIds: ["pump", "electrical"],
  sourceIds: [
    "pump_2010-08-06",
    "pump_2024-09-27",
    "pump_2025-10-10",
    "pump_2026-04-21",
    "electrical_2011-09-21",
    "electrical_2018-01-01",
    "electrical_2026-12-26",
  ],
  vacancyId: vacancy.id,
};

// Presentation rows preserve the underlying employer requirements and evidence links.
export const experienceRows = claims.map((claim) => {
  const requirement = requirements.find((r) => r.id === claim.requirementId);
  const supporting = { pump: "pumped", electrical: "generator" }[claim.id];
  return {
    ...requirement,
    id: claim.id,
    sourceRequirementId: requirement.id,
    text: claim.title,
    conclusion: {
      pump: "Repeated pump repairs recorded",
      electrical: "Fault-finding and repairs across several years",
      safety:
        "Planning and permit issuing recorded; current authority needs checking",
    }[claim.id],
    detail: claim.relevance,
    claimIds: [claim.id],
    qualificationIds: supporting ? [supporting] : [],
  };
});
