import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useUpload } from "./use-upload"

function createFile(name: string, content = "hello", type = "text/plain") {
  return new File([content], name, { type })
}

describe("useUpload", () => {
  it("添加文件后会自动上传并更新进度", async () => {
    const onUpload = vi.fn(
      async (_file: File, context: { onProgress: (progress: number) => void }) => {
        context.onProgress(35)
        context.onProgress(100)
        return { url: "https://example.com/file.txt" }
      },
    )

    const { result } = renderHook(() =>
      useUpload({
        onUpload,
      }),
    )

    act(() => {
      result.current.addFiles([createFile("demo.txt")])
    })

    await waitFor(() => {
      expect(result.current.fileList[0]?.status).toBe("success")
    })

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(result.current.fileList[0]?.progress).toBe(100)
  })

  it("超出大小限制时会进入 rejectedFiles", () => {
    const onUpload = vi.fn(async () => ({ ok: true }))
    const { result } = renderHook(() =>
      useUpload({
        maxSize: 1,
        onUpload,
      }),
    )

    act(() => {
      result.current.addFiles([createFile("too-large.txt", "123")])
    })

    expect(result.current.fileList).toHaveLength(0)
    expect(result.current.rejectedFiles).toHaveLength(1)
    expect(result.current.rejectedFiles[0]?.reason).toBe("max-size")
    expect(onUpload).not.toHaveBeenCalled()
  })

  it("上传失败后可重试并成功", async () => {
    let shouldFail = true
    const onUpload = vi.fn(async () => {
      if (shouldFail) {
        shouldFail = false
        throw new Error("network error")
      }
      return { ok: true }
    })

    const { result } = renderHook(() =>
      useUpload({
        autoUpload: false,
        onUpload,
      }),
    )

    act(() => {
      result.current.addFiles([createFile("retry.txt")])
    })

    const targetId = result.current.fileList[0]?.id
    if (!targetId) {
      throw new Error("missing upload target")
    }

    act(() => {
      result.current.uploadFile(targetId)
    })

    await waitFor(() => {
      expect(result.current.fileList[0]?.status).toBe("error")
    })

    act(() => {
      result.current.retryFile(targetId)
      result.current.uploadFile(targetId)
    })

    await waitFor(() => {
      expect(result.current.fileList[0]?.status).toBe("success")
    })

    expect(onUpload).toHaveBeenCalledTimes(2)
  })
})
