import React from "react";
import {
  Accordion,
  Button,
  Group,
  Stack,
  Text,
  Title,
  SimpleGrid,
  Paper,
} from "@mantine/core";
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
        <span className="requirement-label">
          <Text component="span">{requirement.text}</Text>
          <Text
            component="span"
            size="sm"
            c={statusColors[status.tone] ?? "gray.6"}
            className="assessment-status"
          >
            <Icon icon={statusIcons[status.icon]} />
            {status.label}
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
  const first = records[0],
    latest = records[records.length - 1];
  return (
    <Paper
      component="section"
      withBorder
      p="md"
      aria-labelledby={"claim-" + claim.id}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4} id={"claim-" + claim.id}>
            {claim.title}
          </Title>
          <Text size="sm" c="dimmed">
            {claim.involvement}
          </Text>
        </Group>
        <Text>{claim.summary}</Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" component="dl" m={0}>
          {[
            [
              "Selected supporting records",
              `${records.length} · ${claim.pattern}`,
            ],
            [
              "Documented span",
              `${dateLabel(first.date)} – ${dateLabel(latest.date)}`,
            ],
            ["Latest selected activity", dateLabel(latest.date)],
          ].map(([label, value]) => (
            <div key={label}>
              <Text component="dt" size="sm" c="dimmed">
                {label}
              </Text>
              <Text component="dd" m={0} size="sm">
                {value}
              </Text>
            </div>
          ))}
        </SimpleGrid>
        <Text size="sm" c="clarification.7">
          <strong>To clarify:</strong> {claim.limitation}
        </Text>
        <Group gap="xs">
          <Button
            variant="light"
            rightSection={<Icon icon={ArrowUpRight} />}
            onClick={() => onInspect(claim)}
          >
            Inspect {records.length} records
          </Button>
          <Button
            variant="subtle"
            leftSection={<Icon icon={Pencil} />}
            onClick={() => onClarify(claim)}
          >
            {drafted ? "Edit clarification" : "Ask for clarification"}
          </Button>
        </Group>
      </Stack>
    </Paper>
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
        <Text size="sm" c="clarification.7">
          {q.id === "medical"
            ? "Current offshore clearance needs confirmation. Clinical details are not required."
            : "The required certificate has not been established. Check existing documentation and employer acceptance before identifying any training need."}
        </Text>
      )}
      {q.id === "height" && (
        <Text size="sm" c="clarification.7">
          The vacancy includes height coverage; the supplied offshore scheme
          lists it separately. Confirm the accepted combination with Carrowmore
          Array.
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
          {drafted ? "Edit verification question" : "Ask for verification"}
        </Button>
        <Button
          variant={flagged ? "light" : "subtle"}
          color="clarification"
          aria-pressed={flagged}
          leftSection={<Icon icon={flagged ? Check : Flag} />}
          onClick={() => onFlag(q)}
        >
          {flagged ? "Flagged for verification" : "Flag for verification"}
        </Button>
      </Group>
    </Stack>
  );
}

export function ExpandedAssessment({
  requirement,
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
      onInspect={(item) => onInspect(item, "qualification", requirement)}
      onClarify={(item) => onClarify(item, requirement)}
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
          onInspect={(item) => onInspect(item, "claim", requirement)}
          onClarify={(item) => onClarify(item, requirement)}
          drafted={hasDraft(claim.id)}
        />
      ))}
      {linkedClaims.length > 0 && (
        <Text size="sm" c="dimmed">
          These are selected records, not counts of every occasion the work was
          performed. The evidence supports potential; it does not independently
          verify present competence.
        </Text>
      )}
      {requirement.type === "experience" && linkedQualifications.length > 0 ? (
        <Accordion variant="contained" order={4}>
          <Accordion.Item value="training">
            <Accordion.Control>
              Related training records ({linkedQualifications.length})
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
              ? "Edit clarification"
              : "Ask for clarification"}
          </Button>
        </Group>
      )}
    </>
  );
}
