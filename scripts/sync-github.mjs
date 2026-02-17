import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"

/**
 * 安全同步脚本：发布“无历史”的公开快照到 GitHub，避免泄露私有 apps 历史
 *
 * 使用方式：
 * 1. 确保已添加 github 远程库: git remote add github <url>
 * 2. 运行: pnpm push:github
 */

const REMOTE_NAME = "github"
const GITHUB_BRANCH = "main"
const SYNC_BRANCH = "github-sync"
const APPS_TO_KEEP = ["site"] // 可在这里添加需要公开的 apps 子目录

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  })
  if (result.status !== 0) {
    throw new Error(`命令执行失败: ${command} ${args.join(" ")}`)
  }
  return result
}

function runText(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  })
  if (result.status !== 0) {
    throw new Error(`命令执行失败: ${command} ${args.join(" ")}`)
  }
  return result.stdout.trim()
}

function getAppNames(baseDir) {
  const appsDir = path.resolve(baseDir, "apps")
  if (!existsSync(appsDir)) return []
  return readdirSync(appsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

function removePrivateApps(baseDir) {
  const allApps = getAppNames(baseDir)
  const appsToRemove = allApps.filter((app) => !APPS_TO_KEEP.includes(app))

  if (appsToRemove.length === 0) return

  console.log(`🗑️  已过滤非公开 apps 目录（共 ${appsToRemove.length} 个）`)
  for (const app of appsToRemove) {
    run("git", ["rm", "-rf", `apps/${app}`], { cwd: baseDir, stdio: "ignore" })
  }
}

function safeCleanupWorktree(worktreePath) {
  spawnSync("git", ["worktree", "remove", "--force", worktreePath], {
    stdio: "ignore",
  })
}

function sync() {
  const rootDir = process.cwd()
  const tempWorktree = mkdtempSync(path.join(os.tmpdir(), "github-sync-"))
  let worktreeReady = false

  console.log("🚀 开始安全同步到 GitHub（无历史公开快照）...")

  try {
    // 每次同步前删除同名本地分支，避免 orphan 创建失败
    spawnSync("git", ["branch", "-D", SYNC_BRANCH], {
      cwd: rootDir,
      stdio: "ignore",
    })

    // 1. 从当前 HEAD 创建临时 worktree，隔离本地未提交内容
    run("git", ["worktree", "add", "--detach", tempWorktree, "HEAD"], {
      cwd: rootDir,
      stdio: "ignore",
    })
    worktreeReady = true

    // 2. 在临时 worktree 创建 orphan 分支（无父提交）
    run("git", ["checkout", "--orphan", SYNC_BRANCH], {
      cwd: tempWorktree,
      stdio: "ignore",
    })

    // 3. 过滤掉私有 apps 目录并提交公开快照
    removePrivateApps(tempWorktree)
    run("git", ["add", "-A"], { cwd: tempWorktree, stdio: "ignore" })
    run(
      "git",
      [
        "-c",
        "user.name=github-sync-bot",
        "-c",
        "user.email=github-sync@local",
        "-c",
        "commit.gpgSign=false",
        "commit",
        "--allow-empty",
        "--no-verify",
        "-m",
        "chore: publish public snapshot",
      ],
      {
        cwd: tempWorktree,
      },
    )

    // 4. 强推 orphan 提交到 GitHub main，历史不包含私有模块
    const commitId = runText("git", ["rev-parse", "--short", "HEAD"], {
      cwd: tempWorktree,
    })
    console.log(`📤 正在推送公开快照提交 ${commitId} 到 ${REMOTE_NAME}/${GITHUB_BRANCH}...`)
    run("git", ["push", REMOTE_NAME, `HEAD:${GITHUB_BRANCH}`, "--force", "--no-verify"], {
      cwd: tempWorktree,
    })

    console.log("✅ 同步完成")
  } finally {
    if (worktreeReady) {
      safeCleanupWorktree(tempWorktree)
    } else {
      rmSync(tempWorktree, { recursive: true, force: true })
    }
  }
}

// 检查远程库是否存在
const remotes = runText("git", ["remote"]).split("\n")
if (!remotes.includes(REMOTE_NAME)) {
  console.error(`❌ 未找到名为 "${REMOTE_NAME}" 的远程库。`)
  console.log(`请先运行: git remote add ${REMOTE_NAME} <github-url>`)
  process.exit(1)
}

try {
  sync()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`❌ 同步失败：${message}`)
  process.exit(1)
}
