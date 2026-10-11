import React from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  NativeSelect,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Search } from "lucide-react";
import {
  assessmentHash,
  filterPeople,
  intentions,
  peopleForWorkspace,
} from "./people";

export function PeopleWorkspace({
  workspace,
  storageFailed,
  filters,
  onFiltersChange,
}) {
  const { search, intention, attentionOnly } = filters;
  const setSearch = (search) => onFiltersChange({ ...filters, search });
  const setIntention = (intention) =>
    onFiltersChange({ ...filters, intention });
  const setAttentionOnly = (attentionOnly) =>
    onFiltersChange({ ...filters, attentionOnly });
  const people = filterPeople(
    peopleForWorkspace(workspace),
    search,
    intention,
    attentionOnly,
  );
  return (
    <Container size="lg" py="lg" component="main" id="main" tabIndex={-1}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Redeployment workspace
          </Title>
          <Text c="dimmed" mt="xs">
            Help people at Carrowmore Light Authority explore opportunities and
            take their next step.
          </Text>
        </Box>
        <Paper withBorder p="md" radius="md" bg="white">
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="light" color="gray">
                Assessment workspace
              </Badge>
              <Text size="sm">
                This workspace currently includes Eimhin’s opportunity
                assessment.
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Employment records inform the assessment. Progress and next steps
              reflect your saved work; career intentions and interest remain
              unknown until recorded.
            </Text>
          </Stack>
        </Paper>
        <Stack gap="sm">
          <Grid align="flex-end">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Search by name"
                placeholder="Find a person"
                leftSection={<Search size={16} aria-hidden="true" />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NativeSelect
                label="Employment intention"
                data={[{ value: "", label: "All intentions" }, ...intentions]}
                value={intention ?? ""}
                onChange={(event) => setIntention(event.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>
          <Group justify="space-between">
            <Checkbox
              label="Needs attention"
              description="People with an outstanding next action"
              checked={attentionOnly}
              onChange={(e) => setAttentionOnly(e.currentTarget.checked)}
            />
            <Text size="sm" c="dimmed" role="status">
              {people.length} {people.length === 1 ? "person" : "people"} shown
            </Text>
          </Group>
        </Stack>
        <Paper withBorder radius="md" bg="white">
          {people.length ? (
            people.map((p, index) => (
              <React.Fragment key={p.id}>
                {index > 0 && <Divider />}
                <Box
                  component="section"
                  p="md"
                  aria-labelledby={`person-${p.id}`}
                >
                  <Group justify="space-between" gap="xs" mb="xs">
                    <Title order={2} size="h4" id={`person-${p.id}`}>
                      {p.name}
                    </Title>
                    <Text size="sm">
                      <Text span c="dimmed">
                        Intention:{" "}
                      </Text>
                      {p.intention}
                    </Text>
                  </Group>
                  {p.opportunities.length ? (
                    <Stack gap="xs">
                      <Grid gutter="md" visibleFrom="sm" aria-hidden="true">
                        <Grid.Col span={5}>
                          <Text size="xs" c="dimmed">
                            Opportunity
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Progress
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <Text size="xs" c="dimmed">
                            Next action
                          </Text>
                        </Grid.Col>
                      </Grid>
                      {p.opportunities.map((o) => (
                        <Box key={o.id} py="xs">
                          <Grid gutter="md" align="flex-start">
                            <Grid.Col span={{ base: 12, sm: 5 }}>
                              {o.implemented ? (
                                <Anchor
                                  href={assessmentHash}
                                  fw={600}
                                  size="sm"
                                >
                                  {o.title}
                                </Anchor>
                              ) : (
                                <Text size="sm" fw={500}>
                                  {o.title}
                                </Text>
                              )}
                              <Text size="xs" c="dimmed">
                                {o.employer}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {o.implemented
                                  ? "Open assessment"
                                  : "Illustrative · Assessment not included"}
                              </Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 3 }}>
                              <Text size="xs" c="dimmed" hiddenFrom="sm">
                                Progress
                              </Text>
                              <Text size="sm">{o.progress}</Text>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                              <Text size="xs" c="dimmed" hiddenFrom="sm">
                                Next action
                              </Text>
                              <Text
                                size="sm"
                                c={o.nextAction ? undefined : "dimmed"}
                              >
                                {o.nextAction ?? "No next action recorded"}
                              </Text>
                            </Grid.Col>
                          </Grid>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No employment recommendations
                    </Text>
                  )}
                </Box>
              </React.Fragment>
            ))
          ) : (
            <Stack align="center" p="lg" gap="sm">
              <Text>No people match these filters.</Text>
              <Button
                variant="subtle"
                onClick={() => {
                  onFiltersChange({
                    search: "",
                    intention: null,
                    attentionOnly: false,
                  });
                }}
              >
                Clear filters
              </Button>
            </Stack>
          )}
        </Paper>
        {storageFailed && (
          <Text role="alert" size="sm" c="clarification.8">
            Browser storage is unavailable. Changes are kept for this session
            but will not survive refresh.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
