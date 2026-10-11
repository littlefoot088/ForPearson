import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  FileText,
  CircleHelp,
  Pencil,
  ClipboardList,
  Waves,
  Trash2,
} from "lucide-react";
import {
  person,
  vacancy,
  requirements,
  requirementGroups,
  claims,
  qualifications,
  trainingRecords,
  interpretations,
  getSources,
  dateLabel,
  initialReview,
  toggleReview,
} from "./data";
import { Icon, Dialog, Highlight } from "./components";
import { RequirementRow, ExpandedAssessment } from "./assessment";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./styles.css";

function App() {
  const [expanded, setExpanded] = useState(null);
  const [review, setReview] = useState(initialReview);
  const [drawer, setDrawer] = useState(null);
  const [index, setIndex] = useState(0);
  const [composer, setComposer] = useState(null);
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [draftOpen, setDraftOpen] = useState(false);
  const [returnToDraft, setReturnToDraft] = useState(false);
  const [notice, setNotice] = useState("");
  const [jobOpen, setJobOpen] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const focusOrigin = useRef(null);
  function rememberFocus() {
    if (!drawer && !composer && !draftOpen && !jobOpen)
      focusOrigin.current = document.activeElement;
  }
  function inspect(item, type, requirement) {
    rememberFocus();
    setIndex(0);
    setDrawer({ type, item, requirement });
  }
  function clarify(item, requirement, fromDraft = false) {
    rememberFocus();
    setReturnToDraft(fromDraft);
    setDrawer(null);
    setDraftOpen(false);
    setComposer({ item, requirement });
    setQuestion(drafts.find((d) => d.id === item.id)?.text ?? item.question);
  }
  function closeComposer() {
    setComposer(null);
    if (returnToDraft) setDraftOpen(true);
  }
  function saveDraft(e) {
    e.preventDefault();
    const draft = {
      id: composer.item.id,
      requirementId: composer.requirement.id,
      title: composer.item.title,
      text: question.trim(),
    };
    setDrafts((ds) =>
      ds.some((d) => d.id === draft.id)
        ? ds.map((d) => (d.id === draft.id ? draft : d))
        : [...ds, draft],
    );
    closeComposer();
    setNotice("Clarification draft saved. Nothing has been sent.");
  }
  function editDraft(draft) {
    const requirement = requirements.find((r) => r.id === draft.requirementId);
    const item = [...claims, ...qualifications].find(
      (i) => i.id === draft.id,
    ) ?? { ...requirement, title: requirement.text };
    clarify(item, requirement, true);
  }
  function flag(q) {
    setVerifications((v) =>
      v.includes(q.id) ? v.filter((id) => id !== q.id) : [...v, q.id],
    );
    setNotice(
      verifications.includes(q.id)
        ? "Verification flag removed."
        : "Flagged for verification. The evidence status is unchanged.",
    );
  }
  function changeReview(field) {
    setReview((current) => toggleReview(current, field));
    setNotice(
      field === "progressing"
        ? review.progressing
          ? "Progression mark removed."
          : "Marked as worth progressing. Outstanding requirements remain open."
        : review.clarification
          ? "Clarification-needed mark removed."
          : "Marked as clarification needed. Nothing has been sent.",
    );
  }
  const selectedSources =
    drawer?.type === "claim" ? getSources(drawer.item) : [];
  const source = selectedSources[index];
  const training =
    drawer?.type === "qualification"
      ? trainingRecords.find((r) => r.id === drawer.item.recordId)
      : null;
  return (
    <>
      <a className="skip" href="#main">
        Skip to candidate review
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon icon={Waves} size={25} />
          </span>
          <span>
            carrowmore<span className="brand-sub">LIGHT AUTHORITY</span>
          </span>
        </div>
        <span className="product-name">Keeper redeployment</span>
        <div className="officer">
          Officer workspace<span className="avatar small">RO</span>
        </div>
      </header>
      <div className="contextbar">
        <nav aria-label="Review context" className="breadcrumbs">
          <span>Assigned vacancies</span>
          <Icon icon={ChevronRight} size={13} />
          <span>Carrowmore Array</span>
          <Icon icon={ChevronRight} size={13} />
          <strong>Candidate review</strong>
        </nav>
      </div>
      <main id="main" className="page">
        <section
          className="candidate-overview"
          aria-labelledby="candidate-name"
        >
          <div className="candidate-heading">
            <div className="candidate-name">
              <div className="avatar large" aria-hidden="true">
                EM
              </div>
              <div>
                <p className="eyebrow">CANDIDATE REVIEW</p>
                <h1 id="candidate-name">{person.name}</h1>
                <p className="candidate-meta">Lighthouse keeper</p>
              </div>
            </div>
          </div>
          <div className="review-focus">
            <h2>Review focus</h2>
            <p>
              Records show repeated pump repairs and electrical fault-finding,
              alongside permit-issuing responsibility. Clarify the scope of
              independent work and current permit authority. Verify complete
              offshore safety coverage, medical clearance and comfort with
              offshore working conditions before mobilisation.
            </p>
          </div>
          <div className="vacancy-context">
            <div>
              <span className="context-label">Being considered for</span>
              <p>
                <strong>{vacancy.title}</strong>
                <span className="vacancy-dot">·</span>
                {vacancy.employer}
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                rememberFocus();
                setJobOpen(true);
              }}
            >
              View role <Icon icon={ArrowUpRight} />
            </button>
          </div>
        </section>
        <section
          className="requirements-section"
          aria-labelledby="requirements-heading"
        >
          <div className="assessment-heading">
            <h2 id="requirements-heading">Requirements assessment</h2>
            <span>Select a requirement to investigate</span>
          </div>
          <div className="requirements-list">
            {requirementGroups.map((group) => (
              <section
                className="requirement-group"
                key={group.id}
                aria-labelledby={"group-" + group.id}
              >
                <div className="requirement-group-heading">
                  <h3 id={"group-" + group.id}>{group.label}</h3>
                  <span>Recorded assessment</span>
                </div>
                {requirements
                  .filter((r) => r.group === group.id)
                  .map((requirement) => (
                    <RequirementRow
                      key={requirement.id}
                      requirement={requirement}
                      expanded={expanded === requirement.id}
                      onToggle={() =>
                        setExpanded((current) =>
                          current === requirement.id ? null : requirement.id,
                        )
                      }
                    >
                      <ExpandedAssessment
                        requirement={requirement}
                        onInspect={inspect}
                        onClarify={clarify}
                        drafts={drafts}
                        verifications={verifications}
                        onFlag={flag}
                      />
                    </RequirementRow>
                  ))}
              </section>
            ))}
          </div>
        </section>
        <section className="review-actions-bar" aria-label="Review actions">
          <div className="review-action-context">
            <strong>Your review</strong>
            <p>
              {review.progressing && review.clarification
                ? "Worth progressing · clarification needed"
                : review.progressing
                  ? "Worth progressing"
                  : review.clarification
                    ? "Clarification needed"
                    : "No decision recorded"}
            </p>
            {drafts.length > 0 && (
              <button
                className="draft-review-button"
                onClick={() => {
                  rememberFocus();
                  setDraftOpen(true);
                }}
              >
                <Icon icon={ClipboardList} />
                Review draft ({drafts.length})
              </button>
            )}
          </div>
          <div className="review-controls">
            <div className="decision-actions">
              <button
                className={
                  "secondary-button" + (review.clarification ? " selected" : "")
                }
                aria-pressed={review.clarification}
                onClick={() => changeReview("clarification")}
              >
                <Icon icon={review.clarification ? Check : CircleHelp} />
                Clarification needed
              </button>
              <button
                className={
                  "primary-button" + (review.progressing ? " selected" : "")
                }
                aria-pressed={review.progressing}
                onClick={() => changeReview("progressing")}
              >
                <Icon icon={review.progressing ? Check : ArrowRight} />
                Worth progressing
              </button>
            </div>
            <p>Both can apply. Progression does not confirm eligibility.</p>
          </div>
        </section>
        <footer className="page-footer">
          <span>
            CARROWMORE LIGHT AUTHORITY <span>/</span> KEEPER REDEPLOYMENT
          </span>
          <span>Changes are local and reset on refresh.</span>
        </footer>
      </main>
      <div role="status" className={notice ? "toast" : "sr-only"}>
        {notice}
        {notice && (
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <Icon icon={X} />
          </button>
        )}
      </div>
      {draftOpen && (
        <Dialog
          title="Clarification draft"
          eyebrow="EIMHIN MAC NEIDHE"
          returnFocus={focusOrigin}
          onClose={() => setDraftOpen(false)}
        >
          <div className="draft-review">
            <p className="draft-review-intro">
              Review your questions before any future contact. Nothing has been
              sent.
            </p>
            {drafts.length === 0 ? (
              <p className="draft-empty">
                No questions remain. Add a question from a requirement.
              </p>
            ) : (
              drafts.map((draft) => (
                <article className="draft-item" key={draft.id}>
                  <p className="eyebrow">
                    {
                      requirements.find((r) => r.id === draft.requirementId)
                        .text
                    }
                  </p>
                  <h3>{draft.title}</h3>
                  <p className="draft-question">{draft.text}</p>
                  <div className="detail-actions">
                    <button
                      className="text-button"
                      onClick={() => editDraft(draft)}
                    >
                      <Icon icon={Pencil} />
                      Edit question
                    </button>
                    <button
                      className="subtle-button"
                      onClick={() => {
                        if (drafts.length === 1) {
                          focusOrigin.current = document.getElementById(
                            "requirement-" + draft.requirementId,
                          );
                          setDraftOpen(false);
                        }
                        setDrafts((ds) => ds.filter((d) => d.id !== draft.id));
                        setNotice("Question removed from the draft.");
                      }}
                    >
                      <Icon icon={Trash2} size={14} />
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </Dialog>
      )}
      {drawer && (
        <Dialog
          wide
          eyebrow={
            drawer.type === "claim"
              ? "SUPPORTING EVIDENCE"
              : "QUALIFICATION RECORD"
          }
          title={drawer.item.title}
          returnFocus={focusOrigin}
          onClose={() => setDrawer(null)}
        >
          <div className="drawer-body">
            <p className="evidence-context">
              {drawer.requirement.text} <Icon icon={ChevronRight} size={13} />{" "}
              Supporting evidence
            </p>
            {source ? (
              <>
                <p className="drawer-intro">
                  Read the record behind the suggestion.
                </p>
                <div
                  className="source-tabs"
                  aria-label="Select supporting record"
                >
                  {selectedSources.map((s, i) => (
                    <button
                      key={s.id}
                      className={index === i ? "selected" : ""}
                      aria-pressed={index === i}
                      onClick={() => setIndex(i)}
                    >
                      {dateLabel(s.date)}
                    </button>
                  ))}
                </div>
                <div className="record-nav">
                  <span>
                    Record {index + 1} of {selectedSources.length}
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      disabled={index === 0}
                      aria-label="Previous evidence record"
                      onClick={() => setIndex(index - 1)}
                    >
                      <Icon icon={ChevronLeft} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={index === selectedSources.length - 1}
                      aria-label="Next evidence record"
                      onClick={() => setIndex(index + 1)}
                    >
                      <Icon icon={ChevronRight} />
                    </button>
                  </div>
                </div>
                <p className="eyebrow">ORIGINAL RECORD · VERBATIM</p>
                <blockquote>
                  <Highlight
                    text={source.original}
                    passage={source.highlight}
                  />
                </blockquote>
                <dl className="source-details">
                  <dt>Date</dt>
                  <dd>
                    {dateLabel(source.date)}{" "}
                    <span>(recorded as {source.rawDate})</span>
                  </dd>
                  <dt>Station</dt>
                  <dd>{source.station}</dd>
                  <dt>Source file</dt>
                  <dd>{source.source}</dd>
                  <dt>Record</dt>
                  <dd>{source.recordId}</dd>
                  <dt>Person reference</dt>
                  <dd>{source.personRef}</dd>
                </dl>
                {source.date < person.joined && (
                  <div className="record-context">
                    <strong>Employment-date context</strong>
                    <p>
                      This entry carries keeper code {person.id} and predates
                      the personnel joining date of {dateLabel(person.joined)}.
                      It is included as relevant experience evidence. The reason
                      for the date difference is not established; earlier
                      contract or part-time service is one possible explanation.
                    </p>
                  </div>
                )}
                <div className="interpretation">
                  <p className="eyebrow">SYSTEM INTERPRETATION</p>
                  <p>{interpretations[source.id]}</p>
                </div>
                <div className="drawer-limitation">
                  <Icon icon={CircleHelp} />
                  <div>
                    <strong>What this does not establish</strong>
                    <p>{drawer.item.limitation}</p>
                  </div>
                </div>
                <details className="raw-details">
                  <summary>View original record fields</summary>
                  <pre>
                    {typeof source.rawRecord === "string"
                      ? source.rawRecord
                      : JSON.stringify(source.rawRecord, null, 2)}
                  </pre>
                </details>
                <p className="identity-note">
                  Identity linked using personnel postings and LearnHub’s
                  keeper-code / payroll-reference pair. Attribution is curated,
                  not live verification.
                </p>
              </>
            ) : (
              <>
                <p className="status-line">{drawer.item.status}</p>
                <p>{drawer.item.detail}</p>
                {training && (
                  <>
                    <p className="eyebrow record-label">
                      ORIGINAL LEARNHUB RECORD
                    </p>
                    <dl className="source-details">
                      <dt>Record ID</dt>
                      <dd>{training.id}</dd>
                      <dt>Title</dt>
                      <dd>{training.title}</dd>
                      <dt>Outcome</dt>
                      <dd>
                        <mark>{training.outcome}</mark>
                      </dd>
                      <dt>Completed on</dt>
                      <dd>{dateLabel(training.completed_on)}</dd>
                      <dt>Expiry field</dt>
                      <dd>{dateLabel(training.expires_on)}</dd>
                      <dt>Keeper code</dt>
                      <dd>{training.keeper_code}</dd>
                      <dt>Source</dt>
                      <dd>raw/training/vendor-c-learnhub-2017-2026.json</dd>
                    </dl>
                  </>
                )}
                <div className="drawer-limitation">
                  <Icon icon={CircleHelp} />
                  <div>
                    <strong>Interpretation and limits</strong>
                    <p>
                      A recorded module is not a complete certificate.
                      Attendance does not establish a pass, and an expiry field
                      cannot establish completion. No external verification has
                      taken place.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <footer className="drawer-footer">
            <button
              className="primary-button"
              onClick={() => clarify(drawer.item, drawer.requirement)}
            >
              <Icon icon={Pencil} />
              Draft a clarification
            </button>
            <span>Draft only · not sent.</span>
          </footer>
        </Dialog>
      )}
      {composer && (
        <Dialog
          title="Draft a clarification"
          eyebrow={composer.requirement.text}
          returnFocus={focusOrigin}
          onClose={closeComposer}
        >
          <form className="composer" onSubmit={saveDraft}>
            <p>For Eimhin Mac Neidhe · {composer.item.title}</p>
            <label htmlFor="question">Question for the keeper</label>
            <textarea
              id="question"
              rows={6}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              maxLength={2000}
            />
            <p className="composer-note">
              This creates an editable local draft. It will not send a message
              or change the review decision.
            </p>
            <div className="composer-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeComposer}
              >
                Cancel
              </button>
              <button className="primary-button" disabled={!question.trim()}>
                Save draft <Icon icon={Check} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {jobOpen && (
        <Dialog
          title="Wind Turbine Technician"
          eyebrow="CARROWMORE ARRAY · O&M"
          returnFocus={focusOrigin}
          onClose={() => setJobOpen(false)}
        >
          <div className="job-details">
            <p>
              {vacancy.base} · {vacancy.openings}
            </p>
            <p>{vacancy.pattern}, based on the service operations vessel.</p>
            <h3>Essential</h3>
            <ul>
              <li>
                Hands-on mechanical or electrical maintenance on plant the
                candidate was responsible for.
              </li>
              <li>
                Valid offshore safety coverage: sea survival, fire, first aid
                and working at height.
              </li>
              <li>Offshore medical fitness.</li>
              <li>
                Comfort at height, in enclosed spaces and on a boat in a swell.
              </li>
            </ul>
            <h3>Valued experience</h3>
            <p>
              Generating plant, electrical fault-finding, permit systems and
              supporting younger colleagues.
            </p>
            <h3>Prior wind experience is not required</h3>
            <p>
              The employer offers training and pays for safety renewals, but
              cannot mobilise a candidate without valid coverage.
            </p>
            <p className="identity-note">
              Source: {vacancy.source}. Employer requirements are summarised;
              acceptance of specific certificates must be confirmed.
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
