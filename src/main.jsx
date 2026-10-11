import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import { theme, cssVariablesResolver } from "./theme";
import "@mantine/core/styles.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <MantineProvider
    theme={theme}
    cssVariablesResolver={cssVariablesResolver}
    forceColorScheme="light"
  >
    <App />
  </MantineProvider>,
);
