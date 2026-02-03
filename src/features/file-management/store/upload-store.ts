"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UploadStatus =
	| "pending"
	| "uploading"
	| "paused"
	| "completed"
	| "failed"
	| "interrupted"

export interface UploadTask {
	id: string
	uploadId?: string
	fileHash?: string
	distinctId?: string
	fileName: string
	fileSize: number
	uploadedBytes: number
	progress: number
	status: UploadStatus
	speed: number | null
	catalogId: string | null
	createdTime: number
	errorMessage: string | null
}

interface UploadStoreState {
	uploadTasks: UploadTask[]
	isUploadWidgetExpanded: boolean
	addUploadTask: (task: UploadTask) => void
	updateUploadProgress: (
		id: string,
		progress: number,
		uploadedBytes: number,
		speed?: number,
	) => void
	setUploadStatus: (id: string, status: UploadStatus, errorMessage?: string) => void
	setUploadId: (id: string, uploadId: string) => void
	removeUploadTask: (id: string) => void
	clearCompletedTasks: () => void
	toggleUploadWidget: () => void
}

export const useUploadStore = create<UploadStoreState>()(
	persist(
		(set) => ({
			uploadTasks: [],
			isUploadWidgetExpanded: true,
			addUploadTask: (task) =>
				set((state) => ({
					uploadTasks: [...state.uploadTasks, task],
				})),
			updateUploadProgress: (id, progress, uploadedBytes, speed) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id
							? {
									...task,
									progress,
									uploadedBytes,
									speed: speed ?? null,
								}
							: task,
					),
				})),
			setUploadStatus: (id, status, errorMessage) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id ? { ...task, status, errorMessage: errorMessage ?? null } : task,
					),
				})),
			setUploadId: (id, uploadId) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id ? { ...task, uploadId } : task,
					),
				})),
			removeUploadTask: (id) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.filter((task) => task.id !== id),
				})),
			clearCompletedTasks: () =>
				set((state) => ({
					uploadTasks: state.uploadTasks.filter(
						(task) => task.status !== "completed" && task.status !== "failed",
					),
				})),
			toggleUploadWidget: () =>
				set((state) => ({
					isUploadWidgetExpanded: !state.isUploadWidgetExpanded,
				})),
		}),
		{
			name: "file-manager-upload",
			partialize: (state) => ({
				uploadTasks: state.uploadTasks,
				isUploadWidgetExpanded: state.isUploadWidgetExpanded,
			}),
			onRehydrateStorage: () => (state) => {
				if (!state) return
				state.uploadTasks = state.uploadTasks.map((task) => {
					if (
						task.status === "uploading" ||
						task.status === "pending" ||
						task.status === "paused"
					) {
						return { ...task, status: "interrupted" }
					}
					return task
				})
			},
		},
	),
)
