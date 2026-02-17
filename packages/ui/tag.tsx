import { cva } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { Slot } from "radix-ui"
import * as React from "react"

import { cn } from "@/packages/ui-utils"
import {
  getSemanticToneClasses,
  type SemanticToneColor,
  semanticToneColorOptions,
} from "./semantic-tone"

export const tagColorOptions = semanticToneColorOptions

export const tagVariantOptions = [
  "solid",
  "outline",
  "dashed",
  "soft",
  "ghost",
  "link",
  "plain",
  "pure",
] as const

export const tagShapeOptions = ["rounded", "circle", "square"] as const
export const tagSizeOptions = ["xs", "sm", "md", "lg", "xl", "2xl"] as const

export type TagColor = SemanticToneColor
export type TagVariant = (typeof tagVariantOptions)[number]
export type TagShape = (typeof tagShapeOptions)[number]
export type TagSize = (typeof tagSizeOptions)[number]

type TagColorInput = TagColor | (string & {})
type NormalizedTagVariant = (typeof tagVariantOptions)[number]

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center border font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:shrink-0 outline-none transition-[color,background-color,border-color,box-shadow] overflow-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        solid: "border-transparent",
        outline: "bg-background",
        dashed: "border-dashed bg-background",
        soft: "border-transparent",
        ghost: "border-transparent bg-transparent",
        link: "border-transparent bg-transparent underline-offset-4 hover:underline",
        plain: "bg-background text-foreground",
        pure: "border-border bg-background text-accent-foreground",
      },
      size: {
        xs: "h-5 gap-1 px-1.5 text-[10px] leading-none [&>svg]:size-3",
        sm: "h-6 gap-1 px-2 text-xs leading-none [&>svg]:size-3",
        md: "h-7 gap-1.5 px-2.5 text-xs leading-none [&>svg]:size-3",
        lg: "h-8 gap-1.5 px-3 text-sm leading-none [&>svg]:size-4",
        xl: "h-9 gap-2 px-3.5 text-base leading-none [&>svg]:size-4",
        "2xl": "h-10 gap-2 px-4 text-lg leading-none [&>svg]:size-5",
      },
      shape: {
        rounded: "rounded-full",
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    compoundVariants: [
      { size: "xs", shape: ["circle", "square"], class: "w-5 px-0" },
      { size: "sm", shape: ["circle", "square"], class: "w-6 px-0" },
      { size: "md", shape: ["circle", "square"], class: "w-7 px-0" },
      { size: "lg", shape: ["circle", "square"], class: "w-8 px-0" },
      { size: "xl", shape: ["circle", "square"], class: "w-9 px-0" },
      { size: "2xl", shape: ["circle", "square"], class: "w-10 px-0" },
    ],
    defaultVariants: {
      variant: "soft",
      size: "md",
      shape: "rounded",
    },
  },
)

const tagCloseButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full text-current/80 transition-opacity hover:text-current focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] outline-none cursor-pointer",
  {
    variants: {
      size: {
        xs: "size-3",
        sm: "size-3.5",
        md: "size-4",
        lg: "size-4",
        xl: "size-4.5",
        "2xl": "size-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

function isTagColor(value: string): value is TagColor {
  return (tagColorOptions as readonly string[]).includes(value)
}

function normalizeTagColor(color: TagColorInput | undefined): TagColor {
  if (!color) {
    return "primary"
  }

  return isTagColor(color) ? color : "primary"
}

function normalizeTagVariant(variant: TagVariant | undefined): NormalizedTagVariant {
  return variant ?? "soft"
}

function resolveTagColor(color: TagColorInput | undefined): TagColor {
  return normalizeTagColor(color)
}

function getTagColorClasses(color: TagColor, variant: NormalizedTagVariant) {
  return getSemanticToneClasses(color, variant, { pureToneMode: "text-border" })
}

export interface TagUi {
  root?: string | undefined
  close?: string | undefined
}

type NativeTagProps = Omit<React.ComponentProps<"span">, "color" | "content">

export interface TagProps extends NativeTagProps {
  color?: TagColorInput | undefined
  variant?: TagVariant | undefined
  size?: TagSize | undefined
  shape?: TagShape | undefined
  closable?: boolean | undefined
  content?: string | undefined
  ui?: TagUi | undefined
  asChild?: boolean | undefined
  closeSlot?: React.ReactNode | undefined
  onClose?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined
}

function getAsChildElement(children: React.ReactNode) {
  let resolved: React.ReactElement | null = null

  for (const child of React.Children.toArray(children)) {
    if (React.isValidElement(child)) {
      if (resolved !== null) {
        return null
      }
      resolved = child
      continue
    }

    if (typeof child === "string" && child.trim() === "") {
      continue
    }

    if (child === null || child === undefined || typeof child === "boolean") {
      continue
    }

    return null
  }

  return resolved
}

export function Tag({
  className,
  color,
  variant,
  size = "md",
  shape = "rounded",
  closable = false,
  content,
  ui,
  asChild = false,
  closeSlot,
  onClose,
  children,
  ...props
}: TagProps) {
  const resolvedVariant = normalizeTagVariant(variant)
  const resolvedColor = resolveTagColor(color)
  const asChildElement = asChild && !closable ? getAsChildElement(children) : null
  const renderedContent = children ?? content

  const handleCloseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onClose?.(event)
  }

  if (asChildElement) {
    return (
      <Slot.Root
        data-slot="tag"
        data-color={resolvedColor}
        data-variant={resolvedVariant}
        data-size={size}
        data-shape={shape}
        data-closable="false"
        className={cn(
          tagVariants({ variant: resolvedVariant, size, shape }),
          getTagColorClasses(resolvedColor, resolvedVariant),
          ui?.root,
          className,
        )}
        {...props}
      >
        {asChildElement}
      </Slot.Root>
    )
  }

  return (
    <span
      data-slot="tag"
      data-color={resolvedColor}
      data-variant={resolvedVariant}
      data-size={size}
      data-shape={shape}
      data-closable={closable ? "true" : "false"}
      className={cn(
        tagVariants({ variant: resolvedVariant, size, shape }),
        getTagColorClasses(resolvedColor, resolvedVariant),
        ui?.root,
        className,
      )}
      {...props}
    >
      {renderedContent}
      {closable ? (
        <button
          type="button"
          data-slot="tag-close"
          className={cn(tagCloseButtonVariants({ size }), ui?.close)}
          onClick={handleCloseClick}
        >
          {closeSlot ?? <XIcon className="size-[80%]" aria-hidden />}
          <span className="sr-only">关闭标签</span>
        </button>
      ) : null}
    </span>
  )
}

export { tagVariants }
