import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { useButtonGroupContext } from "./button-context"

export const buttonColorOptions = [
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
  "carbon",
  "secondary",
  "accent",
] as const

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        pure: "border border-border bg-background text-accent-foreground hover:bg-accent/60 active:bg-accent",
        plain: "border border-border bg-background text-foreground",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background hover:bg-accent/60 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        dashed: "border border-dashed bg-background",
        soft: "bg-primary/10 hover:bg-primary/10 active:bg-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:bg-accent/60 dark:hover:bg-accent/50",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "gap-1 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "gap-1.5 text-xs",
        md: "gap-2 text-sm",
        lg: "gap-2.5 text-base",
        xl: "gap-3 text-lg",
        "2xl": "gap-3.5 text-xl",
        default: "gap-2 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      shape: {
        auto: "rounded-md",
        rounded: "rounded-full",
        square: "rounded-md",
        circle: "rounded-full",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      fitContent: {
        true: "h-fit w-fit",
        false: "",
      },
    },
    compoundVariants: [
      { size: "xs", fitContent: true, class: "p-1" },
      { size: "sm", fitContent: true, class: "p-1" },
      { size: "md", fitContent: true, class: "p-1.5" },
      { size: "lg", fitContent: true, class: "p-2" },
      { size: "xl", fitContent: true, class: "p-2" },
      { size: "2xl", fitContent: true, class: "p-2.5" },
      { size: "default", fitContent: true, class: "p-1.5" },
      { size: "xs", fitContent: false, class: "h-6 px-1.5" },
      { size: "sm", fitContent: false, class: "h-7 px-2" },
      { size: "md", fitContent: false, class: "h-8 px-4" },
      { size: "lg", fitContent: false, class: "h-9 px-6" },
      { size: "xl", fitContent: false, class: "h-10 px-8" },
      { size: "2xl", fitContent: false, class: "h-12 px-10" },
      { size: "default", fitContent: false, class: "h-8 px-4" },
      {
        size: ["xs", "sm", "md", "default", "lg", "xl", "2xl"],
        fitContent: false,
        shape: ["square", "circle"],
        class: "px-0",
      },
      { size: "xs", fitContent: false, shape: ["square", "circle"], class: "w-6" },
      { size: "sm", fitContent: false, shape: ["square", "circle"], class: "w-7" },
      { size: "md", fitContent: false, shape: ["square", "circle"], class: "w-8" },
      { size: "default", fitContent: false, shape: ["square", "circle"], class: "w-8" },
      { size: "lg", fitContent: false, shape: ["square", "circle"], class: "w-9" },
      { size: "xl", fitContent: false, shape: ["square", "circle"], class: "w-10" },
      { size: "2xl", fitContent: false, shape: ["square", "circle"], class: "w-12" },
      { variant: ["ghost", "link"], shadow: ["sm", "md", "lg"], class: "shadow-none" },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      shape: "auto",
      shadow: "none",
      fitContent: false,
    },
  },
)

type ButtonVariantConfig = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonSizeConfig = NonNullable<VariantProps<typeof buttonVariants>["size"]>
type ButtonShapeConfig = NonNullable<VariantProps<typeof buttonVariants>["shape"]>
type ButtonShadowConfig = NonNullable<VariantProps<typeof buttonVariants>["shadow"]>

export type ButtonColor = (typeof buttonColorOptions)[number]
type ButtonColorInput = ButtonColor | (string & {})
export type ButtonVariant = ButtonVariantConfig
export type ButtonSize = ButtonSizeConfig
export type ButtonShape = ButtonShapeConfig
export type ButtonShadow = ButtonShadowConfig

interface ButtonTone {
  ring: string
  solid: string
  text: string
  border: string
  ghostHover: string
  plainHover: string
  soft: string
}

