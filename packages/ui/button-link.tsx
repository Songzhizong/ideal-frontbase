import type * as React from "react"
import { BaseLink } from "@/packages/platform-router"
import { Button, type ButtonProps } from "./button"

interface ButtonLinkRenderContext {
  isHref: boolean
}

type ButtonLinkChildren = React.ReactNode | ((context: ButtonLinkRenderContext) => React.ReactNode)

function isAbsoluteUrl(url: string) {
  return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(url)
}

export interface ButtonLinkProps extends Omit<ButtonProps, "asChild" | "children"> {
  to?: string | undefined
  href?: string | undefined
  external?: boolean | undefined
  target?: React.HTMLAttributeAnchorTarget | undefined
  rel?: string | undefined
  noRel?: boolean | undefined
  prefetch?: boolean | undefined
  noPrefetch?: boolean | undefined
  children?: ButtonLinkChildren
}

export function ButtonLink({
  to,
  href,
  external,
  target,
  rel,
  noRel = false,
  prefetch,
  noPrefetch,
  disabled,
  children,
  ...props
}: ButtonLinkProps) {
  const destination = to ?? href
  const isHref = destination ? (external ?? isAbsoluteUrl(destination)) : false
  const content = typeof children === "function" ? children({ isHref }) : children

  if (!destination || disabled) {
    return (
      <Button disabled={disabled ?? !destination} {...props}>
        {content}
      </Button>
    )
  }

  if (isHref) {
    const resolvedRel = noRel ? rel : (rel ?? "noopener noreferrer")
    const externalLinkProps: React.ComponentProps<"a"> = { href: destination }

    if (target !== undefined) {
      externalLinkProps.target = target
    }

    if (resolvedRel !== undefined) {
      externalLinkProps.rel = resolvedRel
    }

    return (
      <Button asChild {...props}>
        <a {...externalLinkProps}>{content}</a>
      </Button>
    )
  }

  const preload = noPrefetch ? false : prefetch ? "intent" : undefined
  const internalLinkProps: React.ComponentProps<typeof BaseLink> = {
    to: destination,
  }

  if (preload !== undefined) {
    internalLinkProps.preload = preload
  }

  if (target !== undefined) {
    internalLinkProps.target = target
  }

  if (rel !== undefined) {
    internalLinkProps.rel = rel
  }

  return (
    <Button asChild {...props}>
      <BaseLink {...internalLinkProps}>{content}</BaseLink>
    </Button>
  )
}
