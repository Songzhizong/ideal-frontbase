function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

export interface PreferenceEnvelope<TValue> {
	schemaVersion: number
	updatedAt: number
	value: TValue
}

export interface PreferenceMergeContext {
	columnIds: string[]
}

export interface PreferenceMigrationContext {
	columnIds: string[]
}

export type PreferenceMigration<TValue> = (args: {
	fromVersion: number
	toVersion: number
	value: TValue
	ctx: PreferenceMigrationContext
}) => TValue

function isPreferenceEnvelope<TValue>(value: unknown): value is PreferenceEnvelope<TValue> {
	if (!isRecord(value)) return false
	return (
		typeof value.schemaVersion === "number" &&
		Number.isFinite(value.schemaVersion) &&
		typeof value.updatedAt === "number" &&
		Number.isFinite(value.updatedAt) &&
		"value" in value
	)
}

export function mergeRecordPreference<TValue>(args: {
	stored: Record<string, TValue> | null
	defaults: Record<string, TValue>
	ctx: PreferenceMergeContext
	normalize?: (args: {
		columnId: string
		value: TValue | undefined
		defaultValue: TValue
	}) => TValue
}): Record<string, TValue> {
	const next: Record<string, TValue> = {}
	for (const columnId of args.ctx.columnIds) {
		const defaultValue = args.defaults[columnId]
		const storedValue = args.stored?.[columnId]
		if (defaultValue === undefined) {
			if (storedValue === undefined) continue
			next[columnId] = storedValue
			continue
		}
		if (args.normalize) {
			next[columnId] = args.normalize({ columnId, value: storedValue, defaultValue })
			continue
		}
		const mergedValue = storedValue ?? defaultValue
		if (mergedValue === undefined) continue
		next[columnId] = mergedValue
	}
	return next
}

export function applyPreferenceMigrations<TValue>(args: {
	envelope: PreferenceEnvelope<TValue>
	schemaVersion: number
	ctx: PreferenceMigrationContext
	migrate?: PreferenceMigration<TValue>
	now?: number
}): PreferenceEnvelope<TValue> {
	if (args.envelope.schemaVersion === args.schemaVersion) return args.envelope
	if (args.envelope.schemaVersion > args.schemaVersion) {
		return {
			schemaVersion: args.schemaVersion,
			updatedAt: args.now ?? Date.now(),
			value: args.envelope.value,
		}
	}
	if (!args.migrate) {
		return {
			schemaVersion: args.schemaVersion,
			updatedAt: args.now ?? Date.now(),
			value: args.envelope.value,
		}
	}
	return {
		schemaVersion: args.schemaVersion,
		updatedAt: args.now ?? Date.now(),
		value: args.migrate({
			fromVersion: args.envelope.schemaVersion,
			toVersion: args.schemaVersion,
			value: args.envelope.value,
			ctx: args.ctx,
		}),
	}
}

export function createJsonLocalStoragePreferenceStorage<TValue>(args: {
	parse: (value: unknown) => TValue | null
	schemaVersion: number
}): {
	getSync: (key: string) => PreferenceEnvelope<TValue> | null
	get: (key: string) => Promise<PreferenceEnvelope<TValue> | null>
	set: (key: string, value: PreferenceEnvelope<TValue>) => Promise<void>
	remove: (key: string) => Promise<void>
} {
	const getItem = (key: string): unknown => {
		if (typeof window === "undefined") return null
		const raw = window.localStorage.getItem(key)
		if (!raw) return null
		try {
			return JSON.parse(raw) as unknown
		} catch {
			return null
		}
	}

	const getEnvelope = (key: string): PreferenceEnvelope<TValue> | null => {
		const parsed = getItem(key)
		if (!parsed) return null
		if (isPreferenceEnvelope<TValue>(parsed)) {
			const value = args.parse(parsed.value)
			if (!value) return null
			return {
				schemaVersion:
					Number.isFinite(parsed.schemaVersion) && parsed.schemaVersion > 0
						? parsed.schemaVersion
						: args.schemaVersion,
				updatedAt: parsed.updatedAt,
				value,
			}
		}
		const value = args.parse(parsed)
		if (!value) return null
		return {
			schemaVersion: args.schemaVersion,
			updatedAt: Date.now(),
			value,
		}
	}

	return {
		getSync: getEnvelope,
		get: async (key) => getEnvelope(key),
		set: async (key, value) => {
			if (typeof window === "undefined") return
			window.localStorage.setItem(key, JSON.stringify(value))
		},
		remove: async (key) => {
			if (typeof window === "undefined") return
			window.localStorage.removeItem(key)
		},
	}
}
