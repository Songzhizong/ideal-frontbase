import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { useButtonGroupContext } from "./button-context"
import {
  getSemanticToneClasses,
  type SemanticToneColor,
  semanticToneColorOptions,
} from "./semantic-tone"

export const buttonColorOptions = semanticToneColorOptions

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        pure: "border border-border bg-background text-accent-foreground hover:bg-accent/60 active:bg-accent",
        plain: "border border-border bg-background text-foreground",
        outline:
          "border bg-background hover:bg-accent/60 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        dashed: "border border-dashed bg-background",
        soft: "bg-primary/10 hover:bg-primary/10 active:bg-primary/20",
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
      { size: "xs", fitContent: false, class: "h-6 px-1.5" },
      { size: "sm", fitContent: false, class: "h-7 px-2" },
      { size: "md", fitContent: false, class: "h-8 px-4" },
      { size: "lg", fitContent: false, class: "h-9 px-6" },
      { size: "xl", fitContent: false, class: "h-10 px-8" },
      { size: "2xl", fitContent: false, class: "h-12 px-10" },
      {
        size: ["xs", "sm", "md", "lg", "xl", "2xl"],
        fitContent: false,
        shape: ["square", "circle"],
        class: "px-0",
      },
      { size: "xs", fitContent: false, shape: ["square", "circle"], class: "w-6" },
      { size: "sm", fitContent: false, shape: ["square", "circle"], class: "w-7" },
      { size: "md", fitContent: false, shape: ["square", "circle"], class: "w-8" },
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

export type ButtonColor = SemanticToneColor
type ButtonColorInput = ButtonColor | (string & {})
export type ButtonVariant = ButtonVariantConfig
export type ButtonSize = ButtonSizeConfig
export type ButtonShape = ButtonShapeConfig
export type ButtonShadow = ButtonShadowConfig

function getButtonColorClasses(color: ButtonColor, variant: ButtonVariant) {
  return getSemanticToneClasses(color, variant, { pureToneMode: "ring-only" })
}

function isButtonColor(value: string): value is ButtonColor {
  return (buttonColorOptions as readonly string[]).includes(value)
}

function getDefaultButtonColor(variant: ButtonVariant): ButtonColor {
  if (variant === "solid" || variant === "soft" || variant === "link") {
    return "primary"
  }

  return "neutral"
}

function normalizeButtonColor(
  color: ButtonColorInput | undefined,
  variant: ButtonVariant,
): ButtonColor {
  if (!color) {
    return getDefaultButtonColor(variant)
  }

  return isButtonColor(color) ? color : getDefaultButtonColor(variant)
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
  const resolvedVariant = variant ?? groupContext?.variant ?? "solid"
  const resolvedColor = normalizeButtonColor(color ?? groupContext?.color, resolvedVariant)
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
