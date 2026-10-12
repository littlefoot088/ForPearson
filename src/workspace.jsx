import {
  workflowView,
  questionDiscussed,
  verificationFor,
  today,
  currentSend,
  safetyIds,
  trainingFor,
} from "./workflowState";
import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  ActionIcon,
  Anchor,
  Menu,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";
import { claims, dateLabel, qualifications } from "./data";
import { interestLabel, officerAssessments } from "./workflow";
import { CandidateIntroduction } from "./introduction";
import { TrainingEditor } from "./TrainingEditor";

export const workspaceTitles = {
  referral: "Candidate introduction",
  task: "Next step",
  notes: "Conversations",
  report: "Eimhin’s account",
  preferences: "Eimhin’s working preferences",
  verification: "Qualification verification",
  training: "Training to support job search",
};
function StatusRow({ label, value, detail, action, prominent = false }) {
  return (
    <div className="workspace-status-row">
      <Stack gap={4} className="workspace-status-copy">
        <Text size="sm" c="dimmed">{label}</Text>
        {prominent ? <Title order={2} size="h3">{value}</Title> : <Text size="sm" fw={500}>{value}</Text>}
        {detail && <Text size="xs" c="dimmed">{detail}</Text>}
      </Stack>
      {action && <Button className="workspace-status-action" size="compact-xs" variant="subtle"
        aria-label={action.name} onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

function TaskLink({ children, onClick }) {
  return <Anchor component="button" type="button" size="xs" underline="always"
    c="carrowmore.7" ta="left" onClick={onClick}>{children}</Anchor>;
}

export function Workspace({
  state,
  dispatch,
  onOpen,
  onWorkflow,
  drafts,
  onDiscussion,
  progressTarget,
}) {
  const contacts = [
    ...state.notes.map((note) => ({ ...note, kind: "Private note" })),
    ...Object.values(state.reports).map((report) => ({ ...report, kind: "Eimhin’s account", title: claims.find((c) => c.id === report.id)?.title })),
  ];
  const recent = contacts.sort(
    (a, b) =>
      b.date.localeCompare(a.date) || (b.recordedAt ?? 0) - (a.recordedAt ?? 0),
  )[0];
  const view = workflowView(state);
  const assessment = view.assessment;
  const kind = view.primary.action;
  const sent = kind === null ? currentSend(state) : null;
  const primary = {
    ...view.primary,
    assessment: kind === "assessment",
    response: kind === "response",
    discussion: kind === "discussion",
    introduction: kind === "introduction",
    action:
      kind === "discussion"
        ? onDiscussion
        : kind === "introduction"
          ? () => onOpen("referral")
          : () => onWorkflow(kind),
  };
  const pendingQuestions = drafts.filter((d) => !questionDiscussed(state, d)).length;
  const verifiedSafetyCount = safetyIds.filter((id) => verificationFor(state, id).current).length;
  function openCertificateCheck() {
    const nextId = safetyIds.find((id) => !verificationFor(state, id).current) ?? safetyIds[0];
    onOpen("verification", qualifications.find((q) => q.id === nextId));
  }
  const tasks = view.tasks
    .filter(
      (t) =>
        (!t.automatic ||
          t.id === "certificates" ||
          t.id === "career-preferences" || t.trainingId) &&
        !(t.automatic && t.trainingId && trainingFor(state, t.trainingId).record?.status === "cancelled") &&
        !(
          t.id === "responsibilities" &&
          Object.keys(state.reports).length > 0
        ),
    )
    .sort((a, b) => Number(a.done) - Number(b.done));
  const progress = (
    <Paper
      component="section"
      className="crafted-progress"
      id="opportunity-actions"
      tabIndex={-1}
      radius={0}
      p="md"
      bg="transparent"
    >
      <Stack gap="md">
        <Stack gap="lg" className="workspace-status-list">
          <StatusRow label="Progress" prominent value={view.progress}
            action={!sent && { label: "Update", name: "Update progress", onClick: () => onWorkflow("progress") }} />
          <StatusRow label="Your assessment" value={officerAssessments[assessment]}
            action={{
              label: assessment === "not-reviewed" || assessment === "needs-clarification" ? "Record" : "Change",
              name: assessment === "not-reviewed" || assessment === "needs-clarification" ? "Record decision" : "Change decision",
              onClick: () => onWorkflow("assessment"),
            }} />
          <StatusRow label="Eimhin’s interest"
            value={<span data-testid="keeper-interest">{interestLabel(state.opportunity)}</span>}
            action={{ label: "Change", name: "Update Eimhin’s interest", onClick: () => onWorkflow("response") }} />
          {(primary.introduction || state.referral) && (
            <StatusRow label="Candidate introduction" value={view.introduction}
              detail={sent && !state.referral?.needsReview ? dateLabel(sent.sentAt.slice(0, 10)) : null}
              action={state.referral && (!primary.introduction || sent) && {
                label: "View", name: sent ? "View sent introduction" : "View introduction",
                onClick: () => onOpen("referral"),
              }} />
          )}
        </Stack>
        {!sent && (
          <Stack gap="xs" align="flex-start">
            <Text size="sm" fw={600}>
              Next action
            </Text>
            {primary.assessment || primary.response ? (
              <Text size="sm">
                {primary.assessment
                  ? assessment === "not-reviewed"
                    ? "Record your suitability decision above."
                    : "Reconsider your suitability decision above."
                  : state.opportunity.interest === "not-discussed"
                    ? "Record Eimhin’s response above."
                    : "Review Eimhin’s recorded response above."}
              </Text>
            ) : (
              <Button size="sm" w="fit-content" onClick={primary.action}>
                {primary.label}
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
  return (
    <Stack gap="lg" className="workspace-surface crafted-workspace">
      {progressTarget ? createPortal(progress, progressTarget) : progress}
      <Paper
        component="section"
        radius={0}
        p="md"
        bg="transparent"
        aria-label="Next steps"
      >
        <Stack gap="xs">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Title order={2} size="h4">What needs doing</Title>
            <Button size="compact-xs" variant="subtle" className="workspace-status-action"
              id="add-workspace-task" onClick={() => onOpen("task")}>
              Add task
            </Button>
          </Group>
          {tasks.length === 0 && (
            <Text size="sm" c="dimmed">
              No tasks recorded.
            </Text>
          )}
          {tasks.map((t) => (
            <Stack
              gap="xs"
              key={t.id}
              className="workspace-task"
              data-complete={t.done || undefined}
            >
              <Group wrap="nowrap" align="flex-start" gap="xs">
                <Checkbox
                  flex={1}
                  miw={0}
                  aria-label={t.title}
                  label={
                    <Text component="span" size="sm" className="source-text">
                      {t.title}
                    </Text>
                  }
                  description={(t.id === "certificates" || t.id === "career-preferences" || t.trainingId) && (
                    <Stack component="span" gap={2}>
                      {t.id === "certificates" && (
                        <TaskLink onClick={openCertificateCheck}>
                          {verifiedSafetyCount} of 4 safety certificates verified
                        </TaskLink>
                      )}
                      {t.id === "career-preferences" && (
                        <TaskLink onClick={() => onOpen("preferences")}>
                          {t.done
                            ? "Working preferences recorded"
                            : "Complete by recording working preferences"}
                        </TaskLink>
                      )}
                      {t.trainingId && (
                        <>
                        <Text component="span" size="xs" c="dimmed">
                          {trainingFor(state, t.trainingId).record?.course} · {verificationFor(state, t.trainingId).current ? "Certificate verified" : trainingFor(state, t.trainingId).label}
                        </Text>
                        <Group component="span" gap="sm">
                          <TaskLink onClick={() => onOpen("training", qualifications.find((q) => q.id === t.trainingId))}>
                            Update training
                          </TaskLink>
                          {trainingFor(state, t.trainingId).record?.status === "completed" && !verificationFor(state, t.trainingId).current && (
                            <TaskLink onClick={() => onOpen("verification", qualifications.find((q) => q.id === t.trainingId))}>
                              Verify certificate
                            </TaskLink>
                          )}
                        </Group>
                        </>
                      )}
                    </Stack>
                  )}
                  checked={t.done}
                  onChange={() => {
                    if (t.automatic && t.trainingId) {
                      onOpen("training", qualifications.find((q) => q.id === t.trainingId));
                      return;
                    }
                    if (t.id === "career-preferences") {
                      onOpen("preferences");
                      return;
                    }
                    if (t.id !== "certificates") {
                      dispatch({ type: "task-toggle", id: t.id });
                      return;
                    }
                    openCertificateCheck();
                  }}
                />
                <Menu position="bottom-end" withinPortal returnFocus>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      data-task-options={t.id}
                      aria-label={`Options for task: ${t.title}`}
                    >
                      <MoreHorizontal size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Pencil size={16} />}
                      onClick={() =>
                        requestAnimationFrame(() => {
                          onOpen(
                            "task",
                            t,
                            document.querySelector(
                              `[data-task-options="${t.id}"]`,
                            ),
                          );
                        })
                      }
                    >
                      Edit task
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<MessageSquare size={16} />}
                      onClick={() =>
                        requestAnimationFrame(() => {
                          onDiscussion(
                            document.querySelector(
                              `[data-task-options="${t.id}"]`,
                            ),
                          );
                        })
                      }
                    >
                      Prepare discussion questions
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<Trash2 size={16} />}
                      onClick={() => {
                        dispatch({ type: "task-remove", id: t.id });
                        requestAnimationFrame(() =>
                          document
                            .getElementById("add-workspace-task")
                            ?.focus(),
                        );
                      }}
                    >
                      Remove task
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Stack>
          ))}
        </Stack>
      </Paper>
      <Paper component="section" aria-label="Conversations" radius={0} p="md" bg="transparent">
        <Stack gap="sm">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Title order={2} size="h4">Conversations</Title>
            <Button size="compact-xs" variant="subtle" className="workspace-status-action" aria-label="Record conversation"
              onClick={() => onOpen("notes", { newNote: true })}>
              Record
            </Button>
          </Group>
          {drafts.length > 0 && <Text size="sm" c="dimmed">{pendingQuestions} {pendingQuestions === 1 ? "question" : "questions"} prepared · {drafts.length - pendingQuestions} discussed</Text>}
          {!primary.discussion && <Button variant="subtle" size="compact-xs" w="fit-content" onClick={() => onDiscussion()}>
            {drafts.length ? "View questions" : "Prepare questions"}
          </Button>}
          {recent ? (
            <>
              <Text size="sm" c="dimmed">
                {dateLabel(recent.date)} · {recent.kind}
              </Text>
              {recent.title && <Text size="sm" fw={500}>{recent.title}</Text>}
              <Text size="sm" lineClamp={3} className="source-quote">
                {recent.text}
              </Text>
              {recent.followup && (
                <Text size="sm" lineClamp={2}>
                  <strong>Follow-up:</strong> {recent.followup}
                </Text>
              )}
            </>
          ) : (
            <Text size="sm" c="dimmed">
              No conversation recorded.
            </Text>
          )}
          <Group gap="xs">
            <Button
                size="compact-sm"
                variant="subtle"
                onClick={() => onOpen("notes")}
              >
                View conversation history ({contacts.length})
              </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function WorkspacePanel({
  mode,
  item,
  state,
  dispatch,
  onClose,
  storageFailed,
  onQuestion,
  drafts = [],
  onRecordAccount,
  onNavigate,
}) {
  if (mode === "training")
    return <TrainingEditor qualification={item} state={state} dispatch={dispatch} onClose={onClose} onVerify={() => onNavigate("verification", item)} />;
  if (mode === "verification")
    return (
      <VerificationEditor
        qualification={item}
        state={state}
        dispatch={dispatch}
        onClose={onClose}
        onTraining={() => onNavigate("training", item)}
      />
    );
  if (mode === "referral")
    return (
      <CandidateIntroduction
        state={state}
        dispatch={dispatch}
        storageFailed={storageFailed}
      />
    );
  if (mode === "preferences")
    return (
      <PreferencesEditor
        preference={state.workingPreferences}
        onCancel={onClose}
        onSave={(preference) => {
          dispatch({ type: "preferences-save", preference });
          onClose();
        }}
      />
    );
  if (mode === "notes")
    return (
      <NotesEditor
        notes={state.notes}
        drafts={drafts}
        reports={state.reports}
        onRecordAccount={onRecordAccount}
        newNote={item?.newNote}
        onSave={(note) => dispatch({ type: "note-save", note })}
      />
    );
  if (mode === "report")
    return (
      <ReportEditor
        id={item.id}
        onCancel={onClose}
        report={state.reports[item.id]}
        onSave={(report) => {
          dispatch({ type: "report-save", report });
          onClose();
        }}
      />
    );
  return (
    <TaskEditor
      task={item}
      onQuestion={onQuestion}
      drafted={drafts.some((d) => d.id === item?.qualificationId)}
      onRemove={() => {
        dispatch({ type: "task-remove", id: item.id });
        onClose();
      }}
      onCancel={onClose}
      onSave={(task) => {
        dispatch({ type: "task-save", task });
        onClose();
      }}
    />
  );
}
function TaskEditor({ task, onSave, onCancel, onQuestion, onRemove, drafted }) {
  const [title, setTitle] = useState(task?.title ?? "");
  return (
    <Stack
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...task,
          id: task?.id ?? crypto.randomUUID(),
          title,
          done: task?.done ?? false,
        });
      }}
      gap="md"
    >
      <TextInput
        data-autofocus
        label="Task"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        required
        maxLength={180}
      />
      {task?.qualificationId && (
        <Text size="sm" c="dimmed">
          Linked to{" "}
          {qualifications.find((q) => q.id === task.qualificationId)?.title}.
          Check with Eimhin, Authority training records or the provider.
        </Text>
      )}
      {task?.qualificationId && (
        <Stack gap="xs" align="flex-start">
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() =>
              onQuestion(
                qualifications.find((q) => q.id === task.qualificationId),
              )
            }
          >
            {drafted ? "View follow-up" : "Add follow-up"}
          </Button>
          <Button variant="subtle" size="compact-sm" onClick={onRemove}>
            Undo qualification check
          </Button>
        </Stack>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Save task
        </Button>
      </Group>
    </Stack>
  );
}
function NotesEditor({ notes, drafts, reports, onRecordAccount, newNote, onSave }) {
  const blank = () => ({
    id: crypto.randomUUID(),
    date: "",
    text: "",
    followup: "",
    recordedAt: Date.now(),
    topics: [],
  });
  const [editing, setEditing] = useState(newNote ? blank() : null);
  const [saved, setSaved] = useState(false);
  const dateInput = useRef(null);
  const addButton = useRef(null);
  useEffect(() => {
    (editing ? dateInput.current : addButton.current)?.focus();
  }, [editing?.id]);
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Private notes; not included in the candidate introduction.
      </Text>
      {saved && (
        <Text role="status" size="sm">
          Note saved.
        </Text>
      )}
      {editing ? (
        <Stack
          component="form"
          gap="sm"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(editing);
            setEditing(null);
            setSaved(true);
          }}
        >
          <TextInput
            data-autofocus
            type="date"
            ref={dateInput}
            label="Conversation or note date"
            required
            value={editing.date}
            onChange={(e) =>
              setEditing({ ...editing, date: e.currentTarget.value })
            }
          />
          {drafts.length > 0 && <Stack gap="xs">
            <Text size="sm" fw={500}>Questions covered</Text>
            <Text size="xs" c="dimmed">Select all that you discussed. Unselected questions stay prepared.</Text>
            {drafts.map((draft) => <Checkbox key={draft.id} label={draft.title} description={draft.text}
              checked={(editing.topics ?? []).some((t) => t.id === draft.id)}
              onChange={(e) => setEditing({ ...editing, topics: e.currentTarget.checked
                ? [...(editing.topics ?? []), { id: draft.id, title: draft.title, text: draft.text }]
                : (editing.topics ?? []).filter((t) => t.id !== draft.id) })} />)}
          </Stack>}
          <Textarea
            label="Private note"
            required
            autosize
            minRows={4}
            maxRows={12}
            maxLength={4000}
            value={editing.text}
            onChange={(e) =>
              setEditing({ ...editing, text: e.currentTarget.value })
            }
          />
          {editing.followup && (
            <Text size="sm">
              <strong>Previous follow-up:</strong> {editing.followup}
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!editing.date || !editing.text.trim()}
            >
              Save note
            </Button>
          </Group>
        </Stack>
      ) : (
        <Button
          variant="light"
          ref={addButton}
          onClick={() => {
            setEditing(blank());
            setSaved(false);
          }}
        >
          Add note
        </Button>
      )}
      {!editing && <Stack gap="xs">
        <Text size="sm" fw={500}>Eimhin’s accounts</Text>
        <Text size="sm" c="dimmed">Record reported experience separately when it may support the assessment. Private notes are never included in an introduction.</Text>
        {["pump", "electrical"].map((id) => <Group key={id} justify="space-between" wrap="nowrap">
          <Text size="sm">{claims.find((c) => c.id === id).title}</Text>
          <Button size="compact-xs" variant="subtle" aria-label={`${reports[id] ? "View" : "Record"} account: ${claims.find((c) => c.id === id).title}`}
            onClick={() => onRecordAccount(id)}>{reports[id] ? "View" : "Record"}</Button>
        </Group>)}
      </Stack>}
      {[...notes, ...Object.values(reports).map((report) => ({ ...report, isReport: true }))]
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            (b.recordedAt ?? 0) - (a.recordedAt ?? 0),
        )
        .map((note) => (
          <Paper key={`${note.isReport ? "report" : "note"}-${note.id}`} withBorder p="md">
            <Stack gap="xs">
              <Text fw={600}>{dateLabel(note.date)} · {note.isReport ? "Eimhin’s account" : "Private note"}</Text>
              {note.isReport && <Text size="sm">{claims.find((c) => c.id === note.id)?.title}</Text>}
              {note.topics?.length > 0 && <Text size="sm" c="dimmed">Discussed: {note.topics.map((t) => t.title).join(" · ")}</Text>}
              <Text className="source-quote">{note.text}</Text>
              {note.followup && (
                <Text size="sm">
                  <strong>Follow-up:</strong> {note.followup}
                </Text>
              )}
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => {
                  if (note.isReport) onRecordAccount(note.id);
                  else { setEditing(note); setSaved(false); }
                }}
              >
                {note.isReport ? "View account from" : "Edit note from"} {dateLabel(note.date)}
              </Button>
            </Stack>
          </Paper>
        ))}
    </Stack>
  );
}
function ReportEditor({ id, report, onSave, onCancel }) {
  const [value, setValue] = useState(report ?? { id, date: "", text: "" });
  return (
    <Stack
      component="form"
      gap="md"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
    >
      <Text fw={600}>{claims.find((c) => c.id === id).title}</Text>
      <Text size="sm">
        Reported by Eimhin; recorded by you. This account supplements historical
        records and is not independent verification.
      </Text>
      <TextInput
        data-autofocus
        label="Date reported"
        type="date"
        required
        value={value.date}
        onChange={(e) => setValue({ ...value, date: e.currentTarget.value })}
      />
      <Textarea
        label="Responsibilities described by Eimhin"
        required
        autosize
        minRows={4}
        maxRows={12}
        maxLength={3000}
        value={value.text}
        onChange={(e) => setValue({ ...value, text: e.currentTarget.value })}
      />
      <Text size="sm" c="dimmed">
        Saved separately from private notes. You can choose whether to include
        this account in the candidate introduction.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!value.date || !value.text.trim()}>
          Save Eimhin’s account
        </Button>
      </Group>
    </Stack>
  );
}

