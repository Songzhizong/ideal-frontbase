import { createFileRoute } from "@tanstack/react-router"
import { ComponentDetailPage } from "@/features/component-docs/pages/component-detail-page"

export const Route = createFileRoute("/components/$componentSlug")({
  component: ComponentDetailRoute,
})

function ComponentDetailRoute() {
  const { componentSlug } = Route.useParams()

  return <ComponentDetailPage componentSlug={componentSlug} />
}
