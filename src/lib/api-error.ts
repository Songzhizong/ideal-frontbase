import type { ProblemDetail } from "@/types/problem-detail"

export class ApiError extends Error {
  public override readonly name = "ApiError"

  public readonly status: number
  public readonly url: string
  public readonly method: string
  public readonly problem: ProblemDetail | null
  public readonly originalError: unknown

  public constructor(args: {
    status: number
    message: string
    url: string
    method: string
    problem?: ProblemDetail | null
    originalError?: unknown
  }) {
    super(args.message)
    this.status = args.status
    this.url = args.url
    this.method = args.method
    this.problem = args.problem ?? null
    this.originalError = args.originalError
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.status === 401
}

export function getApiErrorMessage(error: ApiError): string {
  const detail = error.problem?.detail
  if (detail) return detail

  if (error.status >= 500) {
    return "Server error. Try again."
  }

  return "Request failed."
}
