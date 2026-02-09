"use client"

import { Download } from "lucide-react"
import { Button } from "@/packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui/dialog"
import type { FileManagerItem } from "../types"
import { isImageType, isOfficeType, isPdfType, isVideoType } from "../utils/file-utils"

interface FilePreviewDialogProps {
  item: FileManagerItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  getPreviewUrl: (id: string) => string
  onDownload: (item: FileManagerItem) => void
}

export function FilePreviewDialog({
  item,
  open,
  onOpenChange,
  getPreviewUrl,
  onDownload,
}: FilePreviewDialogProps) {
  if (!item || item.kind !== "file") return null

  const previewUrl = getPreviewUrl(item.id)
  const canImage = isImageType(item.contentType)
  const canVideo = isVideoType(item.contentType)
  const canPdf = isPdfType(item.contentType)
  const canOffice = isOfficeType(item.contentType)
  const canIframe = canPdf || canOffice

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="truncate">{item.name}</DialogTitle>
          <DialogDescription className="sr-only">{item.name} 文件预览</DialogDescription>
          <Button variant="outline" size="sm" onClick={() => onDownload(item)}>
            <Download className="mr-2 size-4" />
            下载
          </Button>
        </DialogHeader>
        <div className="min-h-105 overflow-hidden rounded-lg border border-border/50 bg-muted/30 p-4">
          {canImage && <img src={previewUrl} alt={item.name} className="mx-auto max-h-[70vh]" />}
          {canVideo && (
            <video className="mx-auto max-h-[70vh]" controls>
              <source src={previewUrl} />
              <track kind="captions" />
            </video>
          )}
          {canIframe && (
            <iframe
              title={item.name}
              src={previewUrl}
              className="h-[70vh] w-full rounded-md bg-background"
            />
          )}
          {!canImage && !canVideo && !canIframe && (
            <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm">该文件类型暂不支持预览</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => onDownload(item)}>
                <Download className="mr-2 size-4" />
                下载文件
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
