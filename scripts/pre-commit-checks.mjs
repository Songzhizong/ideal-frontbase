import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import path from "node:path"

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" })

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}

function getStagedFiles() {
  const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    encoding: "utf8",
  })

  if ((result.status ?? 1) !== 0) {
    console.error("无法读取 staged 文件列表。")
    process.exit(result.status ?? 1)
  }

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function hasTypecheckScript(workspacePath) {
  try {
    const pkgPath = path.resolve(process.cwd(), workspacePath, "package.json")
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    const scripts = pkg.scripts ?? {}
    return typeof scripts.typecheck === "string"
  } catch {
    return false
  }
}

function getChangedScopes(stagedFiles) {
  const changedApps = new Set()
  const changedPackages = new Set()

  for (const file of stagedFiles) {
    const parts = file.split("/")
    const [scope, name] = parts

    if (!name) {
      continue
    }

    if (scope === "apps") {
      changedApps.add(name)
    }

    if (scope === "packages") {
      changedPackages.add(name)
    }
  }

  return { changedApps, changedPackages }
}

function hasGlobalConfigChange(stagedFiles) {
  const fullTypecheckTriggers = new Set([
    "package.json",
    "pnpm-lock.yaml",
    "turbo.json",
    "biome.json",
    "tsconfig.json",
    "tsconfig.base.json",
  ])

  return stagedFiles.some((file) => {
    if (fullTypecheckTriggers.has(file)) {
      return true
    }

    return file.startsWith("scripts/")
  })
}

const stagedFiles = getStagedFiles()

if (stagedFiles.length === 0) {
  console.log("未检测到 staged 变更，跳过 pre-commit 检查。")
  process.exit(0)
}

console.log("1/3 运行 staged lint（Biome）...")
run("pnpm", [
  "exec",
  "biome",
  "check",
  "--staged",
  "--files-ignore-unknown=true",
  "--no-errors-on-unmatched",
])

const { changedApps, changedPackages } = getChangedScopes(stagedFiles)
const packageChanged = changedPackages.size > 0

if (packageChanged) {
  console.log("2/3 检测到 packages 变更，执行包边界检查...")
  run("pnpm", ["lint:packages-boundary"])
}

const needFullTypecheck = packageChanged || hasGlobalConfigChange(stagedFiles)

if (needFullTypecheck) {
  console.log("3/3 检测到共享层或全局配置变更，执行全量 typecheck...")
  run("pnpm", ["typecheck"])
  process.exit(0)
}

const appFilters = [...changedApps]
  .map((app) => `./apps/${app}`)
  .filter((workspacePath) => hasTypecheckScript(workspacePath))

if (appFilters.length === 0) {
  console.log("3/3 未检测到需要 typecheck 的应用变更，跳过 typecheck。")
  process.exit(0)
}

console.log(`3/3 执行应用增量 typecheck: ${appFilters.join(", ")}`)
run("pnpm", [
  "turbo",
  "run",
  "typecheck",
  ...appFilters.map((filterPath) => `--filter=${filterPath}`),
])
