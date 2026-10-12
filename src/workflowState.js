import { qualifications, dateLabel, person, vacancy } from "./data.js";
import { workStages } from "./workflow.js";

export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
export const requiredQualifications = qualifications.filter((q) => q.required);
export const safetyIds = ["sea", "fire", "first-aid", "height"];
export function verificationFor(state, id, date = today()) {
  const record = state.verifications?.[id]?.at(-1);
  const current = Boolean(
    record &&
    !record.withdrawn &&
    record.coverageConfirmed &&
    (record.noExpiry || record.expiresOn >= date),
  );
  return {
    record,
    current,
    label: current
      ? "Verified by you"
      : record?.withdrawn
        ? "Verification withdrawn"
        : record
          ? "Verification expired"
          : null,
  };
}
export function verificationSignature(state, date = today()) {
  return Object.keys(state.verifications ?? {})
    .sort()
    .map((id) => ({ id, ...verificationFor(state, id, date) }));
}
export function qualificationCopy(q, state) {
  const { record, current, label } = verificationFor(state, q.id);
  if (!record) return q;
  return {
    ...q,
    status: label,
    detail: current
      ? `${record.issuer} · ${record.reference}. Verified ${dateLabel(record.verifiedOn)}. ${record.noExpiry ? "No expiry stated on the document." : `Expires ${dateLabel(record.expiresOn)}.`}`
      : `${record.withdrawn ? "Verification was withdrawn." : `The verified document expired ${dateLabel(record.expiresOn)}.`} ${q.detail}`,
  };
}
export function qualificationSummary(state) {
  const verified = requiredQualifications.filter(
    (q) => verificationFor(state, q.id).current,
  );
  const outstanding = requiredQualifications.filter(
    (q) => !verificationFor(state, q.id).current,
  );
  if (!Object.keys(state.verifications ?? {}).length)
    return "Sea-survival training is recorded, but complete offshore safety certification and medical fitness still need verification. Safety certification is required before mobilisation; the vacancy does not specify when medical fitness must be verified.";
  return [
    verified.length
      ? `Verified by the redeployment officer: ${verified.map((q) => q.title).join(", ")}.`
      : "",
    outstanding.length
      ? `Still to verify: ${outstanding.map((q) => q.title).join(", ")}.`
      : "All required safety certificates and medical clearance have current verification recorded.",
    "Safety certification is required before mobilisation; the vacancy does not specify when medical fitness must be verified.",
  ]
    .filter(Boolean)
    .join(" ");
}
export function summaryWithQualifications(text, state) {
  if (!Object.keys(state.verifications ?? {}).length) return text;
  const base = text
    .replace(
      /; safety certification and medical fitness still need checking\./,
      ".",
    )
    .replace(
      /, but safety certification and medical fitness still need checking\./,
      ".",
    );
  const outstanding = requiredQualifications.filter(
    (q) => !verificationFor(state, q.id).current,
  );
  return `${base} ${outstanding.length ? `Still to verify: ${outstanding.map((q) => q.title).join(", ")}.` : "All required safety certificates and medical clearance have current verification recorded."}`;
}
export function systemTaskComplete(task, state) {
  if (task.id === "prepare-referral") return Boolean(state.referral);
  if (task.id === "certificates")
    return safetyIds.every((id) => verificationFor(state, id).current);
  if (task.id === "career-preferences")
    return Boolean(state.workingPreferences);
  if (task.qualificationId)
    return verificationFor(state, task.qualificationId).current;
  return task.done;
}
export function linkedTask(task) {
  return (
    task.id === "prepare-referral" ||
    task.id === "certificates" ||
    task.id === "career-preferences" ||
    Boolean(task.qualificationId)
  );
}
export function workflowTasks(state) {
  return state.tasks.map((task) => ({
    ...task,
    automatic: task.origin === "system" && linkedTask(task),
    done:
      task.origin === "system" && linkedTask(task)
        ? systemTaskComplete(task, state)
        : task.done,
  }));
}
export function introductionDocument(referral) {
  if (!referral) return null;
  return {
    candidateName: person.name,
    candidateRole: person.role,
    opportunityTitle: vacancy.title,
    employer: vacancy.employer,
    ...Object.fromEntries(
      [
        "format",
        "why",
        "pump",
        "electrical",
        "safety",
        "qualifications",
        "recommendation",
        "includedReports",
      ].map((key) => [key, referral[key]]),
    ),
  };
}
export function introductionVersion(referral) {
  return JSON.stringify({
    document: introductionDocument(referral),
    context: referral?.assessmentSignature,
  });
}
export function currentSend(state) {
  return state.sentIntroductions?.findLast(
    (event) => event.version === introductionVersion(state.referral),
  );
}
export function canSendIntroduction(state) {
  return (
    state.opportunity.assessment === "worth-discussing" &&
    state.opportunity.interest === "interested" &&
    state.referral?.format === 2 &&
    !state.referral.needsReview &&
    !currentSend(state)
  );
}
export function workflowView(state) {
  const { opportunity: o, referral, ready } = state;
  const sent = currentSend(state);
  const introduction = !referral
    ? "Not prepared"
    : referral.needsReview
      ? "Introduction needs review"
      : sent
        ? "Sent to Carrowmore Array · simulated"
        : ready
          ? "Ready for Eimhin’s review"
          : "Introduction draft saved";
  const paused = o.interest === "not-interested" || o.assessment === "not-suitable";
  const progress = paused ? "On hold"
    : referral?.needsReview ? "Reviewing introduction"
    : sent ? "Introduction sent"
    : ready ? "Reviewing with Eimhin"
    : workStages[o.workStage] ?? workStages["to-do"];
  let action, label;
  if (o.interest === "not-interested")
    [action, label] = ["response", "Review Eimhin’s response"];
  else if (o.assessment === "not-suitable")
    [action, label] = ["assessment", "Reconsider suitability"];
  else if (sent && !referral?.needsReview)
    [action, label] = [null, null];
  else if (o.workStage === "discussing" || o.assessment === "needs-clarification" || o.interest === "more-information")
    [action, label] = ["discussion", "Prepare follow-up discussion"];
  else if (o.assessment === "not-reviewed")
    [action, label] = ["assessment", "Review suitability"];
  else if (o.interest !== "interested")
    [action, label] = ["response", "Record Eimhin’s response"];
  else if (referral?.needsReview)
    [action, label] = ["introduction", "Review candidate introduction"];
  else if (!referral)
    [action, label] = ["introduction", "Prepare candidate introduction"];
  else if (ready)
    [action, label] = ["introduction", "Review with Eimhin"];
  else
    [action, label] = ["introduction", "Review candidate introduction"];
  return {
    assessment: o.assessment,
    interest: o.interest,
    introduction,
    progress,
    primary: { action, label },
    tasks: workflowTasks(state),
  };
}

export function questionDiscussed(state, draft) {
  return Boolean(draft.completed || state.reports[draft.id] || state.notes.some((n) => n.topics?.some((t) => t.id === draft.id)));
}
