import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { person, vacancy, claims } from "./data";
import {
  assessmentSignature,
  createReferral,
  referralFields,
  readinessAllowed,
} from "./workspace";

const experienceFields = referralFields.filter(([key]) =>
  ["pump", "electrical", "safety"].includes(key),
);
function DocumentPreview({ draft }) {
  return (
    <Paper
      component="article"
      aria-label="Candidate introduction preview"
      bg="white"
      p="lg"
      withBorder
      radius="sm"
    >
      <Stack gap="md">
        <header>
          <Title order={2} size="h3">
            {person.name}
          </Title>
          <Text size="sm" c="dimmed">
            Current role: {person.role}
          </Text>
          <Text mt="sm" size="sm">
            For consideration
          </Text>
          <Text fw={600}>
            {vacancy.title} · {vacancy.employer}
          </Text>
        </header>
        <Divider />
        <section>
          <Title order={3} size="h5" mb="xs">
            Why we recommend Eimhin
          </Title>
          <Text size="sm" className="source-quote">
            {draft.why}
          </Text>
        </section>
        <section>
          <Title order={3} size="h5" mb="xs">
            Relevant experience
          </Title>
          <Stack gap="xs">
            {experienceFields.map(([key, label]) => (
              <Text key={key} size="sm" className="source-quote">
                <strong>{label}:</strong> {draft[key]}
              </Text>
            ))}
          </Stack>
        </section>
        {draft.includedReports.length > 0 && (
          <section>
            <Title order={3} size="h5" mb="xs">
              Eimhin’s account
            </Title>
            {draft.includedReports.map((r) => (
              <Text key={r.id} size="sm" className="source-quote">
                Eimhin reports: {r.text}
              </Text>
            ))}
          </section>
        )}
        <section>
          <Title order={3} size="h5" mb="xs">
            Qualifications and readiness
          </Title>
          <Text size="sm" className="source-quote">
            {draft.qualifications}
          </Text>
        </section>
        <section>
          <Title order={3} size="h5" mb="xs">
            Recommendation
          </Title>
          <Text size="sm" className="source-quote">
            {draft.recommendation}
          </Text>
        </section>
      </Stack>
    </Paper>
  );
}
function PreviousDraft({ draft }) {
  if (!draft) return null;
  return (
    <Accordion>
      <Accordion.Item value="previous">
        <Accordion.Control>
          Previous draft · internal reference
        </Accordion.Control>
        <Accordion.Panel>
          <Text size="sm" c="dimmed" mb="sm">
            Retained wording, not part of this candidate introduction.
          </Text>
          <Stack gap="sm">
            {Object.entries(draft)
              .filter(
                ([key, value]) =>
                  typeof value === "string" &&
                  !["assessmentSignature"].includes(key),
              )
              .map(([key, value]) => (
                <Text key={key} size="sm" className="source-quote">
                  {value}
                </Text>
              ))}
            {Array.isArray(draft.includedReports) &&
              draft.includedReports.map((report) => (
                <Text size="sm" key={report.id}>
                  {report.text}
                </Text>
              ))}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
export function CandidateIntroduction({ state, dispatch, storageFailed }) {
  const legacy = state.referral && state.referral.format !== 2;
  const [draft, setDraft] = useState(() =>
    legacy ? null : (state.referral ?? createReferral()),
  );
  const [editing, setEditing] = useState(false);
  const [working, setWorking] = useState(null);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const previewStart = useRef(null);
  const editStart = useRef(null);
  const resetTrigger = useRef(null);
  const regenerated = useRef(false);
  useEffect(() => {
    (editing ? editStart.current : previewStart.current)?.focus({
      preventScroll: true,
    });
  }, [editing]);
  const dirty =
    draft &&
    JSON.stringify({ ...draft, needsReview: false }) !==
      JSON.stringify(state.referral);
  function change(key, text) {
    setWorking({
      ...working,
      [key]: text,
      editedFields: [...new Set([...working.editedFields, key])],
    });
  }
  function regenerate() {
    // Keep the previous wording available without inserting it into the external document.
    const previous = draft ?? state.referral;
    const { previousDraft: ignored, ...snapshot } = previous ?? {};
    regenerated.current = true;
    setDraft({
      ...createReferral(),
      previousDraft: previous ? snapshot : null,
    });
    setEditing(false);
    setWorking(null);
    setSaved(false);
    setResetOpen(false);
  }
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Badge color="gray" variant="light">
          {!dirty && state.ready ? "Ready for Eimhin’s review" : "Draft"}
        </Badge>
        <Text
          size="xs"
          c="dimmed"
          ref={previewStart}
          tabIndex={-1}
          data-autofocus
        >
          Not approved or submitted
        </Text>
      </Group>
      {legacy && !draft && (
        <>
          <Text>
            The previous referral draft has been retained. Create the shorter
            candidate introduction from the assessment, then bring across any
            wording you want to keep.
          </Text>
          <Button ref={resetTrigger} onClick={() => setResetOpen(true)}>
            Create introduction from assessment
          </Button>
          <PreviousDraft draft={state.referral} />
        </>
      )}
      {draft && (
        <>
          {state.referral?.format === 2 && state.referral.needsReview && (
            <Text size="sm" c="clarification.8">
              The assessment has changed. Review this introduction before saving
              again; your wording has been retained.
            </Text>
          )}
          {editing ? (
            <Stack
              component="form"
              gap="md"
              onSubmit={(e) => {
                e.preventDefault();
                setDraft(working);
                setEditing(false);
                setSaved(false);
              }}
            >
              <Text size="sm" c="dimmed">
                Edit the employer-facing wording. Your changes are recorded as
                authored by you; they do not verify evidence.
              </Text>
              {referralFields.map(([key, label], index) => (
                <Textarea
                  key={key}
                  ref={index === 0 ? editStart : undefined}
                  label={label}
                  value={working[key]}
                  onChange={(e) => change(key, e.currentTarget.value)}
                  autosize
                  minRows={2}
                  maxRows={6}
                  maxLength={1800}
                  required
                />
              ))}
              {Object.values(state.reports).length > 0 && (
                <Accordion>
                  <Accordion.Item value="reported">
                    <Accordion.Control>
                      Include Eimhin-reported responsibilities (optional)
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        <Text size="sm" c="dimmed">
                          Keep these distinct from documented experience. Only
                          selected accounts appear in the introduction.
                        </Text>
                        {Object.values(state.reports).map((report) => {
                          const included = working.includedReports.find(
                            (r) => r.id === report.id,
                          );
                          return (
                            <Stack gap="xs" key={report.id}>
                              <Checkbox
                                checked={Boolean(included)}
                                label={`Include Eimhin’s account: ${claims.find((c) => c.id === report.id).title}`}
                                onChange={(e) =>
                                  setWorking({
                                    ...working,
                                    includedReports: e.currentTarget.checked
                                      ? [
                                          ...working.includedReports,
                                          { ...report },
                                        ]
                                      : working.includedReports.filter(
                                          (r) => r.id !== report.id,
                                        ),
                                    editedFields: [
                                      ...new Set([
                                        ...working.editedFields,
                                        "reported",
                                      ]),
                                    ],
                                  })
                                }
                              />
                              {included && (
                                <>
                                  <Textarea
                                    label={`Eimhin-reported wording: ${claims.find((c) => c.id === report.id).title}`}
                                    autosize
                                    minRows={2}
                                    maxRows={4}
                                    maxLength={1200}
                                    required
                                    value={included.text}
                                    onChange={(e) =>
                                      setWorking({
                                        ...working,
                                        includedReports:
                                          working.includedReports.map((r) =>
                                            r.id === report.id
                                              ? {
                                                  ...r,
                                                  text: e.currentTarget.value,
                                                }
                                              : r,
                                          ),
                                        editedFields: [
                                          ...new Set([
                                            ...working.editedFields,
                                            "reported",
                                          ]),
                                        ],
                                      })
                                    }
                                  />
                                  <Button
                                    variant="subtle"
                                    size="compact-sm"
                                    onClick={() =>
                                      setWorking({
                                        ...working,
                                        includedReports:
                                          working.includedReports.map((r) =>
                                            r.id === report.id
                                              ? { ...report }
                                              : r,
                                          ),
                                      })
                                    }
                                  >
                                    Use latest reported account
                                  </Button>
                                </>
                              )}
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              )}
              <Group>
                <Button
                  type="submit"
                  disabled={
                    !referralFields.every(([key]) => working[key].trim()) ||
                    working.includedReports.some((r) => !r.text.trim())
                  }
                >
                  Review introduction
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setEditing(false);
                    setWorking(null);
                  }}
                >
                  Cancel edits
                </Button>
              </Group>
            </Stack>
          ) : (
            <>
              <DocumentPreview draft={draft} />
              <Group justify="space-between" align="flex-start">
                <Text size="sm" c="dimmed">
                  Candidate CV: Not attached
                </Text>
                <Button
                  variant="subtle"
                  size="compact-sm"
                  onClick={() => {
                    setWorking(structuredClone(draft));
                    setEditing(true);
                  }}
                >
                  Edit introduction
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                An approved CV would accompany this introduction. No attachment
                is required to save.
              </Text>
              {draft.editedFields.length > 0 && (
                <Text size="xs" c="dimmed">
                  Includes wording edited by you. Supporting evidence remains in
                  the internal assessment.
                </Text>
              )}
              {saved && (
                <Text role="status" size="sm">
                  {storageFailed
                    ? "Draft saved for this session. Browser storage is unavailable."
                    : "Candidate introduction saved on this browser."}
                </Text>
              )}
              {!saved && dirty && (
                <Text size="xs" c="dimmed">
                  Unsaved draft. Save to retain this wording.
                </Text>
              )}
              <Group>
                <Button
                  onClick={() => {
                    const savedDraft = {
                      ...draft,
                      needsReview: false,
                      assessmentSignature: assessmentSignature(),
                    };
                    dispatch({ type: "referral-save", referral: savedDraft });
                    setDraft(savedDraft);
                    setSaved(true);
                  }}
                >
                  Save introduction draft
                </Button>
                {!dirty &&
                  state.referral?.format === 2 &&
                  !state.referral.needsReview &&
                  !state.ready && (
                    <Button
                      variant="light"
                      disabled={!readinessAllowed(state)}
                      onClick={() => dispatch({ type: "ready" })}
                    >
                      Mark ready for Eimhin’s review
                    </Button>
                  )}
                {!dirty && state.ready && (
                  <Button
                    variant="subtle"
                    onClick={() => dispatch({ type: "unready" })}
                  >
                    Return to draft
                  </Button>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                Ready for review means prepared for Eimhin to check. His
                approval to share is not recorded, and nothing is sent.
              </Text>
              <Button
                variant="subtle"
                size="compact-sm"
                ref={resetTrigger}
                onClick={() => setResetOpen(true)}
              >
                Reset to assessment
              </Button>
              <PreviousDraft draft={draft.previousDraft} />
            </>
          )}
        </>
      )}
      <Modal
        opened={resetOpen}
        onClose={() => setResetOpen(false)}
        title={
          draft
            ? "Replace introduction wording?"
            : "Create a shorter introduction?"
        }
        zIndex={300}
        returnFocus={false}
        onExitTransitionEnd={() => {
          (regenerated.current
            ? previewStart.current
            : resetTrigger.current
          )?.focus({ preventScroll: true });
          regenerated.current = false;
        }}
      >
        <Stack gap="md">
          <Text>
            This uses the current assessment and replaces manual wording and
            selected reported accounts in the working draft. The previous
            wording will remain available as an internal reference. Save
            explicitly to keep the new draft.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={regenerate}>
              {draft ? "Replace wording" : "Create introduction"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
export function IntroductionReview({ state, dispatch, onClose }) {
  return (
    <Stack gap="md">
      <Title order={3} size="h4">
        {state.ready
          ? "Ready for Eimhin’s review"
          : "Prepare for Eimhin’s review"}
      </Title>
      <Text>
        The saved introduction is ready for Eimhin to check. This does not
        record his approval or share anything with Carrowmore Array.
      </Text>
      {!readinessAllowed(state) && (
        <Text size="sm" role="alert">
          Save a reviewed candidate introduction and record Eimhin’s interest
          first.
        </Text>
      )}
      <Button
        disabled={!readinessAllowed(state)}
        onClick={() => {
          dispatch({ type: state.ready ? "unready" : "ready" });
          onClose();
        }}
      >
        {state.ready ? "Return to draft" : "Mark ready for Eimhin’s review"}
      </Button>
    </Stack>
  );
}
