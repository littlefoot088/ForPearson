import React from "react";
import {
  FileText,
  Files,
  Clock3,
  CircleHelp,
  CircleDashed,
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
  Pencil,
  Check,
  Flag,
} from "lucide-react";
import { Icon } from "./components";
import {
  assessmentStates,
  claims,
  qualifications,
  getSources,
  dateLabel,
  reviewDate,
} from "./data";

const statusIcons = {
  file: FileText,
  module: Files,
  clock: Clock3,
  question: CircleHelp,
  circle: CircleDashed,
  check: CheckCircle2,
};
export function RequirementRow({ requirement, expanded, onToggle, children }) {
  const status = assessmentStates[requirement.assessment];
  return (
    <article className={"requirement-row" + (expanded ? " expanded" : "")}>
      <h3>
        <button
          id={"requirement-" + requirement.id}
          className="requirement-trigger"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={"assessment-" + requirement.id}
        >
          <span className="requirement-name">{requirement.text}</span>
          <span className={"assessment-status " + status.tone}>
            <Icon icon={statusIcons[status.icon]} size={17} />
            {status.label}
          </span>
          <Icon icon={ChevronDown} size={17} className="expand-chevron" />
        </button>
      </h3>
      <div
        hidden={!expanded}
        id={"assessment-" + requirement.id}
        className="expanded-assessment"
        role="region"
        aria-labelledby={"requirement-" + requirement.id}
      >
        {expanded && children}
      </div>
    </article>
  );
}
function ExperienceDetail({ claim, onInspect, onClarify, drafted }) {
  const records = getSources(claim);
  const first = records[0],
    latest = records[records.length - 1];
  return (
    <section className="claim-detail" aria-labelledby={"claim-" + claim.id}>
      <div className="claim-heading">
        <h4 id={"claim-" + claim.id}>{claim.title}</h4>
        <span>{claim.involvement}</span>
      </div>
      <p>{claim.summary}</p>
      <dl className="experience-facts">
        <div>
          <dt>Selected supporting records</dt>
          <dd>
            {records.length} · {claim.pattern}
          </dd>
        </div>
        <div>
          <dt>Documented span</dt>
          <dd>
            {dateLabel(first.date)} – {dateLabel(latest.date)}
          </dd>
        </div>
        <div>
          <dt>Latest selected activity</dt>
          <dd>{dateLabel(latest.date)}</dd>
        </div>
      </dl>
      <p className="assessment-limit">
        <strong>To clarify:</strong> {claim.limitation}
      </p>
      <div className="detail-actions">
        <button className="text-button" onClick={() => onInspect(claim)}>
          Inspect {records.length} records <Icon icon={ArrowUpRight} />
        </button>
        <button className="subtle-button" onClick={() => onClarify(claim)}>
          <Icon icon={Pencil} />
          {drafted ? "Edit clarification" : "Ask for clarification"}
        </button>
      </div>
    </section>
  );
}
function QualificationDetail({
  q,
  onInspect,
  onClarify,
  flagged,
  onFlag,
  drafted,
  supporting = false,
}) {
  return (
    <section
      className={
        "qualification-detail" + (supporting ? " supporting-training" : "")
      }
      aria-label={q.title}
    >
      {supporting && <h4>{q.title}</h4>}
      <div className="qualification-detail-title">
        <strong>{q.status}</strong>
        {supporting && <span>Supporting module</span>}
      </div>
      <p>{q.detail}</p>
      {!supporting && (
        <p className="assessment-limit">
          {q.id === "medical"
            ? "Current offshore clearance needs confirmation. Clinical details are not required."
            : "The required certificate has not been established. Check existing documentation and employer acceptance before identifying any training need."}
        </p>
      )}
      {q.id === "height" && (
        <p className="assessment-limit">
          The vacancy includes height coverage; the supplied offshore scheme
          lists it separately. Confirm the accepted combination with Carrowmore
          Array.
        </p>
      )}
      <div className="detail-actions">
        {q.recordId && (
          <button className="text-button" onClick={() => onInspect(q)}>
            View training record <Icon icon={ArrowUpRight} />
          </button>
        )}
        <button className="subtle-button" onClick={() => onClarify(q)}>
          <Icon icon={Pencil} />
          {drafted ? "Edit verification question" : "Ask for verification"}
        </button>
        <button
          className={"verification-button" + (flagged ? " flagged" : "")}
          aria-pressed={flagged}
          onClick={() => onFlag(q)}
        >
          <Icon icon={flagged ? Check : Flag} size={14} />
          {flagged ? "Flagged for verification" : "Flag for verification"}
        </button>
      </div>
    </section>
  );
}
export function ExpandedAssessment({
  requirement,
  onInspect,
  onClarify,
  drafts,
  verifications,
  onFlag,
}) {
  const linkedClaims = (requirement.claimIds ?? []).map((id) =>
    claims.find((c) => c.id === id),
  );
  const linkedQualifications = (requirement.qualificationIds ?? []).map((id) =>
    qualifications.find((q) => q.id === id),
  );
  const hasDraft = (id) => drafts.some((d) => d.id === id);
  return (
    <>
      {requirement.detail && (
        <p className="requirement-detail-intro">{requirement.detail}</p>
      )}
      {linkedClaims.map((claim) => (
        <ExperienceDetail
          key={claim.id}
          claim={claim}
          onInspect={(item) => onInspect(item, "claim", requirement)}
          onClarify={(item) => onClarify(item, requirement)}
          drafted={hasDraft(claim.id)}
        />
      ))}
      {linkedClaims.length > 0 && (
        <p className="selected-records-note">
          These are selected records, not counts of every occasion the work was
          performed. The evidence supports potential; it does not independently
          verify present competence.
        </p>
      )}
      {requirement.type === "experience" && linkedQualifications.length > 0 ? (
        <details className="related-training">
          <summary>
            Related training records <span>{linkedQualifications.length}</span>
          </summary>
          {linkedQualifications.map((q) => (
            <QualificationDetail
              key={q.id}
              q={q}
              supporting
              onInspect={(item) =>
                onInspect(item, "qualification", requirement)
              }
              onClarify={(item) => onClarify(item, requirement)}
              flagged={verifications.includes(q.id)}
              onFlag={onFlag}
              drafted={hasDraft(q.id)}
            />
          ))}
        </details>
      ) : (
        linkedQualifications.map((q) => (
          <QualificationDetail
            key={q.id}
            q={q}
            onInspect={(item) => onInspect(item, "qualification", requirement)}
            onClarify={(item) => onClarify(item, requirement)}
            flagged={verifications.includes(q.id)}
            onFlag={onFlag}
            drafted={hasDraft(q.id)}
          />
        ))
      )}
      {linkedQualifications.length > 0 && (
        <p className="assessment-date">
          Expiry interpretation as of {dateLabel(reviewDate)}.
        </p>
      )}
      {requirement.type === "clarification" && (
        <button
          className="text-button"
          onClick={() =>
            onClarify({ ...requirement, title: requirement.text }, requirement)
          }
        >
          <Icon icon={Pencil} />
          {hasDraft(requirement.id)
            ? "Edit clarification"
            : "Ask for clarification"}
        </button>
      )}
    </>
  );
}
