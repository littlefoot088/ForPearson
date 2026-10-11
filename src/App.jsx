import React, { useState, useReducer, useRef, useEffect } from "react";
import {
  Accordion,
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Drawer,
  Group,
  Grid,
  List,
  Notification,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight, Check, Pencil, Waves, Trash2 } from "lucide-react";
import {
  person,
  vacancy,
  requirements,
  experienceRows,
  candidateSummary,
  claims,
  qualifications,
  trainingRecords,
  getSources,
} from "./data";
import { Icon } from "./components";
import { EvidenceContent } from "./EvidenceContent";
import { RequirementRow, ExpandedAssessment } from "./assessment";

import {
  careerContext,
  certificateContext,
  discussionTopics,
  opportunityContext,
  initialOpportunity,
  opportunityReducer,
  interestLabel,
} from "./workflow";
import {
  OpportunityActions,
  WorkflowForm,
  workflowTitles,
} from "./opportunity";
const clarificationContexts = [
  ...requirements,
  careerContext,
  opportunityContext,
  certificateContext,
];

export default function App() {
  const [expanded, setExpanded] = useState(null);
  const [opportunity, dispatchOpportunity] = useReducer(
    opportunityReducer,
    initialOpportunity,
  );
  const [workflowDialog, setWorkflowDialog] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [index, setIndex] = useState(0);
  const [composer, setComposer] = useState(null);
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [draftOpen, setDraftOpen] = useState(false);
  const [returnToDraft, setReturnToDraft] = useState(false);
  const [notice, setNotice] = useState("");
  const [jobOpen, setJobOpen] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [recordFlags, setRecordFlags] = useState([]);
  const focusOrigin = useRef(null);
  function rememberFocus() {
    if (!drawer && !composer && !draftOpen && !jobOpen && !workflowDialog)
      focusOrigin.current = document.activeElement;
  }
  function inspect(item, type, requirement) {
    rememberFocus();
    const records = type === "claim" ? getSources(item) : [];
    setIndex(
      Math.max(
        0,
        records.findIndex((record) => record.date >= person.joined),
      ),
    );
    setDrawer({ type, item, requirement });
  }
  function clarify(item, requirement, fromDraft = false) {
    rememberFocus();
    setReturnToDraft(fromDraft);
    setDrawer(null);
    setDraftOpen(false);
    setComposer({ item, requirement });
    setQuestion(drafts.find((d) => d.id === item.id)?.text ?? item.question);
  }
  function closeComposer() {
    setComposer(null);
    if (returnToDraft) setDraftOpen(true);
  }
  function saveDraft(e) {
    e.preventDefault();
    if (!question.trim()) return;
    const draft = {
      id: composer.item.id,
      requirementId: composer.requirement.id,
      title: composer.item.title,
      text: question.trim(),
    };
    setDrafts((ds) =>
      ds.some((d) => d.id === draft.id)
        ? ds.map((d) => (d.id === draft.id ? draft : d))
        : [...ds, draft],
    );
    closeComposer();
    setNotice("Question saved to Discussion with Eimhin.");
  }
  function editDraft(draft) {
    const requirement = clarificationContexts.find(
      (r) => r.id === draft.requirementId,
    );
    const item = [...claims, ...qualifications].find(
      (i) => i.id === draft.id,
    ) ?? { ...requirement, title: requirement.text };
    clarify(item, requirement, true);
  }
  function flag(q) {
    setVerifications((v) =>
      v.includes(q.id) ? v.filter((id) => id !== q.id) : [...v, q.id],
    );
    setNotice(
      verifications.includes(q.id)
        ? "Qualification check removed."
        : "Qualification check added.",
    );
  }
  function openWorkflow(mode) {
    rememberFocus();
    setWorkflowDialog(mode);
  }
  function saveWorkflow(action) {
    dispatchOpportunity(action);
    setWorkflowDialog(null);
    setNotice(
      action.type === "suggest"
        ? "Suggestion recorded locally. Nothing has been sent."
        : action.type === "response"
          ? "Simulated keeper response saved."
          : action.type === "nomination"
            ? "Nomination decision saved locally. Nothing has been submitted."
            : "Officer assessment saved. Evidence statuses are unchanged.",
    );
  }
  const selectedSources =
    drawer?.type === "claim" ? getSources(drawer.item) : [];
  const source = selectedSources[index];
  const training =
    drawer?.type === "qualification"
      ? trainingRecords.find((r) => r.id === drawer.item.recordId)
      : null;
  const mantineTheme = useMantineTheme();
  const narrow = useMediaQuery(`(max-width: ${mantineTheme.breakpoints.sm})`);
  const overlayActive = useRef(false);
  overlayActive.current = Boolean(
    drawer || composer || draftOpen || jobOpen || workflowDialog,
  );
  const composerInput = useRef(null);
  const discussionStart = useRef(null);
  useEffect(() => {
    if (draftOpen) discussionStart.current?.focus();
  }, [draftOpen]);
  useEffect(() => {
    // Editing a draft changes content inside an already-open drawer.
    if (composer) composerInput.current?.focus();
  }, [composer]);
  function restoreFocus() {
    if (!overlayActive.current) {
      const target = focusOrigin.current?.isConnected
        ? focusOrigin.current
        : document.getElementById("opportunity-actions");
      target?.focus();
    }
  }
  const overlayTitle = composer
    ? "Add to discussion"
    : draftOpen
      ? "Discussion with Eimhin"
      : workflowDialog
        ? workflowTitles[workflowDialog]
        : "Wind Turbine Technician";
  const overlayContext = composer
    ? composer.requirement.text
    : draftOpen
      ? person.name
      : workflowDialog
        ? `${person.name} · ${vacancy.title}`
        : "CARROWMORE ARRAY · O&M";

  function renderAssessment(row) {
    const context = requirements.find(
      (r) => r.id === (row.sourceRequirementId ?? row.id),
    );
    return (
      <RequirementRow key={row.id} requirement={row}>
        {expanded === row.id && (
          <ExpandedAssessment
            requirement={row}
            contextRequirement={context}
            onInspect={inspect}
            onClarify={clarify}
            drafts={drafts}
            verifications={verifications}
            onFlag={flag}
          />
        )}
      </RequirementRow>
    );
  }

  return (
    <>
      <Anchor className="skip" href="#main">
        Skip to opportunity assessment
      </Anchor>
      <Paper component="header" withBorder radius={0} p="md">
        <Container size="lg">
          <Group justify="space-between">
            <Group gap="sm" wrap="nowrap">
              <Box className="brand-mark" p="xs">
                <Icon icon={Waves} size={24} />
              </Box>
              <div>
                <Text fw={700} size="lg">
                  carrowmore
                </Text>
                <Text size="xs" c="dimmed">
                  LIGHT AUTHORITY
                </Text>
              </div>
            </Group>
            <Text c="dimmed" visibleFrom="sm">
              Redeployment
            </Text>
            <Group gap="sm">
              <Text size="sm" c="dimmed" visibleFrom="xs">
                Officer workspace
              </Text>
              <Avatar color="carrowmore" radius="xl">
                RO
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Paper>
      <Container size="lg" py="lg" component="main" id="main" tabIndex={-1}>
        <Stack gap="md">
          <Breadcrumbs
            className="context-breadcrumbs"
            separator={<Icon icon={ChevronRight} />}
            aria-label="Review context"
          >
            <Text size="sm" c="dimmed">
              People
            </Text>
            <Text size="sm" c="dimmed">
              {person.name}
            </Text>
            <Text size="sm">{vacancy.title}</Text>
          </Breadcrumbs>
          <Paper
            component="section"
            withBorder
            radius="md"
            p="lg"
            bg="white"
            aria-labelledby="candidate-name"
          >
            <Grid gutter="xl" align="stretch">
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <Stack gap="sm">
                  <Title order={1} size="h2" id="candidate-name">
                    {person.name}
                  </Title>
                  <Text size="sm">
                    <Text component="span" c="dimmed">
                      Current role:{" "}
                    </Text>
                    Lighthouse keeper · Carrowmore Light Authority
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Paper p="md" radius="sm" bg="gray.0">
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed" fw={600}>
                      Opportunity being assessed
                    </Text>
                    <Title order={2} size="h4">
                      {vacancy.title} · {vacancy.employer}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {vacancy.base} · {vacancy.pattern} · Based on the service
                      operations vessel
                    </Text>
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      style={{ alignSelf: "flex-start" }}
                      onClick={() => {
                        rememberFocus();
                        setJobOpen(true);
                      }}
                    >
                      View role details
                    </Button>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Paper>
          <Stack
            component={Paper}
            role="region"
            withBorder
            radius="md"
            p="lg"
            bg="carrowmore.0"
            gap="xs"
            aria-labelledby="summary-heading"
          >
            <Title order={2} size="h3" id="summary-heading">
              Why consider Eimhin
            </Title>
            <Text>{candidateSummary.text}</Text>
          </Stack>
          <Accordion value={expanded} onChange={setExpanded} order={3}>
            <Stack gap="md">
              <Stack
                component={Paper}
                role="region"
                withBorder
                radius="md"
                p="lg"
                bg="white"
                gap="sm"
                aria-labelledby="experience-heading"
              >
                <Title order={2} size="h3" id="experience-heading">
                  Relevant experience
                </Title>
                <Text size="sm" c="dimmed">
                  Mechanical or electrical maintenance can meet the experience
                  requirement.
                </Text>
                <Box>
                  {experienceRows
                    .filter((row) => row.id !== "safety")
                    .map(renderAssessment)}
                </Box>
              </Stack>
              <Stack
                component={Paper}
                role="region"
                withBorder
                radius="md"
                p="lg"
                bg="white"
                gap="sm"
                aria-labelledby="qualifications-heading"
              >
                <Title order={2} size="h3" id="qualifications-heading">
                  Safety certificates and medical fitness
                </Title>
                <Text size="sm" c="dimmed">
                  Safety certification is required before mobilisation. Medical
                  fitness is essential; the vacancy does not specify when it
                  must be verified.
                </Text>
                <Box>
                  {requirements
                    .filter((r) => r.type === "qualification")
                    .map(renderAssessment)}
                </Box>
                {verifications.length > 0 && (
                  <Stack gap="xs" aria-label="Qualification checks">
                    <Text size="sm" fw={600}>
                      Qualification checks ({verifications.length})
                    </Text>
                    <Text size="sm" c="dimmed">
                      Tasks to follow up with Eimhin, Authority training records
                      or the provider. No qualification has been verified.
                    </Text>
                    {verifications.map((id) => {
                      const q = qualifications.find((q) => q.id === id);
                      return (
                        <Group key={id} gap="xs">
                          <Text size="sm">{q.title}</Text>
                          <Button
                            size="compact-sm"
                            variant="subtle"
                            onClick={() => flag(q)}
                            aria-label={`Remove check: ${q.title}`}
                          >
                            Remove check
                          </Button>
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
              <Stack
                component={Paper}
                role="region"
                withBorder
                radius="md"
                p="lg"
                bg="white"
                gap="sm"
                aria-labelledby="preferences-heading"
              >
                <Title order={2} size="h3" id="preferences-heading">
                  Additional employer preferences
                </Title>
                <Text size="sm" c="dimmed">
                  Valued experience, rather than essential requirements.
                </Text>
                <Box>
                  {experienceRows
                    .filter((row) => row.id === "safety")
                    .map(renderAssessment)}
                  {requirements
                    .filter((r) => r.id === "mentoring")
                    .map(renderAssessment)}
                </Box>
              </Stack>
              <Stack
                component={Paper}
                role="region"
                withBorder
                radius="md"
                p="lg"
                bg="white"
                gap="sm"
                aria-labelledby="interest-heading"
              >
                <Title order={2} size="h3" id="interest-heading">
                  Eimhin’s interest in this role
                </Title>
                <Text data-testid="keeper-interest">
                  {interestLabel(opportunity)}
                  {opportunity.responseOrigin && " · simulated response"}
                </Text>
                <Text size="sm" fw={600}>
                  Required working conditions
                </Text>
                <Box>
                  {requirements
                    .filter((r) => r.id === "environment")
                    .map(renderAssessment)}
                </Box>
              </Stack>
            </Stack>
          </Accordion>
          <OpportunityActions
            state={opportunity}
            drafts={drafts}
            onOpen={openWorkflow}
            onClarify={() => clarify(opportunityContext, opportunityContext)}
            onReviewDrafts={() => {
              rememberFocus();
              setDraftOpen(true);
            }}
          />
          <Group component="footer" justify="space-between" gap="xs">
            <Text size="xs" c="dimmed">
              CARROWMORE LIGHT AUTHORITY / KEEPER REDEPLOYMENT
            </Text>
            <Text size="xs" c="dimmed">
              Changes are local and reset on refresh.
            </Text>
          </Group>
        </Stack>
      </Container>
      <Box className="notification-region" role="status" aria-live="polite">
        {notice && (
          <Notification
            withBorder
            onClose={() => setNotice("")}
            closeButtonProps={{ "aria-label": "Dismiss notification" }}
          >
            {notice}
          </Notification>
        )}
      </Box>
      <Drawer
        opened={Boolean(drawer)}
        onClose={() => setDrawer(null)}
        position="right"
        size={narrow ? "100%" : "lg"}
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
        title={
          <span>
            <Text component="span" display="block" size="xs" c="dimmed">
              {drawer?.type === "claim"
                ? "SUPPORTING EVIDENCE"
                : "QUALIFICATION RECORD"}
            </Text>
            <Text component="span" fw={600}>
              {drawer?.item.title}
            </Text>
          </span>
        }
        closeButtonProps={{ "aria-label": "Close evidence" }}
      >
        {drawer && (
          <EvidenceContent
            drawer={drawer}
            records={selectedSources}
            index={index}
            setIndex={setIndex}
            training={training}
            flagged={recordFlags.includes(source?.id)}
            onFlag={(id) =>
              setRecordFlags((flags) =>
                flags.includes(id)
                  ? flags.filter((flag) => flag !== id)
                  : [...flags, id],
              )
            }
          />
        )}
      </Drawer>
      <Drawer
        opened={Boolean(composer || draftOpen || jobOpen || workflowDialog)}
        onClose={
          composer
            ? closeComposer
            : () => {
                setDraftOpen(false);
                setJobOpen(false);
                setWorkflowDialog(null);
              }
        }
        position="right"
        size={narrow ? "100%" : "lg"}
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
        title={
          <span>
            <Text component="span" display="block" size="xs" c="dimmed">
              {overlayContext}
            </Text>
            <Text component="span" fw={600}>
              {overlayTitle}
            </Text>
          </span>
        }
        closeButtonProps={{ "aria-label": "Close panel" }}
      >
        {draftOpen && (
          <Stack gap="md">
            <Text ref={discussionStart} tabIndex={-1}>
              Save questions for your conversation with Eimhin. Questions stay
              local; nothing is sent.
            </Text>
            {discussionTopics
              .filter((topic) => !drafts.some((draft) => draft.id === topic.id))
              .map((topic) => (
                <Button
                  key={topic.id}
                  variant="light"
                  onClick={() => clarify(topic, topic, true)}
                >
                  Add topic: {topic.title}
                </Button>
              ))}
            {drafts.map((draft) => (
              <Paper withBorder p="md" key={draft.id}>
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">
                    {
                      clarificationContexts.find(
                        (r) => r.id === draft.requirementId,
                      ).text
                    }
                  </Text>
                  <Title order={4}>{draft.title}</Title>
                  <Text className="source-quote">{draft.text}</Text>
                  <Group gap="xs">
                    <Button
                      variant="light"
                      leftSection={<Icon icon={Pencil} />}
                      onClick={() => editDraft(draft)}
                    >
                      Edit question
                    </Button>
                    <Button
                      variant="subtle"
                      leftSection={<Icon icon={Trash2} />}
                      onClick={() => {
                        if (drafts.length === 1) {
                          focusOrigin.current =
                            document.getElementById(
                              "requirement-" +
                                (experienceRows.find(
                                  (row) =>
                                    row.claimIds.includes(draft.id) ||
                                    row.qualificationIds.includes(draft.id),
                                )?.id ?? draft.requirementId),
                            ) ?? document.getElementById("opportunity-actions");
                          setDraftOpen(false);
                        }
                        setDrafts((ds) => ds.filter((d) => d.id !== draft.id));
                        setNotice("Question removed from the discussion.");
                      }}
                    >
                      Remove
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
        {composer && (
          <Stack component="form" gap="md" onSubmit={saveDraft}>
            <Text>For Eimhin Mac Neidhe · {composer.item.title}</Text>
            <Textarea
              ref={composerInput}
              data-autofocus
              label="Question for the keeper"
              autosize
              minRows={3}
              maxRows={12}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              maxLength={2000}
            />
            <Text size="sm" c="dimmed">
              For your discussion with Eimhin. Saving does not send a message.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={closeComposer}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!question.trim()}
                rightSection={<Icon icon={Check} />}
              >
                Save question
              </Button>
            </Group>
          </Stack>
        )}
        {workflowDialog && (
          <WorkflowForm
            key={workflowDialog}
            mode={workflowDialog}
            state={opportunity}
            onSave={saveWorkflow}
            onCancel={() => setWorkflowDialog(null)}
          />
        )}
        {jobOpen && (
          <Stack gap="md">
            <Text>{vacancy.base}</Text>
            <Text>
              {vacancy.pattern}, based on the service operations vessel.
            </Text>
            <Title order={4}>Essential</Title>
            <List spacing="xs">
              <List.Item>
                Hands-on mechanical or electrical maintenance on plant the
                candidate was responsible for.
              </List.Item>
              <List.Item>
                Valid offshore safety coverage: sea survival, fire, first aid
                and working at height.
              </List.Item>
              <List.Item>Offshore medical fitness.</List.Item>
              <List.Item>
                Comfort at height, in enclosed spaces and on a boat in a swell.
              </List.Item>
            </List>
            <Title order={4}>Valued experience</Title>
            <Text>
              Generating plant, electrical fault-finding, permit systems and
              supporting younger colleagues.
            </Text>
            <Title order={4}>Prior wind experience is not required</Title>
            <Text>
              The employer offers training and pays for safety renewals, but
              cannot mobilise a candidate without valid coverage.
            </Text>
            <Text size="sm" c="dimmed">
              Source: {vacancy.source}. Employer requirements are summarised;
              acceptance of specific certificates must be confirmed.
            </Text>
          </Stack>
        )}
      </Drawer>
    </>
  );
}
