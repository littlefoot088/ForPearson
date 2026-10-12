import React from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Grid,
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

export function Progress({ children }) {
  const color = [
    "Interview invited",
    "Employment arranged",
    "Introduction sent",
    "Reviewing with Eimhin",
  ].includes(children)
    ? "documented"
    : ["On hold", "Reviewing introduction"].includes(children)
      ? "clarification"
      : "carrowmore";
  return (
    <Badge
      color={color}
      variant="light"
      size="md"
      tt="none"
      fw={500}
      h="auto"
      styles={{ root: { maxWidth: "100%" }, label: { whiteSpace: "normal", overflow: "visible", textOverflow: "clip" } }}
    >
      {children}
    </Badge>
  );
}

export function PeopleWorkspace({
  workspace,
  storageFailed,
  filters,
  onFiltersChange,
}) {
  const { search, intention, attentionOnly } = filters;
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
          <Text c="dimmed" size="sm" mt="xs">
            People, opportunities under consideration and next actions
          </Text>
        </Box>
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, sm: 5 }}>
            <TextInput
              label="Search by name"
              placeholder="Find a person"
              leftSection={<Search size={16} aria-hidden="true" />}
              value={search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.currentTarget.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NativeSelect
              label="Employment intention"
              data={[{ value: "", label: "All intentions" }, ...intentions]}
              value={intention ?? ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  intention: e.currentTarget.value,
                })
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }} pb="sm">
            <Checkbox
              label="Needs attention"
              checked={attentionOnly}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  attentionOnly: e.currentTarget.checked,
                })
              }
            />
          </Grid.Col>
        </Grid>
        <Text size="sm" c="dimmed" role="status">
          {people.length} {people.length === 1 ? "person" : "people"} shown
        </Text>
        <Paper bg="white" p="md" radius="sm">
          {people.length > 0 && (
            <Grid gutter="lg" mb="md" visibleFrom="sm" aria-hidden="true">
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed">
                  Person · employment intention
                </Text>
              </Grid.Col>
              <Grid.Col span={9}>
                <Grid gutter="xs">
                  <Grid.Col span={5}>
                    <Text size="xs" c="dimmed">
                      Opportunities under consideration
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
              </Grid.Col>
            </Grid>
          )}
          <Stack gap="xl">
            {people.map((p) => (
              <Grid
                component="section"
                key={p.id}
                aria-labelledby={`person-${p.id}`}
                gutter="lg"
              >
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <Stack gap={2}>
                    <Title order={2} size="md" id={`person-${p.id}`}>
                      {p.name}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {p.intention}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 9 }}>
                  {p.opportunities.length ? (
                    <Stack gap="md">
                      {p.opportunities.map((o) => (
                        <Grid key={o.id} gutter="xs" align="flex-start">
                          <Grid.Col span={{ base: 12, sm: 5 }}>
                            {o.implemented ? (
                              <Anchor
                                href={assessmentHash}
                                fw={600}
                                size="sm"
                                underline="always"
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
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 3 }}>
                            <Progress>{o.progress}</Progress>
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            {o.nextAction && (
                              <Text size="sm">
                                <Text span c="dimmed" hiddenFrom="sm">
                                  Next:{" "}
                                </Text>
                                {o.nextAction}
                              </Text>
                            )}
                          </Grid.Col>
                        </Grid>
                      ))}
                    </Stack>
                  ) : p.intentionFollowup ? (
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>Clarify employment plans</Text>
                      <Text size="sm">{p.intentionFollowup}</Text>
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No opportunities under consideration
                    </Text>
                  )}
                </Grid.Col>
              </Grid>
            ))}
            {!people.length && (
              <Stack align="center" p="lg" gap="sm">
                <Text>No people match these filters.</Text>
                <Button
                  variant="subtle"
                  onClick={() =>
                    onFiltersChange({
                      search: "",
                      intention: null,
                      attentionOnly: false,
                    })
                  }
                >
                  Clear filters
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
        {storageFailed && (
          <Text role="alert" size="sm" c="clarification.8">
            Browser storage is unavailable. Changes will not survive refresh.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
