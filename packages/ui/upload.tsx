import { FileUpIcon, RefreshCcwIcon, Trash2Icon, UploadIcon } from "lucide-react"
import type * as React from "react"
import { useId, useState } from "react"
import {
  type UploadFileItem,
  type UploadRejectedFile,
  type UseUploadOptions,
  useUpload,
} from "@/packages/hooks-core"
import { cn } from "@/packages/ui-utils"
import { Button, type ButtonProps } from "./button"
import { Progress } from "./progress"

type UploadSharedProps<TResponse> = Omit<UseUploadOptions<TResponse>, "onUpload"> & {
  onUpload: UseUploadOptions<TResponse>["onUpload"]
  disabled?: boolean | undefined
  listClassName?: string | undefined
  emptyText?: React.ReactNode | undefined
}

export interface UploadProps<TResponse = unknown>
  extends Omit<ButtonProps, "onCopy">,
    UploadSharedProps<TResponse> {
  triggerLabel?: React.ReactNode
}

export interface UploadDraggerProps<TResponse = unknown>
  extends Omit<React.ComponentProps<"button">, "children" | "title">,
    UploadSharedProps<TResponse> {
  title?: React.ReactNode | undefined
  description?: React.ReactNode | undefined
}

interface UploadListProps<TResponse> {
  fileList: UploadFileItem<TResponse>[]
  rejectedFiles: UploadRejectedFile[]
  autoUpload: boolean
  disabled: boolean
  listClassName?: string | undefined
  emptyText?: React.ReactNode | undefined
  onUploadNow: (id: string) => void
  onRetry: (id: string) => void
  onRemove: (id: string) => void
}

const STATUS_LABEL_MAP = {
  queued: "待上传",
  uploading: "上传中",
  success: "上传成功",
  error: "上传失败",
} as const

function formatFileSize(size: number) {
  const units = ["B", "KB", "MB", "GB"]
  let currentSize = size
  let unitIndex = 0

  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024
    unitIndex += 1
  }

  const fixed = currentSize >= 100 ? 0 : currentSize >= 10 ? 1 : 2
  return `${currentSize.toFixed(fixed)} ${units[unitIndex]}`
}

