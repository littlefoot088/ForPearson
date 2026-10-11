import React from "react";
import {
  Accordion,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Paper,
  SimpleGrid,
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
    <Stack component="section" gap="md" aria-label={claim.title}>
      <Paper p="md" radius="sm" bg="gray.0">
        <Stack gap="sm">
          <Title order={4} size="h5">
            Experience recorded
          </Title>
          <Text>{claim.summary}</Text>
          <Text size="sm">
            <Text component="span" fw={600}>
              Relevance to this role:{" "}
            </Text>
            {claim.relevance}
          </Text>
          <Text size="sm" c="dimmed">
            {records.length} selected records
            {records.some((r) => r.date < person.joined) &&
              " · 1 needs attribution checking"}
          </Text>
          <Group>
            <Button
              variant="light"
              leftSection={<Icon icon={FileText} />}
              onClick={() => onInspect(claim)}
            >
              View supporting records ({records.length})
            </Button>
          </Group>
          <Accordion variant="default" order={5}>
            <Accordion.Item value="coverage">
              <Accordion.Control>
                <Text component="span" size="sm">
                  Record coverage and involvement
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <div>
                    <Text size="xs" c="dimmed">
                      Selected date range
                    </Text>
                    <Text size="sm">
                      {dateLabel(records[0].date)} –{" "}
                      {dateLabel(records.at(-1).date)}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Latest selected activity
                    </Text>
                    <Text size="sm">{dateLabel(records.at(-1).date)}</Text>
                  </div>
                </SimpleGrid>
                <Text size="sm" mt="sm">
                  <strong>Involvement: </strong>
                  {claim.involvement}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Paper>
      <Paper p="md" radius="sm" bg="clarification.0">
        <Stack gap="xs">
          <Title order={4} size="h5">
            What to clarify with Eimhin
          </Title>
          <Text size="sm">{claim.limitation}</Text>
          <Group>
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<Icon icon={Pencil} />}
              onClick={() => onClarify(claim)}
            >
              {drafted ? "Edit discussion question" : "Add to discussion"}
            </Button>
          </Group>
        </Stack>
      </Paper>
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
  if (supporting)
    return (
      <Stack gap="sm" component="section" aria-label={q.title}>
        <Text fw={600} size="sm">
          {q.title}
        </Text>
        <Text size="sm">{q.status}</Text>
        <Text size="sm" c="dimmed">
          {q.detail}
        </Text>
        <Text size="xs" c="dimmed">
          Expiry interpreted as of {dateLabel(reviewDate)}.
        </Text>
        <Group>
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<Icon icon={FileText} />}
            onClick={() => onInspect(q)}
          >
            View training record
          </Button>
        </Group>
        <Accordion variant="default" order={5}>
          <Accordion.Item value="followup">
            <Accordion.Control>
              <Text component="span" size="sm">
                Follow up this module
                {flagged
                  ? " · check added"
                  : drafted
                    ? " · question saved"
                    : ""}
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Optional actions for this supporting module.
                </Text>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    onClick={() => onClarify(q)}
                  >
                    {drafted ? "Edit discussion question" : "Add to discussion"}
                  </Button>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    aria-pressed={flagged}
                    onClick={() => onFlag(q)}
                  >
                    {flagged
                      ? "Qualification check added"
                      : "Add qualification check"}
                  </Button>
                </Group>
                {flagged && (
                  <Text size="xs" c="dimmed">
                    Check with Eimhin, Authority training records or the
                    provider. Select again to undo; this does not verify the
                    module.
                  </Text>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    );
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
      {requirement.detail && linkedClaims.length === 0 && (
        <Text c="dimmed">{requirement.detail}</Text>
      )}
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
        <Accordion variant="default" order={4}>
          <Accordion.Item value="training">
            <Accordion.Control>
              <Text component="span" size="sm" fw={600}>
                Related training ({linkedQualifications.length})
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="lg">{trainingDetails}</Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ) : (
        trainingDetails
      )}
      {linkedQualifications.length > 0 && requirement.type !== "experience" && (
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
