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
  List,
  Modal,
  Notification,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  ArrowUpRight,
  ChevronRight,
  Check,
  Pencil,
  Waves,
  Trash2,
} from "lucide-react";
import {
  person,
  vacancy,
  requirements,
  requirementGroups,
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
    setIndex(0);
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
  useEffect(() => {
    // Editing a draft changes content inside an already-open Modal.
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
  const modalTitle = composer
    ? "Add to discussion"
    : draftOpen
      ? "Discussion with Eimhin"
      : workflowDialog
        ? workflowTitles[workflowDialog]
        : "Wind Turbine Technician";
  const modalContext = composer
    ? composer.requirement.text
    : draftOpen
      ? person.name
      : workflowDialog
        ? `${person.name} · ${vacancy.title}`
        : "CARROWMORE ARRAY · O&M";

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
        <Stack gap="xl">
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
          <Stack component="section" gap="md" aria-labelledby="candidate-name">
            <Group wrap="nowrap" align="flex-start">
              <Avatar size="lg" color="carrowmore" aria-hidden="true">
                EM
              </Avatar>
              <Box miw={0}>
                <Text size="xs" c="dimmed">
                  OPPORTUNITY ASSESSMENT
                </Text>
                <Title order={1} id="candidate-name">
                  {person.name}
                </Title>
                <Text c="dimmed">Lighthouse keeper</Text>
              </Box>
            </Group>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    System-suggested opportunity
                  </Text>
                  <Text>
                    <strong>{vacancy.title}</strong> · {vacancy.employer}
                  </Text>
                </div>
                <Button
                  variant="subtle"
                  rightSection={<Icon icon={ArrowUpRight} />}
                  onClick={() => {
                    rememberFocus();
                    setJobOpen(true);
                  }}
                >
                  View role
                </Button>
              </Group>
            </Paper>
            <Stack gap="xs" aria-label="Quick assessment">
              <Text size="sm">
                <strong>Experience:</strong> Relevant maintenance experience
                recorded.
              </Text>
              <Text size="sm">
                <strong>Qualifications:</strong> Offshore safety certificates
                and medical clearance need checking.
              </Text>
              <Text size="sm">
                <strong>Interest:</strong> {interestLabel(opportunity)}
                {opportunity.responseOrigin && " · simulated response"}
              </Text>
              <Text size="sm">
                <strong>Next step:</strong>{" "}
                {opportunity.assessment === "not-suitable"
                  ? "Reconsider the assessment before suggesting this opportunity."
                  : opportunity.nominationDecision?.decision === "defer"
                    ? "Follow up the outstanding questions before reconsidering nomination."
                    : opportunity.nominationDecision
                      ? "Review the recorded gaps before any employer referral."
                      : opportunity.interest === "interested"
                        ? "Review outstanding requirements before deciding whether to nominate Eimhin."
                        : opportunity.interest === "not-interested"
                          ? "Respect Eimhin’s decision; revisit this opportunity only if his interest changes."
                          : opportunity.interest === "more-information"
                            ? "Prepare the information Eimhin needs to decide."
                            : opportunity.suggested
                              ? "Discuss the opportunity and record Eimhin’s response."
                              : "Discuss offshore working preferences and check which safety certificates Eimhin already holds."}
              </Text>
            </Stack>
            <Group justify="space-between" align="center" gap="sm">
              <div>
                <Text size="sm">
                  <strong>Career intention:</strong> {person.careerIntention}
                </Text>
                <Text size="sm" c="dimmed">
                  Career preferences not yet discussed
                </Text>
              </div>
              <Button
                id="requirement-career-preferences"
                variant="subtle"
                leftSection={<Icon icon={Pencil} />}
                onClick={() => clarify(careerContext, careerContext)}
              >
                Add preferences to discussion
              </Button>
            </Group>
          </Stack>
          <Stack
            component="section"
            gap="md"
            aria-labelledby="requirements-heading"
          >
            <Group justify="space-between" gap="xs">
              <Title order={2} id="requirements-heading">
                Requirements assessment
              </Title>
              <Text size="sm" c="dimmed">
                Select a requirement to investigate
              </Text>
            </Group>
            <Paper withBorder>
              <Accordion value={expanded} onChange={setExpanded} order={4}>
                {requirementGroups.map((group) => (
                  <Box
                    component="section"
                    key={group.id}
                    aria-labelledby={"group-" + group.id}
                  >
                    <Box px="md" py="sm" bg="gray.1">
                      <Title
                        order={3}
                        size="sm"
                        c="gray.7"
                        id={"group-" + group.id}
                      >
                        {group.label}
                      </Title>
                    </Box>
                    {requirements
                      .filter((r) => r.group === group.id)
                      .map((requirement) => (
                        <RequirementRow
                          key={requirement.id}
                          requirement={requirement}
                        >
                          {expanded === requirement.id && (
                            <ExpandedAssessment
                              requirement={requirement}
                              onInspect={inspect}
                              onClarify={clarify}
                              drafts={drafts}
                              verifications={verifications}
                              onFlag={flag}
                            />
                          )}
                        </RequirementRow>
                      ))}
                  </Box>
                ))}
              </Accordion>
            </Paper>
          </Stack>
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
      <Modal
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
        size="lg"
        returnFocus={false}
        onExitTransitionEnd={restoreFocus}
        title={
          <span>
            <Text component="span" display="block" size="xs" c="dimmed">
              {modalContext}
            </Text>
            <Text component="span" fw={600}>
              {modalTitle}
            </Text>
          </span>
        }
        closeButtonProps={{ "aria-label": "Close dialog" }}
      >
        {draftOpen && (
          <Stack gap="md">
            <Text>
              Prepare for your discussion. Questions are saved locally, not
              sent.
            </Text>
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
                              "requirement-" + draft.requirementId,
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
      </Modal>
    </>
  );
}
