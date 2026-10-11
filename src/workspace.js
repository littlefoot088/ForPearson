import {
  canSendIntroduction,
  introductionDocument,
  introductionVersion,
  verificationSignature,
  qualificationSummary,
  summaryWithQualifications,
  systemTaskComplete,
  linkedTask,
  today,
  requiredQualifications,
} from "./workflowState.js";
import {
  recordIds,
  selectedClaim,
  includedRecords,
  claimChanged,
  selectedCandidateSummary,
} from "./evidenceSelection.js";
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
export function assessmentSignature(excluded = [], verifications = {}) {
  return JSON.stringify({
    claims,
    qualifications,
    vacancy,
    ...(Object.keys(verifications).length
      ? { verifications: verificationSignature({ verifications }) }
      : {}),
    ...(excluded.length ? { excluded: [...excluded].sort() } : {}),
  });
}
export function initialWorkspace() {
  return {
    interestScenarioVersion: 1,
    preferenceTaskVersion: 1,
    opportunity: {
      ...initialOpportunity,
      interest: "interested",
      responseOrigin: "scenario-confirmed",
    },
    tasks: [
      {
        id: "certificates",
        title: "Check existing offshore certificates",
        done: false,
        origin: "system",
      },
      {
        id: "responsibilities",
        title: "Discuss Eimhin’s maintenance experience",
        done: false,
        origin: "system",
      },
      {
        id: "career-preferences",
        title: "Discuss Eimhin’s career and offshore working preferences",
        done: false,
        origin: "system",
      },
      {
        id: "prepare-referral",
        title: "Prepare candidate introduction",
        done: false,
        origin: "system",
      },
    ],
    verifications: {},
    sentIntroductions: [],
    notes: [],
    reports: {},
    workingPreferences: null,
    excludedRecordIds: [],
    referral: null,
    ready: null,
  };
}
export function createReferral(excluded = [], verifications = {}) {
  return {
    format: 2,
    why: excluded.length
      ? summaryWithQualifications(selectedCandidateSummary(excluded), {
          verifications,
        })
      : "Eimhin’s lighthouse work includes practical maintenance of mechanical and electrical equipment. Carrowmore Array welcomes experience from other kinds of plant, making his background worth exploring for the Wind Turbine Technician role.",
    ...Object.fromEntries(
      claims.map((claim) => [
        claim.id,
        selectedClaim(claim, excluded).introductionSummary,
      ]),
    ),
    qualifications: qualificationSummary({ verifications }),
    recommendation:
      "We recommend considering Eimhin for an initial technical interview to explore how his maintenance experience could transfer to offshore wind operations.",
    includedReports: [],
    editedFields: [],
    needsReview: false,
    assessmentSignature: assessmentSignature(excluded, verifications),
    // Internal provenance never renders as part of the employer-facing document.
    sourceIds: claims.flatMap((c) => {
      const records = includedRecords(c, excluded).filter(
        (r) => r.date >= person.joined,
      );
      return (
        claimChanged(c, excluded)
          ? records.slice(-3)
          : records.filter((r) => c.sourceIds.includes(r.id))
      ).map((r) => r.id);
    }),
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
    case "verification-save": {
      if (
        !requiredQualifications.some((q) => q.id === action.id) ||
        !validVerification(action.record) ||
        action.record.withdrawn ||
        action.record.verifiedOn > today()
      )
        return state;
      const history = state.verifications?.[action.id] ?? [];
      return {
        ...state,
        verifications: {
          ...state.verifications,
          [action.id]: [
            ...history,
            { ...action.record, recordedAt: Date.now() },
          ],
        },
        ready: null,
        referral: state.referral
          ? { ...state.referral, needsReview: true }
          : null,
      };
    }
    case "verification-withdraw": {
      const history = state.verifications?.[action.id];
      if (!history?.length || history.at(-1).withdrawn) return state;
      return {
        ...state,
        verifications: {
          ...state.verifications,
          [action.id]: [
            ...history,
            { ...history.at(-1), withdrawn: true, recordedAt: Date.now() },
          ],
        },
        ready: null,
        referral: state.referral
          ? { ...state.referral, needsReview: true }
          : null,
      };
    }

    case "record-inclusion": {
      if (!recordIds.has(action.id) || typeof action.included !== "boolean")
        return state;
      const excluded = state.excludedRecordIds ?? [];
      const next = action.included
        ? excluded.filter((id) => id !== action.id)
        : [...new Set([...excluded, action.id])];
      if (JSON.stringify(next) === JSON.stringify(excluded)) return state;
      return {
        ...state,
        excludedRecordIds: next,
        ready: null,
        referral: state.referral
          ? {
              ...state.referral,
              needsReview: true,
              sourceIds: state.referral.sourceIds.filter(
                (id) => !next.includes(id),
              ),
            }
          : null,
      };
    }

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
    case "preferences-save": {
      const preference = action.preference;
      if (
        !preference ||
        !validDate(preference.date) ||
        !string(preference.response) ||
        !preference.response.trim() ||
        !string(preference.concerns)
      )
        return state;
      const saved = {
        date: preference.date,
        response: preference.response.trim(),
        concerns: preference.concerns.trim(),
      };
      if (JSON.stringify(state.workingPreferences) === JSON.stringify(saved))
        return state;
      return {
        ...state,
        workingPreferences: saved,
        ready: null,
        referral: state.referral
          ? { ...state.referral, needsReview: true }
          : null,
      };
    }
    case "task-save":
      if (!action.task.title.trim()) return state;
      return {
        ...state,
        tasks: upsert(state.tasks, {
          ...action.task,
          title: action.task.title.trim(),
          origin:
            state.tasks.find((t) => t.id === action.task.id)?.title ===
            action.task.title.trim()
              ? (state.tasks.find((t) => t.id === action.task.id)?.origin ??
                "manual")
              : "manual",
        }),
      };
    case "task-toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id && !(t.origin === "system" && linkedTask(t))
            ? { ...t, done: !t.done }
            : t,
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
                origin: "system",
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
        sourceIds: action.referral.sourceIds.filter(
          (id) => !(state.excludedRecordIds ?? []).includes(id),
        ),
        format: 2,
        needsReview: false,
        assessmentSignature: assessmentSignature(
          state.excludedRecordIds,
          state.verifications,
        ),
      };
      const changed =
        JSON.stringify({ ...state.referral, needsReview: false }) !==
        JSON.stringify(referral);
      return { ...state, referral, ready: changed ? null : state.ready };
    }
    case "simulate-send": {
      if (
        action.approved !== true ||
        !canSendIntroduction(state) ||
        action.version !== introductionVersion(state.referral) ||
        state.referral.assessmentSignature !==
          assessmentSignature(state.excludedRecordIds, state.verifications)
      )
        return state;
      return {
        ...state,
        sentIntroductions: [
          ...(state.sentIntroductions ?? []),
          {
            id: crypto.randomUUID(),
            recipient: "Carrowmore Array",
            sentAt: new Date().toISOString(),
            approved: true,
            simulated: true,
            version: action.version,
            document: structuredClone(introductionDocument(state.referral)),
          },
        ],
      };
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
function validVerification(r) {
  return (
    r &&
    typeof r.issuer === "string" &&
    !!r.issuer.trim() &&
    typeof r.reference === "string" &&
    !!r.reference.trim() &&
    validDate(r.verifiedOn) &&
    r.coverageConfirmed === true &&
    typeof r.noExpiry === "boolean" &&
    (r.noExpiry ? r.expiresOn === "" : validDate(r.expiresOn)) &&
    (r.withdrawn == null || typeof r.withdrawn === "boolean")
  );
}
function validWorkspace(w) {
  return (
    w &&
    (w.sentIntroductions == null ||
      (Array.isArray(w.sentIntroductions) &&
        w.sentIntroductions.every(
          (e) =>
            e &&
            string(e.id) &&
            e.recipient === "Carrowmore Array" &&
            e.approved === true &&
            e.simulated === true &&
            string(e.sentAt) &&
            !Number.isNaN(Date.parse(e.sentAt)) &&
            string(e.version) &&
            e.document?.format === 2 &&
            referralFields.every(([key]) => string(e.document[key])),
        ))) &&
    w.verifications &&
    Object.entries(w.verifications).every(
      ([id, history]) =>
        requiredQualifications.some((q) => q.id === id) &&
        Array.isArray(history) &&
        history.every(validVerification),
    ) &&
    (w.excludedRecordIds == null ||
      (Array.isArray(w.excludedRecordIds) &&
        w.excludedRecordIds.every((id) => recordIds.has(id)))) &&
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
    (w.workingPreferences == null ||
      (validDate(w.workingPreferences.date) &&
        string(w.workingPreferences.response) &&
        !!w.workingPreferences.response.trim() &&
        string(w.workingPreferences.concerns))) &&
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
    const removedIllustration = ["illustrative", "simulated"].includes(
      saved.workspace?.opportunity?.responseOrigin,
    );
    if (removedIllustration) {
      saved.workspace.opportunity.interest = "not-discussed";
      saved.workspace.opportunity.responseOrigin = null;
      saved.workspace.opportunity.nominationDecision = null;
      if (saved.workspace.opportunity.assessment === "worth-nominating")
        saved.workspace.opportunity.assessment = "not-reviewed";
      saved.workspace.ready = null;
      if (saved.workspace.referral) saved.workspace.referral.needsReview = true;
    }
    if (saved.workspace && saved.workspace.interestScenarioVersion !== 1) {
      if (
        saved.workspace.opportunity?.interest === "not-discussed" &&
        !saved.workspace.opportunity.responseOrigin
      ) {
        saved.workspace.opportunity.interest = "interested";
        saved.workspace.opportunity.responseOrigin = "scenario-confirmed";
      }
      saved.workspace.interestScenarioVersion = 1;
    }
    // Add the previously untracked follow-up once; later edits/removal remain respected.
    if (
      saved.workspace &&
      Array.isArray(saved.workspace.tasks) &&
      saved.workspace.preferenceTaskVersion !== 1
    ) {
      if (
        !saved.workspace.tasks.some((task) => task?.id === "career-preferences")
      ) {
        saved.workspace.tasks.push({
          id: "career-preferences",
          title: "Discuss Eimhin’s career and offshore working preferences",
          done: false,
        });
      }
      saved.workspace.preferenceTaskVersion = 1;
    }
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
      saved.workspace.referral.assessmentSignature !==
        assessmentSignature(
          saved.workspace.excludedRecordIds,
          saved.workspace.verifications,
        )
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
    if (
      saved.version === 2 &&
      saved.workspace &&
      Array.isArray(saved.workspace.tasks)
    ) {
      saved.workspace.verifications ??= {};
      const defaults = initialWorkspace().tasks;
      saved.workspace.tasks = saved.workspace.tasks.map((t) => {
        const known =
          defaults.find((d) => d.id === t.id)?.title ??
          (t.qualificationId
            ? `Check ${qualifications.find((q) => q.id === t.qualificationId)?.title}`
            : null);
        return {
          ...t,
          origin:
            t.origin ??
            (known === t.title &&
            (!t.done ||
              (linkedTask(t) && systemTaskComplete(t, saved.workspace)))
              ? "system"
              : "manual"),
        };
      });
      saved.version = 3;
    }
    if (saved.version === 3 && saved.workspace) {
      saved.workspace.sentIntroductions ??= [];
      saved.version = 4;
    }
    if (saved.version === 4 && saved.workspace) {
      saved.workspace.tasks = saved.workspace.tasks.map((task) =>
        task.id === "certificates" ? { ...task, origin: "manual" } : task,
      );
      saved.version = 5;
    }
    if (saved.version === 5 && saved.workspace) {
      saved.workspace.tasks = saved.workspace.tasks.map((task) =>
        task.id === "certificates" ? { ...task, origin: "system" } : task,
      );
      saved.version = 6;
    }
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
      saved.version !== 6 ||
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
          string(d.text) &&
          (d.completed === undefined || typeof d.completed === "boolean"),
      ) ||
      !Array.isArray(saved.recordFlags) ||
      !saved.recordFlags.every(string)
    )
      throw new Error("Invalid saved workspace");
    return {
      ...saved,
      message: removedIllustration
        ? "Eimhin’s interest reflects the agreed conversation scenario. Your saved work is retained."
        : "",
    };
  } catch {
    return {
      ...fallback,
      message:
        "Saved workspace could not be loaded. The initial workspace has been restored.",
    };
  }
}
export function persistWorkspace(storage, snapshot) {
  try {
    storage.setItem(storageKey, JSON.stringify({ ...snapshot, version: 6 }));
    return true;
  } catch {
    return false;
  }
}
