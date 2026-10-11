import { qualificationCopy } from "./workflowState";
import React from "react";
import {
  Button,
  Paper,
  Stack,
  Text,
  Mark,
  Group,
  Checkbox,
} from "@mantine/core";
import { Flag } from "lucide-react";
import { TrainingSummary } from "./assessment";
import { Icon, Highlight, RecordFields } from "./components";
import { dateLabel, person, interpretations, evidenceAudit } from "./data";

export function EvidenceContent({
  drawer,
  records,
  training,
  recordFlags,
  onFlag,
  excludedRecordIds = [],
  onInclusion,
  workspace = {},
}) {
  const appraisal = ["pump", "electrical"].includes(drawer.item.id)
    ? evidenceAudit.appraisals.find((r) => r.record_id === "AP000013")
    : null;
  const excerpt = appraisal?.text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) =>
      drawer.item.id === "pump"
        ? /pumps/i.test(sentence)
        : /panels|switchgear|changeover/i.test(sentence),
    )
    .join(" ");
  if (!records.length)
    return (
      <EvidenceRecord
        drawer={{ ...drawer, item: qualificationCopy(drawer.item, workspace) }}
        training={training}
      />
    );
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          {records.filter((r) => !excludedRecordIds.includes(r.id)).length}{" "}
          included logbook entries
          {records.some((r) => excludedRecordIds.includes(r.id))
            ? ` · ${records.filter((r) => excludedRecordIds.includes(r.id)).length} excluded`
            : ""}{" "}
          · oldest first
        </Text>
        <Text size="sm" c="dimmed">
          Excluding a record removes it from the assessment and generated
          introduction. You can restore it at any time.
        </Text>
      </Stack>
      <ol className="evidence-timeline">
        {[...records]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((source) => (
            <li key={source.id}>
              <EvidenceRecord
                drawer={drawer}
                source={source}
                flagged={recordFlags.includes(source.id)}
                onFlag={onFlag}
                excluded={excludedRecordIds.includes(source.id)}
                onInclusion={onInclusion}
              />
            </li>
          ))}
      </ol>
      {appraisal && (
        <section aria-label="Manager appraisal">
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Manager appraisal · {appraisal.year}
            </Text>
            <Text component="blockquote" size="md" m={0}>
              {excerpt}
            </Text>
            <Text size="sm" c="dimmed">
              Manager’s observation, not an independent skills assessment.
            </Text>
            <details>
              <Text component="summary" size="sm" style={{ cursor: "pointer" }}>
                View source details
              </Text>
              <Text size="sm" mt="sm">
                {appraisal.record_id} · {appraisal.station} ·
                raw/appraisals/appraisals.jsonl
              </Text>
            </details>
          </Stack>
        </section>
      )}
    </Stack>
  );
}

function EvidenceRecord({
  drawer,
  source,
  training,
  flagged,
  onFlag,
  excluded,
  onInclusion,
}) {
  const early = source && source.date < person.joined;
  const inclusion = source && (
    <Checkbox
      size="xs"
      label="Exclude this record"
      description={
        early
          ? `Date needs checking: this entry names Eimhin but predates his recorded joining date (${dateLabel(person.joined)}).`
          : excluded
            ? "Excluded from the assessment and introduction."
            : undefined
      }
      styles={{
        label: { fontSize: "var(--mantine-font-size-sm)" },
        description: {
          fontSize: "var(--mantine-font-size-xs)",
          color: early ? "var(--mantine-color-clarification-7)" : undefined,
        },
      }}
      checked={Boolean(excluded)}
      onChange={(event) => onInclusion(source.id, !event.currentTarget.checked)}
    />
  );
  return (
    <Stack gap="sm">
      {source ? (
        <>
          <div>
            <Group gap="xs" align="baseline">
              <Text size="sm" fw={600}>
                {dateLabel(source.date)}
              </Text>
              <Text size="sm" c="dimmed">
                {source.station} Station · Original logbook
              </Text>
            </Group>
            <Paper
              component="blockquote"
              p="sm"
              m={0}
              mt="xs"
              bg="evidence.0"
              className="source-quote"
            >
              <Highlight
                text={source.original}
                passage={source.highlight}
                color="evidence.1"
              />
            </Paper>
          </div>
          {[
            "pump_2025-10-10",
            "safety_2014-04-15",
            "safety_2025-08-19",
          ].includes(source.id) && (
            <div className="reference-interpretation">
              <Text size="sm">{interpretations[source.id]}</Text>
            </div>
          )}
          {source.dateNote && <Text size="sm">{source.dateNote}</Text>}
          {source.measurementNote && (
            <Text size="sm" c="clarification.7">
              {source.measurementNote}
            </Text>
          )}
          {inclusion}
        </>
      ) : (
        <>
          <TrainingSummary q={drawer.item} />
          {training && (
            <RecordFields
              fields={[
                ["Module", training.title],
                [
                  "Recorded outcome",
                  <Mark key="outcome" color="clarification.2">
                    {training.outcome}
                  </Mark>,
                ],
                ["Recorded date", dateLabel(training.completed_on)],
                ["Listed expiry", dateLabel(training.expires_on)],
              ]}
            />
          )}
        </>
      )}
      <details key={source?.id ?? training?.id}>
        <Text component="summary" size="sm" style={{ cursor: "pointer" }}>
          View source details
        </Text>
        <Stack gap="md" mt="sm" ps="sm">
          {source && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<Icon icon={Flag} />}
              aria-pressed={flagged}
              onClick={() => onFlag(source.id)}
              style={{ alignSelf: "flex-start" }}
            >
              {flagged ? "Record flagged · undo" : "Flag record for review"}
            </Button>
          )}
          {source ? (
            <>
              <RecordFields
                fields={[
                  ["Source file", source.source],
                  ["Record", source.recordId],
                  ["Person reference", source.personRef],
                  ["Original date", source.rawDate],
                ]}
              />
              <Text size="sm">
                Linked to Eimhin through personnel postings and the training
                system’s keeper-code/payroll-reference match. Attribution has
                not been independently verified.
              </Text>
            </>
          ) : (
            training && (
              <RecordFields
                fields={[
                  ["Record ID", training.id],
                  ["Keeper code", training.keeper_code],
                  ["Source", "raw/training/vendor-c-learnhub-2017-2026.json"],
                ]}
              />
            )
          )}
          <div>
            <Text size="xs" c="dimmed" mb="xs">
              Original source text
            </Text>
            <Text component="pre" size="xs" className="source-quote" m={0}>
              {source
                ? typeof source.rawRecord === "string"
                  ? source.rawRecord
                  : JSON.stringify(source.rawRecord, null, 2)
                : JSON.stringify(training, null, 2)}
            </Text>
          </div>
        </Stack>
      </details>
    </Stack>
  );
}