function UploadList<TResponse>({
  fileList,
  rejectedFiles,
  autoUpload,
  disabled,
  listClassName,
  emptyText = "暂无上传文件",
  onUploadNow,
  onRetry,
  onRemove,
}: UploadListProps<TResponse>) {
  return (
    <div className={cn("space-y-2", listClassName)}>
      {fileList.length === 0 ? (
        <p className="rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-2">
          {fileList.map((item) => (
            <li key={item.id} className="rounded-lg border border-border/50 bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)} · {STATUS_LABEL_MAP[item.status]}
                  </p>
                  {item.error ? <p className="text-xs text-error">{item.error}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!autoUpload && item.status === "queued" ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => onUploadNow(item.id)}
                      disabled={disabled}
                      className="cursor-pointer"
                    >
                      <UploadIcon aria-hidden className="size-3.5" />
                      开始上传
                    </Button>
                  ) : null}
                  {item.status === "error" ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => onRetry(item.id)}
                      disabled={disabled}
                      className="cursor-pointer"
                    >
                      <RefreshCcwIcon aria-hidden className="size-3.5" />
                      重试
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="xs"
                    shape="square"
                    variant="ghost"
                    onClick={() => onRemove(item.id)}
                    disabled={disabled}
                    className="cursor-pointer"
                    aria-label={`移除 ${item.name}`}
                  >
                    <Trash2Icon aria-hidden className="size-3.5" />
                  </Button>
                </div>
              </div>
              {item.status !== "queued" ? (
                <Progress
                  className="mt-2 h-1.5"
                  value={item.status === "success" ? 100 : item.progress}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {rejectedFiles.length > 0 ? (
        <div
          role="alert"
          className="rounded-md border border-warning/40 bg-warning-subtle px-3 py-2 text-xs text-warning-on-subtle"
        >
          {rejectedFiles.map((item) => (
            <p key={`${item.file.name}-${item.reason}`}>{item.message}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function Upload<TResponse = unknown>({
  accept,
  multiple,
  maxSize,
  maxCount,
  fileList,
  defaultFileList,
  onFileListChange,
  onReject,
  onRemove,
  onUpload,
  autoUpload = true,
  concurrency,
  disabled = false,
  listClassName,
  emptyText,
  triggerLabel = "上传文件",
  children,
  className,
  onClick,
  type = "button",
  ...props
}: UploadProps<TResponse>) {
  const inputId = useId()
  const {
    fileList: resolvedFileList,
    rejectedFiles,
    addFiles,
    removeFile,
    retryFile,
    uploadFile,
  } = useUpload({
    accept,
    multiple,
    maxSize,
    maxCount,
    fileList,
    defaultFileList,
    onFileListChange,
    onReject,
    onRemove,
    onUpload,
    autoUpload,
    concurrency,
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) {
      return
    }
    addFiles(selectedFiles)
    event.currentTarget.value = ""
  }

  const openFilePicker = () => {
    const input = document.getElementById(inputId)
    if (input instanceof HTMLInputElement) {
      input.click()
    }
  }

  const handleRemove = (id: string) => {
    void removeFile(id)
  }

  return (
    <div data-slot="upload" className={cn("space-y-3", className)}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type={type}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || disabled) {
            return
          }
          openFilePicker()
        }}
        disabled={disabled}
        className="cursor-pointer"
        {...props}
      >
        <FileUpIcon aria-hidden className="size-4" />
        {children ?? triggerLabel}
      </Button>
      <UploadList
        fileList={resolvedFileList}
        rejectedFiles={rejectedFiles}
        autoUpload={autoUpload}
        disabled={disabled}
        listClassName={listClassName}
        emptyText={emptyText}
        onUploadNow={uploadFile}
        onRetry={retryFile}
        onRemove={handleRemove}
      />
    </div>
  )
}

export function UploadDragger<TResponse = unknown>({
  accept,
  multiple,
  maxSize,
  maxCount,
  fileList,
  defaultFileList,
  onFileListChange,
  onReject,
  onRemove,
  onUpload,
  autoUpload = true,
  concurrency,
  disabled = false,
  listClassName,
  emptyText,
  title = "拖拽文件到此处上传",
  description = "也可以点击选择文件",
  className,
  onKeyDown,
  onClick,
  ...props
}: UploadDraggerProps<TResponse>) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const {
    fileList: resolvedFileList,
    rejectedFiles,
    addFiles,
    removeFile,
    retryFile,
    uploadFile,
  } = useUpload({
    accept,
    multiple,
    maxSize,
    maxCount,
    fileList,
    defaultFileList,
    onFileListChange,
    onReject,
    onRemove,
    onUpload,
    autoUpload,
    concurrency,
  })

  const openFilePicker = () => {
    const input = document.getElementById(inputId)
    if (input instanceof HTMLInputElement) {
      input.click()
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) {
      return
    }
    addFiles(selectedFiles)
    event.currentTarget.value = ""
  }

  const handleRemove = (id: string) => {
    void removeFile(id)
  }

  return (
    <div data-slot="upload-dragger" className="space-y-3">
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        disabled={disabled}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (disabled) {
            return
          }
          if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files)
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || disabled) {
            return
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openFilePicker()
          }
        }}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || disabled) {
            return
          }
          openFilePicker()
        }}
        className={cn(
          "cursor-pointer rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "border-primary/60 bg-primary/10" : "",
          disabled ? "cursor-not-allowed opacity-60" : "",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full border border-border/50 bg-background">
          <FileUpIcon aria-hidden className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </button>
      <UploadList
        fileList={resolvedFileList}
        rejectedFiles={rejectedFiles}
        autoUpload={autoUpload}
        disabled={disabled}
        listClassName={listClassName}
        emptyText={emptyText}
        onUploadNow={uploadFile}
        onRetry={retryFile}
        onRemove={handleRemove}
      />
    </div>
  )
}
