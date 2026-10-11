import React from "react";
import { Accordion, Button, Stack, Text } from "@mantine/core";
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
        <Stack gap="md">{children}</Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

function DetailSection({ title, children }) {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        {title}
      </Text>
      <Stack gap="xs" ps={{ base: "sm", sm: "md" }}>
        {children}
      </Stack>
    </Stack>
  );
}

export function TrainingSummary({ q, children }) {
  const content = (
    <>
      <Text size="sm">{q.detail}</Text>
      {children}
    </>
  );
  return q.recordId ? (
    <DetailSection title={q.status}>{content}</DetailSection>
  ) : (
    <Stack gap="xs">{content}</Stack>
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
            gap="md"
            aria-label={claim.title}
            key={claim.id}
          >
            <DetailSection title="What Eimhin did">
              <Text size="sm">{claim.workSummary}</Text>
            </DetailSection>
            <DetailSection title="When it is recorded">
              <Text size="sm">{claim.evidenceSummary}</Text>
              {claim.id === "pump" && (
                <Text size="sm">
                  Reviews in 2014–2018 raised concerns about pump work. In 2026,
                  his manager described Eimhin as the station’s go-to for pumps.
                </Text>
              )}
              {claim.id === "electrical" && (
                <Text size="sm">
                  Manager reviews praise some electrical work but also raise
                  concerns, including switchgear work in 2026.
                </Text>
              )}
              <Text size="sm">
                {records.length} matching logbook entries · Full supplied-log
                review
              </Text>
              <Button
                variant="light"
                size="sm"
                w="fit-content"
                onClick={() => inspect(claim, "claim")}
              >
                View evidence
              </Button>
            </DetailSection>
            {linkedQualifications.map((q) => (
              <DetailSection key={q.id} title="Related training">
                <Text size="sm">{q.title}</Text>
                <Text size="sm">{q.summary}</Text>
                <Button
                  variant="default"
                  size="sm"
                  w="fit-content"
                  onClick={() => inspect(q, "qualification")}
                >
                  View training record
                </Button>
              </DetailSection>
            ))}
            {report && (
              <DetailSection
                title={`Reported by Eimhin · ${dateLabel(report.date)}`}
              >
                <Text size="sm" className="source-quote">
                  {report.text}
                </Text>
                <Text size="sm">
                  Recorded by you; not independently verified.
                </Text>
              </DetailSection>
            )}
          </Stack>
        );
      })}
      {requirement.type !== "experience" &&
        linkedQualifications.map((q) => (
          <Stack component="section" gap="sm" aria-label={q.title} key={q.id}>
            <TrainingSummary q={q}>
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
            </TrainingSummary>
          </Stack>
        ))}
      {requirement.type === "clarification" && (
        <Text size="sm">{requirement.detail}</Text>
      )}
    </>
  );
}
