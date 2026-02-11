import { spawnSync } from "node:child_process"
import { readdirSync, existsSync } from "node:fs"
import path from "node:path"

/**
 * 智能同步脚本：将代码推送到 GitHub，但过滤掉 apps 目录下除指定子目录外的其他内容
 *
 * 使用方式：
 * 1. 确保已添加 github 远程库: git remote add github <url>
 * 2. 运行: pnpm push:github
 */

const REMOTE_NAME = "github"
const GITHUB_BRANCH = "main"
const SYNC_BRANCH = "github-sync"
const APPS_TO_KEEP = ["example"] // 可以在这里添加需要保留的 apps 子目录

function run(command, args, options = { stdio: "inherit" }) {
	const result = spawnSync(command, args, options)
	if (result.status !== 0) {
		console.error(`命令执行失败: ${command} ${args.join(" ")}`)
		return false
	}
	return true
}

function getAppNames() {
	const appsDir = path.resolve(process.cwd(), "apps")
	if (!existsSync(appsDir)) return []
	return readdirSync(appsDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
}

function sync() {
	// 1. 获取当前分支名，以便后续切回
	const currentBranch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
		encoding: "utf8",
	}).stdout.trim()

	console.log(`🚀 开始同步到 GitHub (当前分支: ${currentBranch})...`)

	// 2. 确保同步分支存在并更新到最新 main
	if (!run("git", ["checkout", "-B", SYNC_BRANCH, "main"])) return

	// 3. 找出需要删除的 apps
	const allApps = getAppNames()
	const appsToRemove = allApps.filter((app) => !APPS_TO_KEEP.includes(app))

	if (appsToRemove.length > 0) {
		console.log(`🗑️  正在从 GitHub 分支中移除: ${appsToRemove.join(", ")}`)

		// 使用 git rm 移除，确保历史记录中删除这些文件
		for (const app of appsToRemove) {
			run("git", ["rm", "-rf", `apps/${app}`], { stdio: "ignore" })
		}

		// 提交变更
		run("git", ["commit", "-m", `chore: filter apps for github publish\n\nKept: ${APPS_TO_KEEP.join(", ")}\nRemoved: ${appsToRemove.join(", ")}`], { stdio: "ignore" })
	}

	// 4. 推送到 GitHub
	console.log(`📤 正在推送到 ${REMOTE_NAME}/${GITHUB_BRANCH}...`)
	run("git", ["push", REMOTE_NAME, `${SYNC_BRANCH}:${GITHUB_BRANCH}`, "--force"])

	// 5. 切回原始分支
	console.log(`✅ 同步完成，切回 ${currentBranch}`)
	run("git", ["checkout", currentBranch])
}

// 检查远程库是否存在
const remotes = spawnSync("git", ["remote"], { encoding: "utf8" }).stdout.split("\n")
if (!remotes.includes(REMOTE_NAME)) {
	console.error(`❌ 未找到名为 "${REMOTE_NAME}" 的远程库。`)
	console.log(`请先运行: git remote add ${REMOTE_NAME} <github-url>`)
	process.exit(1)
}

sync()
