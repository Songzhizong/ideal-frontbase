import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type UploadStatus = "queued" | "uploading" | "success" | "error"

export interface UploadFileItem<TResponse = unknown> {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: UploadStatus
  progress: number
  attempt: number
  error: string | null
  response?: TResponse
}

export type UploadRejectReason = "max-count" | "max-size" | "accept"

export interface UploadRejectedFile {
  file: File
  reason: UploadRejectReason
  message: string
}

export interface UploadTaskContext {
  signal: AbortSignal
  attempt: number
  onProgress: (progress: number) => void
}

export interface UseUploadOptions<TResponse = unknown> {
  accept?: string | undefined
  multiple?: boolean | undefined
  maxSize?: number | undefined
  maxCount?: number | undefined
  autoUpload?: boolean | undefined
  concurrency?: number | undefined
  fileList?: UploadFileItem<TResponse>[] | undefined
  defaultFileList?: UploadFileItem<TResponse>[] | undefined
  onFileListChange?: ((nextFileList: UploadFileItem<TResponse>[]) => void) | undefined
  onReject?: ((rejectedFiles: UploadRejectedFile[]) => void) | undefined
  onRemove?: ((file: UploadFileItem<TResponse>) => void | Promise<void>) | undefined
  onUpload: (file: File, context: UploadTaskContext) => Promise<TResponse>
}

type SetFileListAction<TResponse> = (
  current: UploadFileItem<TResponse>[],
) => UploadFileItem<TResponse>[]

function createUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `upload-${crypto.randomUUID()}`
  }
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeFiles(files: File[] | FileList) {
  return Array.from(files)
}

function isAcceptedFile(file: File, accept: string | undefined) {
  if (!accept || accept.trim().length === 0) {
    return true
  }

  const normalizedType = file.type.toLowerCase()
  const normalizedName = file.name.toLowerCase()
  const patterns = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0)

  if (patterns.length === 0) {
    return true
  }

  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) {
      return normalizedName.endsWith(pattern)
    }
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1)
      return normalizedType.startsWith(prefix)
    }
    return normalizedType === pattern
  })
}

function toUploadFileItem<TResponse = unknown>(file: File): UploadFileItem<TResponse> {
  return {
    id: createUploadId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: "queued",
    progress: 0,
    attempt: 0,
    error: null,
  }
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }
  return "上传失败，请重试。"
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}

function useControllableFileList<TResponse>({
  fileList,
  defaultFileList,
  onFileListChange,
}: Pick<UseUploadOptions<TResponse>, "fileList" | "defaultFileList" | "onFileListChange">) {
  const [internalFileList, setInternalFileList] = useState<UploadFileItem<TResponse>[]>(
    () => defaultFileList ?? [],
  )
  const isControlled = fileList !== undefined
  const resolvedFileList = isControlled ? fileList : internalFileList
  const resolvedFileListRef = useRef(resolvedFileList)

  useEffect(() => {
    resolvedFileListRef.current = resolvedFileList
  }, [resolvedFileList])

  const setFileList = useCallback(
    (next: UploadFileItem<TResponse>[] | SetFileListAction<TResponse>) => {
      const current = resolvedFileListRef.current
      const nextFileList = typeof next === "function" ? next(current) : next
      resolvedFileListRef.current = nextFileList

      if (!isControlled) {
        setInternalFileList(nextFileList)
      }

      onFileListChange?.(nextFileList)
    },
    [isControlled, onFileListChange],
  )

  return {
    fileList: resolvedFileList,
    fileListRef: resolvedFileListRef,
    setFileList,
  }
}

export interface UseUploadReturn<TResponse = unknown> {
  fileList: UploadFileItem<TResponse>[]
  rejectedFiles: UploadRejectedFile[]
  addFiles: (files: File[] | FileList) => UploadRejectedFile[]
  removeFile: (id: string) => Promise<void>
  retryFile: (id: string) => void
  uploadFile: (id: string) => void
  clear: () => Promise<void>
  uploading: boolean
  queuedCount: number
}

