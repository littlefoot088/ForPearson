import { createTheme } from "@mantine/core";

// Brand and semantic colours only. Mantine owns typography, sizing and spacing.
export const theme = createTheme({
  black: "#203639",
  primaryColor: "carrowmore",
  primaryShade: 7,
  colors: {
    carrowmore: [
      "#edf5f5",
      "#dceaea",
      "#b9d3d5",
      "#91b8bc",
      "#6d9fa5",
      "#4e858e",
      "#36707b",
      "#245b65",
      "#204e57",
      "#1a4149",
    ],
    evidence: [
      "#edf5f8",
      "#dcebf0",
      "#bdd5df",
      "#9abcc9",
      "#78a3b4",
      "#5d8a9e",
      "#44768a",
      "#2d6370",
      "#265560",
      "#204751",
    ],
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
    gray: [
      "#f5f7f5",
      "#edf1ed",
      "#dfe5e1",
      "#c9d2cd",
      "#a8b5ae",
      "#84958c",
      "#647476",
      "#4c6061",
      "#344b4e",
      "#203639",
    ],
  },
});

export const cssVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "var(--mantine-color-gray-0)",
    "--mantine-color-text": "var(--mantine-color-gray-9)",
  },
  dark: {},
});
