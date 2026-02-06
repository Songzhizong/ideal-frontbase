import { describe, expect, it, vi } from "vitest"
import {
  formatTimestampToDate,
  formatTimestampToDateTime,
  formatTimestampToRelativeTime,
} from "./time-utils"

describe("timeUtils", () => {
  // Actually let's use a specific date for predictable tests
  const targetDate = new Date(2026, 0, 30, 14, 2, 32) // 2026-01-30 14:02:32
  const targetTimestamp = targetDate.getTime()

  describe("formatDate", () => {
    it("should format date correctly from timestamp", () => {
      expect(formatTimestampToDate(targetTimestamp)).toBe("2026-01-30")
    })

    it("should format date correctly from numeric string (Long as string)", () => {
      expect(formatTimestampToDate(targetTimestamp.toString())).toBe("2026-01-30")
    })

    it("should return '-' for null/undefined/invalid", () => {
      expect(formatTimestampToDate(null)).toBe("-")
      expect(formatTimestampToDate(undefined)).toBe("-")
      expect(formatTimestampToDate("invalid")).toBe("-")
    })
  })

  describe("formatDateTime", () => {
    it("should format datetime correctly", () => {
      expect(formatTimestampToDateTime(targetTimestamp)).toBe("2026-01-30 14:02:32")
    })
  })

  describe("formatRelativeTime", () => {
    it("should return '刚刚' for very recent time", () => {
      const now = new Date()
      vi.setSystemTime(now)
      expect(formatTimestampToRelativeTime(now.getTime() - 5000)).toBe("刚刚")
      vi.useRealTimers()
    })

    it("should return relative time for past dates", () => {
      const now = new Date(2026, 0, 31, 10, 0, 0)
      vi.useFakeTimers()
      vi.setSystemTime(now)

      // 2 分钟前
      const twoMinutesAgo = new Date(2026, 0, 31, 9, 58, 0)
      expect(formatTimestampToRelativeTime(twoMinutesAgo.getTime())).toBe("2 分钟前")

      // 1 天前
      const oneDayAgo = new Date(2026, 0, 30, 10, 0, 0)
      expect(formatTimestampToRelativeTime(oneDayAgo.getTime())).toBe("1 天前")

      vi.useRealTimers()
    })
  })
})
