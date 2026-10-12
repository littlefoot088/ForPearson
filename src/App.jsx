import { summaryWithQualifications, questionDiscussed } from "./workflowState";
import {
  selectedCandidateSummary,
  includedRecords,
  claimChanged,
} from "./evidenceSelection";
import React, { useState, useReducer, useRef, useEffect } from "react";
import {
  Accordion,
  MantineProvider,
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
  MultiSelect,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight, Check, Pencil, Trash2 } from "lucide-react";
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
  dateLabel,
} from "./data";
import { Icon } from "./components";
import { quietTheme, quietCssVariablesResolver } from "./theme";
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
import { assessmentHash, profileIdForHash, peopleForWorkspace } from "./people";
import { KeeperProfile } from "./KeeperProfile";
const pageForHash = () => window.location.hash === assessmentHash ? "assessment" : profileIdForHash(window.location.hash) ?? "people";

const clarificationContexts = [
  ...requirements,
  careerContext,
  opportunityContext,
  certificateContext,
];

export default function App() {
  const [page, setPage] = useState(() =>
    pageForHash(),
  );
  useEffect(() => {
    const changePage = () => {
      if (window.location.hash === "#main") return;
      setPage(
        pageForHash(),
      );
    };
    window.addEventListener("hashchange", changePage);
    return () => window.removeEventListener("hashchange", changePage);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.carrowmoreIdentity = "quiet";
    return () => {
      delete document.documentElement.dataset.carrowmoreIdentity;
    };
  }, [page]);
  const previousPage = useRef(page);
  useEffect(() => {
    document.title =
      page === "people"
        ? "Redeployment workspace · Carrowmore"
        : page === "assessment" ? "Eimhin Mac Neidhe · Carrowmore" : `${peopleForWorkspace(workspace).find((p) => p.id === page)?.name ?? "Keeper profile"} · Carrowmore`;
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
  const [composer, setComposer] = useState(null);
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState(loaded.drafts);
  const [draftOpen, setDraftOpen] = useState(false);
  const [questionTopics, setQuestionTopics] = useState([]);
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
  function openWorkspace(mode, item, origin) {
    rememberFocus();
    if (origin) focusOrigin.current = origin;
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
    setDrafts((ds) => {
      const existing = ds.find((d) => d.id === composer.item.id);
      const draft = {
        id: composer.item.id,
        requirementId: composer.requirement.id,
        title: composer.item.title,
        text: question.trim(),
        completed: existing?.completed ?? false,
      };
      return existing
        ? ds.map((d) => (d.id === draft.id ? draft : d))
        : [...ds, draft];
    });
    closeComposer();
    setNotice("Question saved in Conversations.");
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
  const training =
    drawer?.type === "qualification"
      ? trainingRecords.find((r) => r.id === drawer.item.recordId)
      : null;
  const mantineTheme = useMantineTheme();
  const narrow = useMediaQuery(`(max-width: ${mantineTheme.breakpoints.sm})`);
  const mobileWorkspace = useMediaQuery(
    `(max-width: ${mantineTheme.breakpoints.md})`,
  );
  const [progressTarget, setProgressTarget] = useState(null);
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
    const claim = claims.find((c) => c.id === row.id);
    if (claim && claimChanged(claim, workspace.excludedRecordIds)) {
      const count = includedRecords(claim, workspace.excludedRecordIds).length;
      row = {
        ...row,
        conclusion: `${count} logbook ${count === 1 ? "entry" : "entries"} included`,
        assessment: count ? row.assessment : "unknown",
      };
    }

    const context = requirements.find(
      (r) => r.id === (row.sourceRequirementId ?? row.id),
    );
    return (
      <RequirementRow key={row.id} requirement={row} workspace={workspace}>
        {expanded === row.id &&
          (row.id === "environment" ? (
            <Stack gap="sm">
              {workspace.workingPreferences ? (
                <>
                  <Text size="sm" className="source-quote">
                    {workspace.workingPreferences.response}
                  </Text>
                  {workspace.workingPreferences.concerns && (
                    <Text size="sm" className="source-quote">
                      <strong>Concerns or conditions: </strong>
                      {workspace.workingPreferences.concerns}
                    </Text>
                  )}
                  <Text size="sm" c="dimmed">
                    Reported by Eimhin ·{" "}
                    {dateLabel(workspace.workingPreferences.date)}
                  </Text>
                </>
              ) : (
                <Text size="sm">{row.detail}</Text>
              )}
              <Button
                variant="default"
                size="sm"
                w="fit-content"
                onClick={() => openWorkspace("preferences")}
              >
                {workspace.workingPreferences
                  ? "Edit working preferences"
                  : "Record working preferences"}
              </Button>
            </Stack>
          ) : (
            <ExpandedAssessment
              workspace={workspace}
              onVerify={(q) => openWorkspace("verification", q)}
              onTraining={(q) => openWorkspace("training", q)}
              excludedRecordIds={workspace.excludedRecordIds}
              requirement={row}
              contextRequirement={context}
              onInspect={inspect}
              reports={workspace.reports}
            />
          ))}
      </RequirementRow>
    );
  }

  return (
    <MantineProvider
      theme={quietTheme}
      cssVariablesResolver={quietCssVariablesResolver}
      forceColorScheme="light"
    >
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
          : page === "assessment" ? "Skip to opportunity assessment" : "Skip to keeper profile"}
      </Anchor>
      <Paper component="header" className="app-header" radius={0} p="md">
        <Container size="lg">
          <Group justify="space-between">
            <img
              src={`${import.meta.env.BASE_URL}brand/carrowmore-lighthouse.svg?v=3`}
              alt="Carrowmore Light Authority"
              width={228}
              height={48}
              style={{ display: "block", flexShrink: 0 }}
            />
            <Group gap="sm">
              <Text size="sm" c="carrowmore.7" visibleFrom="xs">
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
      ) : page !== "assessment" ? (
        <KeeperProfile key={page} keeper={peopleForWorkspace(workspace).find((p) => p.id === page)}
          workspace={workspace} dispatch={dispatchWorkspace} storageFailed={storageFailed} />
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
              <Text size="sm">{person.name}</Text>
              <Text size="sm">{vacancy.title}</Text>
            </Breadcrumbs>
            <Grid gutter="lg" align="flex-start">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                  <Paper className="assessment-surface" radius="lg" bg="white">
                    <Paper
                      component="section"
                      className="assessment-section candidate-section"
                      radius={0}
                      p="lg"
                      bg="white"
                      aria-labelledby="candidate-name"
                    >
                      <Stack gap="lg">
                        <Stack gap="xs">
                          <Title order={1} size="h2" id="candidate-name">
                            {person.name}
                          </Title>
                          <Text size="sm">
                            Current role: Lighthouse keeper · Carrowmore Light
                            Authority
                          </Text>
                        </Stack>
                        <Group justify="space-between" align="center" gap="sm">
                          <Stack gap="xs">
                            <Text size="sm" c="dimmed">
                              Opportunity being assessed
                            </Text>
                            <Text size="sm">
                              {vacancy.title} · {vacancy.employer}
                            </Text>
                          </Stack>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => {
                              rememberFocus();
                              setJobOpen(true);
                            }}
                          >
                            View role details
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                    <Stack
                      component={Paper}
                      className="assessment-section"
                      role="region"
                      radius={0}
                      p="lg"
                      bg="white"
                      gap="xs"
                      aria-labelledby="summary-heading"
                    >
                      <Title order={2} size="h4" id="summary-heading">
                        Why this could work
                      </Title>
                      <Text>
                        {summaryWithQualifications(
                          selectedCandidateSummary(workspace.excludedRecordIds),
                          workspace,
                        )}
                      </Text>
                    </Stack>
                  </Paper>
                  <Box
                    display={mobileWorkspace ? "block" : "none"}
                    ref={setProgressTarget}
                    className={
                      mobileWorkspace ? "workspace-surface" : undefined
                    }
                  />
                  <Accordion value={expanded} onChange={setExpanded} order={3}>
                    <Stack gap="lg">
                      <Stack
                        component={Paper}
                        className="assessment-section"
                        role="region"
                        radius="lg"
                        p="lg"
                        bg="white"
                        gap="sm"
                        aria-labelledby="experience-heading"
                      >
                        <Title order={2} size="h4" id="experience-heading">
                          Relevant experience
                        </Title>
                        <Text size="sm" c="dimmed">
                          Mechanical or electrical maintenance can meet the
                          experience requirement.
                        </Text>
                        <Box>{experienceRows.map(renderAssessment)}</Box>
                      </Stack>
                      <Stack
                        component={Paper}
                        className="assessment-section"
                        role="region"
                        radius="lg"
                        p="lg"
                        bg="white"
                        gap="sm"
                        aria-labelledby="qualifications-heading"
                      >
                        <Title
                          order={2}
                          size="h4"
                          id="qualifications-heading"
                          tabIndex={-1}
                        >
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
                        {renderAssessment({
                          ...requirements.find((r) => r.id === "environment"),
                          text: "Working conditions",
                          conclusion: workspace.workingPreferences
                            ? "Preferences recorded"
                            : "Not yet discussed",
                          detail:
                            "Eimhin’s comfort at height, in enclosed spaces and on boats in a swell has not yet been discussed.",
                        })}
                        <Text size="sm" c="dimmed">
                          Missing records do not mean a qualification is absent.
                        </Text>
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
                  progressTarget={mobileWorkspace ? progressTarget : null}
                  state={workspace}
                  dispatch={dispatchWorkspace}
                  onOpen={openWorkspace}
                  onWorkflow={openWorkflow}
                  drafts={drafts}
                  onDiscussion={(origin) => {
                    rememberFocus();
                    if (origin instanceof HTMLElement)
                      focusOrigin.current = origin;
                    setDraftOpen(true);
                  }}
                />
              </Grid.Col>
            </Grid>
            <Group component="footer" justify="space-between" gap="xs">
              <Text size="sm" c="dimmed">
                CARROWMORE LIGHT AUTHORITY / EMPLOYEE REDEPLOYMENT
              </Text>
              <Text size="sm" c="dimmed">
                Changes saved. Nothing shared.
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  rememberFocus();
                  setResetOpen(true);
                }}
              >
                Reset workspace
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
            onRecordAccount={(id) => openWorkspace("report", { id })}
            onNavigate={openWorkspace}
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
        title="Reset workspace?"
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
      >
        <Stack gap="md">
          <Text>
            This removes saved notes, tasks, accounts, discussion questions,
            flags and referral decisions from this browser. The initial tasks
            will be restored.
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
                setNotice("Workspace reset.");
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
            <Text component="span" display="block" size="sm" c="dimmed">
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
            workspace={workspace}
            drawer={drawer}
            records={selectedSources}
            training={training}
            recordFlags={recordFlags}
            excludedRecordIds={workspace.excludedRecordIds ?? []}
            onInclusion={(id, included) =>
              dispatchWorkspace({ type: "record-inclusion", id, included })
            }
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
            <Text component="span" display="block" size="sm" c="dimmed">
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
            <MultiSelect comboboxProps={{ withinPortal: false }} label="Question topics" placeholder="Select one or more topics" searchable
              value={questionTopics} onChange={setQuestionTopics}
              data={[
                ...claims, ...qualifications, ...discussionTopics,
                ...requirements.filter((r) => r.type === "clarification").map((r) => ({ ...r, title: r.text })),
              ].map((topic) => ({ value: topic.id, label: topic.title, disabled: drafts.some((d) => d.id === topic.id) }))} />
            <Button variant="default" disabled={!questionTopics.length} onClick={() => {
              const additions = questionTopics.map((id) => {
                const topic = [...claims, ...qualifications, ...discussionTopics, ...requirements].find((t) => t.id === id);
                const context = clarificationContexts.find((r) => r.id === topic.requirementId || r.qualificationIds?.includes(id) || r.id === id)
                  ?? requirements.find((r) => r.id === "maintenance");
                return { id, requirementId: context.id, title: topic.title ?? topic.text, text: topic.question, completed: false };
              });
              setDrafts((ds) => [...ds, ...additions.filter((a) => !ds.some((d) => d.id === a.id))]);
              setQuestionTopics([]);
              setNotice("Questions added to Conversations.");
            }}>Add selected questions</Button>
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
                  {questionDiscussed(workspace, draft) &&
                    <Text size="sm" c="dimmed">{workspace.reports[draft.id] ? "Eimhin’s account recorded" : "Discussed"}</Text>}
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
              Saved in Conversations for your discussion. Nothing is sent.
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
            <Text size="sm">
              {requirements.find((r) => r.id === "mentoring").detail}
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
    </MantineProvider>
  );
}
