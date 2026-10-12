import React, { useEffect, useRef, useState } from "react";
import { Button, Group, NativeSelect, Stack, Text, TextInput } from "@mantine/core";
import { dateLabel } from "./data";
import { trainingFor, trainingReasons, trainingStatuses, verificationFor, today } from "./workflowState";

export function TrainingEditor({ qualification, state, dispatch, onClose, onVerify }) {
  const { record } = trainingFor(state, qualification.id);
  const current = verificationFor(state, qualification.id).current;
  const [value, setValue] = useState(record ?? {
    reason: "", course: "", provider: "", dueOn: "", completedOn: "", status: "assigned",
  });
  const firstInput = useRef(null);
  useEffect(() => { firstInput.current?.focus(); }, []);
  const update = (key, next) => setValue((v) => ({ ...v, [key]: next }));
  const dirty = !record || ["reason", "course", "provider", "dueOn", "completedOn", "status"].some((key) => value[key] !== record[key]);
  const valid = value.course.trim() && value.reason &&
    (value.status !== "completed" || (value.completedOn && value.completedOn <= today()));
  const history = state.training?.[qualification.id] ?? [];

  return (
    <Stack component="form" gap="md" onSubmit={(event) => {
      event.preventDefault();
      if (!valid || !dirty) return;
      dispatch({ type: "training-save", id: qualification.id, record: value });
      onClose();
    }}>
      <Text fw={600}>{qualification.title}</Text>
      <Text size="sm">Assign a certification course to Eimhin to support his job search. This records the plan locally; it does not book a place or contact a provider.</Text>
      <NativeSelect ref={firstInput} label="Reason for training" required value={value.reason}
        data={[{ value: "", label: "Select the confirmed training need" }, ...Object.entries(trainingReasons).map(([value, label]) => ({ value, label }))]}
        description="Record what you have established with Eimhin. Missing records alone do not mean a certificate is not held."
        onChange={(e) => update("reason", e.currentTarget.value)} />
      <TextInput label="Course name" required value={value.course} description="Use a course that leads to certification for this requirement."
        onChange={(e) => update("course", e.currentTarget.value)} />
      <TextInput label="Training provider" value={value.provider} description="Optional until the provider is arranged."
        onChange={(e) => update("provider", e.currentTarget.value)} />
      <TextInput type="date" label="Target completion date" value={value.dueOn} description="Optional."
        onChange={(e) => update("dueOn", e.currentTarget.value)} />
      {record && <NativeSelect label="Training progress" value={value.status}
        data={Object.entries(trainingStatuses).map(([value, label]) => ({ value, label: value === "completed" ? "Completed" : label.replace("Training ", "").replace(/^./, (c) => c.toUpperCase()) }))}
        onChange={(e) => {
          const status = e.currentTarget.value;
          setValue((v) => ({ ...v, status, completedOn: status === "completed" ? v.completedOn : "" }));
        }} />}
      {value.status === "completed" && <TextInput type="date" label="Completion date" required max={today()} value={value.completedOn}
        onChange={(e) => update("completedOn", e.currentTarget.value)} />}
      <Text size="sm" c="dimmed">{current ? "The certificate has current verification recorded." : "Course completion closes the training task. The certificate must still be checked before this qualification is marked Verified by you."}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!valid || !dirty}>{record ? "Save training update" : "Assign training"}</Button>
      </Group>
      {record?.status === "completed" && !current && !dirty && (
        <Button variant="default" w="fit-content" onClick={onVerify}>Verify certificate</Button>
      )}
      {history.length > 0 && (
        <Stack gap="xs">
          <Text size="sm" fw={600}>Training history</Text>
          {[...history].reverse().map((entry, i) => (
            <Text size="sm" key={i}>
              {dateLabel(new Date(entry.recordedAt).toISOString().slice(0, 10))} · {trainingStatuses[entry.status]} · {entry.course}
              {entry.provider ? ` · ${entry.provider}` : ""}
              {` · ${trainingReasons[entry.reason]}`}
              {entry.dueOn ? ` · Target ${dateLabel(entry.dueOn)}` : ""}
              {entry.completedOn ? ` · Completed ${dateLabel(entry.completedOn)}` : ""}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
