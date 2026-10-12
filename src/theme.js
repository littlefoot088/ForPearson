import { createTheme } from "@mantine/core";

// Quiet Authority: one shared system for both routes and every overlay.
const applicationFont =
  '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const theme = createTheme({
  fontFamily: applicationFont,
  fontSizes: { xs: "0.8125rem" },
  primaryColor: "carrowmore",
  primaryShade: 7,
  black: "#273238",
  headings: { fontFamily: applicationFont, fontWeight: "500" },
  colors: {
    clarification: [
      "#faf5eb",
      "#f2e8d4",
      "#e6d2ab",
      "#d7ba81",
      "#c5a263",
      "#ac894b",
      "#98743c",
      "#805f2e",
      "#6c4f27",
      "#594121",
    ],
    documented: [
      "#edf6ef",
      "#daeadf",
      "#b9d6c3",
      "#95bfa4",
      "#73a887",
      "#578c6c",
      "#3b7055",
      "#315f48",
      "#284e3b",
      "#203f30",
    ],
    carrowmore: [
      "#f0f3f6",
      "#e2e8ee",
      "#cad4df",
      "#aabccd",
      "#869fb6",
      "#617e9a",
      "#385577",
      "#243951",
      "#1e3045",
      "#182737",
    ],
    evidence: [
      "#f0f3f6",
      "#e2e8ee",
      "#cad4df",
      "#aabccd",
      "#869fb6",
      "#617e9a",
      "#456583",
      "#385577",
      "#2c4562",
      "#243951",
    ],
    gray: [
      "#faf9f5",
      "#f0f0eb",
      "#e2e3de",
      "#c5cac7",
      "#7d888c",
      "#687379",
      "#59646d",
      "#46515b",
      "#34404a",
      "#273238",
    ],
    red: [
      "#fbefec",
      "#f5ddd7",
      "#e9b8ad",
      "#d99080",
      "#c96d5a",
      "#b85142",
      "#a23b32",
      "#8b3029",
      "#732922",
      "#5e241e",
    ],
  },
  components: {
    Title: {
      defaultProps: { c: "carrowmore.7" },
      styles: { root: { letterSpacing: "-0.015em" } },
    },
    Text: { styles: { root: { fontVariantNumeric: "lining-nums" } } },
    Button: {
      defaultProps: { radius: "sm" },
      classNames: { root: "ui-button" },
      styles: {
        root: { fontWeight: 500, minHeight: 24 },
        label: { whiteSpace: "normal", textAlign: "start" },
      },
    },
    ActionIcon: {
      defaultProps: { radius: "sm" },
      styles: { root: { minWidth: 24, minHeight: 24 } },
    },
    CloseButton: { defaultProps: { radius: "sm" } },
    Input: {
      defaultProps: { radius: "sm" },
      classNames: { input: "ui-input" },
    },
    InputWrapper: {
      styles: {
        label: { fontWeight: 500 },
        description: { color: "var(--mantine-color-gray-6)" },
      },
    },
    Checkbox: {
      defaultProps: { size: "md", radius: "xs" },
      classNames: { input: "ui-checkbox" },
      styles: { label: { lineHeight: 1.5 } },
    },
    Menu: {
      defaultProps: { radius: "sm", shadow: "xs" },
      classNames: { item: "ui-menu-item" },
      styles: {
        dropdown: { borderColor: "var(--mantine-color-gray-3)" },
        item: { fontSize: "var(--mantine-font-size-sm)" },
      },
    },
    Accordion: {
      classNames: { control: "ui-disclosure" },
      styles: { chevron: { color: "var(--mantine-color-carrowmore-7)" } },
    },
    Badge: {
      defaultProps: { radius: "sm" },
      styles: {
        root: {
          fontWeight: 500,
          fontSize: "var(--mantine-font-size-xs)",
          letterSpacing: "0.01em",
        },
      },
    },
    Anchor: {
      classNames: { root: "ui-link" },
      styles: {
        root: { textUnderlineOffset: "0.2em", textDecorationThickness: "1px" },
      },
    },
    Drawer: {
      styles: {
        header: { borderBottom: "1px solid var(--mantine-color-gray-3)" },
        title: { fontWeight: 500 },
      },
    },
    Modal: { styles: { title: { fontWeight: 500 } } },
    Notification: { defaultProps: { radius: "sm" } },
  },
});

export const cssVariablesResolver = () => ({
  variables: {
    "--carrowmore-page": "#F7F4EE",
    "--carrowmore-workspace": "#F0F0ED",
    "--carrowmore-header-border": "#D8DEE0",
  },
  light: {
    "--mantine-color-body": "var(--carrowmore-page)",
    "--mantine-color-text": "var(--mantine-color-gray-9)",
    "--mantine-color-dimmed": "var(--mantine-color-gray-6)",
    "--mantine-color-placeholder": "var(--mantine-color-gray-6)",
    "--mantine-color-default-border": "var(--mantine-color-gray-4)",
    "--mantine-color-default-hover": "var(--mantine-color-evidence-0)",
    "--mantine-color-disabled": "var(--mantine-color-gray-1)",
    "--mantine-color-disabled-color": "var(--mantine-color-gray-6)",
    "--mantine-color-disabled-border": "var(--mantine-color-gray-3)",
  },
  dark: {},
});
// Existing import names remain compatible; both resolve to the same system.
export const quietTheme = theme;
export const quietCssVariablesResolver = cssVariablesResolver;
