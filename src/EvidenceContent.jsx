import React from "react";
import {
  Divider,
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Mark,
  NativeSelect,
} from "@mantine/core";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { TrainingSummary } from "./assessment";
import { Icon, Highlight, RecordFields } from "./components";
import { dateLabel, person, interpretations, evidenceAudit } from "./data";

export function EvidenceContent({
  drawer,
  records,
  index,
  setIndex,
  training,
  flagged,
  onFlag,
}) {
  const source = records[index];
  const early = source && source.date < person.joined;
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {drawer.requirement.text}
      </Text>
      {source && (
        <Text size="sm">
          Records cover: {dateLabel(records[0].date)}–
          {dateLabel(records.at(-1).date)}. Latest entry:{" "}
          {dateLabel(records.at(-1).date)}. {drawer.item.involvement}
        </Text>
      )}
      {source && (
        <Text size="sm">
          Matching entries by year:{" "}
          {Array.from({ length: 18 }, (_, i) => 2009 + i)
            .map(
              (year) =>
                `${year}: ${records.filter((r) => r.date.startsWith(String(year))).length}`,
            )
            .join(" · ")}
        </Text>
      )}
      {source ? (
        <>
          <Text size="sm">
            {records.length} matching logbook entries · Full supplied-log review
          </Text>
          <Text fw={600}>
            {dateLabel(source.date)} · {source.station} Station
          </Text>
          <div>
            <Text size="xs" c="dimmed" mb="xs">
              ORIGINAL LOGBOOK
            </Text>
            <Paper
              component="blockquote"
              withBorder
              p="md"
              m={0}
              className="source-quote"
            >
              <Highlight text={source.original} passage={source.highlight} />
            </Paper>
          </div>
          <div>
            <Text fw={600} size="sm">
              What this tells us
            </Text>
            <Text>{interpretations[source.id] ?? source.interpretation}</Text>
          </div>
          {source.dateNote && <Text size="sm">{source.dateNote}</Text>}
          {source.measurementNote && (
            <Text size="sm" c="clarification.7">
              {source.measurementNote}
            </Text>
          )}
          {early && (
            <Text size="sm" c="clarification.7">
              <strong>Needs checking:</strong> This entry names MAC NEIDHE E and
              uses code K0104. It predates the recorded joining date of{" "}
              {dateLabel(person.joined)}; the date discrepancy is unresolved.
            </Text>
          )}
          <Group justify="space-between">
            <Text size="sm">
              Record {index + 1} of {records.length}
            </Text>
            <Group gap="xs">
              <ActionIcon
                variant="default"
                disabled={index === 0}
                aria-label="Previous evidence record"
                onClick={() => setIndex(index - 1)}
              >
                <Icon icon={ChevronLeft} />
              </ActionIcon>
              <ActionIcon
                variant="default"
                disabled={index === records.length - 1}
                aria-label="Next evidence record"
                onClick={() => setIndex(index + 1)}
              >
                <Icon icon={ChevronRight} />
              </ActionIcon>
            </Group>
          </Group>
          <NativeSelect
            label="Select supporting record"
            value={String(index)}
            onChange={(event) => setIndex(Number(event.currentTarget.value))}
            data={records.map((r, i) => ({
              value: String(i),
              label: `${dateLabel(r.date)} · ${r.station} · ${r.original.slice(0, 65)}`,
            }))}
          />
          <Button
            variant="default"
            color="clarification"
            leftSection={<Icon icon={Flag} />}
            aria-pressed={flagged}
            onClick={() => onFlag(source.id)}
          >
            {flagged ? "Record flagged · undo" : "Flag record for review"}
          </Button>
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
      {source && ["pump", "electrical"].includes(drawer.item.id) && (
        <Stack gap="sm">
          <Divider />
          <Text fw={600}>Manager feedback</Text>
          <Text size="sm">
            These are managers’ observations, not verified competence
            assessments. Later praise does not erase earlier concerns.
          </Text>
          {evidenceAudit.appraisals
            .filter((r) =>
              drawer.item.id === "pump"
                ? [
                    "AP000004",
                    "AP000005",
                    "AP000006",
                    "AP000007",
                    "AP000013",
                  ].includes(r.record_id)
                : [
                    "AP000002",
                    "AP000003",
                    "AP000008",
                    "AP000009",
                    "AP000010",
                    "AP000013",
                  ].includes(r.record_id),
            )
            .map((r) => (
              <Stack gap="xs" key={r.record_id}>
                <Text size="sm" fw={600}>
                  {r.year} · {r.station} · {r.record_id}
                </Text>
                <Text size="sm">{r.text}</Text>
              </Stack>
            ))}
          <Text size="xs">Source: raw/appraisals/appraisals.jsonl</Text>
        </Stack>
      )}
      <Divider />
      <Text fw={600}>Source details</Text>
      <Stack gap="sm">
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
              Identity linked using personnel postings and LearnHub’s
              keeper-code / payroll-reference pair.{" "}
              {early
                ? `This entry carries ${person.id}; its date conflicts with the personnel joining date of ${dateLabel(person.joined)}.`
                : "Attribution is curated, not externally verified."}
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
        <Text component="pre" size="sm" className="source-quote" m={0}>
          {source
            ? typeof source.rawRecord === "string"
              ? source.rawRecord
              : JSON.stringify(source.rawRecord, null, 2)
            : JSON.stringify(training, null, 2)}
        </Text>
      </Stack>
    </Stack>
  );
}
