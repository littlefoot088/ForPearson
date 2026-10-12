import React, { useState } from "react";
import { Anchor, Breadcrumbs, Button, Container, Drawer, Grid, Group, NativeSelect, Paper, Stack, Text, Textarea, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight } from "lucide-react";
import { assessmentHash, intentions, vacancyOptions } from "./people";
import { dateLabel, person } from "./data";

export function KeeperProfile({ keeper, workspace, dispatch, storageFailed }) {
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState("");
  const narrow = useMediaQuery("(max-width: 48em)");
  if (!keeper) return null;
  const available = vacancyOptions.filter((o) => !keeper.consideredOpportunities.some((selected) => selected.id === o.id));
  const working = keeper.currentPerson && workspace.workingPreferences;
  const close = () => setEditor(null);
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
            {keeper.currentPerson && <Stack gap="sm" maw="48rem">
              <Title order={2} size="h4">About Eimhin</Title>
              <Text size="sm">Eimhin is a lighthouse keeper with Carrowmore Light Authority. His personnel record gives a joining date of {dateLabel(person.joined)}. As the Authority automates its stations, the redeployment officer is helping him consider what comes next.</Text>
              <Text size="sm">His selected work records describe pump repairs, electrical fault-finding and control work, alongside examples of work planning and permit issuing. These records provide a starting point for discussing transferable experience; they do not establish his current qualifications or the full scope of his responsibilities.</Text>
              <Text size="xs" c="dimmed">Background from personnel and selected work records. The detailed assessment contains the evidence and its limitations.</Text>
            </Stack>}
            <Group justify="space-between" wrap="nowrap" gap="xs">
              <Title order={2} size="h4">Career context</Title>
              <Button className="workspace-status-action" style={{ flexShrink: 0 }} size="compact-xs" variant="subtle" onClick={() => setEditor("context")}>Edit career context</Button>
            </Group>
            <Text size="sm" c="dimmed" maw="48rem">This is where the officer records what matters to the keeper: their plans after lighthouse work, the roles they want to explore, preferred locations and working patterns, and support they may need. It is informed by their questionnaire and conversations.</Text>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, sm: 4 }}><Stack gap={4}>
                <Text size="sm" c="dimmed">Employment intention</Text><Text size="sm" fw={500}>{keeper.intention}</Text>
              </Stack></Grid.Col>
              <Grid.Col span={{ base: 12, sm: 8 }}><Stack gap={4}>
                <Text size="sm" c="dimmed">Career preferences</Text>
                <Text size="sm" className="source-text" style={{ whiteSpace: "pre-wrap" }}>{keeper.careerPreferences || "Preferences have not yet been recorded. Discuss their plans, preferred work and any support needed, then save their response here."}</Text>
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
        <CareerPlanning currentPerson={keeper.currentPerson} />
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
function CareerPlanning({ currentPerson }) {
  return <Paper p="lg" radius="lg" bg="white">
    <Stack gap="md" maw="48rem">
      <Stack gap={4}>
        <Text size="xs" c="dimmed">Conceptual view</Text>
        <Title order={2} size="h4">Career planning and opportunities</Title>
      </Stack>
      <Text size="sm">In the full product, this profile would bring together the keeper’s intentions, preferences and experience alongside available employment opportunities. Redeployment officers would use it to assess which roles could be a suitable match, identify support needs and select opportunities to take forward.</Text>
      <Text size="sm">For this prototype, one opportunity assessment has been developed in detail to show how historical evidence can support a redeployment decision.</Text>
      {currentPerson && <Stack gap={4}>
        <Anchor href={assessmentHash} size="sm" fw={600} underline="always">Explore Wind Turbine Technician assessment</Anchor>
        <Text size="sm" c="dimmed">Eimhin Mac Neidhe · Carrowmore Array</Text>
      </Stack>}
    </Stack>
  </Paper>;
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
