# Data decisions

## Selected person and vacancy

Eimhin Mac Neidhe, keeper code **K0104**, is reviewed against `employers/carrowmore-array-om-technician.md`. The brief asks for 40 potential interview candidates, not 40 available openings. The vacancy requires hands-on maintenance, offshore safety coverage, medical fitness and comfort in the offshore working environment. It values permit experience; it does not require prior wind experience or the separate HV Authorised Person award.

The selected records demonstrate repeated repairs, older and recent electrical work, and planning/permit responsibility. No observation or supervision label has been invented where the records do not establish it. “Hands-on work recorded” does not claim independent performance.

## Identity and date decisions

`raw/personnel/cla_personnel_export.csv` identifies `MAC NEIDHE E`, K0104, with a recorded joining date of 6 November 2009. Named 2014–2017 records identify Eimhin Mac Neidhe at Dunsaille and Rossanvoe, consistent with the DUN and ROS postings. Other people sharing the surname have different initials and keeper codes; they are not merged.

LearnHub records, including LH500003, LH500008 and LH500010, explicitly contain both K0104 and payroll reference 0012801. Across LearnHub, the selected reference links to K0104 only. This supports linking the selected recent spreadsheet entries bearing 0012801 or the leading-zero-stripped 12801. Their stations fit the personnel postings: ERR in 2022–2024 and GOW in 2025–2026. This corroborated attribution is documented rather than treated as external identity verification. The raw pack README’s general warning about a missing payroll mapping is not silently ignored; the selected LearnHub rows provide a specific cross-reference.

The user chose **31 December 2026** as the fictional review date. The pack’s stated March preparation date and February LearnHub extraction date conflict with later records. Those metadata conflicts remain a known limitation; neither date has been presented as a reliable snapshot boundary. The fixture deliberately includes the approved later 2026 entries. Both 2009 entries remain in the selected-record counts at the user’s request, with one attribution caveat on each affected experience area. They are accessible evidence candidates, not confirmed experience attributed to Eimhin until checked. The date discrepancy is unresolved; the UI offers an independent internal record-review flag and does not invent a reason for it. Flagging or unflagging does not resolve attribution.

Selected mixed-format dates are unambiguous (for example 12/26/2026). Normalised dates are shown alongside raw dates. Original text, spelling, capitalisation and punctuation remain unchanged. Raw data-row locations count parsed CSV records starting at one, excluding the header; they are not invented source record IDs.

## Selected source evidence

The fixture in `src/records.js` contains original text, highlighted substrings, source path, raw date, source locator, identity reference and original row fields. It was extracted directly from the supplied ZIP, not the clean subset.

| Experience                  | Date        | Raw source and locator                                                                            |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Pump repair                 | 13 Mar 2009 | `raw/logbooks/era2-keeperlog/KLOG2009.DAT`, REC_ID 002666                                         |
| Electrical fault correction | 27 May 2009 | `raw/logbooks/era2-keeperlog/KLOG2009.DAT`, REC_ID 005386                                         |
| Pump repair                 | 6 Aug 2010  | `raw/logbooks/era2-keeperlog/KLOG2010.DAT`, REC_ID 007616                                         |
| Pump repair                 | 27 Sep 2024 | `raw/logbooks/era3-spreadsheets/station-logs-2022-2026.csv`, date + keeper 0012801                |
| Pump repair                 | 10 Oct 2025 | Same CSV, date + keeper 12801                                                                     |
| Pump rebuild                | 21 Apr 2026 | Same CSV, date + keeper 0012801                                                                   |
| Electrical control          | 21 Sep 2011 | `raw/logbooks/era2-keeperlog/KLOG2011.DAT`, REC_ID 009447                                         |
| Electrical fault-finding    | 1 Jan 2018  | `raw/logbooks/era3-spreadsheets/station-logs-2018-2021.csv`, date + keeper 0012801                |
| Charger fault correction    | 26 Dec 2026 | `raw/logbooks/era3-spreadsheets/station-logs-2022-2026.csv`, raw date 12/26/2026 + keeper 0012801 |
| Safe-work planning          | 15 Apr 2014 | `raw/logbooks/era3-spreadsheets/station-logs-2014-2017.csv`, date + Eimhin Mac Neidhe             |
| Permit responsibility       | 19 Aug 2025 | `raw/logbooks/era3-spreadsheets/station-logs-2022-2026.csv`, date + keeper 0012801                |

Exact parsed-row locations for the CSV entries are included in the fixture and evidence inspector. KEEPERLOG files were decoded as CP1252. Raw activity text is separate from curated interpretations in `src/data.js`.

Five pump records, four electrical records and two safe-work records are deliberately selected examples, not exhaustive search totals or counts of actual work. Date markers show those records, not continuous activity or a competence score. Repeated wording on different dates may reflect routine work or templated entries; it does not prove distinct independently verified repairs. `verified_by`, including “self”, is preserved in raw fields but never treated as verification of present competence.

## Formal qualification records

All four displayed training records come from `raw/training/vendor-c-learnhub-2017-2026.json` and retain their original fields.

