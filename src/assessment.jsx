import React from "react";
import { Accordion, Button, Group, Stack, Text, Title } from "@mantine/core";
import {
  FileText,
  Files,
  Clock3,
  CircleHelp,
  CircleDashed,
  CheckCircle2,
  ArrowUpRight,
  Pencil,
  Check,
  Flag,
} from "lucide-react";
import { Icon } from "./components";
import {
  assessmentStates,
  claims,
  qualifications,
  getSources,
  dateLabel,
  reviewDate,
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
      <Accordion.Control id={"requirement-" + requirement.id}>
        <span
          className={
            requirement.conclusion
              ? "requirement-label experience-label"
              : "requirement-label"
          }
        >
          <Text component="span">{requirement.text}</Text>
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
                  ? "Clearance not established from records"
                  : "Certificate not established from records"
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

function ExperienceDetail({ claim, onInspect, onClarify, drafted }) {
  const records = getSources(claim);
  return (
    <Stack component="section" aria-label={claim.title}>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          {claim.involvement}
        </Text>
        <Text>
          <strong>What we found:</strong> {claim.summary}
        </Text>
        <Text size="sm" c="dimmed">
          {records.length} selected records
          {records.some((r) => r.date < person.joined) &&
            " · 1 needs attribution checking"}
        </Text>
        <Text size="sm" c="dimmed">
          {dateLabel(records[0].date)} – {dateLabel(records.at(-1).date)} ·
          Latest selected activity: {dateLabel(records.at(-1).date)}
        </Text>
        <Text size="sm">
          <strong>Needs checking:</strong> {claim.limitation}
        </Text>
        <Group gap="xs">
          <Button
            variant="light"
            rightSection={<Icon icon={ArrowUpRight} />}
            onClick={() => onInspect(claim)}
          >
            View supporting records ({records.length})
          </Button>
          <Button
            variant="subtle"
            leftSection={<Icon icon={Pencil} />}
            onClick={() => onClarify(claim)}
          >
            {drafted ? "Edit discussion question" : "Add to discussion"}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}

function QualificationDetail({
  q,
  onInspect,
  onClarify,
  flagged,
  onFlag,
  drafted,
  supporting = false,
}) {
  return (
    <Stack component="section" gap="sm" aria-label={q.title}>
      {supporting && <Title order={5}>{q.title}</Title>}
      <Group>
        <Text fw={600}>{q.status}</Text>
        {supporting && (
          <Text size="sm" c="dimmed">
            Supporting module
          </Text>
        )}
      </Group>
      <Text>{q.detail}</Text>
      {!supporting && (
        <Text size="sm">
          <strong>Needs checking:</strong>{" "}
          {q.id === "medical"
            ? "Confirm current offshore clearance; clinical details are not needed."
            : q.id === "height"
              ? "Confirm the certificate and height coverage Carrowmore Array accepts."
              : "Check the complete certificate and its current coverage."}
        </Text>
      )}
      <Group gap="xs">
        {q.recordId && (
          <Button
            variant="light"
            rightSection={<Icon icon={ArrowUpRight} />}
            onClick={() => onInspect(q)}
          >
            View training record
          </Button>
        )}
        <Button
          variant="subtle"
          leftSection={<Icon icon={Pencil} />}
          onClick={() => onClarify(q)}
        >
          {drafted ? "Edit discussion question" : "Add to discussion"}
        </Button>
        <Button
          variant={flagged ? "light" : "subtle"}
          color="clarification"
          aria-pressed={flagged}
          leftSection={<Icon icon={flagged ? Check : Flag} />}
          onClick={() => onFlag(q)}
        >
          {flagged ? "Qualification check added" : "Add qualification check"}
        </Button>
      </Group>
      {flagged && (
        <Text size="sm" c="dimmed">
          Check with Eimhin, Authority training records or the provider. Select
          “Qualification check added” again to undo. This tracks the check, not
          its outcome.
        </Text>
      )}
    </Stack>
  );
}

export function ExpandedAssessment({
  requirement,
  contextRequirement = requirement,
  onInspect,
  onClarify,
  drafts,
  verifications,
  onFlag,
}) {
  const linkedClaims = (requirement.claimIds ?? []).map((id) =>
    claims.find((c) => c.id === id),
  );
  const linkedQualifications = (requirement.qualificationIds ?? []).map((id) =>
    qualifications.find((q) => q.id === id),
  );
  const hasDraft = (id) => drafts.some((d) => d.id === id);
  const trainingDetails = linkedQualifications.map((q) => (
    <QualificationDetail
      key={q.id}
      q={q}
      supporting={requirement.type === "experience"}
      onInspect={(item) => onInspect(item, "qualification", contextRequirement)}
      onClarify={(item) => onClarify(item, contextRequirement)}
      flagged={verifications.includes(q.id)}
      onFlag={onFlag}
      drafted={hasDraft(q.id)}
    />
  ));
  return (
    <>
      {requirement.detail && <Text c="dimmed">{requirement.detail}</Text>}
      {linkedClaims.map((claim) => (
        <ExperienceDetail
          key={claim.id}
          claim={claim}
          onInspect={(item) => onInspect(item, "claim", contextRequirement)}
          onClarify={(item) => onClarify(item, contextRequirement)}
          drafted={hasDraft(claim.id)}
        />
      ))}
      {requirement.type === "experience" && linkedQualifications.length > 0 ? (
        <Accordion variant="contained" order={4}>
          <Accordion.Item value="training">
            <Accordion.Control>
              Related training ({linkedQualifications.length})
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="lg">{trainingDetails}</Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ) : (
        trainingDetails
      )}
      {linkedQualifications.length > 0 && (
        <Text size="sm" c="dimmed">
          Expiry interpretation as of {dateLabel(reviewDate)}.
        </Text>
      )}
      {requirement.type === "clarification" && (
        <Group>
          <Button
            variant="light"
            leftSection={<Icon icon={Pencil} />}
            onClick={() =>
              onClarify(
                { ...requirement, title: requirement.text },
                requirement,
              )
            }
          >
            {hasDraft(requirement.id)
              ? "Edit discussion question"
              : "Add to discussion"}
          </Button>
        </Group>
      )}
    </>
  );
}
