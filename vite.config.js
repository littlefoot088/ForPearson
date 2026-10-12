import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  test: {
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
