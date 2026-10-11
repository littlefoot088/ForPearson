import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Plus,
  FileText,
  CircleHelp,
  CheckCircle2,
  Clock3,
  Pencil,
  ClipboardList,
  Waves,
  ShieldCheck,
} from "lucide-react";
import {
  person,
  vacancy,
  claims,
  qualifications,
  trainingRecords,
  interpretations,
  getSources,
  dateLabel,
} from "./data";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./styles.css";

function Icon({ icon: Component, ...props }) {
  return (
    <Component size={16} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
function Dialog({ title, eyebrow, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "drawer" : "modal"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-inner">
        <header className="dialog-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="dialog-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            autoFocus
          >
            <Icon icon={X} size={22} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
function Highlight({ text, passage }) {
  const start = text.indexOf(passage);
  if (start < 0) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark>{passage}</mark>
      {text.slice(start + passage.length)}
    </>
  );
}
function App() {
  const [status, setStatus] = useState("In review");
  const [drawer, setDrawer] = useState(null);
  const [index, setIndex] = useState(0);
  const [composer, setComposer] = useState(null);
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [notice, setNotice] = useState("");
  const [jobOpen, setJobOpen] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [moreTraining, setMoreTraining] = useState(false);
  function inspect(claim, i = 0) {
    setIndex(i);
    setDrawer({ type: "claim", item: claim });
  }
  function clarify(item) {
    setDrawer(null);
    setComposer(item);
    setQuestion(drafts.find((d) => d.id === item.id)?.text ?? item.question);
  }
  function saveDraft(e) {
    e.preventDefault();
    const draft = {
      id: composer.id,
      title: composer.title,
      text: question.trim(),
    };
    setDrafts((ds) => [...ds.filter((d) => d.id !== draft.id), draft]);
    setComposer(null);
    setNotice("Clarification draft saved locally. Nothing has been sent.");
  }
  function flag(q) {
    setVerifications((v) =>
      v.includes(q.id) ? v.filter((id) => id !== q.id) : [...v, q.id],
    );
    setNotice(
      verifications.includes(q.id)
        ? "Verification flag removed."
        : "Flagged for verification in this review.",
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
        <div className="product-name">Keeper redeployment</div>
        <div className="officer">
          <span className="officer-dot" />
          Officer workspace<span className="avatar small">RO</span>
        </div>
      </header>
      <div className="contextbar">
        <div className="breadcrumbs">
          <span>Assigned vacancies</span>
          <Icon icon={ChevronRight} size={13} />
          <span>Carrowmore Array</span>
          <Icon icon={ChevronRight} size={13} />
          <strong>Candidate review</strong>
        </div>
        <span className="prototype">
          <span />
          Prototype · local review
        </span>
      </div>
      <main id="main" className="page">
        <section className="vacancy-bar">
          <div>
            <span className="eyebrow">REVIEWING FOR</span>
            <div className="vacancy-title">
              {vacancy.title}
              <span className="vacancy-divider" />
              <span>{vacancy.employer}</span>
            </div>
          </div>
          <div className="vacancy-end">
            <span className="openings">{vacancy.openings}</span>
            <button className="text-button" onClick={() => setJobOpen(true)}>
              Role requirements <Icon icon={ArrowUpRight} />
            </button>
          </div>
        </section>
        <section className="candidate-header">
          <div className="candidate-name">
            <div className="avatar large">EM</div>
            <div>
              <p className="eyebrow">
                SUGGESTED CANDIDATE{" "}
                <span className="keeper-id">/ {person.id}</span>
              </p>
              <h1>{person.name}</h1>
              <p className="candidate-meta">
                Lighthouse keeper <span>·</span> Personnel joining date: 6 Nov
                2009
              </p>
            </div>
          </div>
          <div className="review-state">
            <span
              className={
                "status " +
                (status === "Worth progressing" ? "progressing" : "")
              }
            >
              <span />
              {status}
            </span>
            <span>Review as of 31 Dec 2026</span>
          </div>
        </section>
        <section className="rationale">
          <div className="rationale-label">
            <span className="spark">↗</span>
            <span>WHY SUGGESTED</span>
          </div>
          <div>
            <h2>
              Practical maintenance experience. A credible starting point.
            </h2>
            <p>
              Records describe repeated pump repairs and electrical
              fault-finding, alongside permit responsibility. Offshore
              certification and the scope of independent work still need
              clarification.
            </p>
          </div>
          <span className="curated-label">
            <Icon icon={FileText} />
            Curated evidence
          </span>
        </section>
        <div className="review-grid">
          <section className="experience" aria-labelledby="experience-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">WHAT THE RECORDS SUGGEST</p>
                <h2 id="experience-heading">Potential relevant experience</h2>
              </div>
              <span className="count-label">3 areas</span>
            </div>
            <p className="section-intro">
              Transferable experience, with the evidence and its limits in view.
            </p>
            <div className="experience-list">
              {claims.map((claim) => {
                const records = getSources(claim);
                return (
                  <article className="experience-item" key={claim.id}>
                    <div className="experience-top">
                      <span className="area-number">{claim.number}</span>
                      <div>
                        <h3>{claim.title}</h3>
                        <span className="pattern">{claim.pattern}</span>
                      </div>
                      <button
                        className="evidence-arrow"
                        onClick={() => inspect(claim)}
                        aria-label={"Inspect " + claim.title + " evidence"}
                      >
                        <Icon icon={ArrowUpRight} size={21} />
                      </button>
                    </div>
                    <p className="experience-summary">{claim.summary}</p>
                    <p className="relevance">{claim.relevance}</p>
                    <div
                      className="evidence-strip"
                      aria-label="Selected source dates"
                    >
                      {records.map((record, i) => (
                        <button
                          className="date-marker"
                          key={record.id}
                          onClick={() => inspect(claim, i)}
                          aria-label={
                            "Inspect record dated " + dateLabel(record.date)
                          }
                        >
                          <span className="marker-dot" />
                          <span>{dateLabel(record.date)}</span>
                        </button>
                      ))}
                    </div>
                    <div className="evidence-meta">
                      <span>
                        <Icon icon={FileText} />
                        {records.length} selected supporting records
                      </span>
                      <span>{claim.involvement}</span>
                    </div>
                    <div className="limitation">
                      <Icon icon={CircleHelp} />
                      <p>{claim.limitation}</p>
                    </div>
                    <div className="claim-actions">
                      <button
                        className="text-button"
                        onClick={() => inspect(claim)}
                      >
                        Inspect evidence <Icon icon={ArrowRight} />
                      </button>
                      <button
                        className="subtle-button"
                        onClick={() => clarify(claim)}
                      >
                        <Icon
                          icon={
                            drafts.some((d) => d.id === claim.id)
                              ? Pencil
                              : Plus
                          }
                        />
                        {drafts.some((d) => d.id === claim.id)
                          ? "Edit draft"
                          : "Draft a question"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="evidence-footnote">
              <Icon icon={CircleHelp} />
              Dates show selected records, not every occasion the work was
              performed. Gaps do not indicate inactivity. Present competence has
              not been independently assessed.
            </p>
          </section>
          <aside
            className="qualifications"
            aria-labelledby="qualifications-heading"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">WHAT THE ROLE REQUIRES</p>
                <h2 id="qualifications-heading">Formal qualifications</h2>
              </div>
              <Icon icon={ShieldCheck} size={24} />
            </div>
            <p className="section-intro">
              Practical experience and certification are separate.
            </p>
            <div className="readiness-note">
              <Icon icon={CircleHelp} size={18} />
              <div>
                <strong>Mobilisation readiness is not established</strong>
                <p>
                  Check certificate coverage and currency before offshore
                  mobilisation.
                </p>
              </div>
            </div>
            <p className="qualification-group">
              REQUIRED COVERAGE <span>5 checks</span>
            </p>
            {qualifications
              .filter((q) => q.required)
              .map((q) => (
                <Qualification
                  key={q.id}
                  q={q}
                  flagged={verifications.includes(q.id)}
                  onInspect={() => {
                    setIndex(0);
                    setDrawer({ type: "qualification", item: q });
                  }}
                  onFlag={() => flag(q)}
                  onClarify={() => clarify(q)}
                />
              ))}
            <div className="scheme-note">
              The vacancy includes height coverage; the supplied offshore scheme
              lists height separately. Confirm accepted certification with the
              employer.
            </div>
            <button
              className="additional-toggle"
              onClick={() => setMoreTraining(!moreTraining)}
              aria-expanded={moreTraining}
            >
              <span>
                Additional relevant training{" "}
                <span className="mini-count">2</span>
              </span>
              <Icon icon={moreTraining ? X : Plus} />
            </button>
            {moreTraining &&
              qualifications
                .filter((q) => !q.required)
                .map((q) => (
                  <Qualification
                    key={q.id}
                    q={q}
                    flagged={verifications.includes(q.id)}
                    onInspect={() =>
                      setDrawer({ type: "qualification", item: q })
                    }
                    onFlag={() => flag(q)}
                    onClarify={() => clarify(q)}
                  />
                ))}
            <div className="qualification-footer">
              <Icon icon={FileText} />
              <p>
                Module records are not complete certificates. “Not established”
                means the selected records do not answer the question.
              </p>
            </div>
          </aside>
        </div>
        <section className="next-step" aria-labelledby="next-heading">
          <div className="next-heading">
            <span className="next-icon">
              <Icon icon={ClipboardList} size={22} />
            </span>
            <div>
              <p className="eyebrow">YOUR JUDGEMENT, YOUR NEXT STEP</p>
              <h2 id="next-heading">Bring the open questions into focus</h2>
              <p>
                Clarify existing experience and certificates before identifying
                training needs.
              </p>
            </div>
          </div>
          <div className="drafts-header">
            <strong>
              Clarification drafts{" "}
              <span className="mini-count">{drafts.length}</span>
            </strong>
            <span>Local only · nothing is sent</span>
          </div>
          {drafts.length === 0 ? (
            <div className="empty-drafts">
              <Icon icon={Pencil} size={19} />
              <span>
                No drafts yet. Start from an experience area or qualification.
              </span>
            </div>
          ) : (
            <div className="draft-list">
              {drafts.map((d) => (
                <article key={d.id}>
                  <span className="draft-tag">DRAFT</span>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={"Edit draft for " + d.title}
                    onClick={() =>
                      clarify(
                        [...claims, ...qualifications].find(
                          (i) => i.id === d.id,
                        ),
                      )
                    }
                  >
                    <Icon icon={Pencil} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={"Remove draft for " + d.title}
                    onClick={() => {
                      setDrafts((ds) => ds.filter((x) => x.id !== d.id));
                      setNotice("Draft removed.");
                    }}
                  >
                    <Icon icon={X} />
                  </button>
                </article>
              ))}
            </div>
          )}
          <div className="decision-row">
            <div>
              <strong>Record your review</strong>
              <p>Progressing a candidate does not confirm eligibility.</p>
            </div>
            <div className="decision-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setStatus("Clarification required");
                  setNotice(
                    "Review marked as clarification required. Nothing has been sent.",
                  );
                }}
              >
                <Icon icon={CircleHelp} />
                Clarification required
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setStatus("Worth progressing");
                  setNotice(
                    "Marked as worth progressing. Outstanding requirements remain open.",
                  );
                }}
              >
                <Icon icon={Check} />
                Worth progressing
              </button>
            </div>
          </div>
          {status !== "In review" && (
            <button
              className="reset-status text-button"
              onClick={() => {
                setStatus("In review");
                setNotice("Review decision cleared.");
              }}
            >
              Clear review decision
            </button>
          )}
        </section>
        <footer className="page-footer">
          <span>
            CARROWMORE <span> / </span> KEEPER REDEPLOYMENT
          </span>
          <span>
            Synthetic records · Demonstration only · Changes reset on refresh
          </span>
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
      {drawer && (
        <Dialog
          wide
          eyebrow={
            drawer.type === "claim"
              ? "SUPPORTING EVIDENCE"
              : "QUALIFICATION RECORD"
          }
          title={drawer.item.title}
          onClose={() => setDrawer(null)}
        >
          <div className="drawer-body">
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
              onClick={() => clarify(drawer.item)}
            >
              <Icon icon={Pencil} />
              Draft a clarification
            </button>
            <span>Saved locally. Not sent.</span>
          </footer>
        </Dialog>
      )}
      {composer && (
        <Dialog
          title="Draft a clarification"
          eyebrow={composer.title}
          onClose={() => setComposer(null)}
        >
          <form className="composer" onSubmit={saveDraft}>
            <p>For Eimhin Mac Neidhe · linked to this review</p>
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
                onClick={() => setComposer(null)}
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
function Qualification({ q, flagged, onInspect, onFlag, onClarify }) {
  return (
    <article className="qualification">
      <h3>{q.title}</h3>
      <div className={"qualification-status " + q.tone}>
        <Icon
          icon={
            q.tone === "positive"
              ? CheckCircle2
              : q.tone === "attention"
                ? Clock3
                : CircleHelp
          }
        />
        {q.status}
      </div>
      <p>{q.detail}</p>
      <div className="qualification-actions">
        {q.recordId ? (
          <button onClick={onInspect}>
            View record <Icon icon={ArrowUpRight} size={13} />
          </button>
        ) : (
          <button onClick={onClarify}>
            Draft a question <Icon icon={Plus} size={13} />
          </button>
        )}
        <button
          onClick={onFlag}
          aria-pressed={flagged}
          className={flagged ? "flagged" : ""}
        >
          {flagged ? (
            <>
              <Icon icon={Check} size={13} />
              Flagged
            </>
          ) : (
            "Flag for verification"
          )}
        </button>
      </div>
    </article>
  );
}
createRoot(document.getElementById("root")).render(<App />);
