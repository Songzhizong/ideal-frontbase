import type { ComponentType } from "react"

interface PlaygroundModule {
  default: ComponentType<Record<string, never>>
}

const playgroundComponents = import.meta.glob<PlaygroundModule>("./**/*.tsx", {
  eager: true,
})

const playgroundCodes = import.meta.glob<string>("./**/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
})

function getDemoPath(component: string, file: string) {
  return `./${component}/${file}.tsx`
}

export function getPlaygroundComponent(component: string, file: string) {
  const path = getDemoPath(component, file)

  return playgroundComponents[path]?.default ?? null
}

export function getPlaygroundCode(component: string, file: string) {
  const path = getDemoPath(component, file)

  return playgroundCodes[path] ?? null
}