const buttonToneMap: Record<ButtonColor, ButtonTone> = {
  primary: {
    ring: "focus-visible:ring-primary/30",
    solid: "bg-primary text-primary-foreground hover:bg-primary/90",
    text: "text-primary",
    border: "border-primary",
    ghostHover: "hover:bg-primary/10 active:bg-primary/20",
    plainHover: "hover:border-primary hover:text-primary",
    soft: "bg-primary/10 hover:bg-primary/10 active:bg-primary/20",
  },
  destructive: {
    ring: "focus-visible:ring-destructive/30",
    solid: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    text: "text-destructive",
    border: "border-destructive",
    ghostHover: "hover:bg-destructive/10 active:bg-destructive/20",
    plainHover: "hover:border-destructive hover:text-destructive",
    soft: "bg-destructive/10 hover:bg-destructive/10 active:bg-destructive/20",
  },
  success: {
    ring: "focus-visible:ring-success/30",
    solid: "bg-success text-success-foreground hover:bg-success/90",
    text: "text-success",
    border: "border-success",
    ghostHover: "hover:bg-success/10 active:bg-success/20",
    plainHover: "hover:border-success hover:text-success",
    soft: "bg-success/10 hover:bg-success/10 active:bg-success/20",
  },
  warning: {
    ring: "focus-visible:ring-warning/30",
    solid: "bg-warning text-warning-foreground hover:bg-warning/90",
    text: "text-warning",
    border: "border-warning",
    ghostHover: "hover:bg-warning/10 active:bg-warning/20",
    plainHover: "hover:border-warning hover:text-warning",
    soft: "bg-warning/10 hover:bg-warning/10 active:bg-warning/20",
  },
  info: {
    ring: "focus-visible:ring-info/30",
    solid: "bg-info text-info-foreground hover:bg-info/90",
    text: "text-info",
    border: "border-info",
    ghostHover: "hover:bg-info/10 active:bg-info/20",
    plainHover: "hover:border-info hover:text-info",
    soft: "bg-info/10 hover:bg-info/10 active:bg-info/20",
  },
  carbon: {
    ring: "focus-visible:ring-foreground/30",
    solid: "bg-foreground text-background hover:bg-foreground/90",
    text: "text-foreground",
    border: "border-foreground",
    ghostHover: "hover:bg-foreground/10 active:bg-foreground/20",
    plainHover: "hover:border-foreground hover:text-foreground",
    soft: "bg-foreground/10 hover:bg-foreground/10 active:bg-foreground/20",
  },
  secondary: {
    ring: "focus-visible:ring-secondary-foreground/20",
    solid: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    text: "text-secondary-foreground",
    border: "border-secondary-foreground",
    ghostHover: "hover:bg-secondary-foreground/10 active:bg-secondary-foreground/20",
    plainHover: "hover:border-secondary-foreground hover:text-secondary-foreground",
    soft: "bg-secondary-foreground/10 hover:bg-secondary-foreground/10 active:bg-secondary-foreground/20",
  },
  accent: {
    ring: "focus-visible:ring-accent-foreground/20",
    solid: "bg-accent text-accent-foreground hover:bg-accent/80",
    text: "text-accent-foreground",
    border: "border-accent-foreground",
    ghostHover: "hover:bg-accent-foreground/10 active:bg-accent-foreground/20",
    plainHover: "hover:border-accent-foreground hover:text-accent-foreground",
    soft: "bg-accent-foreground/10 hover:bg-accent-foreground/10 active:bg-accent-foreground/20",
  },
}

function getButtonColorClasses(color: ButtonColor, variant: ButtonVariant) {
  const tone = buttonToneMap[color]

  if (variant === "solid" || variant === "default") {
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

  return tone.ring
}

function isButtonColor(value: string): value is ButtonColor {
  return (buttonColorOptions as readonly string[]).includes(value)
}

function normalizeButtonColor(color: ButtonColorInput | undefined): ButtonColor {
  if (!color) {
    return "primary"
  }

  return isButtonColor(color) ? color : "primary"
}

type NativeButtonProps = Omit<React.ComponentProps<"button">, "color" | "size">

export interface ButtonProps extends NativeButtonProps {
  color?: ButtonColorInput | undefined
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  shape?: ButtonShape | undefined
  shadow?: ButtonShadow | undefined
  fitContent?: boolean | undefined
  asChild?: boolean | undefined
  leading?: React.ReactNode | undefined
  trailing?: React.ReactNode | undefined
}

function Button({
  className,
  color,
  variant,
  size,
  shape,
  shadow,
  fitContent,
  asChild = false,
  leading,
  trailing,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const groupContext = useButtonGroupContext()
  const Comp = asChild ? Slot.Root : "button"
  const resolvedColor = normalizeButtonColor(color ?? groupContext?.color)
  const resolvedVariant = variant ?? groupContext?.variant ?? "solid"
  const resolvedSize = size ?? groupContext?.size ?? "md"
  const resolvedShape = shape ?? groupContext?.shape ?? "auto"
  const resolvedShadow = shadow ?? groupContext?.shadow ?? "none"
  const resolvedFitContent = fitContent ?? groupContext?.fitContent ?? false
  const resolvedDisabled = Boolean(disabled || groupContext?.disabled)

  const renderedChildren = asChild ? (
    children
  ) : (
    <>
      {leading}
      {children}
      {trailing}
    </>
  )

  return (
    <Comp
      data-slot="button"
      data-color={resolvedColor}
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-shape={resolvedShape}
      data-shadow={resolvedShadow}
      data-fit-content={resolvedFitContent ? "true" : "false"}
      disabled={resolvedDisabled}
      className={cn(
        buttonVariants({
          variant: resolvedVariant,
          size: resolvedSize,
          shape: resolvedShape,
          shadow: resolvedShadow,
          fitContent: resolvedFitContent,
        }),
        getButtonColorClasses(resolvedColor, resolvedVariant),
        className,
      )}
      {...props}
    >
      {renderedChildren}
    </Comp>
  )
}

export { Button, buttonVariants }
