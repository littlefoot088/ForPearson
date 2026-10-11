import React, { useState, useRef, useEffect } from "react";
import {
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
import { assessmentOverview } from "./people";
import { officerAssessments } from "./workflow";
import { CandidateIntroduction } from "./introduction";

export const workspaceTitles = {
  referral: "Prepare candidate introduction",
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
  const overview = assessmentOverview(state);
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
          <Text fw={600}>{overview.progress}</Text>
          <Button onClick={() => onOpen("referral")}>
            {state.referral
              ? "Review candidate introduction"
              : "Prepare candidate introduction"}
          </Button>
          {state.referral?.format === 2 && state.referral.needsReview && (
            <Text size="sm" c="clarification.8">
              Assessment information changed. Review and save the introduction
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
  storageFailed,
}) {
  if (mode === "referral")
    return (
      <CandidateIntroduction
        state={state}
        dispatch={dispatch}
        storageFailed={storageFailed}
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
      onCancel={onClose}
      onSave={(task) => {
        dispatch({ type: "task-save", task });
        onClose();
      }}
    />
  );
}
function TaskEditor({ task, onSave, onCancel }) {
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
