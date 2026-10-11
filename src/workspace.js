import {
  person,
  vacancy,
  claims,
  getSources,
  qualifications,
  requirements,
} from "./data.js";
import {
  initialOpportunity,
  opportunityReducer,
  officerAssessments,
  keeperResponses,
} from "./workflow.js";

export const storageKey = `carrowmore:workspace:v1:${person.id}:${vacancy.id}`;
// Internal field names remain stable at the workspace boundary; the document is format 2.
export const referralFields = [
  ["why", "Why we recommend Eimhin"],
  ["pump", "Mechanical maintenance"],
  ["electrical", "Electrical fault-finding"],
  ["safety", "Safe-working procedures"],
  ["qualifications", "Qualifications and readiness"],
  ["recommendation", "Recommendation"],
];
const legacyFields = [
  "candidate",
  "why",
  "experience",
  "qualifications",
  "questions",
];
export function assessmentSignature() {
  return JSON.stringify({ claims, qualifications, vacancy });
}
export function initialWorkspace() {
  return {
    opportunity: {
      ...initialOpportunity,
      interest: "interested",
      responseOrigin: "illustrative",
    },
    tasks: [
      {
        id: "certificates",
        title: "Check existing offshore certificates",
        done: false,
      },
      {
        id: "responsibilities",
        title: "Discuss Eimhin’s maintenance experience",
        done: false,
      },
      {
        id: "prepare-referral",
        title: "Prepare candidate introduction",
        done: false,
      },
    ],
    notes: [],
    reports: {},
    referral: null,
    ready: null,
  };
}
export function createReferral() {
  return {
    format: 2,
    why: "Eimhin’s lighthouse work includes practical maintenance of mechanical and electrical equipment. Carrowmore Array welcomes experience from other kinds of plant, making his background worth exploring for the Wind Turbine Technician role.",
    ...Object.fromEntries(
      claims.map((claim) => [claim.id, claim.introductionSummary]),
    ),
    qualifications:
      "Sea-survival training is recorded, but complete offshore safety certification and medical fitness still need verification. Safety certification is required before mobilisation; the vacancy does not specify when medical fitness must be verified.",
    recommendation:
      "We recommend considering Eimhin for an initial technical interview to explore how his maintenance experience could transfer to offshore wind operations.",
    includedReports: [],
    editedFields: [],
    needsReview: false,
    assessmentSignature: assessmentSignature(),
    // Internal provenance never renders as part of the employer-facing document.
    sourceIds: claims.flatMap((c) =>
      getSources(c)
        .filter((r) => c.sourceIds.includes(r.id) && r.date >= person.joined)
        .map((r) => r.id),
    ),
    qualificationIds: qualifications.map((q) => q.id),
  };
}
export function readinessAllowed(state) {
  return Boolean(
    state.referral?.format === 2 &&
    !state.referral.needsReview &&
    state.opportunity.interest === "interested",
  );
}
const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const upsert = (items, item) =>
  items.some((i) => i.id === item.id)
    ? items.map((i) => (i.id === item.id ? item : i))
    : [...items, item];
export function workspaceReducer(state, action) {
  switch (action.type) {
    case "opportunity": {
      const next = opportunityReducer(state.opportunity, action.action);
      const changed =
        next.interest !== state.opportunity.interest ||
        next.assessment !== state.opportunity.assessment;
      return {
        ...state,
        opportunity: next,
        ready: changed ? null : state.ready,
        referral:
          changed && state.referral
            ? { ...state.referral, needsReview: true }
            : state.referral,
      };
    }
    case "task-save":
      if (!action.task.title.trim()) return state;
      return {
        ...state,
        tasks: upsert(state.tasks, {
          ...action.task,
          title: action.task.title.trim(),
        }),
      };
    case "task-toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      };
    case "task-remove":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "qualification-toggle": {
      const id = `qualification:${action.qualification.id}`;
      return {
        ...state,
        tasks: state.tasks.some((t) => t.id === id)
          ? state.tasks.filter((t) => t.id !== id)
          : [
              ...state.tasks,
              {
                id,
                qualificationId: action.qualification.id,
                title: `Check ${action.qualification.title}`,
                done: false,
              },
            ],
      };
    }
    case "note-save":
      if (!action.note.text.trim() || !validDate(action.note.date))
        return state;
      return {
        ...state,
        notes: upsert(state.notes, {
          ...action.note,
          text: action.note.text.trim(),
        }),
      };
    case "report-save": {
      if (
        !["pump", "electrical"].includes(action.report.id) ||
        !validDate(action.report.date) ||
        !action.report.text.trim()
      )
        return state;
      const changed =
        JSON.stringify(state.reports[action.report.id]) !==
        JSON.stringify(action.report);
      const included = state.referral?.includedReports.some(
        (r) => r.id === action.report.id,
      );
      return {
        ...state,
        reports: { ...state.reports, [action.report.id]: action.report },
        ready: changed && included ? null : state.ready,
        referral:
          changed && included && state.referral
            ? { ...state.referral, needsReview: true }
            : state.referral,
      };
    }
    case "referral-save": {
      if (!referralFields.every(([key]) => action.referral[key]?.trim()))
        return state;
      const referral = {
        ...action.referral,
        format: 2,
        needsReview: false,
        assessmentSignature: assessmentSignature(),
      };
      const changed =
        JSON.stringify({ ...state.referral, needsReview: false }) !==
        JSON.stringify(referral);
      return { ...state, referral, ready: changed ? null : state.ready };
    }
    case "ready":
      if (!readinessAllowed(state)) return state;
      return { ...state, ready: { stage: "awaiting-person-review" } };
    case "unready":
      return { ...state, ready: null };
    case "reset":
      return initialWorkspace();
    default:
      return state;
  }
}

