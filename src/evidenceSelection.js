import {
  claims,
  getSources,
  dateLabel,
  person,
  candidateSummary,
} from "./data.js";

export const recordIds = new Set(
  claims.flatMap((c) => getSources(c).map((r) => r.id)),
);
export const includedRecords = (claim, excluded = []) =>
  getSources(claim).filter((r) => !excluded.includes(r.id));
export const claimChanged = (claim, excluded = []) =>
  getSources(claim).some((r) => excluded.includes(r.id));

// Rebuild affected statements from retained quotations, never from an excluded record.
export function selectedClaim(claim, excluded = []) {
  if (!claimChanged(claim, excluded)) return claim;
  const records = includedRecords(claim, excluded);
  const recent = records.filter((r) => r.date >= "2024-01-01").length;
  const examples = records.filter((r) => r.date >= person.joined).slice(-3);
  const work = examples.length
    ? examples.map((r) => `“${r.highlight || r.original}”`).join(" ")
    : "No included, attributed logbook entries support a description of this work.";
  return {
    ...claim,
    workSummary: work,
    introductionSummary: work,
    evidenceSummary: records.length
      ? `${records.length} included ${records.length === 1 ? "entry" : "entries"} across ${new Set(records.map((r) => r.date.slice(0, 4))).size} separate years, from ${dateLabel(records[0].date)} to ${dateLabel(records.at(-1).date)}. ${recent} from 2024–2026. The logs do not establish how often this was part of his normal duties.`
      : "No logbook entries are included in this assessment.",
  };
}
export function selectedCandidateSummary(excluded = []) {
  if (!excluded.length) return candidateSummary.text;
  const counts = claims
    .slice(0, 2)
    .map(
      (c) =>
        `${includedRecords(c, excluded).length} ${c.id === "pump" ? "pump maintenance" : "electrical maintenance"} entries`,
    );
  return `The assessment includes ${counts.join(" and ")}. Carrowmore Array accepts maintenance experience from other plant. Review the included work below to assess its relevance; safety certification and medical fitness still need checking.`;
}