export function useUpload<TResponse = unknown>(
  options: UseUploadOptions<TResponse>,
): UseUploadReturn<TResponse> {
  const {
    accept,
    multiple = false,
    maxSize,
    maxCount,
    autoUpload = true,
    concurrency = 2,
    onReject,
    onRemove,
    onUpload,
  } = options

  const { fileList, fileListRef, setFileList } = useControllableFileList<TResponse>(options)
  const [rejectedFiles, setRejectedFiles] = useState<UploadRejectedFile[]>([])
  const uploadControllersRef = useRef(new Map<string, AbortController>())
  const onUploadRef = useRef(onUpload)

  useEffect(() => {
    onUploadRef.current = onUpload
  }, [onUpload])

  useEffect(
    () => () => {
      uploadControllersRef.current.forEach((controller) => {
        controller.abort()
      })
      uploadControllersRef.current.clear()
    },
    [],
  )

  const updateFileItem = useCallback(
    (id: string, updater: (item: UploadFileItem<TResponse>) => UploadFileItem<TResponse>) => {
      setFileList((current) => current.map((item) => (item.id === id ? updater(item) : item)))
    },
    [setFileList],
  )

  const runUpload = useCallback(
    async (id: string) => {
      const target = fileListRef.current.find((item) => item.id === id)
      if (!target || target.status === "uploading") {
        return
      }

      const controller = new AbortController()
      uploadControllersRef.current.set(id, controller)

      const attempt = target.attempt + 1
      updateFileItem(id, (item) => ({
        ...item,
        status: "uploading",
        attempt,
        error: null,
        progress: item.progress > 0 ? item.progress : 0,
      }))

      try {
        const response = await onUploadRef.current(target.file, {
          signal: controller.signal,
          attempt,
          onProgress: (progress) => {
            updateFileItem(id, (item) => ({
              ...item,
              progress: Math.min(Math.max(progress, 0), 100),
            }))
          },
        })

        updateFileItem(id, (item) => ({
          ...item,
          status: "success",
          progress: 100,
          error: null,
          response,
        }))
      } catch (error) {
        if (isAbortError(error)) {
          return
        }
        updateFileItem(id, (item) => ({
          ...item,
          status: "error",
          error: normalizeErrorMessage(error),
        }))
      } finally {
        uploadControllersRef.current.delete(id)
      }
    },
    [fileListRef, updateFileItem],
  )

  const addFiles = useCallback(
    (inputFiles: File[] | FileList) => {
      const files = normalizeFiles(inputFiles)
      const nextFiles = multiple ? files : files.slice(0, 1)
      const rejected: UploadRejectedFile[] = []
      const acceptedItems: UploadFileItem<TResponse>[] = []

      let remainingCount =
        maxCount === undefined ? Number.POSITIVE_INFINITY : maxCount - fileListRef.current.length

      for (const file of nextFiles) {
        if (remainingCount <= 0) {
          rejected.push({
            file,
            reason: "max-count",
            message: `最多只能上传 ${maxCount} 个文件。`,
          })
          continue
        }

        if (maxSize !== undefined && file.size > maxSize) {
          rejected.push({
            file,
            reason: "max-size",
            message: `文件 ${file.name} 超出大小限制。`,
          })
          continue
        }

        if (!isAcceptedFile(file, accept)) {
          rejected.push({
            file,
            reason: "accept",
            message: `文件 ${file.name} 类型不符合限制。`,
          })
          continue
        }

        acceptedItems.push(toUploadFileItem<TResponse>(file))
        remainingCount -= 1
      }

      if (acceptedItems.length > 0) {
        setFileList((current) => [...current, ...acceptedItems])
      }

      setRejectedFiles(rejected)
      onReject?.(rejected)
      return rejected
    },
    [accept, fileListRef, maxCount, maxSize, multiple, onReject, setFileList],
  )

  const removeFile = useCallback(
    async (id: string) => {
      const target = fileListRef.current.find((item) => item.id === id)
      if (!target) {
        return
      }

      const controller = uploadControllersRef.current.get(id)
      controller?.abort()
      uploadControllersRef.current.delete(id)

      setFileList((current) => current.filter((item) => item.id !== id))
      await onRemove?.(target)
    },
    [fileListRef, onRemove, setFileList],
  )

  const retryFile = useCallback(
    (id: string) => {
      setFileList((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "queued",
                error: null,
                progress: 0,
              }
            : item,
        ),
      )
    },
    [setFileList],
  )

  const uploadFile = useCallback(
    (id: string) => {
      const target = fileListRef.current.find((item) => item.id === id)
      if (!target) {
        return
      }

      if (target.status === "error") {
        retryFile(id)
        void runUpload(id)
        return
      }

      if (target.status === "queued") {
        void runUpload(id)
      }
    },
    [fileListRef, retryFile, runUpload],
  )

  const clear = useCallback(async () => {
    uploadControllersRef.current.forEach((controller) => {
      controller.abort()
    })
    uploadControllersRef.current.clear()

    const current = [...fileListRef.current]
    setFileList([])

    if (!onRemove) {
      return
    }
    await Promise.all(current.map((item) => onRemove(item)))
  }, [fileListRef, onRemove, setFileList])

  const queuedCount = useMemo(
    () => fileList.filter((item) => item.status === "queued").length,
    [fileList],
  )
  const uploading = useMemo(() => fileList.some((item) => item.status === "uploading"), [fileList])

  useEffect(() => {
    if (!autoUpload) {
      return
    }

    const currentList = fileList
    const activeCount = currentList.filter((item) => item.status === "uploading").length
    const queue = currentList.filter((item) => item.status === "queued")
    const availableSlots = Math.max(concurrency - activeCount, 0)

    if (availableSlots <= 0 || queue.length === 0) {
      return
    }

    queue.slice(0, availableSlots).forEach((item) => {
      void runUpload(item.id)
    })
  }, [autoUpload, concurrency, fileList, runUpload])

  return {
    fileList,
    rejectedFiles,
    addFiles,
    removeFile,
    retryFile,
    uploadFile,
    clear,
    uploading,
    queuedCount,
  }
}
