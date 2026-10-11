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
  Title,
} from "@mantine/core";
import { ArrowRight, Check, ClipboardList } from "lucide-react";
import { Icon } from "./components";
import {
  officerAssessments,
  keeperResponses,
  nextRecommendation,
} from "./workflow";
import { vacancy } from "./data";

export const workflowTitles = {
  suggest: "Suggest this opportunity to Eimhin",
  response: "Record keeper response",
  assessment: "Officer assessment",
  nomination: "Consider for nomination",
};

export function OpportunityActions({
  state,
  onOpen,
  onClarify,
  drafts,
  onReviewDrafts,
}) {
  const { action, label, guidance, detail } = nextRecommendation(state);
  return (
    <Paper
      component="section"
      id="opportunity-actions"
      tabIndex={-1}
      withBorder
      radius="md"
      bg="white"
      p="lg"
      aria-label="Opportunity actions"
    >
      <Stack gap="md">
        <Title order={2} size="h3">
          Officer decision and next step
        </Title>
        <Text>{guidance}</Text>
        {detail && (
          <Text size="sm" c="dimmed">
            {detail}
          </Text>
        )}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="sm">
              <strong>Officer assessment:</strong>{" "}
              {officerAssessments[state.assessment]}
            </Text>
            {action !== "assessment" && (
              <Button variant="subtle" onClick={() => onOpen("assessment")}>
                Update officer assessment
              </Button>
            )}
          </Stack>
          <Group gap="xs">
            {drafts.length > 0 && action !== "discussion" && (
              <Button
                variant="subtle"
                leftSection={<Icon icon={ClipboardList} />}
                onClick={onReviewDrafts}
              >
                Discussion with Eimhin ({drafts.length})
              </Button>
            )}
            <Button
              id="next-opportunity-action"
              rightSection={<Icon icon={ArrowRight} />}
              onClick={() =>
                action === "discussion"
                  ? onReviewDrafts()
                  : action === "clarify"
                    ? onClarify()
                    : onOpen(action)
              }
            >
              {action === "discussion" && drafts.length > 0
                ? `Discussion with Eimhin (${drafts.length})`
                : label}
            </Button>
            {!state.suggested &&
              state.interest === "not-discussed" &&
              state.assessment !== "not-suitable" && (
                <Button variant="subtle" onClick={() => onOpen("suggest")}>
                  Suggest to keeper
                </Button>
              )}
          </Group>
        </Group>
        {action !== "response" && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {state.interest === "not-discussed"
                ? "Already spoken with Eimhin?"
                : "His response has changed?"}
            </Text>
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => onOpen("response")}
            >
              Record keeper response
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

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
            label="Officer assessment"
            value={assessment}
            onChange={(event) => setAssessment(event.currentTarget.value)}
            data={Object.entries(officerAssessments).map(([value, label]) => ({
              value,
              label,
              disabled: value === "worth-nominating",
            }))}
          />
          <Text size="sm" c="dimmed">
            This is your judgement about the opportunity. Outstanding questions
            and qualification statuses remain unchanged. “Worth nominating” is
            recorded through the nomination decision after keeper interest.
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
            label="Simulated keeper response"
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
