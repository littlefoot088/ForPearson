import React from "react";
import { Grid, Mark, Text } from "@mantine/core";

export function Icon({ icon: Component, ...props }) {
  return (
    <Component size={16} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}

// Keep the exact substring algorithm: source wording must not be normalised.
export function Highlight({ text, passage }) {
  const start = text.indexOf(passage);
  if (start < 0) return text;
  return (
    <>
      {text.slice(0, start)}
      <Mark color="clarification.2">{passage}</Mark>
      {text.slice(start + passage.length)}
    </>
  );
}

export function RecordFields({ fields }) {
  return (
    <Grid component="dl" gutter="xs" m={0}>
      {fields.map(([label, value]) => (
        <React.Fragment key={label}>
          <Grid.Col component="dt" span={{ base: 12, xs: 4 }}>
            <Text size="sm" c="dimmed">
              {label}
            </Text>
          </Grid.Col>
          <Grid.Col
            component="dd"
            span={{ base: 12, xs: 8 }}
            m={0}
            className="source-text"
          >
            <Text size="sm" component="div">
              {value}
            </Text>
          </Grid.Col>
        </React.Fragment>
      ))}
    </Grid>
  );
}
