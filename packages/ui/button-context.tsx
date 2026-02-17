import { createContext, useContext } from "react"
import type { ButtonColor, ButtonShadow, ButtonShape, ButtonSize, ButtonVariant } from "./button"

export interface ButtonGroupContextValue {
  color?: ButtonColor | undefined
  size?: ButtonSize | undefined
  variant?: ButtonVariant | undefined
  shape?: ButtonShape | undefined
  shadow?: ButtonShadow | undefined
  fitContent?: boolean | undefined
  disabled?: boolean | undefined
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext)
}
