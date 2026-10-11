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

## Simplifications and boundaries

`src/data.js` separates the person, vacancy, job requirements, experience claims, interpretations and qualification requirements. `src/records.js` separates source and training records. Discussion questions, qualification checks and internal record-review flags live in separate React state. Opportunity-specific workflow state is managed separately in `src/workflow.js`. Claims refer to requirements and source IDs; qualifications refer to training record IDs where present.

This is curated decision support, not live inference, certification validation or matching. No raw personnel or appraisal corpus is shipped. No expensive training is recommended from missing evidence. All review changes reset on refresh, and neither interest nor a local nomination decision establishes offshore eligibility.

## Requirement-led assessment

The same eleven original log entries and four training records are retained. Requirements now carry group/order, an assessment state, and explicit links to existing experience claims or qualification records. Mechanical and electrical evidence are alternative routes within one employer requirement. Supporting modules are disclosed there, not promoted into additional mandatory certificates.

The collapsed labels describe evidence states. Evidence found means relevant work is documented, not competence verified. Module recorded means a passed module exists, not the complete certificate. Attendance recorded preserves the distinction from completion. Needs clarification identifies an unresolved question; Not established describes the selected records without asserting that the keeper lacks experience or credentials. Documented is reserved for sufficient qualification evidence and is not assigned to any current required qualification.

The offshore-working-conditions and mentoring rows represent actual employer requirements/preferences. No new evidence has been invented for them. All expiry interpretations still use the agreed fictional review date, 31 December 2026, shown in qualification detail rather than the overview.

Officer assessment, opportunity suggestion, keeper response and nomination decision are distinct from requirement evidence labels, discussion questions and verification checks. These states do not recalculate or override evidence. Employer progression remains Not submitted in this prototype.

## Mantine presentation migration

No evidence fixtures, qualification interpretations, source quotations, identity links or requirement definitions changed during this migration. All eleven logs and four training records remain reachable. The fixed 31 December 2026 review date still governs expiry interpretation.

Mantine theme colours express the existing evidence states; they do not calculate ratings or certification readiness. Module/attendance labels remain neutral, clarification remains amber and evidence remains blue. The exact substring highlighter wraps the original passage in Mantine Mark without changing the source text. Review decisions, drafts and verification flags retain their separate state and never promote a qualification to Documented.

## Career context and workflow provenance

Eimhin’s career intention is explicitly unknown and career preferences are null. These are absence-of-information states, not facts inferred from age, tenure or historical appraisals. The preference discussion question is authored prototype copy, not a source quotation. Opportunity responses entered through the UI are explicitly simulated and never written into personnel or evidence fixtures.

The user approved local nomination decisions with outstanding gaps, provided interest is recorded and the officer supplies a rationale and acknowledges unresolved requirements. A saved recommendation means an officer decision for possible employer consideration; it never marks an employer submission or interview. Retirement filtering and the illustrative Fintan Ó Ceallaigh example exist only in the information-architecture proposal and are not source-derived personnel data.

## Decision-focused presentation

The page separates experience, qualifications and interest in a compact summary. Each requirement offers a current position and a next step where useful; mentoring has no automatic immediate action. Detailed source counts describe selected records, not total work frequency. Recency, span and involvement are available in expanded experience assessments. Technical identifiers, original dates, identity notes and raw fields sit under View source details; original passages and highlights remain unchanged. The inspector identifies the fictional assessment date.

Discussion with Eimhin collects editable questions by experience area or topic, with one item per stable ID. No source-level question drafts or outgoing messages are created. Check qualification tracks a reversible local task to obtain evidence from the keeper, Authority training records or provider. It never certifies a qualification or creates a training recommendation. Internal record-review flags are keyed by source ID and remain independent of qualification checks, discussion questions and opportunity progression.

## Narrative provenance and display mappings

`candidateSummary` stores authored assessment text plus links to the pump/electrical claims, seven post-joining source records and the O&M vacancy. It is curated, not generated at runtime by a matching model. The vacancy explicitly accepts mechanical or electrical experience on other kinds of plant and does not require prior wind experience. These facts support the transfer described in the summary; they do not prove turbine competence, independence or decades of work. Both unresolved 2009 records remain accessible and counted with caveats, but are not needed to support the narrative.

Experience presentation rows preserve their parent requirement IDs. Pump repair and electrical fault-finding map to the same maintenance requirement; the pumped-systems and generator-control modules stay with their respective area. Safe-work planning/permits map to the permit preference. Formal qualifications and non-certificate considerations retain their original definitions and evidence statuses.

The narrative’s uncertainty sentence omits the request to establish interest once any opportunity response is recorded. `nextRecommendation` derives recommendations from existing officer, interest and nomination state; it never treats a local qualification task as a verified outcome. Safety certification is a documented mobilisation condition. Medical fitness is essential with timing unspecified. The fixture provides no verified-current full required qualification and no confirmed training gap.
