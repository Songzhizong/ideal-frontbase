import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageOffIcon,
  LoaderCircleIcon,
  SearchIcon,
} from "lucide-react"
import type * as React from "react"
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"
import { Dialog, DialogContent } from "./dialog"
import { Skeleton } from "./skeleton"

interface ImagePreviewItem {
  id: string
  src: string
  alt?: string | undefined
}

interface ImagePreviewGroupContextValue {
  register: (item: ImagePreviewItem) => void
  unregister: (id: string) => void
  openPreview: (id: string) => void
}

const ImagePreviewGroupContext = createContext<ImagePreviewGroupContextValue | null>(null)

export interface ImageProps extends Omit<React.ComponentProps<"img">, "src" | "placeholder"> {
  src: string
  fallback?: string | React.ReactNode | undefined
  preview?: boolean | undefined
  lazy?: boolean | undefined
  placeholder?: React.ReactNode | undefined
  containerClassName?: string | undefined
}

export interface ImagePreviewGroupProps extends React.ComponentProps<"div"> {
  children: React.ReactNode
}

function PreviewDialogImage({ src, alt }: { src: string; alt?: string | undefined }) {
  return (
    <div className="flex max-h-[80vh] w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40">
      <img
        src={src}
        alt={alt ?? "preview"}
        className="max-h-[80vh] w-auto max-w-full object-contain"
      />
    </div>
  )
}

function useLazyLoad(shouldLazy: boolean) {
  const [inView, setInView] = useState(!shouldLazy)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!shouldLazy || inView) {
      return
    }
    const target = containerRef.current
    if (!target) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "120px" },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [inView, shouldLazy])

  return { inView, containerRef }
}

function FallbackContent({ fallback }: { fallback?: string | React.ReactNode | undefined }) {
  if (!fallback) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-1 text-xs text-muted-foreground">
        <ImageOffIcon aria-hidden className="size-4" />
        加载失败
      </div>
    )
  }
  if (typeof fallback === "string") {
    return <img src={fallback} alt="fallback" className="h-full w-full object-cover" />
  }
  return <>{fallback}</>
}

export function Image({
  src,
  alt,
  fallback,
  preview = false,
  lazy = false,
  placeholder,
  containerClassName,
  className,
  loading,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const groupContext = useContext(ImagePreviewGroupContext)
  const imageId = useId()
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { inView, containerRef } = useLazyLoad(lazy)

  useEffect(() => {
    if (!groupContext || !preview) {
      return
    }
    groupContext.register({ id: imageId, src, alt })
    return () => {
      groupContext.unregister(imageId)
    }
  }, [alt, groupContext, imageId, preview, src])

  useEffect(() => {
    if (!src) {
      setLoaded(false)
      setErrored(false)
      return
    }
    setLoaded(false)
    setErrored(false)
  }, [src])

  const shouldDisplayImage = !lazy || inView
  const displayPlaceholder = !loaded && !errored

  const content = errored ? (
    <FallbackContent fallback={fallback} />
  ) : (
    <>
      {displayPlaceholder ? (
        <div className="absolute inset-0">
          {placeholder ?? <Skeleton className="h-full w-full rounded-md" />}
        </div>
      ) : null}
      {shouldDisplayImage ? (
        <img
          src={src}
          alt={alt}
          loading={loading ?? (lazy ? "lazy" : undefined)}
          className={cn("h-full w-full object-cover", className)}
          onLoad={(event) => {
            setLoaded(true)
            onLoad?.(event)
          }}
          onError={(event) => {
            setErrored(true)
            onError?.(event)
          }}
          {...props}
        />
      ) : null}
      {!shouldDisplayImage ? (
        <div className="absolute inset-0">
          {placeholder ?? <Skeleton className="h-full w-full rounded-md" />}
        </div>
      ) : null}
    </>
  )

  const canPreview = preview && !errored

  return (
    <div
      ref={containerRef}
      data-slot="image"
      className={cn(
        "relative inline-flex overflow-hidden rounded-md bg-muted/30",
        containerClassName,
      )}
    >
      {canPreview ? (
        <button
          type="button"
          className="group relative h-full w-full cursor-zoom-in overflow-hidden"
          onClick={() => {
            if (groupContext) {
              groupContext.openPreview(imageId)
              return
            }
            setPreviewOpen(true)
          }}
        >
          {content}
          <span className="absolute inset-0 hidden items-center justify-center bg-overlay/35 text-background transition group-hover:flex">
            <SearchIcon aria-hidden className="size-5" />
          </span>
        </button>
      ) : (
        content
      )}

      {!groupContext ? (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl p-3" showCloseButton>
            <PreviewDialogImage src={src} alt={alt} />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}

export function ImagePreviewGroup({ children, className, ...props }: ImagePreviewGroupProps) {
  const [items, setItems] = useState<ImagePreviewItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeIndex = useMemo(
    () => items.findIndex((item) => item.id === activeId),
    [activeId, items],
  )
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null

  const contextValue = useMemo<ImagePreviewGroupContextValue>(
    () => ({
      register: (item) => {
        setItems((prev) => {
          const index = prev.findIndex((current) => current.id === item.id)
          if (index < 0) {
            return [...prev, item]
          }
          const next = [...prev]
          next[index] = item
          return next
        })
      },
      unregister: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
        setActiveId((prev) => (prev === id ? null : prev))
      },
      openPreview: (id) => {
        setActiveId(id)
      },
    }),
    [],
  )

  const showPreview = activeItem !== null

  return (
    <ImagePreviewGroupContext value={contextValue}>
      <div data-slot="image-preview-group" className={cn(className)} {...props}>
        {children}
      </div>
      <Dialog open={showPreview} onOpenChange={(open) => (!open ? setActiveId(null) : undefined)}>
        <DialogContent className="max-w-5xl p-3" showCloseButton>
          {activeItem ? <PreviewDialogImage src={activeItem.src} alt={activeItem.alt} /> : null}
          {items.length > 1 ? (
            <div className="mt-3 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  if (items.length === 0 || activeIndex < 0) {
                    return
                  }
                  const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1
                  setActiveId(items[nextIndex]?.id ?? null)
                }}
              >
                <ChevronLeftIcon aria-hidden className="size-4" />
                上一张
              </Button>
              <span className="text-xs text-muted-foreground">
                {Math.max(activeIndex + 1, 1)} / {items.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  if (items.length === 0 || activeIndex < 0) {
                    return
                  }
                  const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1
                  setActiveId(items[nextIndex]?.id ?? null)
                }}
              >
                下一张
                <ChevronRightIcon aria-hidden className="size-4" />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </ImagePreviewGroupContext>
  )
}

export function ImageLoading({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center text-muted-foreground",
        className,
      )}
    >
      <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
    </div>
  )
}
