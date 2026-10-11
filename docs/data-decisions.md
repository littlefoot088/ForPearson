# Data decisions

## Selected person and vacancy

Eimhin Mac Neidhe, keeper code **K0104**, is reviewed against `employers/carrowmore-array-om-technician.md`. The vacancy describes approximately 40 openings and requires hands-on maintenance, offshore safety coverage, medical fitness and comfort in the offshore working environment. It values permit experience; it does not require prior wind experience or the separate HV Authorised Person award.

The selected records demonstrate repeated repairs, older and recent electrical work, and planning/permit responsibility. No observation or supervision label has been invented where the records do not establish it. “Hands-on work recorded” does not claim independent performance.

## Identity and date decisions

`raw/personnel/cla_personnel_export.csv` identifies `MAC NEIDHE E`, K0104, with a recorded joining date of 6 November 2009. Named 2014–2017 records identify Eimhin Mac Neidhe at Dunsaille and Rossanvoe, consistent with the DUN and ROS postings. Other people sharing the surname have different initials and keeper codes; they are not merged.

LearnHub records, including LH500003, LH500008 and LH500010, explicitly contain both K0104 and payroll reference 0012801. Across LearnHub, the selected reference links to K0104 only. This supports linking the selected recent spreadsheet entries bearing 0012801 or the leading-zero-stripped 12801. Their stations fit the personnel postings: ERR in 2022–2024 and GOW in 2025–2026. This corroborated attribution is documented rather than treated as external identity verification. The raw pack README’s general warning about a missing payroll mapping is not silently ignored; the selected LearnHub rows provide a specific cross-reference.

The user chose **31 December 2026** as the fictional review date. The pack’s stated March preparation date and February LearnHub extraction date conflict with later records. Those metadata conflicts remain a known limitation; neither date has been presented as a reliable snapshot boundary. The fixture deliberately includes the approved later 2026 entries. Entries preceding the personnel joining date remain eligible as experience evidence. That date does not establish the start of all work: earlier part-time or contract service is possible, but is not confirmed. Two relevant 2009 examples carrying K0104 are included and annotated in the evidence inspector; no adverse competence inference is made from the date difference.

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

`src/data.js` separates the person, vacancy, job requirements, experience claims, interpretations and qualification requirements. `src/records.js` separates source and training records. Clarification drafts, verification flags and review status live in React state. Claims refer to requirements and source IDs; qualifications refer to training record IDs where present.

This is curated decision support, not live inference, certification validation or matching. No raw personnel or appraisal corpus is shipped. No expensive training is recommended from missing evidence. All review changes reset on refresh, and progression does not establish offshore eligibility.
