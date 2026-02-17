import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Separator } from "@/packages/ui/separator"
import { cn } from "@/packages/ui-utils"
import type { ButtonColor, ButtonProps } from "./button"
import { ButtonGroupContext } from "./button-context"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
)

interface ButtonGroupOwnProps extends VariantProps<typeof buttonGroupVariants> {
  dir?: "ltr" | "rtl" | undefined
  color?: ButtonColor | undefined
  size?: ButtonProps["size"] | undefined
  variant?: ButtonProps["variant"] | undefined
  shape?: ButtonProps["shape"] | undefined
  shadow?: ButtonProps["shadow"] | undefined
  fitContent?: ButtonProps["fitContent"] | undefined
}

type NativeFieldsetProps = Omit<React.ComponentProps<"fieldset">, "color">

function ButtonGroup({
  className,
  orientation,
  dir = "ltr",
  color,
  size,
  variant,
  shape,
  shadow,
  fitContent,
  disabled,
  children,
  ...props
}: NativeFieldsetProps & ButtonGroupOwnProps) {
  return (
    <ButtonGroupContext value={{ color, size, variant, shape, shadow, fitContent, disabled }}>
      <fieldset
        data-slot="button-group"
        data-orientation={orientation}
        dir={dir}
        className={cn(buttonGroupVariants({ orientation }), className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </fieldset>
    </ButtonGroupContext>
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
