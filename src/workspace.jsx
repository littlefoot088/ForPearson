import {
  workflowView,
  verificationFor,
  today,
  currentSend,
  safetyIds,
} from "./workflowState";
import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  ActionIcon,
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
  Plus,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";
import { claims, dateLabel, qualifications } from "./data";
import { interestLabel, officerAssessments } from "./workflow";
import { CandidateIntroduction } from "./introduction";

export const workspaceTitles = {
  referral: "Candidate introduction",
  task: "Next step",
  notes: "Conversation notes",
  report: "Eimhin’s account",
  preferences: "Eimhin’s working preferences",
  verification: "Qualification verification",
};
export function Workspace({
  state,
  dispatch,
  onOpen,
  onWorkflow,
  drafts,
  onDiscussion,
  onDraftToggle,
  onEditDraft,
  onRemoveDraft,
  progressTarget,
}) {
  const recent = [...state.notes].sort(
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
  const tasks = view.tasks
    .filter(
      (t) =>
        (!t.automatic ||
          t.id === "certificates" ||
          t.id === "career-preferences") &&
        !(
          t.id === "responsibilities" &&
          (Object.keys(state.reports).length > 0 ||
            drafts.some((draft) =>
              ["pump", "electrical"].includes(draft.id),
            ))
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
        <Stack gap="xs">
          {sent ? (
            <>
              <Title order={2} size="h3">
                Introduction sent
              </Title>
              <Group justify="space-between" gap="xs" align="flex-start">
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Your assessment
                  </Text>
                  <Text size="sm" fw={600}>
                    {officerAssessments[assessment]}
                  </Text>
                </Stack>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => onWorkflow("assessment")}
                  aria-label="Change decision"
                >
                  Change decision
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Group justify="space-between" gap="xs">
                <Text size="sm" c="dimmed">
                  Your assessment
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => onWorkflow("assessment")}
                  aria-label={
                    assessment === "not-reviewed"
                      ? "Record decision"
                      : "Change decision"
                  }
                >
                  {assessment === "not-reviewed"
                    ? "Record decision"
                    : "Change decision"}
                </Button>
              </Group>
              <Title order={2} size="h3">
                {assessment === "not-reviewed"
                  ? "Decision not recorded"
                  : officerAssessments[assessment]}
              </Title>
            </>
          )}
          <Group gap="xs" align="center">
            <Text size="sm">Eimhin’s interest</Text>
            <Button
              size="compact-sm"
              variant="subtle"
              onClick={() => onWorkflow("response")}
              aria-label="Update Eimhin’s interest"
              rightSection={<Pencil size={14} />}
            >
              <span data-testid="keeper-interest">
                {interestLabel(state.opportunity)}
              </span>
            </Button>
          </Group>
          {(primary.introduction || state.referral) && (
            <Stack gap="xs">
              <Text size="sm">Candidate introduction</Text>
              <Text size="sm" c="dimmed">
                {view.introduction}
                {sent && !state.referral?.needsReview
                  ? ` · ${dateLabel(sent.sentAt.slice(0, 10))}`
                  : ""}
              </Text>
              {state.referral && (!primary.introduction || sent) && (
                <Button
                  variant="subtle"
                  size="compact-sm"
                  w="fit-content"
                  onClick={() => onOpen("referral")}
                >
                  {sent ? "View sent introduction" : "View introduction"}
                </Button>
              )}
            </Stack>
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
          <Group justify="space-between">
            <Title order={2} size="h4">
              What needs doing
            </Title>
            <ActionIcon
              variant="subtle"
              id="add-workspace-task"
              aria-label="Add task"
              onClick={() => onOpen("task")}
            >
              <Plus size={18} />
            </ActionIcon>
          </Group>
          {drafts.map((draft) => {
            const report = state.reports[draft.id];
            const complete = Boolean(draft.completed || report);
            const canRecordAccount = ["pump", "electrical"].includes(
              draft.id,
            );
            return (
              <Stack
                gap="xs"
                key={draft.id}
                className="workspace-task"
                data-complete={complete || undefined}
              >
                <Group wrap="nowrap" align="flex-start" gap="xs">
                  <Checkbox
                    mt={3}
                    aria-label={`Discuss ${draft.title}`}
                    checked={complete}
                    onChange={() =>
                      report
                        ? onOpen("report", { id: draft.id })
                        : onDraftToggle(draft.id)
                    }
                    aria-describedby={
                      report ? `discussion-status-${draft.id}` : undefined
                    }
                  />
                  <Stack gap={2} flex={1} miw={0}>
                    <Text size="sm" className="source-text">
                      Discuss {draft.title}
                    </Text>
                    {report && (
                      <Text
                        id={`discussion-status-${draft.id}`}
                        size="xs"
                        c="dimmed"
                      >
                        Completed automatically when Eimhin’s account was
                        recorded
                      </Text>
                    )}
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      px={0}
                      w="fit-content"
                      onClick={() =>
                        canRecordAccount
                          ? onOpen("report", { id: draft.id })
                          : onEditDraft(draft)
                      }
                    >
                      {canRecordAccount
                        ? report
                          ? "View Eimhin’s account"
                          : "Record Eimhin’s account"
                        : "View discussion question"}
                    </Button>
                  </Stack>
                  <Menu position="bottom-end" withinPortal returnFocus>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        aria-label={`Options for discussion: ${draft.title}`}
                      >
                        <MoreHorizontal size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Pencil size={16} />}
                        onClick={() => onEditDraft(draft)}
                      >
                        Edit question
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<MessageSquare size={16} />}
                        onClick={() => onDiscussion()}
                      >
                        Add discussion item
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<Trash2 size={16} />}
                        onClick={() => onRemoveDraft(draft.id)}
                      >
                        Remove question
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Stack>
            );
          })}
          {Object.values(state.reports)
            .filter((report) => !drafts.some((draft) => draft.id === report.id))
            .map((report) => (
              <Stack
                gap="xs"
                key={report.id}
                className="workspace-task"
                data-complete
              >
                <Group wrap="nowrap" align="flex-start" gap="xs">
                  <Checkbox
                    mt={3}
                    checked
                    aria-label={`Discuss ${claims.find((claim) => claim.id === report.id)?.title}`}
                    aria-describedby={`report-status-${report.id}`}
                    onChange={() => onOpen("report", { id: report.id })}
                  />
                  <Stack gap={2} flex={1} miw={0}>
                    <Text size="sm" className="source-text">
                      Discuss {claims.find((claim) => claim.id === report.id)?.title}
                    </Text>
                    <Text id={`report-status-${report.id}`} size="xs" c="dimmed">
                      Completed automatically when Eimhin’s account was recorded
                    </Text>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      px={0}
                      w="fit-content"
                      onClick={() => onOpen("report", { id: report.id })}
                    >
                      View Eimhin’s account
                    </Button>
                  </Stack>
                </Group>
              </Stack>
            ))}
          {tasks.length === 0 && drafts.length === 0 && (
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
                    <Stack component="span" gap={2}>
                      <Text component="span" size="sm" className="source-text">
                        {t.title}
                      </Text>
                      {t.id === "certificates" && (
                        <Text component="span" size="xs" c="dimmed">
                          {
                            safetyIds.filter(
                              (id) => verificationFor(state, id).current,
                            ).length
                          }{" "}
                          of 4 safety certificates verified
                        </Text>
                      )}
                      {t.id === "career-preferences" && (
                        <Text component="span" size="xs" c="dimmed">
                          {t.done
                            ? "Working preferences recorded"
                            : "Complete by recording working preferences"}
                        </Text>
                      )}
                    </Stack>
                  }
                  checked={t.done}
                  onChange={() => {
                    if (t.id === "career-preferences") {
                      onOpen("preferences");
                      return;
                    }
                    if (t.id !== "certificates") {
                      dispatch({ type: "task-toggle", id: t.id });
                      return;
                    }
                    const nextId =
                      safetyIds.find(
                        (id) => !verificationFor(state, id).current,
                      ) ?? safetyIds[0];
                    onOpen(
                      "verification",
                      qualifications.find((q) => q.id === nextId),
                    );
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
      <Paper component="section" radius={0} p="md" bg="transparent">
        <Stack gap="sm">
          <Title order={2} size="h4">
            Last contact
          </Title>
          {recent ? (
            <>
              <Text size="sm" c="dimmed">
                {dateLabel(recent.date)} · Private note
              </Text>
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
              onClick={() => onOpen("notes", { newNote: true })}
            >
              Add note
            </Button>
            {recent && (
              <Button
                size="compact-sm"
                variant="subtle"
                onClick={() => onOpen("notes")}
              >
                View notes ({state.notes.length})
              </Button>
            )}
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
}) {
  if (mode === "verification")
    return (
      <VerificationEditor
        qualification={item}
        state={state}
        dispatch={dispatch}
        onClose={onClose}
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
function NotesEditor({ notes, newNote, onSave }) {
  const blank = () => ({
    id: crypto.randomUUID(),
    date: "",
    text: "",
    followup: "",
    recordedAt: Date.now(),
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
      {[...notes]
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            (b.recordedAt ?? 0) - (a.recordedAt ?? 0),
        )
        .map((note) => (
          <Paper key={note.id} withBorder p="md">
            <Stack gap="xs">
              <Text fw={600}>{dateLabel(note.date)}</Text>
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
                  setEditing(note);
                  setSaved(false);
                }}
              >
                Edit note from {dateLabel(note.date)}
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

function VerificationEditor({ qualification, state, dispatch, onClose }) {
  const { record } = verificationFor(state, qualification.id);
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
      {qualification.id === "medical" && (
        <Text size="sm">
          Record clearance details only, not clinical information.
        </Text>
      )}
      <TextInput
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
