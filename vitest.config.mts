import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    // Rendering whole pages under coverage instrumentation in parallel workers can be slow
    testTimeout: 30000,
    // next-intl imports "next/navigation" without an extension, which only resolves when Vite bundles it
    server: { deps: { inline: ["next-intl"] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      // The whole application: every route, component, hook, config and i18n module under src/
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Type declarations only (no runtime code)
        "src/**/*.d.ts",
      ],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
