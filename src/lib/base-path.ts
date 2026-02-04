export function getBasePath() {
	const baseUrl = import.meta.env.BASE_URL
	if (baseUrl === "/") {
		return "/"
	}
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
}

export function withBasePath(path: string) {
	const basePath = getBasePath()
	const normalizedPath = path.startsWith("/") ? path : `/${path}`
	if (basePath === "/") {
		return normalizedPath
	}
	return `${basePath}${normalizedPath}`
}

export function getAppLocationPath() {
	const basePath = getBasePath()
	const { pathname, search, hash } = window.location
	let appPath = pathname
	if (basePath !== "/" && appPath.startsWith(basePath)) {
		appPath = appPath.slice(basePath.length) || "/"
	}
	return `${appPath}${search}${hash}`
}

export function stripBasePath(path: string) {
	const basePath = getBasePath()
	if (basePath === "/") {
		return path
	}
	if (path === basePath) {
		return "/"
	}
	if (path.startsWith(`${basePath}/`)) {
		return path.slice(basePath.length)
	}
	return path
}