function PreferencesEditor({ preference, onSave, onCancel }) {
  const [value, setValue] = useState(
    preference ?? { date: "", response: "", concerns: "" },
  );
  return (
    <Stack
      component="form"
      gap="md"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.response.trim()) onSave(value);
      }}
    >
      <Text size="sm">
        Record what Eimhin tells you about working at height, in enclosed spaces
        and on boats in a swell.
      </Text>
      <TextInput
        data-autofocus
        type="date"
        label="Discussion date"
        required
        value={value.date}
        onChange={(event) =>
          setValue({ ...value, date: event.currentTarget.value })
        }
      />
      <Textarea
        label="Eimhin’s working preferences"
        description="Include what suits him and anything he has not decided yet."
        required
        autosize
        minRows={4}
        maxRows={10}
        maxLength={4000}
        value={value.response}
        onChange={(event) =>
          setValue({ ...value, response: event.currentTarget.value })
        }
      />
      <Textarea
        label="Concerns or conditions"
        description="Optional"
        autosize
        minRows={2}
        maxRows={6}
        maxLength={2000}
        value={value.concerns}
        onChange={(event) =>
          setValue({ ...value, concerns: event.currentTarget.value })
        }
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!value.date || !value.response.trim()}>
          Save preferences
        </Button>
      </Group>
    </Stack>
  );
}

