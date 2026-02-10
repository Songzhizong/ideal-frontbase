import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

const [, , task, ...rawArgs] = process.argv

if (!task) {
	console.error("缺少 Turbo 任务名，例如：dev / build / lint")
	process.exit(1)
}

const optionArgs = rawArgs.filter((arg) => arg !== "--")
const extraArgsIndex = rawArgs.indexOf("--")
const extraArgs = extraArgsIndex >= 0 ? rawArgs.slice(extraArgsIndex + 1) : []
const isAll = optionArgs.includes("--all")
const isParallel = optionArgs.includes("--parallel")
const appFromArg = optionArgs.find((arg) => arg.startsWith("--app="))
const appName = appFromArg ? appFromArg.replace("--app=", "") : process.env.APP

function readApps() {
	const appsDir = path.resolve(process.cwd(), "apps")

	if (!existsSync(appsDir)) {
		return []
	}

	return readdirSync(appsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((name) => existsSync(path.join(appsDir, name, "package.json")))
}

function readTaskSupportedApps(appsList, scriptName) {
	return appsList.filter((app) => {
		const pkgPath = path.resolve(process.cwd(), "apps", app, "package.json")
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
		const scripts = pkg.scripts ?? {}

		return typeof scripts[scriptName] === "string"
	})
}

const apps = readApps()
const taskSupportedApps = readTaskSupportedApps(apps, task)

if (apps.length === 0) {
	console.error("未在 apps 目录下找到可用应用（缺少 package.json）")
	process.exit(1)
}

if (taskSupportedApps.length === 0) {
	console.error(`apps 下没有应用定义 "${task}" 脚本`)
	process.exit(1)
}

const args = ["turbo", "run", task]

if (isParallel) {
	args.push("--parallel")
}

if (isAll) {
	for (const app of taskSupportedApps) {
		args.push(`--filter=./apps/${app}`)
	}
} else {
	if (!appName) {
		console.error("请设置 APP=<app-name> 或传入 --app=<app-name>，例如 APP=admin")
		process.exit(1)
	}

	if (!apps.includes(appName)) {
		console.error(
			`应用 "${appName}" 不存在。当前可用应用：${apps.join(", ")}`,
		)
		process.exit(1)
	}

	if (!taskSupportedApps.includes(appName)) {
		console.error(`应用 "${appName}" 未定义 "${task}" 脚本`)
		process.exit(1)
	}

	args.push(`--filter=./apps/${appName}`)
}

if (extraArgs.length > 0) {
	args.push(...extraArgs)
}

const result = spawnSync("pnpm", args, {
	stdio: "inherit",
})

process.exit(result.status ?? 1)
