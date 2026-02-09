import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const packagesRoot = path.join(projectRoot, "src/packages")
const sourceFilePattern = /\.(?:[cm]?[jt]sx?)$/

const importPatterns = [
	/\bimport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
	/\bexport\s+(?:type\s+)?[\s\S]*?\sfrom\s*["']([^"']+)["']/g,
	/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
]

function walkFiles(dir) {
	const entries = readdirSync(dir, { withFileTypes: true })
	const files = []

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...walkFiles(fullPath))
			continue
		}
		if (entry.isFile() && sourceFilePattern.test(entry.name)) {
			files.push(fullPath)
		}
	}

	return files
}

function getPackageRoot(filePath) {
	const relative = path.relative(packagesRoot, filePath)
	const [packageName] = relative.split(path.sep)
	return path.join(packagesRoot, packageName)
}

function getLineNumber(content, index) {
	return content.slice(0, index).split("\n").length
}

function parseImportSpecifiers(content) {
	const matches = []

	for (const pattern of importPatterns) {
		pattern.lastIndex = 0
		let match = pattern.exec(content)
		while (match) {
			const specifier = match[1]
			if (specifier) {
				matches.push({ specifier, index: match.index })
			}
			match = pattern.exec(content)
		}
	}

	return matches
}

function isDisallowedAliasImport(specifier) {
	if (!specifier.startsWith("@/")) return false
	return !specifier.startsWith("@/packages/")
}

function isRelativeCrossPackageImport(filePath, packageRoot, specifier) {
	if (!specifier.startsWith(".")) return false
	const resolved = path.resolve(path.dirname(filePath), specifier)
	return !resolved.startsWith(packageRoot)
}

const violations = []

const allPackageFiles = walkFiles(packagesRoot)
for (const filePath of allPackageFiles) {
	const content = readFileSync(filePath, "utf8")
	const packageRoot = getPackageRoot(filePath)
	const specifiers = parseImportSpecifiers(content)

	for (const { specifier, index } of specifiers) {
		const line = getLineNumber(content, index)

		if (isDisallowedAliasImport(specifier)) {
			violations.push({
				filePath,
				line,
				specifier,
				reason: "packages 内仅允许使用 '@/packages/*' 别名导入",
			})
			continue
		}

		if (isRelativeCrossPackageImport(filePath, packageRoot, specifier)) {
			violations.push({
				filePath,
				line,
				specifier,
				reason: "packages 内禁止通过相对路径跨出当前 package 根目录",
			})
		}
	}
}

if (violations.length > 0) {
	console.error("发现 packages 边界违规导入:\n")
	for (const violation of violations) {
		const relativePath = path.relative(projectRoot, violation.filePath)
		console.error(
			`- ${relativePath}:${violation.line} -> "${violation.specifier}" (${violation.reason})`,
		)
	}
	process.exit(1)
}

console.log("packages 边界检查通过。")
