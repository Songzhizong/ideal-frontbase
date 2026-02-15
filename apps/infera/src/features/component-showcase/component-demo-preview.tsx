import type * as React from "react"
import type { ComponentDemoSlug } from "./component-demo-config"
import { BASIC_COMPONENT_PREVIEW_RENDERERS } from "./component-demo-preview-basic"
import { ENHANCE_COMPONENT_PREVIEW_RENDERERS } from "./component-demo-preview-enhance"
import { STRUCTURED_COMPONENT_PREVIEW_RENDERERS } from "./component-demo-preview-structured"

type ComponentDemoPreviewRenderer = () => React.ReactNode

const COMPONENT_PREVIEW_RENDERERS = {
  ...BASIC_COMPONENT_PREVIEW_RENDERERS,
  ...STRUCTURED_COMPONENT_PREVIEW_RENDERERS,
  ...ENHANCE_COMPONENT_PREVIEW_RENDERERS,
} satisfies Record<ComponentDemoSlug, ComponentDemoPreviewRenderer>

interface ComponentDemoPreviewProps {
  slug: ComponentDemoSlug
}

export function ComponentDemoPreview({ slug }: ComponentDemoPreviewProps) {
  const Renderer = COMPONENT_PREVIEW_RENDERERS[slug]
  return <Renderer />
}
