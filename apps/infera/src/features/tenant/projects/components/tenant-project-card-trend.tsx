import { motion } from "motion/react"

function toSeed(value: string) {
  let seed = 0
  for (let index = 0; index < value.length; index += 1) {
    seed += value.charCodeAt(index) * (index + 3)
  }
  return seed
}

export function buildTokenTrendSeries(tokensToday: number, projectId: string) {
  const safeCurrent = Math.max(tokensToday, 0)
  const seed = toSeed(projectId)

  return Array.from({ length: 6 }, (_, index) => {
    if (index === 5) {
      return safeCurrent
    }

    const wave = Math.sin((seed + index) * 0.37) * 0.09
    const drift = (index - 4) * 0.05
    const ratio = 0.78 + wave + drift
    return Math.max(0, Math.round(safeCurrent * Math.max(0.4, ratio)))
  })
}

function buildSparklinePoints(values: readonly number[]) {
  if (values.length === 0) {
    return ""
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100
      const y = 34 - ((value - min) / range) * 28
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}

interface TokenSparklineProps {
  points: readonly number[]
}

function resolveTrendTone(points: readonly number[]) {
  if (points.length < 2) {
    return {
      className: "text-muted-foreground/70",
      strokeWidth: 2,
    }
  }

  const first = points[0] ?? 0
  const last = points[points.length - 1] ?? 0
  const baseline = Math.max(first, 1)
  const changeRate = (last - first) / baseline

  if (changeRate >= 0.32) {
    return {
      className: "text-primary",
      strokeWidth: 2.6,
    }
  }

  if (changeRate >= 0.1) {
    return {
      className: "text-primary/85",
      strokeWidth: 2.3,
    }
  }

  if (changeRate <= -0.24) {
    return {
      className: "text-destructive/85",
      strokeWidth: 2.3,
    }
  }

  if (changeRate <= -0.08) {
    return {
      className: "text-muted-foreground/80",
      strokeWidth: 2.1,
    }
  }

  return {
    className: "text-muted-foreground/75",
    strokeWidth: 2,
  }
}

export function TokenSparkline({ points }: TokenSparklineProps) {
  const polylinePoints = buildSparklinePoints(points)
  const tone = resolveTrendTone(points)

  return (
    <svg viewBox="0 0 100 40" className={`h-8 w-24 ${tone.className}`} aria-hidden>
      <title>最近六小时 Token 波动</title>
      <motion.polyline
        points={polylinePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth={tone.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </svg>
  )
}
