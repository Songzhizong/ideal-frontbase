import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { stripBasePath } from "@/lib/base-path"

type BaseLinkProps = Omit<ComponentProps<typeof Link>, "to"> & {
  to: string
}

export function BaseLink({ to, ...props }: BaseLinkProps) {
  return <Link to={stripBasePath(to)} {...props} />
}
