import { z } from "zod"

/**
 * RFC 7807 Problem Details for HTTP APIs
 * Backend error response schema
 */
export const ProblemDetailSchema = z.object({
	/**
	 * HTTP status code (e.g., 404, 500)
	 */
	status: z.number().int(),

	/**
	 * URI reference that identifies the problem type
	 * Defaults to "about:blank"
	 */
	type: z.string(),

	/**
	 * Short, human-readable summary (error code/title)
	 * Same for all occurrences of this problem type
	 */
	title: z.string().nullable(),

	/**
	 * Human-readable explanation specific to this occurrence
	 * Typically displayed in the UI
	 */
	detail: z.string().nullable(),

	/**
	 * URI reference that identifies the specific occurrence
	 */
	instance: z.string().nullable(),

	/**
	 * Additional data attached to the error
	 */
	data: z.unknown().nullable().optional(),

	/**
	 * Additional properties/metadata
	 */
	properties: z.record(z.string(), z.unknown()).nullable().optional(),

	/**
	 * Trace ID for request tracking (used in logs)
	 */
	traceId: z.string().nullable().optional(),
})

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>
