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
  NativeSelect,
  Modal,
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
  interestLabel,
} from "./workflow";
import { WorkflowForm, workflowTitles } from "./opportunity";
import { Workspace, WorkspacePanel, workspaceTitles } from "./workspace.jsx";
import {
  loadWorkspace,
  persistWorkspace,
  workspaceReducer,
} from "./workspace.js";
import { PeopleWorkspace } from "./PeopleWorkspace";
import { assessmentHash } from "./people";

const clarificationContexts = [
  ...requirements,
  careerContext,
  opportunityContext,
  certificateContext,
];

export default function App() {
  const [page, setPage] = useState(() =>
    window.location.hash === assessmentHash ? "assessment" : "people",
  );
  useEffect(() => {
    const changePage = () => {
      if (window.location.hash === "#main") return;
      setPage(
        window.location.hash === assessmentHash ? "assessment" : "people",
      );
    };
    window.addEventListener("hashchange", changePage);
    return () => window.removeEventListener("hashchange", changePage);
  }, []);
  const previousPage = useRef(page);
  useEffect(() => {
    document.title =
      page === "people"
        ? "Redeployment workspace · Carrowmore"
        : "Eimhin Mac Neidhe · Carrowmore";
    if (previousPage.current !== page) {
      document.getElementById("main")?.focus();
      window.scrollTo(0, 0);
      previousPage.current = page;
    }
  }, [page]);
  const [peopleFilters, setPeopleFilters] = useState({
    search: "",
    intention: null,
    attentionOnly: false,
  });
  const [expanded, setExpanded] = useState(null);
  const [loaded] = useState(() =>
    loadWorkspace({ getItem: (key) => window.localStorage.getItem(key) }),
  );
  const [workspace, dispatchWorkspace] = useReducer(
    workspaceReducer,
    loaded.workspace,
  );
  const opportunity = workspace.opportunity;
  const [workspacePanel, setWorkspacePanel] = useState(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [workflowDialog, setWorkflowDialog] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [index, setIndex] = useState(0);
  const [composer, setComposer] = useState(null);
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState(loaded.drafts);
  const [draftOpen, setDraftOpen] = useState(false);
  const [questionTopic, setQuestionTopic] = useState("pump");
  const [returnToDraft, setReturnToDraft] = useState(false);
  const [notice, setNotice] = useState(loaded.message);
  const [jobOpen, setJobOpen] = useState(false);
  const [recordFlags, setRecordFlags] = useState(loaded.recordFlags);
  useEffect(() => {
    setStorageFailed(
      !persistWorkspace(
        { setItem: (key, value) => window.localStorage.setItem(key, value) },
        { workspace, drafts, recordFlags },
      ),
    );
  }, [workspace, drafts, recordFlags]);
  function openWorkspace(mode, item) {
    rememberFocus();
    setWorkspacePanel({ mode, item, session: crypto.randomUUID() });
    setWorkspaceOpen(true);
  }
  function closeEvidence() {
    setDrawer(null);
  }
  const focusOrigin = useRef(null);
  function rememberFocus() {
    if (
      !drawer &&
      !composer &&
      !draftOpen &&
      !jobOpen &&
      !workflowDialog &&
      !workspaceOpen &&
      !resetOpen
    )
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
    setNotice("Question saved in Next steps.");
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
  function openWorkflow(mode) {
    rememberFocus();
    setWorkflowDialog(mode);
  }
  function saveWorkflow(action) {
    dispatchWorkspace({ type: "opportunity", action });
    setWorkflowDialog(null);
    setNotice(
      action.type === "suggest"
        ? "Suggestion recorded locally. Nothing has been sent."
        : action.type === "response"
          ? "Simulated response from Eimhin saved."
          : action.type === "nomination"
            ? "Nomination decision saved locally. Nothing has been submitted."
            : "Your assessment saved. Evidence statuses are unchanged.",
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
    drawer ||
    composer ||
    draftOpen ||
    jobOpen ||
    workflowDialog ||
    workspaceOpen ||
    resetOpen,
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
    ? "Follow-up question"
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
            reports={workspace.reports}
          />
        )}
      </RequirementRow>
    );
  }

  return (
    <>
      <Anchor
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
          document.getElementById("main")?.scrollIntoView();
        }}
      >
        {page === "people"
          ? "Skip to redeployment workspace"
          : "Skip to opportunity assessment"}
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
                Your workspace
              </Text>
              <Avatar color="carrowmore" radius="xl">
                You
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Paper>
      {page === "people" ? (
        <PeopleWorkspace
          workspace={workspace}
          storageFailed={storageFailed}
          filters={peopleFilters}
          onFiltersChange={setPeopleFilters}
        />
      ) : (
        <Container size="lg" py="lg" component="main" id="main" tabIndex={-1}>
          <Stack gap="md">
            <Breadcrumbs
              className="context-breadcrumbs"
              separator={<Icon icon={ChevronRight} />}
              aria-label="Review context"
            >
              <Anchor size="sm" href="#people">
                People
              </Anchor>
              <Text size="sm" c="dimmed">
                {person.name}
              </Text>
              <Text size="sm">{vacancy.title}</Text>
            </Breadcrumbs>
            <Grid gutter="lg" align="flex-start">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="md">
                  <Paper
                    component="section"
                    withBorder
                    radius="md"
                    p="lg"
                    bg="white"
                    aria-labelledby="candidate-name"
                  >
                    <Grid gutter="xl" align="stretch">
                      <Grid.Col span={12}>
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
                      <Grid.Col span={12}>
                        <Paper p="md" radius="sm" bg="gray.0">
                          <Stack gap="xs">
                            <Text size="sm" c="dimmed" fw={600}>
                              Opportunity being assessed
                            </Text>
                            <Title order={2} size="h4">
                              {vacancy.title} · {vacancy.employer}
                            </Title>
                            <Text size="sm" c="dimmed">
                              {vacancy.base} · {vacancy.pattern} · Based on the
                              service operations vessel
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
                            <Group gap="xs">
                              <Text size="sm" data-testid="keeper-interest">
                                <strong>Eimhin’s interest:</strong>{" "}
                                {interestLabel(opportunity)}
                              </Text>
                              <Button
                                variant="subtle"
                                size="compact-xs"
                                onClick={() => openWorkflow("response")}
                              >
                                Edit response
                              </Button>
                            </Group>
                            <Text size="xs" c="dimmed">
                              {opportunity.responseOrigin ===
                              "manually-recorded"
                                ? "Response recorded by you."
                                : "No response recorded."}{" "}
                              Career preferences remain unknown.
                            </Text>
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
                          Mechanical or electrical maintenance can meet the
                          experience requirement.
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
                          Safety certification is required before mobilisation.
                          Medical fitness is essential; the vacancy does not
                          specify when it must be verified.
                        </Text>
                        <Box>
                          {requirements
                            .filter((r) => r.type === "qualification")
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
                          Offshore working conditions
                        </Title>
                        <Box>
                          {requirements
                            .filter((r) => r.id === "environment")
                            .map(renderAssessment)}
                        </Box>
                      </Stack>
                    </Stack>
                  </Accordion>
                </Stack>
              </Grid.Col>
              <Grid.Col
                span={{ base: 12, md: 4 }}
                component="aside"
                aria-label="Your review workspace"
                className="review-workspace"
                tabIndex={0}
              >
                <Workspace
                  state={workspace}
                  dispatch={dispatchWorkspace}
                  onOpen={openWorkspace}
                  onWorkflow={openWorkflow}
                  drafts={drafts}
                  onDiscussion={() => {
                    rememberFocus();
                    setDraftOpen(true);
                  }}
                />
              </Grid.Col>
            </Grid>
            <Group component="footer" justify="space-between" gap="xs">
              <Text size="xs" c="dimmed">
                CARROWMORE LIGHT AUTHORITY / EMPLOYEE REDEPLOYMENT
              </Text>
              <Text size="xs" c="dimmed">
                Saved on this browser only. Nothing is sent.
              </Text>
              <Button
                variant="subtle"
                size="compact-xs"
                onClick={() => {
                  rememberFocus();
                  setResetOpen(true);
                }}
              >
                Reset prototype workspace
              </Button>
            </Group>
            {storageFailed && (
              <Text role="alert" size="sm" c="clarification.8">
                Browser storage is unavailable. Changes are kept for this
                session but will not survive refresh.
              </Text>
            )}
          </Stack>
        </Container>
      )}
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
        opened={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        position="right"
        size={narrow ? "100%" : "lg"}
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
        title={workspaceTitles[workspacePanel?.mode]}
        closeButtonProps={{ "aria-label": "Close workspace panel" }}
      >
        {workspacePanel && (
          <WorkspacePanel
            key={workspacePanel.session}
            storageFailed={storageFailed}
            mode={workspacePanel.mode}
            item={workspacePanel.item}
            state={workspace}
            dispatch={dispatchWorkspace}
            onClose={() => setWorkspaceOpen(false)}
            onQuestion={(q) => {
              setWorkspaceOpen(false);
              clarify(
                q,
                clarificationContexts.find((r) =>
                  r.qualificationIds?.includes(q.id),
                ) ?? requirements.find((r) => r.id === "maintenance"),
              );
            }}
            drafts={drafts}
          />
        )}
      </Drawer>
      <Modal
        opened={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset prototype workspace?"
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
      >
        <Stack gap="md">
          <Text>
            This removes saved notes, tasks, accounts, discussion questions,
            flags and referral decisions from this browser. The initial tasks
            will be restored, with no interest recorded.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                dispatchWorkspace({ type: "reset" });
                setDrafts([]);
                setRecordFlags([]);
                setExpanded(null);
                setWorkspacePanel(null);
                setResetOpen(false);
                setNotice("Prototype workspace reset.");
              }}
            >
              Reset workspace
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Drawer
        opened={Boolean(drawer)}
        onClose={closeEvidence}
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
            <NativeSelect
              label="Question topic"
              value={questionTopic}
              onChange={(e) => setQuestionTopic(e.currentTarget.value)}
              data={[
                ...claims,
                ...qualifications,
                ...discussionTopics,
                ...requirements
                  .filter((r) => r.type === "clarification")
                  .map((r) => ({ ...r, title: r.text })),
              ].map((topic) => ({ value: topic.id, label: topic.title }))}
            />
            <Button
              variant="default"
              onClick={() => {
                const topic = [
                  ...claims,
                  ...qualifications,
                  ...discussionTopics,
                  ...requirements,
                ].find((item) => item.id === questionTopic);
                const context =
                  clarificationContexts.find(
                    (r) =>
                      r.id === topic.requirementId ||
                      r.qualificationIds?.includes(topic.id) ||
                      r.id === topic.id,
                  ) ?? requirements.find((r) => r.id === "maintenance");
                clarify(
                  { ...topic, title: topic.title ?? topic.text },
                  context,
                  true,
                );
              }}
            >
              Write question
            </Button>
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
              label="Question for Eimhin"
              autosize
              minRows={3}
              maxRows={12}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              maxLength={2000}
            />
            <Text size="sm" c="dimmed">
              Saved in Next steps for your discussion. Nothing is sent.
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
