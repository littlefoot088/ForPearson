import { qualificationCopy, verificationFor, trainingFor, safetyIds } from "./workflowState";
import { selectedClaim } from "./evidenceSelection";
import React from "react";
import { Accordion, Button, Group, Stack, Text } from "@mantine/core";
import {
  FileText,
  Files,
  Clock3,
  CircleHelp,
  CircleDashed,
  CheckCircle2,
} from "lucide-react";
import { Icon } from "./components";
import { assessmentStates, claims, qualifications, dateLabel } from "./data";

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

export function RequirementRow({ requirement, children, workspace = {} }) {
  const status = assessmentStates[requirement.assessment];
  const verification = verificationFor(workspace, requirement.id);
  const training = trainingFor(workspace, requirement.id);
  const qualificationScan =
    (verification.current ? verification.label : training.label ?? verification.label) ??
    {
      environment: requirement.conclusion ?? "Not yet discussed",
      sea: "Module passed",
      fire: "Attendance only",
      "first-aid": "Certificate not recorded",
      height: "Certificate not recorded",
      medical: "Clearance not recorded",
    }[requirement.id];
  const qualificationDate = training.record && !verification.current
    ? training.record.status === "completed"
      ? `Completed ${dateLabel(training.record.completedOn)}`
      : training.record.dueOn && training.record.status !== "cancelled"
        ? `Target ${dateLabel(training.record.dueOn)}` : null
    : verification.record
    ? verification.record.withdrawn
      ? null
      : verification.record.noExpiry
        ? "No expiry recorded"
        : `Expiry ${dateLabel(verification.record.expiresOn)}`
    : {
        sea: "Expires 3 May 2028",
        fire: "Record expired 18 August 2025",
      }[requirement.id];
  return (
    <Accordion.Item
      value={requirement.id}
      className={
        qualificationScan
          ? "assessment-row qualification-row"
          : "assessment-row"
      }
    >
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
            {["safety", "environment"].includes(requirement.id) && (
              <Text
                component="span"
                display="block"
                size="sm"
                fw={400}
                c="dimmed"
              >
                {requirement.id === "environment"
                  ? "Working preferences"
                  : "Employer preference"}
              </Text>
            )}
          </Text>
          <Text
            component="span"
            size="sm"
            c={
              verification.current
                ? "documented.7"
                : (statusColors[status.tone] ?? "gray.6")
            }
            className="assessment-status"
          >
            {!qualificationScan && <Icon icon={statusIcons[status.icon]} />}
            <span>
              {qualificationScan ??
                requirement.conclusion ??
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
            </span>
            {qualificationDate && (
              <Text component="span" size="xs" c="dimmed">
                {qualificationDate}
              </Text>
            )}
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
  excludedRecordIds = [],
  workspace = {},
  onVerify,
  onTraining,
  onInspect,
}) {
  const linkedClaims = (requirement.claimIds ?? []).map((id) =>
    selectedClaim(
      claims.find((c) => c.id === id),
      excludedRecordIds,
    ),
  );
  const linkedQualifications = (requirement.qualificationIds ?? []).map((id) =>
    qualifications.find((q) => q.id === id),
  );
  const inspect = (item, type) => onInspect(item, type, contextRequirement);
  return (
    <>
      {linkedClaims.map((claim) => {
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
                  Latest manager review (2026): Eimhin is described as the
                  station’s go-to for pumps.
                </Text>
              )}
              {claim.id === "electrical" && (
                <Text size="sm">
                  Latest manager review (2026): praises his panel and changeover
                  work, while raising a concern about switchgear work.
                </Text>
              )}
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
            <TrainingSummary q={qualificationCopy(q, workspace)}>
              {q.required && (
                <Group gap="xs">
                <Button
                  variant="default"
                  size="sm"
                  w="fit-content"
                  onClick={() => onVerify(q)}
                >
                  {verificationFor(workspace, q.id).record
                    ? "Edit verification"
                    : "Record verification"}
                </Button>
                {safetyIds.includes(q.id) && (!verificationFor(workspace, q.id).current || trainingFor(workspace, q.id).record) && (
                  <Button variant="default" size="sm" onClick={() => onTraining(q)}>
                    {trainingFor(workspace, q.id).record ? "Manage training" : "Assign training"}
                  </Button>
                )}
                </Group>
              )}
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
