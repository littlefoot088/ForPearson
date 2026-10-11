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
  module: { label: "Training recorded", icon: "module", tone: "neutral" },
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
      "The selected records do not describe Eimhin training or supporting colleagues.",
    question:
      "Have you trained or supported less experienced colleagues? Please describe your role and a recent example.",
  },
];
export const claims = [
  {
    id: "pump",
    workSummary:
      "Replaced pump seals, aligned couplings and rebuilt a pump with new wear rings.",
    evidenceSummary:
      "Repeated repair entries, including three in 2024–2026. The latest, on 21 April 2026, records a full pump rebuild and restored delivery pressure.",
    introductionSummary:
      "Pump rebuilding, seal replacement and coupling alignment.",
    number: "01",
    title: "Pump maintenance & repair",
    summary:
      "Repeated records of replacing seals, aligning couplings and rebuilding pumps.",
    pattern: "Repeated practical work",
    requirementId: "maintenance",
    relevance:
      "This work is relevant to the role’s mechanical maintenance duties.",
    involvement: "Repair work described",
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
    workSummary:
      "Rebuilt electrical changeover controls, traced a lighting fault and corrected a battery charger’s settings.",
    evidenceSummary:
      "Examples are recorded in 2011, 2018 and 2026. The latest, on 26 December 2026, describes correcting charger settings. The previous selected example is from January 2018.",
    introductionSummary:
      "Control-system repairs, earth-fault tracing and charger fault correction.",
    number: "02",
    title: "Electrical fault-finding & control",
    summary:
      "Records describe tracing faults, rebuilding changeover logic and correcting charger settings.",
    pattern: "Historical and recent evidence",
    requirementId: "maintenance",
    relevance:
      "This work is relevant to the role’s electrical maintenance duties.",
    involvement: "Repair work described",
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
    workSummary:
      "Planned entry into a flooded sump with rescue equipment ready, and acted as the person authorised to issue work permits.",
    evidenceSummary:
      "Two entries describe different responsibilities: entry planning on 15 April 2014, and issuing three permits on 19 August 2025. Current permit authority is not recorded.",
    introductionSummary:
      "Work planning and permit issuing; current authority needs confirmation.",
    number: "03",
    title: "Safe-work planning & permits",
    summary:
      "One entry describes planning a confined-space task; another records issuing permits.",
    pattern: "Two different responsibilities",
    requirementId: "permits",
    relevance: "The employer values experience of permit systems.",
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
    status: "Pass recorded",
    tone: "positive",
    recordId: "LH500010",
    detail:
      "Passed on 5 August 2024; expires 3 May 2028. The full offshore safety certificate has not been checked.",
    question:
      "Please provide your current offshore safety certificate so we can check its award, coverage and expiry.",
  },
  {
    id: "fire",
    title: "Fire prevention & response",
    required: true,
    status: "Listed expiry: 18 August 2025 (past)",
    tone: "attention",
    recordId: "LH500003",
    detail:
      "Attendance was recorded on 8 September 2021. Whether this meets the fire-safety requirement is unknown.",
    question:
      "Do you have a current fire-safety certificate or a newer training record?",
  },
  {
    id: "first-aid",
    title: "First aid",
    required: true,
    status: "Not established",
    tone: "neutral",
    detail: "No first-aid certificate was found in the selected records.",
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
      "No certificate was found in the selected records. The employer’s accepted height coverage also needs checking.",
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
      "No current offshore medical clearance was found in the selected records.",
    question:
      "Can you provide confirmation of current offshore medical clearance and its expiry date? Please do not include clinical details.",
  },
  {
    id: "pumped",
    title: "Fluid transfer & pumped systems",
    required: false,
    status: "Pass recorded",
    tone: "positive",
    recordId: "LH500008",
    summary: "Passed on 4 May 2023. Training record expires 5 December 2028.",
    detail:
      "Training record expires 5 December 2028. This record covers one part of the training, not a full certificate.",
    question:
      "Do you have the award record for your pumped-systems module and any related maintenance certification?",
  },
  {
    id: "generator",
    title: "Rotating plant & generator control",
    required: false,
    status: "Training record expired",
    tone: "attention",
    recordId: "LH500001",
    summary:
      "Passed on 11 February 2017. Training record expired 14 July 2022.",
    detail:
      "Passed on 11 February 2017. Training record expired 14 July 2022. This record covers one part of the training, not a full certificate.",
    question: "Do you have a newer record for the generator-control module?",
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
  fire: "Check current fire-safety coverage",
  "first-aid": "Check certificate",
  height: "Check accepted coverage",
  medical: "Check clearance",
  permits: "Confirm current authority",
};

// Curated conclusions grounded in the linked claims and O&M vacancy, not a score.
export const candidateSummary = {
  text: "Eimhin has recorded pump-repair and electrical fault-finding experience. The employer accepts maintenance experience from other plant and does not require previous wind experience. Offshore safety certificates and medical fitness still need checking.",
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