| Record             | Interpretation as of 31 Dec 2026                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| LH500010 · OSSC-SS | Sea-survival module: Pass, expiry 3 May 2028. Not proof of the complete offshore award.                                                               |
| LH500003 · OSSC-FF | Fire-response module: Attended, expiry field 18 Aug 2025. Attendance does not establish completion; do not label this an expired awarded certificate. |
| LH500008 · MPMC-B  | Pumped-systems module: Pass, expiry 5 Dec 2028. Additional relevant training, not an essential named award.                                           |
| LH500001 · MECS-2  | Generator-control module: Pass, expired 14 Jul 2022. Does not negate practical experience or establish a complete MECS stage.                         |

First aid, height certification and medical fitness are “not established by the selected records”, not “never held”. No clinical or unrelated appraisal information is included. Employer acceptance must be checked: the O&M posting includes height coverage in its safety requirement, while `employers/certification_schemes.json` separates OSSC and WAHS. The UI does not invent equivalence or additional mandatory schemes.

The NOSF Offshore Wind Turbine Technician occupation was inspected for context, but employer wording is used in the page; the prototype does not implement a taxonomy mapping or assert a NOSF award.

## Assessment semantics and narrative provenance

`src/data.js` separates people, vacancies, requirements, claims, interpretations and formal qualification records. Mechanical and electrical maintenance remain alternatives under one essential requirement. Permits and supporting colleagues remain employer preferences. Unknown evidence is not a confirmed absence; no current required qualification is marked Documented.

`candidateSummary` is authored copy linked to the pump/electrical claims, seven attributed post-joining records and the O&M vacancy. It does not use the two disputed early records. The employer accepts maintenance on other plant and does not require prior wind experience; this does not establish that Eimhin lacks wind experience or prove turbine competence. The summary names independent responsibility and safety/medical checks as unresolved.

The candidate introduction adds safe-work and permit evidence and records nine attributed source IDs internally. Both uncertain early records remain available in selected counts and inspection but are excluded from the referral recommendation. Source metadata and inspection links are for the reviewer, separately from employer-facing text. The short qualification summary states that complete offshore safety certification and medical fitness remain unverified, without listing every module or expiry date. All four detailed training interpretations remain unchanged in the internal assessment.

Safety certification is required before mobilisation. Medical fitness is essential with verification timing unspecified. No certificate-verification rule is invented for interview or referral.

## Workflow, private notes and reported information

The initial Interested response is illustrative workflow state, visibly labelled; it is not a historical fact. Career intention remains unknown and preferences remain null. Edited responses are manually recorded prototype responses. No automatic consent or communication occurs.

Private conversation notes require a user-entered date and text, with optional follow-up. No dates or conversations are fabricated. Notes remain excluded from generated referrals. A follow-up within a note is a reminder, not an automatically created task.

The small new-information example records pump/electrical responsibilities explicitly as reported by Eimhin, with a date supplied by the user. It neither overwrites original evidence nor independently verifies competence. Explicit inclusion copies a snapshot into the referral under self-reported information; edited referral wording retains that provenance. Changes to an included account invalidate readiness and mark the draft for review. They never silently overwrite saved wording; the editor offers Use latest reported account.

Qualification checks are linked tasks with stable IDs. Their completion, reopening or removal does not change qualification status. General certificate tasks remain distinct from individual qualification checks. Record flags and discussion questions remain separate; questions are deduplicated by topic, with independent mechanical/electrical topics.

## Candidate introduction and review status

The candidate introduction is a presentation of the existing assessment, not another qualification or experience database. Short employer-facing experience descriptions live beside their claims as `introductionSummary`; the generator uses those claims, person and opportunity fixtures. Recommendation and qualification copy is curated, not generated by a live service. The document has approximately 200 words and does not include record counts, raw text, technical identifiers, date-attribution explanations, private notes or task lists.

The default is a document preview. Editing is explicit; edited field IDs record user authorship internally. Review introduction applies edits to the working preview, while Save introduction draft persists them. Cancellation leaves the prior working preview intact. Closing without saving discards unsaved wording. Optional accounts remain explicitly self-reported in the document, never converted into verified skills.

Draft and Ready for Eimhin’s review are the only implemented document states. Readiness requires a saved introduction that has been reviewed after material context changes, plus recorded interest. The user explicitly removed the previous rationale and unresolved-requirements acknowledgement gate: this action prepares information for Eimhin, not a nomination. It does not change officer judgement or establish permission to share, eligibility, submission or an interview invitation. Approved for sharing and Submitted to employer are conceptual only.

Changed responses, judgements, saved introduction wording or included reported information clear review readiness while retaining the draft. A signature of the current assessment fixtures also detects changed context after reload, prompting review without rewriting manual content. Task completion and private notes remain independent.

Version 2 storage retains tasks, notes, accounts, questions, record flags and review state under the existing person/opportunity key. Version 1 referral text is kept intact; creating the shorter introduction requires explicit confirmation, and the earlier wording is retained as an internal reference. Old referral decisions are not migrated into approval or readiness for person review. Reset to assessment replaces working wording only after confirmation, preserving a previous wording snapshot and requiring explicit saving. This is a limited recovery aid, not a full revision history.

Original fixtures remain unchanged. Invalid saved data falls back to the illustrative scenario with a notice; failed writes retain session state with a warning. No server persistence, synchronisation or production audit trail is implemented. Candidate CV: Not attached is an informational placeholder; no CV, upload, PDF or outgoing message is created.
