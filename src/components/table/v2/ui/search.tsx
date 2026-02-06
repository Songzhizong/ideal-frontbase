import { Search } from "lucide-react"
import { type KeyboardEvent, useEffect, useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { type DataTableI18nOverrides, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

function toTextValue(value: unknown): string {
	if (value == null) return ""
	if (typeof value === "string") return value
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	if (value instanceof Date) return value.toISOString()
	return String(value)
}

export interface DataTableSearchProps<TFilterSchema> {
	filterKey?: keyof TFilterSchema
	debounceMs?: number
	placeholder?: string
	className?: string
	inputClassName?: string
	i18n?: DataTableI18nOverrides
}

export function DataTableSearch<TFilterSchema>({
	filterKey,
	debounceMs = 300,
	placeholder,
	className,
	inputClassName,
	i18n: i18nOverrides,
}: DataTableSearchProps<TFilterSchema>) {
	const dt = useDataTableInstance<unknown, TFilterSchema>()
	const { i18n: globalI18n } = useDataTableConfig()
	const key = (filterKey ?? "q") as keyof TFilterSchema
	const rawValue = dt.filters.state[key]
	const normalizedValue = useMemo(() => toTextValue(rawValue), [rawValue])
	const [value, setValue] = useState(normalizedValue)

	const i18n = useMemo(() => {
		return {
			...globalI18n,
			...i18nOverrides,
			pagination: {
				...globalI18n.pagination,
				...i18nOverrides?.pagination,
			},
		}
	}, [globalI18n, i18nOverrides])

	const debouncedSetValue = useDebouncedCallback((nextValue: string) => {
		dt.filters.set(key, nextValue as TFilterSchema[keyof TFilterSchema])
	}, debounceMs)

	useEffect(() => {
		setValue(normalizedValue)
		if (debounceMs > 0) {
			debouncedSetValue.cancel()
		}
	}, [debounceMs, debouncedSetValue, normalizedValue])

	useEffect(() => () => debouncedSetValue.cancel(), [debouncedSetValue])

	const handleChange = (nextValue: string) => {
		setValue(nextValue)
		if (debounceMs <= 0) {
			dt.filters.set(key, nextValue as TFilterSchema[keyof TFilterSchema])
			return
		}
		debouncedSetValue(nextValue)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || debounceMs <= 0) return
		debouncedSetValue.flush()
	}

	const resolvedPlaceholder = placeholder ?? i18n.searchPlaceholder

	return (
		<div className={cn("relative w-full max-w-sm", className)}>
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(event) => handleChange(event.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={resolvedPlaceholder}
				className={cn("h-9 pl-9", inputClassName)}
			/>
		</div>
	)
}
