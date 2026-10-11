import React from "react";
import { Accordion, Button, Divider, Group, Stack, Text } from "@mantine/core";
import {
  FileText,
  Files,
  Clock3,
  CircleHelp,
  CircleDashed,
  CheckCircle2,
} from "lucide-react";
import { Icon } from "./components";
import {
  assessmentStates,
  claims,
  qualifications,
  getSources,
  dateLabel,
  person,
} from "./data";

const statusIcons = {
  file: FileText,
  module: Files,
  clock: Clock3,
  question: CircleHelp,
  circle: CircleDashed,
  check: CheckCircle2,
};
const statusColors = {
  evidence: "evidence.7",
  neutral: "gray.6",
  attention: "clarification.7",
  documented: "documented.6",
};

export function RequirementRow({ requirement, children }) {
  const status = assessmentStates[requirement.assessment];
  return (
    <Accordion.Item value={requirement.id}>
      <Accordion.Control
        className="assessment-control"
        id={"requirement-" + requirement.id}
      >
        <span
          className={
            requirement.conclusion
              ? "requirement-label experience-label"
              : "requirement-label"
          }
        >
          <Text component="span" fw={600}>
            {requirement.text}
          </Text>
          <Text
            component="span"
            size="sm"
            c={statusColors[status.tone] ?? "gray.6"}
            className="assessment-status"
          >
            <Icon icon={statusIcons[status.icon]} />
            {requirement.conclusion ??
              (requirement.assessment === "unknown" &&
              requirement.type === "qualification"
                ? requirement.id === "medical"
                  ? "No clearance record found"
                  : "No certificate record found"
                : requirement.id === "fire"
                  ? "Attendance recorded · expiry passed"
                  : requirement.id === "environment"
                    ? "Not yet discussed"
                    : requirement.id === "mentoring"
                      ? "No experience recorded"
                      : status.label)}
          </Text>
        </span>
      </Accordion.Control>
      <Accordion.Panel aria-labelledby={"requirement-" + requirement.id}>
        <Stack gap="md" className="assessment-detail">
          {children}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export function TrainingSummary({ q }) {
  return (
    <Stack gap="xs">
      {q.recordId && (
        <Text fw={600} size="sm">
          {q.status}
        </Text>
      )}
      <Text size="sm">{q.detail}</Text>
    </Stack>
  );
}
export function ExpandedAssessment({
  requirement,
  contextRequirement = requirement,
  reports = {},
  onInspect,
}) {
  const linkedClaims = (requirement.claimIds ?? []).map((id) =>
    claims.find((c) => c.id === id),
  );
  const linkedQualifications = (requirement.qualificationIds ?? []).map((id) =>
    qualifications.find((q) => q.id === id),
  );
  const inspect = (item, type) => onInspect(item, type, contextRequirement);
  return (
    <>
      {linkedClaims.map((claim) => {
        const records = getSources(claim);
        const report = reports[claim.id];
        return (
          <Stack
            component="section"
            gap="sm"
            aria-label={claim.title}
            key={claim.id}
          >
            <Stack gap="xs">
              <Text fw={600} size="sm">
                Recorded experience
              </Text>
              <Text>{claim.introductionSummary}</Text>
              <Text size="sm" c="dimmed">
                {claim.relevance}
              </Text>
            </Stack>
            <Stack gap="xs">
              <Text fw={600} size="sm">
                Supporting evidence
              </Text>
              <Text size="sm" c="dimmed">
                {records.length} supporting records ·{" "}
                {records[0].date.slice(0, 4)}–{records.at(-1).date.slice(0, 4)}{" "}
                · {claim.involvement}
              </Text>
              {records.some((r) => r.date < person.joined) && (
                <Text size="sm" c="clarification.8">
                  The {dateLabel(records[0].date)} entry uses Eimhin’s name and
                  code, but predates his recorded joining date (
                  {dateLabel(person.joined)}). The date discrepancy is
                  unresolved.
                </Text>
              )}
              <Text size="sm" c="dimmed">
                {claim.id === "safety"
                  ? "The records do not show whether Eimhin’s permit authority is still current."
                  : "The entries describe the work, but not whether anyone assisted or supervised."}
              </Text>
              <Button
                variant="light"
                w="fit-content"
                onClick={() => inspect(claim, "claim")}
              >
                View evidence
              </Button>
            </Stack>
            {linkedQualifications.map((q) => (
              <Stack key={q.id} gap="xs">
                <Divider />
                <Text fw={600} size="sm">
                  Related training
                </Text>
                <Text size="sm">{q.title}</Text>
                <Group justify="space-between" gap="xs">
                  <Text size="sm" c="dimmed">
                    {q.status === "Not established"
                      ? "No record found"
                      : q.status}{" "}
                    · Supporting module
                  </Text>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => inspect(q, "qualification")}
                  >
                    View training record
                  </Button>
                </Group>
              </Stack>
            ))}
            {report && (
              <Text size="sm" className="source-quote">
                <strong>Reported by Eimhin · {dateLabel(report.date)}:</strong>{" "}
                {report.text}{" "}
                <Text span c="dimmed">
                  Recorded by you; not independently verified.
                </Text>
              </Text>
            )}
          </Stack>
        );
      })}
      {requirement.type !== "experience" &&
        linkedQualifications.map((q) => (
          <Stack component="section" gap="sm" aria-label={q.title} key={q.id}>
            <TrainingSummary q={q} />
            {q.recordId && (
              <Button
                variant="default"
                size="sm"
                w="fit-content"
                onClick={() => inspect(q, "qualification")}
              >
                View training record
              </Button>
            )}
          </Stack>
        ))}
      {requirement.type === "clarification" && (
        <>
          <Text size="sm">{requirement.detail}</Text>
        </>
      )}
    </>
  );
}
