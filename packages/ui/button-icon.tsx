import type * as React from "react"
import { Button, type ButtonProps } from "./button"

export interface ButtonIconProps extends Omit<ButtonProps, "children"> {
  icon: React.ReactNode
}

export function ButtonIcon({
  icon,
  color = "accent",
  variant = "ghost",
  shape = "square",
  fitContent = true,
  ...props
}: ButtonIconProps) {
  return (
    <Button color={color} variant={variant} shape={shape} fitContent={fitContent} {...props}>
      {icon}
    </Button>
  )
}
