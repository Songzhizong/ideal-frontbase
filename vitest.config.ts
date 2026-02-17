import * as path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@/packages",
        replacement: path.resolve(__dirname, "./packages"),
      },
    ],
  },
  test: {
    include: ["packages/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./packages/test/setup.ts",
  },
})
