"use client"

import { useCallback, useRef } from "react"

import {
	fetchAbortMultipartUpload,
	fetchCompleteMultipartUpload,
	fetchInitMultipartUpload,
	fetchUploadFile,
	fetchUploadPart,
} from "../api/fss"
import { type UploadTask, useUploadStore } from "../store/upload-store"
import type { ETag } from "../types"

const CHUNK_SIZE = 5 * 1024 * 1024
const MAX_CONCURRENCY = 3

interface UploadOptions {
	bizType: string
	catalogId: string | null
	isPublic?: boolean
	onCompleted?: () => void
}

type UploadControllerMap = Map<string, AbortController>

function createTask(file: File, catalogId: string | null): UploadTask {
	const now = Date.now()
	return {
		id: `upload-${now}-${Math.random().toString(36).slice(2, 8)}`,
		fileName: file.name,
		fileSize: file.size,
		uploadedBytes: 0,
		progress: 0,
		status: "pending",
		speed: null,
		catalogId,
		createdTime: now,
		errorMessage: null,
	}
}

async function uploadParts(args: {
	file: File
	uploadId: string
	signal: AbortSignal
	onProgress: (uploadedBytes: number, totalBytes: number, speed: number) => void
}) {
	const { file, uploadId, signal, onProgress } = args
	const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
	const chunks: Array<{ partNumber: number; blob: Blob }> = []

	for (let index = 0; index < totalChunks; index += 1) {
		const start = index * CHUNK_SIZE
		const end = Math.min(file.size, start + CHUNK_SIZE)
		chunks.push({ partNumber: index + 1, blob: file.slice(start, end) })
	}

	let uploadedBytes = 0
	const etags: ETag[] = []
	const queue = [...chunks]

	const startTime = Date.now()
	const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, chunks.length) }, () =>
		(async () => {
			while (queue.length > 0) {
				const part = queue.shift()
				if (!part) return
				const result = await fetchUploadPart({
					uploadId,
					partNumber: part.partNumber,
					data: part.blob,
					signal,
				})
				etags.push({ partNumber: result.partNumber, eTag: result.eTag })
				uploadedBytes += part.blob.size
				const elapsedSeconds = Math.max((Date.now() - startTime) / 1000, 0.5)
				const speed = uploadedBytes / elapsedSeconds
				onProgress(uploadedBytes, file.size, speed)
			}
		})(),
	)
	await Promise.all(workers)
	return etags.sort((a, b) => a.partNumber - b.partNumber)
}

export function useFileUploadManager(options: UploadOptions) {
	const { bizType, catalogId, isPublic = false, onCompleted } = options
	const controllersRef = useRef<UploadControllerMap>(new Map())

	const { addUploadTask, updateUploadProgress, setUploadStatus, setUploadId, removeUploadTask } =
		useUploadStore()

	const startUpload = useCallback(
		async (file: File, overrideCatalogId?: string | null) => {
			const targetCatalogId = overrideCatalogId ?? catalogId
			const task = createTask(file, targetCatalogId ?? null)
			addUploadTask(task)
			setUploadStatus(task.id, "uploading")

			const controller = new AbortController()
			controllersRef.current.set(task.id, controller)

			const updateProgress = (uploadedBytes: number, totalBytes: number, speed: number) => {
				const progress = totalBytes === 0 ? 0 : Math.round((uploadedBytes / totalBytes) * 100)
				updateUploadProgress(task.id, progress, uploadedBytes, speed)
			}

			try {
				const uploadCatalogId = targetCatalogId ?? ""
				if (file.size <= CHUNK_SIZE) {
					await fetchUploadFile(bizType, uploadCatalogId, file, controller.signal)
					updateProgress(file.size, file.size, file.size)
					setUploadStatus(task.id, "completed")
					onCompleted?.()
					return
				}

				const initResp = await fetchInitMultipartUpload(bizType, uploadCatalogId, {
					originalName: file.name,
					contentType: file.type || "application/octet-stream",
					public: isPublic,
				})
				setUploadId(task.id, initResp.uploadId)

				const etags = await uploadParts({
					file,
					uploadId: initResp.uploadId,
					signal: controller.signal,
					onProgress: updateProgress,
				})

				await fetchCompleteMultipartUpload(bizType, uploadCatalogId, initResp.uploadId, { etags })
				updateProgress(file.size, file.size, file.size)
				setUploadStatus(task.id, "completed")
				onCompleted?.()
			} catch (_error) {
				if (controller.signal.aborted) {
					setUploadStatus(task.id, "paused")
					return
				}

				setUploadStatus(task.id, "failed", "上传失败")
			} finally {
				controllersRef.current.delete(task.id)
			}
		},
		[
			addUploadTask,
			bizType,
			catalogId,
			isPublic,
			onCompleted,
			setUploadId,
			setUploadStatus,
			updateUploadProgress,
		],
	)

	const startUploads = useCallback(
		(files: File[], targetCatalogId?: string | null) => {
			files.forEach((file) => {
				void startUpload(file, targetCatalogId)
			})
		},
		[startUpload],
	)

	const pauseUpload = useCallback(async (taskId: string) => {
		const controller = controllersRef.current.get(taskId)
		if (controller) {
			controller.abort()
		}
	}, [])

	const cancelUpload = useCallback(
		async (taskId: string, uploadId?: string) => {
			const controller = controllersRef.current.get(taskId)
			if (controller) {
				controller.abort()
			}
			if (uploadId) {
				await fetchAbortMultipartUpload(uploadId)
			}
			removeUploadTask(taskId)
		},
		[removeUploadTask],
	)

	const resumeUpload = useCallback(
		async (taskId: string, file: File, uploadId?: string, targetCatalogId?: string | null) => {
			if (uploadId) {
				await fetchAbortMultipartUpload(uploadId)
			}
			removeUploadTask(taskId)
			await startUpload(file, targetCatalogId)
		},
		[removeUploadTask, startUpload],
	)

	return {
		startUploads,
		pauseUpload,
		cancelUpload,
		resumeUpload,
	} as const
}
