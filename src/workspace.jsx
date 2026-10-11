import React, { useState, useRef, useEffect } from "react";
import {
  Accordion,
  ActionIcon,
  Badge,
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { claims, dateLabel, qualifications } from "./data";
import { officerAssessments } from "./workflow";
import { createReferral, readinessAllowed, referralFields } from "./workspace";

export const workspaceTitles = {
  referral: "Prepare referral",
  ready: "Referral readiness decision",
  task: "Next step",
  notes: "Conversation notes",
  report: "Eimhin’s account",
};
export function Workspace({
  state,
  dispatch,
  onOpen,
  onWorkflow,
  drafts,
  onDiscussion,
}) {
  const recent = [...state.notes].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || (b.recordedAt ?? 0) - (a.recordedAt ?? 0),
  )[0];
  const held =
    state.opportunity.assessment === "not-suitable" ||
    state.opportunity.interest !== "interested";
  const tasks = [...state.tasks].sort(
    (a, b) => Number(a.done) - Number(b.done),
  );
  return (
    <Stack gap="md">
      <Paper
        component="section"
        id="opportunity-actions"
        tabIndex={-1}
        withBorder
        radius="md"
        p="md"
        bg="white"
      >
        <Stack gap="sm">
          <Title order={2} size="h4">
            Opportunity progress
          </Title>
          <Text fw={600}>
            {held
              ? "Referral on hold"
              : state.ready
                ? "Ready for referral"
                : "Assessing referral readiness"}
          </Text>
          <Text size="sm" c="dimmed">
            {held
              ? "Review the assessment and Eimhin’s response before progressing."
              : state.ready
                ? "Internal decision recorded. Nothing has been submitted."
                : "Review the evidence and prepare a recommendation for Carrowmore Array."}
          </Text>
          <Button onClick={() => onOpen("referral")}>
            {state.referral ? "Review referral draft" : "Prepare referral"}
          </Button>
          {state.referral && (
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => onOpen("ready")}
            >
              {state.ready
                ? "Review readiness decision"
                : "Mark ready for referral"}
            </Button>
          )}
          {state.referral?.needsReview && (
            <Text size="sm" c="clarification.8">
              Assessment information changed. Review and save the referral
              again.
            </Text>
          )}
          <Divider />
          <Group justify="space-between" gap="xs">
            <Text size="sm">
              <strong>Your assessment:</strong>{" "}
              {officerAssessments[state.opportunity.assessment]}
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() => onWorkflow("assessment")}
            >
              Edit assessment
            </Button>
          </Group>
          {drafts.length > 0 && (
            <Button variant="subtle" size="compact-sm" onClick={onDiscussion}>
              Discussion with Eimhin ({drafts.length})
            </Button>
          )}
        </Stack>
      </Paper>
      <Paper
        component="section"
        withBorder
        radius="md"
        p="md"
        bg="white"
        aria-label="Next steps"
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={2} size="h4">
              Next steps
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
          {tasks.length === 0 && (
            <Text size="sm" c="dimmed">
              No tasks recorded.
            </Text>
          )}
          {tasks.map((t) => (
            <Stack gap="xs" key={t.id}>
              <Group wrap="nowrap" align="flex-start" gap="xs">
                <Checkbox
                  flex={1}
                  miw={0}
                  label={<span className="source-text">{t.title}</span>}
                  checked={t.done}
                  onChange={() => dispatch({ type: "task-toggle", id: t.id })}
                />
                <Group gap={0} wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Edit task: ${t.title}`}
                    onClick={() => onOpen("task", t)}
                  >
                    <Pencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Remove task: ${t.title}`}
                    onClick={() => {
                      dispatch({ type: "task-remove", id: t.id });
                      requestAnimationFrame(() =>
                        document.getElementById("add-workspace-task")?.focus(),
                      );
                    }}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              {t.qualificationId && (
                <Badge color="gray" variant="light" size="sm">
                  Qualification check
                </Badge>
              )}
            </Stack>
          ))}
          <Text size="xs" c="dimmed">
            Completing a task does not verify evidence or qualifications.
          </Text>
        </Stack>
      </Paper>
      <Paper component="section" withBorder radius="md" p="md" bg="white">
        <Stack gap="sm">
          <Title order={2} size="h4">
            Recent conversation
          </Title>
          {recent ? (
            <>
              <Text size="xs" c="dimmed">
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
              No conversation recorded yet.
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
  onInspect,
}) {
  if (mode === "referral")
    return (
      <ReferralEditor state={state} dispatch={dispatch} onInspect={onInspect} />
    );
  if (mode === "ready")
    return <ReadyEditor state={state} dispatch={dispatch} onClose={onClose} />;
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
      onSave={(task) => {
        dispatch({ type: "task-save", task });
        onClose();
      }}
    />
  );
}
function TaskEditor({ task, onSave }) {
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
      <Button type="submit" disabled={!title.trim()}>
        Save task
      </Button>
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
        Private working notes. These are never automatically included in the
        referral.
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
          <Textarea
            label="Follow-up (optional)"
            description="A reminder within this note; it does not create a task."
            autosize
            maxLength={1000}
            value={editing.followup}
            onChange={(e) =>
              setEditing({ ...editing, followup: e.currentTarget.value })
            }
          />
          <Group>
            <Button
              type="submit"
              disabled={!editing.date || !editing.text.trim()}
            >
              Save note
            </Button>
            <Button variant="default" onClick={() => setEditing(null)}>
              Cancel
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
function ReportEditor({ id, report, onSave }) {
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
        this account in the referral.
      </Text>
      <Button type="submit" disabled={!value.date || !value.text.trim()}>
        Save Eimhin’s account
      </Button>
    </Stack>
  );
}
function ReferralEditor({ state, dispatch, onInspect }) {
  const [draft, setDraft] = useState(() => state.referral ?? createReferral());
  const [saved, setSaved] = useState(false);
  const reports = Object.values(state.reports);
  const dirty =
    JSON.stringify({ ...draft, needsReview: false }) !==
    JSON.stringify(state.referral);
  function includeReport(report, include) {
    setSaved(false);
    setDraft({
      ...draft,
      includedReports: include
        ? [
            ...draft.includedReports.filter((r) => r.id !== report.id),
            { ...report },
          ]
        : draft.includedReports.filter((r) => r.id !== report.id),
    });
  }
  return (
    <Stack
      component="form"
      gap="md"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "referral-save", referral: draft });
        setDraft({ ...draft, needsReview: false });
        setSaved(true);
      }}
    >
      <Text size="sm" c="dimmed" tabIndex={-1} data-autofocus>
        Editable recommendation for Carrowmore Array. Saved on this browser;
        nothing is sent. Eimhin must approve the information before external
        sharing.
      </Text>
      {state.referral?.needsReview && (
        <Paper p="sm" bg="clarification.0">
          <Text size="sm">
            Assessment information changed. Review the wording and any included
            account, then save again. Your edits have been retained.
          </Text>
        </Paper>
      )}
      {referralFields.map(([key, label]) => (
        <Textarea
          key={key}
          label={label}
          required
          autosize
          minRows={2}
          maxRows={10}
          maxLength={6000}
          value={draft[key]}
          onChange={(e) => {
            setDraft({ ...draft, [key]: e.currentTarget.value });
            setSaved(false);
          }}
        />
      ))}
      {reports.length > 0 && (
        <Stack gap="sm">
          <Title order={3} size="h5">
            Eimhin-reported responsibilities
          </Title>
          <Text size="sm" c="dimmed">
            Optional, self-reported information. Select explicitly to include
            it.
          </Text>
          {reports.map((report) => {
            const included = draft.includedReports.find(
              (r) => r.id === report.id,
            );
            return (
              <Paper key={report.id} withBorder p="sm">
                <Stack gap="xs">
                  <Checkbox
                    checked={Boolean(included)}
                    label={`Include Eimhin’s account: ${claims.find((c) => c.id === report.id).title}`}
                    onChange={(e) =>
                      includeReport(report, e.currentTarget.checked)
                    }
                  />
                  <Text size="sm">
                    Reported by Eimhin on {dateLabel(report.date)}; recorded by
                    you.
                  </Text>
                  <Text size="sm" className="source-quote">
                    {report.text}
                  </Text>
                  {included && (
                    <>
                      <Textarea
                        label={`Referral wording: ${claims.find((c) => c.id === report.id).title}`}
                        autosize
                        minRows={2}
                        required
                        value={included.text}
                        onChange={(e) => {
                          setDraft({
                            ...draft,
                            includedReports: draft.includedReports.map((r) =>
                              r.id === report.id
                                ? { ...r, text: e.currentTarget.value }
                                : r,
                            ),
                          });
                          setSaved(false);
                        }}
                      />
                      <Button
                        variant="subtle"
                        size="compact-sm"
                        onClick={() => includeReport(report, true)}
                      >
                        Use latest reported account
                      </Button>
                      <Text size="xs" c="dimmed">
                        Included as self-reported, dated{" "}
                        {dateLabel(included.date)}. This is not verified
                        experience.
                      </Text>
                    </>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
      <Accordion>
        <Accordion.Item value="sources">
          <Accordion.Control>
            Sources behind the draft · for your review
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Text size="sm">
                Historical claims use attributed records. Two early records
                remain accessible with attribution caveats and are excluded from
                the recommendation. Source links and private working notes are
                not part of the employer-facing draft.
              </Text>
              {claims.map((claim) => (
                <Button
                  variant="subtle"
                  key={claim.id}
                  onClick={() => onInspect(claim)}
                >
                  {claim.title} · inspect records
                </Button>
              ))}
              <Text size="xs" c="dimmed">
                Qualification wording reflects the four training records and the
                selected requirements; none establishes a complete verified
                offshore qualification.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      {saved && (
        <Text size="sm" role="status">
          Referral draft saved locally. Readiness has not been granted by
          saving.
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {dirty
          ? "Unsaved edits. Save before closing to retain them."
          : "Saved draft. Readiness is a separate decision."}
      </Text>
      <Button
        type="submit"
        disabled={
          !referralFields.every(([key]) => draft[key].trim()) ||
          draft.includedReports.some((r) => !r.text.trim())
        }
      >
        Save referral draft
      </Button>
    </Stack>
  );
}
function ReadyEditor({ state, dispatch, onClose }) {
  const [rationale, setRationale] = useState(state.ready?.rationale ?? "");
  const [ack, setAck] = useState(false);
  return (
    <Stack
      component="form"
      gap="md"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "ready", rationale, acknowledged: ack });
        onClose();
      }}
    >
      <Text>
        This records an internal recommendation for employer consideration.
        Nothing is submitted. Eimhin’s approval of the information is still
        required before sharing.
      </Text>
      <Paper bg="clarification.0" p="md">
        <Text size="sm">
          Outstanding: independent responsibilities, current permit authority,
          offshore working conditions, complete safety certification and medical
          clearance. Safety coverage is required before mobilisation; the
          medical verification stage is unspecified.
        </Text>
      </Paper>
      {!readinessAllowed(state) && (
        <Text role="alert" c="clarification.8">
          A reviewed, saved draft, recorded interest and an assessment other
          than “Not currently suitable” are required.
        </Text>
      )}
      <Textarea
        data-autofocus
        label="Rationale for referral readiness"
        required
        autosize
        minRows={3}
        maxLength={3000}
        value={rationale}
        onChange={(e) => setRationale(e.currentTarget.value)}
      />
      <Checkbox
        label="I acknowledge the unresolved requirements and have considered them in this recommendation."
        checked={ack}
        onChange={(e) => setAck(e.currentTarget.checked)}
      />
      <Button
        type="submit"
        disabled={!readinessAllowed(state) || !rationale.trim() || !ack}
      >
        Mark ready for referral
      </Button>
      {state.ready && (
        <Button
          variant="default"
          onClick={() => {
            dispatch({ type: "unready" });
            onClose();
          }}
        >
          Return to assessment
        </Button>
      )}
    </Stack>
  );
}
