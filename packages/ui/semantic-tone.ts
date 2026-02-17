import { cn } from "@/packages/ui-utils"

export const semanticToneColorOptions = [
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
  "carbon",
  "secondary",
  "accent",
  "neutral",
] as const

export type SemanticToneColor = (typeof semanticToneColorOptions)[number]

type SemanticToneVariant =
  | "solid"
  | "outline"
  | "dashed"
  | "soft"
  | "ghost"
  | "link"
  | "plain" // Neutral by default, reveals semantic color on hover
  | "pure" // Always neutral (gray), only semantic color on focus ring

interface SemanticToneDefinition {
  ring: string
  solid: string
  text: string
  border: string
  ghostHover: string
  plainHover: string
  soft: string
}

const semanticToneMap: Readonly<Record<SemanticToneColor, SemanticToneDefinition>> = {
  primary: {
    ring: "focus-visible:ring-primary/30",
    solid: "bg-primary text-primary-foreground hover:bg-primary/90",
    text: "text-primary",
    border: "border-primary",
    ghostHover: "hover:bg-primary/10 active:bg-primary/20",
    plainHover: "hover:border-primary hover:text-primary active:text-primary/80",
    soft: "bg-primary/10 hover:bg-primary/10 active:bg-primary/20",
  },
  destructive: {
    ring: "focus-visible:ring-destructive/30",
    solid: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    text: "text-destructive",
    border: "border-destructive",
    ghostHover: "hover:bg-destructive/10 active:bg-destructive/20",
    plainHover: "hover:border-destructive hover:text-destructive active:text-destructive/80",
    soft: "bg-destructive/10 hover:bg-destructive/10 active:bg-destructive/20",
  },
  success: {
    ring: "focus-visible:ring-success/30",
    solid: "bg-success text-success-foreground hover:bg-success/90",
    text: "text-success",
    border: "border-success",
    ghostHover: "hover:bg-success/10 active:bg-success/20",
    plainHover: "hover:border-success hover:text-success active:text-success/80",
    soft: "bg-success/10 hover:bg-success/10 active:bg-success/20",
  },
  warning: {
    ring: "focus-visible:ring-warning/30",
    solid: "bg-warning text-warning-foreground hover:bg-warning/90",
    text: "text-warning",
    border: "border-warning",
    ghostHover: "hover:bg-warning/10 active:bg-warning/20",
    plainHover: "hover:border-warning hover:text-warning active:text-warning/80",
    soft: "bg-warning/10 hover:bg-warning/10 active:bg-warning/20",
  },
  info: {
    ring: "focus-visible:ring-info/30",
    solid: "bg-info text-info-foreground hover:bg-info/90",
    text: "text-info",
    border: "border-info",
    ghostHover: "hover:bg-info/10 active:bg-info/20",
    plainHover: "hover:border-info hover:text-info active:text-info/80",
    soft: "bg-info/10 hover:bg-info/10 active:bg-info/20",
  },
  carbon: {
    ring: "focus-visible:ring-foreground/30",
    solid: "bg-foreground text-background hover:bg-foreground/90",
    text: "text-foreground",
    border: "border-foreground",
    ghostHover: "hover:bg-foreground/10 active:bg-foreground/20",
    plainHover: "hover:border-foreground hover:text-foreground active:text-foreground/80",
    soft: "bg-foreground/10 hover:bg-foreground/10 active:bg-foreground/20",
  },
  secondary: {
    ring: "focus-visible:ring-secondary-foreground/20",
    solid: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    text: "text-secondary-foreground",
    border: "border-secondary-foreground",
    ghostHover: "hover:bg-secondary-foreground/10 active:bg-secondary-foreground/20",
    plainHover:
      "hover:border-secondary-foreground hover:text-secondary-foreground active:text-secondary-foreground/80",
    soft: "bg-secondary hover:bg-secondary/80 active:bg-secondary-foreground/10",
  },
  accent: {
    ring: "focus-visible:ring-accent-foreground/20",
    solid: "bg-accent text-accent-foreground hover:bg-accent/80",
    text: "text-accent-foreground",
    border: "border-accent-foreground",
    ghostHover: "hover:bg-accent-foreground/10 active:bg-accent-foreground/20",
    plainHover:
      "hover:border-accent-foreground hover:text-accent-foreground active:text-accent-foreground/80",
    soft: "bg-accent-foreground/10 hover:bg-accent-foreground/10 active:bg-accent-foreground/20",
  },
  neutral: {
    ring: "focus-visible:ring-ring/30",
    solid: "bg-muted text-foreground hover:bg-muted/80",
    text: "text-foreground",
    border: "border-input", // Matching default input border
    ghostHover: "hover:bg-accent hover:text-accent-foreground",
    plainHover: "hover:border-input hover:text-accent-foreground",
    soft: "bg-muted/50 hover:bg-muted text-foreground",
  },
}

type PureToneMode = "ring-only" | "text-border"

interface SemanticToneClassOptions {
  pureToneMode?: PureToneMode
}

export function getSemanticToneClasses(
  color: SemanticToneColor,
  variant: SemanticToneVariant,
  options: SemanticToneClassOptions = {},
): string {
  const tone = semanticToneMap[color]

  if (variant === "solid") {
    return cn(tone.ring, tone.solid)
  }

  if (variant === "soft") {
    return cn(tone.ring, tone.text, tone.soft)
  }

  if (variant === "plain") {
    return cn(tone.ring, tone.plainHover)
  }

  if (variant === "outline" || variant === "dashed") {
    return cn(tone.ring, tone.text, tone.border, tone.ghostHover)
  }

  if (variant === "ghost") {
    return cn(tone.ring, tone.text, tone.ghostHover)
  }

  if (variant === "link") {
    return cn(tone.ring, tone.text)
  }

  if (variant === "pure") {
    if (options.pureToneMode === "text-border") {
      return cn(tone.ring, tone.text, tone.border)
    }
    return tone.ring
  }

  return tone.ring
}
