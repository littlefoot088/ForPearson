import {
  person,
  vacancy,
  candidateSummary,
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
export const referralFields = [
  ["candidate", "Candidate and opportunity"],
  ["why", "Why consider Eimhin"],
  ["experience", "Relevant documented experience"],
  ["qualifications", "Qualification readiness"],
  ["questions", "Items to confirm"],
];
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
        title: "Clarify independent maintenance responsibilities",
        done: false,
      },
      { id: "prepare-referral", title: "Prepare the referral", done: false },
    ],
    notes: [],
    reports: {},
    referral: null,
    ready: null,
  };
}
export function createReferral() {
  return {
    candidate: `${person.name}\nCurrent role: ${person.role}\nOpportunity: ${vacancy.title} · ${vacancy.employer}`,
    why: candidateSummary.text,
    experience:
      "Historical records document pump seal replacement, coupling alignment and pump rebuilding, alongside electrical control work and fault-finding. These provide a practical basis for discussing transferable maintenance experience. Separate records show safe-work planning and permit-issuing responsibility; they do not establish current authority. Independent responsibility still needs clarification.",
    qualifications:
      "As of 31 December 2026: sea-survival module pass recorded, expiry 3 May 2028; complete certification needs checking. Fire-response attendance recorded, with a past expiry field; completion is not established. First-aid and working-at-height certificates and offshore medical fitness are not established by the selected records. No complete required qualification has been verified in this assessment. Supporting training includes a pumped-systems module pass (expiry 5 December 2028) and a generator-control module pass (expired 14 July 2022). These modules are not complete certificates. Safety certification is required before mobilisation. Medical fitness is essential; the vacancy does not specify its verification stage.",
    questions:
      "Confirm which maintenance Eimhin carried out independently and his current permit authority. Discuss comfort at height, in enclosed spaces and on boats in a swell. Check complete safety certificates, employer acceptance of height coverage and offshore medical clearance. Missing documentation does not establish that a qualification is absent.",
    includedReports: [],
    needsReview: false,
    // Provenance is for the officer, separate from editable employer-facing prose.
    sourceIds: claims.flatMap((c) =>
      getSources(c)
        .filter((r) => r.date >= person.joined)
        .map((r) => r.id),
    ),
  };
}
export function readinessAllowed(state) {
  return Boolean(
    state.referral &&
    !state.referral.needsReview &&
    state.opportunity.interest === "interested" &&
    state.opportunity.assessment !== "not-suitable",
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
      const referral = { ...action.referral, needsReview: false };
      const changed =
        JSON.stringify({ ...state.referral, needsReview: false }) !==
        JSON.stringify(referral);
      return { ...state, referral, ready: changed ? null : state.ready };
    }
    case "ready":
      if (
        !readinessAllowed(state) ||
        !action.rationale.trim() ||
        !action.acknowledged
      )
        return state;
      return {
        ...state,
        ready: { rationale: action.rationale.trim(), acknowledged: true },
      };
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
        referralFields.every(([key]) => string(w.referral[key])) &&
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
      (readinessAllowed(w) &&
        string(w.ready.rationale) &&
        w.ready.rationale.trim() &&
        w.ready.acknowledged === true))
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
      saved.version !== 1 ||
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
    storage.setItem(storageKey, JSON.stringify({ version: 1, ...snapshot }));
    return true;
  } catch {
    return false;
  }
}
