import { useConfirmStore } from "./confirm-store"

export function useConfirm() {
  const confirm = useConfirmStore((state) => state.confirm)
  return { confirm }
}
