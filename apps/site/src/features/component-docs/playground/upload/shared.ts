import type { UploadTaskContext } from "@/packages/hooks-core"

export async function mockUpload(file: File, context: UploadTaskContext) {
  let progress = 0

  while (progress < 100) {
    if (context.signal.aborted) {
      throw new DOMException("Upload aborted", "AbortError")
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 120)
    })

    progress = Math.min(progress + 20, 100)
    context.onProgress(progress)
  }

  return {
    url: `/uploads/${encodeURIComponent(file.name)}`,
    size: file.size,
  }
}
