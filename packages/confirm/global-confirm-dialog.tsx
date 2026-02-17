import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/packages/ui/alert-dialog"
import { useConfirmStore } from "./confirm-store"

export function GlobalConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel, setMounted } = useConfirmStore()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [setMounted])

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="inline-flex items-center gap-2">
              {options.icon ? <span className="shrink-0">{options.icon}</span> : null}
              <span>{options.title}</span>
            </span>
          </AlertDialogTitle>
          {options.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
          <AlertDialogAction
            color={options.color === "destructive" ? "destructive" : "primary"}
            onClick={handleConfirm}
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
