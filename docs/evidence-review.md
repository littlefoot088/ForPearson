# Eimhin: full supplied-log review

Scope: this document records source-data provenance and historical fixture interpretation. For current UI, workflow, verification and persistence rules, use [information architecture](information-architecture.md) and the [design system](design-system.md). Runtime verification and reviewer exclusions can change the displayed assessment without changing original evidence.

This review replaces frequency claims inferred from eleven selected examples. It is a bounded review of the supplied pack, not a claim that the pack records every task Eimhin performed. The scenario includes records through 31 December 2026.

## Findings

| Area | Matching entries | Separate years with entries | Entries in 2024–2026 | Latest entry |
|---|---:|---:|---:|---|
| Pump repair and maintenance | 18 | 10 | 5 | 21 April 2026 |
| Electrical fault-finding and control work | 48 | 13 | 9 | 26 December 2026 |
| Entry planning / permit issuing | 2 | 2 | 1 | 19 August 2025 |

These counts show more documented repetition than the original selection. They do **not** establish daily, weekly or regular duties. No activity rate is calculated from the year range. Missing entries do not prove inactivity.

Pump entries include seal replacement, gland repacking, valve repair, rebuilding and suction-strainer blockage removal. Pump operation, priming and water transfer are excluded from the repair count. Electrical entries include charger correction, fault tracing, control rewiring/rebuilding, distribution changes, termination work, synchronisation and automatic-control setup. Routine readings, battery topping-up, switchovers, resets and general operation are excluded. Battery maintenance and other mechanical work are not silently included in either count. The two planning/permit entries are different responsibilities, not evidence of frequent permit issuing. One additional log says he took the AK around the plant; that is limited support for helping colleagues, not sustained mentoring.

## Scope and identity

The reproducible script scans 1,307 raw logbook files: 1,292 OCR files and 15 structured exports containing 306,674 data rows. It identifies 1,095 structured entries using K0104, the exact name Eimhin Mac Neidhe, or payroll 0012801. This includes 26 payroll references written as `1.2801E+04`, as well as versions with and without leading zeros.

Seven LearnHub records explicitly pair K0104 with 0012801. No different keeper code uses that payroll reference in LearnHub. Full-name spreadsheet locations correspond to Dunsaille Head and Rossanvoe postings. Records for other Mac Neidhe names/codes are excluded. OCR surname-only mentions cannot establish Eimhin's identity; no confidently attributable additional OCR entry was identified. OCR corruption means this search is not a guarantee that no further evidence exists. Clean exports are derived data and are not counted again.

Early entries with K0104 remain included. The personnel joining date is not an exclusion rule. The date discrepancy remains visible only during source inspection. We do not invent a contract or part-time explanation.

## Material counter-evidence

Thirteen identity-linked appraisals were reviewed. Feedback is mixed and cannot be replaced by a favourable count:

- AP000004 (2014) raises a pumped-systems concern; AP000005 (2016) says he avoids pumped systems; AP000006–7 (2017–18) say pump work needs checking.
- AP000013 (2026) calls him the station's go-to for pumps, but also raises a switchgear concern.
- AP000002–3 praise switchgear work (2011/2013), while AP000003 also raises a distribution concern. AP000008–10 (2019–21) raise control/distribution concerns; AP000010 also praises changeover gear.

These are historical managers' observations, not independent competence assessments. Exact appraisal text and identifiers are accessible in the evidence inspector. Recent praise does not silently resolve earlier concerns. The 2012 Dunsaille manager note refers to an uncorrected course record, without identifying the course; it cannot resolve certification.

The audit also encountered additional LearnHub modules, including planned maintenance marked “Not achieved” (LH500002), electrical safe working marked “Attended” (LH500007), and confined-space training marked “Pass” (LH500009). This log-frequency review does not constitute a new full certification assessment. The existing four featured training records remain unchanged; they must not be described as the entire training history.

## Dates, duplicates and data quality

ISO and eight-digit dates are parsed directly; Excel serial dates use the 1899-12-30 epoch. Slash dates with both day/month values at most 12 are not guessed: the year is used for counting and the original date remains visible. There are six such dates among the 68 matching records. Existing verbatim fixtures and their exact highlights are preserved.

Each counted entry has a unique source-file/record locator. Repeated wording on different dates is retained as separate log entries; it is not proof of independent task occurrences. Impossible measurement units are flagged during inspection, without changing quotations or treating the measurements as validated outcomes. A complete technical measurement audit is outside this frequency review.

## Reproduction and presentation

Run `python3 scripts/audit_logbooks.py '/path/to/carrowmore-data-pack 1.zip'`. The reviewed activity families are explicit in that script. It writes `src/evidence-audit.json`, including every counted source row, original date, verbatim text and raw fields. Counts are conditional on these stated categories and identity rules, not an unqualified total of “all evidence”.

The assessment shows recorded repetition and recency. The evidence inspector includes all 68 matching logs with previous/next and direct record selection, plus relevant appraisal excerpts. Eleven original fixtures retain their identifiers and exact highlights. New matches retain full original passages. The introduction retains its curated source selection; saved wording is never overwritten. Changed assessment copy triggers the existing review notice.