function VerificationEditor({ qualification, state, dispatch, onClose, onTraining }) {
  const { record, current } = verificationFor(state, qualification.id);
  const firstInput = useRef(null);
  useEffect(() => { firstInput.current?.focus(); }, []);
  const [value, setValue] = useState(
    record && !record.withdrawn
      ? { ...record }
      : {
          issuer: "",
          reference: "",
          verifiedOn: today(),
          expiresOn: "",
          noExpiry: false,
          coverageConfirmed: false,
        },
  );
  const update = (key, next) => setValue((v) => ({ ...v, [key]: next }));
  const valid = Boolean(
    value.issuer.trim() &&
    value.reference.trim() &&
    value.verifiedOn &&
    value.verifiedOn <= today() &&
    (value.noExpiry || value.expiresOn) &&
    value.coverageConfirmed,
  );
  return (
    <Stack
      component="form"
      gap="md"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        dispatch({
          type: "verification-save",
          id: qualification.id,
          record: {
            ...value,
            issuer: value.issuer.trim(),
            reference: value.reference.trim(),
            expiresOn: value.noExpiry ? "" : value.expiresOn,
            withdrawn: false,
          },
        });
        onClose();
      }}
    >
      <Text fw={600}>{qualification.title}</Text>
      {safetyIds.includes(qualification.id) && !current && (
        <Stack gap="xs">
          <Text size="sm">If Eimhin does not hold this certificate or needs to renew it, you can assign training to support his job search.</Text>
          <Button variant="default" w="fit-content" onClick={onTraining}>
            {trainingFor(state, qualification.id).record ? "Manage training" : "Assign training"}
          </Button>
          <Divider />
        </Stack>
      )}
      {qualification.id === "medical" && (
        <Text size="sm">
          Record clearance details only, not clinical information.
        </Text>
      )}
      <TextInput
        ref={firstInput}
        label="Issuer or provider"
        required
        value={value.issuer}
        onChange={(e) => update("issuer", e.currentTarget.value)}
      />
      <TextInput
        label="Document reference"
        description="Reference to the certificate or clearance you checked."
        required
        value={value.reference}
        onChange={(e) => update("reference", e.currentTarget.value)}
      />
      <TextInput
        type="date"
        label="Verification date"
        max={today()}
        required
        value={value.verifiedOn}
        onChange={(e) => update("verifiedOn", e.currentTarget.value)}
      />
      <Checkbox
        label="The document has no expiry date"
        checked={value.noExpiry}
        onChange={(e) => update("noExpiry", e.currentTarget.checked)}
      />
      {!value.noExpiry && (
        <TextInput
          type="date"
          label="Expiry date"
          required
          value={value.expiresOn}
          onChange={(e) => update("expiresOn", e.currentTarget.value)}
        />
      )}
      {!value.noExpiry && value.expiresOn && value.expiresOn < today() && (
        <Text size="sm" c="clarification.7">
          This document has expired. Saving it will not verify the current
          requirement.
        </Text>
      )}
      <Checkbox
        label="I checked the document and confirmed it covers this requirement"
        checked={value.coverageConfirmed}
        onChange={(e) => update("coverageConfirmed", e.currentTarget.checked)}
      />
      {record && !record.withdrawn && (
        <Button
          variant="subtle"
          color="red"
          w="fit-content"
          onClick={() => {
            dispatch({ type: "verification-withdraw", id: qualification.id });
            onClose();
          }}
        >
          Withdraw verification
        </Button>
      )}
      {(state.verifications?.[qualification.id]?.length ?? 0) > 0 && (
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Verification history
          </Text>
          {[...state.verifications[qualification.id]].reverse().map((r, i) => (
            <Text size="sm" key={i}>
              {r.withdrawn ? "Withdrawn" : "Verified by you"} ·{" "}
              {dateLabel(r.verifiedOn)} · {r.issuer} · {r.reference} ·{" "}
              {r.noExpiry ? "No expiry" : `Expiry ${dateLabel(r.expiresOn)}`}
            </Text>
          ))}
        </Stack>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!valid}>
          Save verification
        </Button>
      </Group>
    </Stack>
  );
}
