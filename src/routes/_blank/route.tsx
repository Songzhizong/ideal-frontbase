import { createFileRoute, Outlet } from "@tanstack/react-router"
import { BlankLayout } from "@/components/layout/blank-layout"

export const Route = createFileRoute("/_blank")({
  component: BlankLayoutRoute,
})

function BlankLayoutRoute() {
  return (
    <BlankLayout>
      <Outlet />
    </BlankLayout>
  )
}
