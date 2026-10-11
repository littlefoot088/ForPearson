import React from "react";
import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Mark,
} from "@mantine/core";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Icon, Highlight, RecordFields } from "./components";
import { dateLabel, person, reviewDate, interpretations } from "./data";

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
      <Text size="xs" c="dimmed">
        Fictional assessment: {dateLabel(reviewDate)}
      </Text>
      {source ? (
        <>
          <Text size="sm">
            {records.length} selected supporting records
            {records.some((r) => r.date < person.joined) &&
              " · 1 needs attribution checking"}
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
            <Text>{interpretations[source.id]}</Text>
          </div>
          {early && (
            <Text size="sm" c="clarification.7">
              <strong>Needs checking:</strong> This record predates Eimhin’s
              documented joining date. Confirm it belongs to him.
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
          <Group gap="xs" aria-label="Select supporting record">
            {records.map((r, i) => (
              <Button
                key={r.id}
                size="xs"
                variant={index === i ? "filled" : "default"}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              >
                {dateLabel(r.date)}
              </Button>
            ))}
          </Group>
          <Button
            variant="subtle"
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
          <Text fw={600}>{drawer.item.status}</Text>
          <Text>{drawer.item.detail}</Text>
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
                ["Expiry field", dateLabel(training.expires_on)],
              ]}
            />
          )}
          <Text size="sm">
            {training?.outcome === "Attended"
              ? "Attendance does not establish completion."
              : "This documents a module, not the complete certificate."}
          </Text>
        </>
      )}
      <Accordion variant="contained">
        <Accordion.Item value="details">
          <Accordion.Control>View source details</Accordion.Control>
          <Accordion.Panel>
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
                      ? `This entry carries ${person.id}; attribution needs checking because it predates the personnel joining date of ${dateLabel(person.joined)}.`
                      : "Attribution is curated, not externally verified."}
                  </Text>
                </>
              ) : (
                training && (
                  <RecordFields
                    fields={[
                      ["Record ID", training.id],
                      ["Keeper code", training.keeper_code],
                      [
                        "Source",
                        "raw/training/vendor-c-learnhub-2017-2026.json",
                      ],
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
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
