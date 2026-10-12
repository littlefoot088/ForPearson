import React, { useState } from "react";
import { Anchor, Breadcrumbs, Button, Container, Drawer, Grid, Group, NativeSelect, Paper, Stack, Text, Textarea, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight } from "lucide-react";
import { assessmentHash, intentions, vacancyOptions } from "./people";
import { dateLabel } from "./data";
import { Progress } from "./PeopleWorkspace";

export function KeeperProfile({ keeper, workspace, dispatch, storageFailed }) {
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState("");
  const narrow = useMediaQuery("(max-width: 48em)");
  if (!keeper) return null;
  const retired = keeper.intention === "Planning retirement";
  const arranged = keeper.intention === "Employment arranged";
  const active = retired || arranged ? [] : keeper.opportunities.filter((o) => o.progress !== "On hold");
  const previous = keeper.consideredOpportunities.filter((o) => retired || arranged || o.progress === "On hold");
  const available = vacancyOptions.filter((o) => !keeper.consideredOpportunities.some((selected) => selected.id === o.id));
  const working = keeper.currentPerson && workspace.workingPreferences;
  const close = () => setEditor(null);
  function opportunityRow(o, showNext = true) {
    return (
      <Grid key={o.id} gutter="md" align="flex-start" component="article" aria-label={`${o.title} at ${o.employer}`}>
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Stack gap={4}>
            {o.implemented
              ? <Anchor href={assessmentHash} size="sm" fw={600} underline="always">{o.title}</Anchor>
              : <Text size="sm" fw={500}>{o.title}</Text>}
            <Text size="sm" c="dimmed">{o.employer}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Stack gap={4}><Text size="xs" c="dimmed">Progress</Text><Progress>{o.progress}</Progress></Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 4 }}>
          {showNext && o.nextAction && <Stack gap={4}><Text size="xs" c="dimmed">Next action</Text><Text size="sm">{o.nextAction}</Text></Stack>}
          {o.implemented && o.progress === "On hold" && <Text size="sm" c="dimmed">
            {workspace.opportunity.interest === "not-interested" ? "Eimhin is not interested in this opportunity." : "Your assessment: Not a current match."}
          </Text>}
        </Grid.Col>
      </Grid>
    );
  }
  return (
    <Container size="lg" py="lg" component="main" id="main" tabIndex={-1}>
      <Stack gap="lg">
        <Breadcrumbs separator={<ChevronRight size={16} />} aria-label="Profile context">
          <Anchor href="#people" size="sm">People</Anchor><Text size="sm">{keeper.name}</Text>
        </Breadcrumbs>
        <Paper p="lg" radius="lg" bg="white">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={1} size="h2">{keeper.name}</Title>
              <Text size="sm">Current role: {keeper.currentPerson ? "Lighthouse keeper · Carrowmore Light Authority" : "Not recorded"}</Text>
            </Stack>
            <Group justify="space-between" wrap="nowrap" gap="xs">
              <Title order={2} size="h4">Career context</Title>
              <Button className="workspace-status-action" style={{ flexShrink: 0 }} size="compact-xs" variant="subtle" onClick={() => setEditor("context")}>Edit career context</Button>
            </Group>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 4 }}><Stack gap={4}>
                <Text size="sm" c="dimmed">Employment intention</Text><Text size="sm" fw={500}>{keeper.intention}</Text>
              </Stack></Grid.Col>
              <Grid.Col span={{ base: 12, sm: 8 }}><Stack gap={4}>
                <Text size="sm" c="dimmed">Career preferences</Text>
                <Text size="sm" className="source-text" style={{ whiteSpace: "pre-wrap" }}>{keeper.careerPreferences || "Not yet discussed"}</Text>
              </Stack></Grid.Col>
            </Grid>
            {keeper.contextUpdatedAt && <Text size="xs" c="dimmed">Updated by you · {dateLabel(keeper.contextUpdatedAt.slice(0, 10))}</Text>}
            {working && <Stack gap={4}>
              <Text size="sm" c="dimmed">Working preferences recorded for Wind Turbine Technician</Text>
              <Text size="sm" className="source-text" style={{ whiteSpace: "pre-wrap" }}>{working.response}</Text>
              {working.concerns && <Text size="sm" className="source-text">Concerns or conditions: {working.concerns}</Text>}
              <Text size="xs" c="dimmed">{dateLabel(working.date)}</Text>
            </Stack>}
          </Stack>
        </Paper>
        <Paper p="lg" radius="lg" bg="white">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              <Title order={2} size="h4" style={{ minWidth: 0 }}>Opportunities under consideration</Title>
              {!retired && !arranged && <Button className="workspace-status-action" style={{ flexShrink: 0 }} size="compact-xs" variant="subtle" aria-label="Explore opportunities" onClick={() => setEditor("opportunities")}>Explore</Button>}
            </Group>
            {active.length ? active.map((o) => opportunityRow(o)) : <Stack gap="sm">
              <Text size="sm">{retired ? "Planning retirement. No placement opportunities are being suggested."
                : arranged ? "Employment arranged. No further job search is needed."
                : "No active opportunities under consideration."}</Text>
              {!retired && !arranged && <Text size="sm" c="dimmed">Review career preferences, explore other vacancies or sectors, and agree a follow-up with the keeper. Discuss whether training would help with their chosen direction.</Text>}
            </Stack>}
          </Stack>
        </Paper>
        {previous.length > 0 && <Paper p="lg" radius="lg" bg="white"><Stack gap="lg">
          <Title order={2} size="h4">{arranged ? "Employment and previous considerations" : retired ? "Previously considered" : "Opportunities on hold"}</Title>
          {!retired && !arranged && <Text size="sm" c="dimmed">An opportunity on hold does not close the keeper’s redeployment case.</Text>}
          {previous.map((o) => opportunityRow(o, false))}
        </Stack></Paper>}
        {notice && <Text role="status" size="sm">{notice}</Text>}
        {storageFailed && <Text role="alert" size="sm" c="clarification.8">Browser storage is unavailable. Changes will not survive refresh.</Text>}
      </Stack>
      <Drawer opened={Boolean(editor)} onClose={close} position="right" size={narrow ? "100%" : "md"}
        title={editor === "context" ? "Edit career context" : "Explore opportunities"}
        closeButtonProps={{ "aria-label": "Close profile editor" }}>
        {editor === "context" && <CareerEditor keeper={keeper} onCancel={close} onSave={(value) => {
          dispatch({ type: "keeper-context-save", id: keeper.id, ...value }); setNotice("Career context saved."); close();
        }} />}
        {editor === "opportunities" && <OpportunityPicker available={available} onCancel={close} onSave={(id) => {
          dispatch({ type: "keeper-opportunity-add", id: keeper.id, opportunityId: id });
          setNotice(`${vacancyOptions.find((o) => o.id === id).title} added. Progress: To do.`); close();
        }} />}
      </Drawer>
    </Container>
  );
}
function CareerEditor({ keeper, onSave, onCancel }) {
  const [intention, setIntention] = useState(keeper.intention);
  const [preferences, setPreferences] = useState(keeper.careerPreferences);
  return <Stack component="form" gap="md" onSubmit={(e) => { e.preventDefault(); onSave({ intention, preferences }); }}>
    <Text size="sm">{keeper.name}</Text>
    <NativeSelect data-autofocus label="Employment intention" data={intentions} value={intention} onChange={(e) => setIntention(e.currentTarget.value)} />
    <Textarea label="Career preferences" description="Record what the keeper has said about their wider career plans. Leave blank if not yet discussed."
      autosize minRows={4} maxRows={12} maxLength={4000} value={preferences} onChange={(e) => setPreferences(e.currentTarget.value)} />
    <Text size="sm" c="dimmed">Interest in individual opportunities is recorded separately.</Text>
    <Group justify="flex-end"><Button variant="default" onClick={onCancel}>Cancel</Button><Button type="submit">Save career context</Button></Group>
  </Stack>;
}
function OpportunityPicker({ available, onSave, onCancel }) {
  const [selected, setSelected] = useState(available[0]?.id ?? "");
  return <Stack component="form" gap="md" onSubmit={(e) => { e.preventDefault(); if (selected) onSave(selected); }}>
    <Text size="sm">Curated vacancies for officer review. Adding an opportunity does not record suitability or the keeper’s interest.</Text>
    {available.length ? <NativeSelect data-autofocus label="Opportunity" value={selected} onChange={(e) => setSelected(e.currentTarget.value)}
      data={available.map((v) => ({ value: v.id, label: `${v.title} · ${v.employer}` }))} />
      : <Text size="sm">All available vacancies have already been considered for this keeper.</Text>}
    <Group justify="flex-end"><Button variant="default" onClick={onCancel}>Cancel</Button>{available.length > 0 && <Button type="submit">Add opportunity</Button>}</Group>
  </Stack>;
}
