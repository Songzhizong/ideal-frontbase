import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = env.VITE_API_BASE_URL || "http://localhost:5678"
  const baseUrl = env.VITE_BASE_URL || "/"

  return {
    base: baseUrl,
    plugins: [tanstackRouter(), react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: "@/packages",
          replacement: path.resolve(__dirname, "../../packages"),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    server: {
      host: true,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
    },
  }
})
