import { useNavigate } from "@tanstack/react-router"
import { stripBasePath } from "./base-path"

type NavigateFn = ReturnType<typeof useNavigate>
type NavigateOptions = Parameters<NavigateFn>[0]

export function useBaseNavigate() {
  const navigate = useNavigate()

  return (options: NavigateOptions) => {
    if (typeof options?.to === "string") {
      return navigate({
        ...options,
        to: stripBasePath(options.to),
      })
    }

    return navigate(options)
  }
}
