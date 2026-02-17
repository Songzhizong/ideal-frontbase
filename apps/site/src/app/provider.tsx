import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/app/router"
import { ThemeProvider } from "@/packages/theme-system"

export function AppProvider() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