const string = (v) => typeof v === "string";
const list = (v, check) =>
  Array.isArray(v) &&
  v.every(check) &&
  new Set(v.map((i) => i.id)).size === v.length;
function validWorkspace(w) {
  return (
    w &&
    w.opportunity &&
    w.opportunity.interest in keeperResponses &&
    w.opportunity.assessment in officerAssessments &&
    w.opportunity.employerProgression === "not-submitted" &&
    list(
      w.tasks,
      (t) =>
        t &&
        string(t.id) &&
        string(t.title) &&
        typeof t.done === "boolean" &&
        (!t.qualificationId ||
          qualifications.some((q) => q.id === t.qualificationId)),
    ) &&
    list(
      w.notes,
      (n) =>
        n &&
        string(n.id) &&
        validDate(n.date) &&
        string(n.text) &&
        string(n.followup),
    ) &&
    w.reports &&
    Object.entries(w.reports).every(
      ([id, r]) =>
        ["pump", "electrical"].includes(id) &&
        r.id === id &&
        validDate(r.date) &&
        string(r.text),
    ) &&
    (w.referral === null ||
      (w.referral &&
        (w.referral.format === 2
          ? referralFields.every(([key]) => string(w.referral[key])) &&
            Array.isArray(w.referral.editedFields) &&
            w.referral.editedFields.every(string)
          : legacyFields.every((key) => string(w.referral[key]))) &&
        Array.isArray(w.referral.sourceIds) &&
        w.referral.sourceIds.every(string) &&
        list(
          w.referral.includedReports,
          (r) =>
            r &&
            ["pump", "electrical"].includes(r.id) &&
            string(r.text) &&
            validDate(r.date),
        ))) &&
    (w.ready === null ||
      (readinessAllowed(w) && w.ready.stage === "awaiting-person-review"))
  );
}
export function loadWorkspace(storage) {
  const fallback = {
    workspace: initialWorkspace(),
    drafts: [],
    recordFlags: [],
  };
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return { ...fallback, message: "" };
    const saved = JSON.parse(raw);
    if (saved.version === 1 && saved.workspace) {
      // A previous referral decision is not the person's approval of an introduction.
      if (saved.workspace.referral) {
        saved.workspace.referral.previousReadiness = saved.workspace.ready;
        saved.workspace.referral.needsReview = true;
      }
      saved.workspace.ready = null;
      saved.version = 2;
    }
    if (
      saved.workspace?.referral?.format === 2 &&
      saved.workspace.referral.assessmentSignature !== assessmentSignature()
    ) {
      saved.workspace.referral.needsReview = true;
      saved.workspace.ready = null;
    }
    if (Array.isArray(saved.workspace?.tasks))
      saved.workspace.tasks = saved.workspace.tasks.map((task) =>
        task?.id === "prepare-referral" && task.title === "Prepare the referral"
          ? { ...task, title: "Prepare candidate introduction" }
          : task,
      );
    const topicIds = [
      "career-preferences",
      "existing-certificates",
      "opportunity-questions",
      "environment",
      "mentoring",
      ...claims.map((c) => c.id),
      ...qualifications.map((q) => q.id),
    ];
    if (
      saved.version !== 2 ||
      !validWorkspace(saved.workspace) ||
      !list(
        saved.drafts,
        (d) =>
          d &&
          topicIds.includes(d.id) &&
          [
            ...requirements.map((r) => r.id),
            "career-preferences",
            "existing-certificates",
            "opportunity-questions",
          ].includes(d.requirementId) &&
          string(d.title) &&
          string(d.text),
      ) ||
      !Array.isArray(saved.recordFlags) ||
      !saved.recordFlags.every(string)
    )
      throw new Error("Invalid saved workspace");
    return { ...saved, message: "" };
  } catch {
    return {
      ...fallback,
      message:
        "Saved workspace could not be loaded. The illustrative scenario has been restored.",
    };
  }
}
export function persistWorkspace(storage, snapshot) {
  try {
    storage.setItem(storageKey, JSON.stringify({ version: 2, ...snapshot }));
    return true;
  } catch {
    return false;
  }
}
