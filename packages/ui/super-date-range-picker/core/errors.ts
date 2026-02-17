export type ResolveErrorCode =
  | "INVALID_EXPRESSION"
  | "INVALID_ISO_WITHOUT_OFFSET"
  | "INVALID_WALL_TIME"
  | "ENDPOINT_ROUND_UNIT_REQUIRED"
  | "START_NOT_BEFORE_END"
  | "DST_GAP_ERROR"

export class TimeResolveError extends Error {
  public readonly code: ResolveErrorCode

  public constructor(code: ResolveErrorCode, message: string) {
    super(message)
    this.name = "TimeResolveError"
    this.code = code
  }
}
