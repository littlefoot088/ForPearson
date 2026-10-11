import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Checkbox,
  Group,
  NativeSelect,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { Check } from "lucide-react";
import { Icon } from "./components";
import { officerAssessments, keeperResponses } from "./workflow";
import { vacancy } from "./data";

export const workflowTitles = {
  suggest: "Suggest this opportunity to Eimhin",
  response: "Record Eimhin’s response",
  assessment: "Your assessment",
  nomination: "Consider for nomination",
};

export function WorkflowForm({ mode, state, onSave, onCancel }) {
  const fieldRef = useRef(null);
  useEffect(() => {
    fieldRef.current?.focus();
  }, []);
  const [response, setResponse] = useState(state.interest);
  const [assessment, setAssessment] = useState(state.assessment);
  const [decision, setDecision] = useState(
    state.nominationDecision?.decision ?? "defer",
  );
  const [rationale, setRationale] = useState(
    state.nominationDecision?.rationale ?? "",
  );
  const [acknowledged, setAcknowledged] = useState(false);
  function save(event) {
    event.preventDefault();
    if (mode === "suggest") onSave({ type: "suggest" });
    if (mode === "response") onSave({ type: "response", value: response });
    if (mode === "assessment")
      onSave({ type: "assessment", value: assessment });
    if (mode === "nomination")
      onSave({ type: "nomination", decision, rationale, acknowledged });
  }
  const disabled =
    mode === "nomination"
      ? state.interest !== "interested" ||
        !rationale.trim() ||
        (decision === "recommend" && !acknowledged)
      : mode === "assessment" && assessment === "worth-nominating";
  return (
    <Stack component="form" gap="md" onSubmit={save}>
      {mode === "suggest" && (
        <>
          <Text fw={600}>
            {vacancy.title} · {vacancy.employer}
          </Text>
          <Text size="sm">
            {vacancy.base} · {vacancy.pattern}, based on the service operations
            vessel.
          </Text>
          <Text>
            Recorded pump repairs and electrical fault-finding make this worth
            exploring. Offshore safety coverage, medical clearance and working
            conditions still need discussion.
          </Text>
          <Text size="sm" c="clarification.7">
            Career preferences not yet discussed. Suggesting this opportunity
            does not record agreement or interest.
          </Text>
          <Text size="sm" c="dimmed">
            This records your recommendation locally. No message will be sent.
          </Text>
        </>
      )}
      {mode === "assessment" && (
        <>
          <NativeSelect
            ref={fieldRef}
            data-autofocus
            label="Your assessment"
            value={assessment}
            onChange={(event) => setAssessment(event.currentTarget.value)}
            data={Object.entries(officerAssessments)
              .filter(
                ([value]) =>
                  value !== "worth-nominating" || state.assessment === value,
              )
              .map(([value, label]) => ({
                value,
                label,
                disabled: value === "worth-nominating",
              }))}
          />
          <Text size="sm" c="dimmed">
            Your judgement does not verify qualifications or resolve outstanding
            questions.
          </Text>
          {state.nominationDecision && (
            <Text size="sm" c="clarification.7">
              Changing this assessment clears the local nomination decision so
              it can be reconsidered.
            </Text>
          )}
        </>
      )}
      {mode === "response" && (
        <>
          <Text size="sm">
            Record a simulated response from Eimhin about this opportunity. No
            response has been received through this application.
          </Text>
          <NativeSelect
            ref={fieldRef}
            data-autofocus
            label="Simulated response from Eimhin"
            value={response}
            onChange={(event) => setResponse(event.currentTarget.value)}
            data={Object.entries(keeperResponses).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Text size="sm" c="dimmed">
            Interest applies only to this opportunity; it does not set career
            intentions or establish suitability. The response can be revised
            later.
          </Text>
          {state.nominationDecision && response !== state.interest && (
            <Text size="sm" c="clarification.7">
              Changing the response clears the local nomination decision. A new
              decision will be needed if Eimhin later expresses interest.
            </Text>
          )}
        </>
      )}
      {mode === "nomination" && (
        <>
          <Text size="sm">
            Eimhin’s interest is recorded as a simulated response. Consider
            experience relevance, qualification readiness and employer
            requirements before deciding.
          </Text>
          <Paper p="sm" bg="clarification.0">
            <Text size="sm" c="clarification.7">
              Still unresolved: independent maintenance scope, current permit
              authority, complete offshore safety coverage, medical clearance
              and offshore working conditions. Career preferences have not been
              discussed.
            </Text>
          </Paper>
          <NativeSelect
            ref={fieldRef}
            data-autofocus
            label="Nomination decision"
            value={decision}
            onChange={(event) => setDecision(event.currentTarget.value)}
            data={[
              { value: "defer", label: "Resolve questions before nomination" },
              {
                value: "recommend",
                label: "Recommend for employer consideration",
              },
            ]}
          />
          <Textarea
            label="Decision rationale"
            required
            value={rationale}
            onChange={(event) => setRationale(event.currentTarget.value)}
            autosize
            minRows={3}
            maxLength={2000}
          />
          {decision === "recommend" && (
            <Checkbox
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.currentTarget.checked)}
              label="I acknowledge the unresolved requirements and will make these gaps explicit in any future employer referral."
            />
          )}
          <Text size="sm" c="dimmed">
            This saves a local decision only. No nomination is submitted to
            Carrowmore Array and no interview is confirmed.
          </Text>
        </>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={disabled}
          rightSection={<Icon icon={Check} />}
        >
          {mode === "suggest"
            ? "Record suggestion locally"
            : mode === "response"
              ? "Save simulated response"
              : mode === "assessment"
                ? "Save assessment"
                : "Save nomination decision"}
        </Button>
      </Group>
    </Stack>
  );
}
