import { useConfirmStore } from "@/lib/confirm-store"

export function useConfirm() {
  const confirm = useConfirmStore((state) => state.confirm)
  return { confirm }
}
