"use client"

import {
	AlertCircle,
	Check,
	ChevronDown,
	ChevronUp,
	Pause,
	Play,
	Trash2,
	Upload,
	X,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { type UploadTask, useUploadStore } from "../store/upload-store"
import { formatFileSize, formatSpeed } from "../utils/file-utils"

interface FileUploadWidgetProps {
	onPause: (taskId: string) => void
	onCancel: (taskId: string, uploadId?: string) => void
	onResume: (taskId: string, file: File, uploadId?: string, catalogId?: string | null) => void
}

function UploadTaskItem({
	task,
	onPause,
	onResume,
	onCancel,
}: {
	task: UploadTask
	onPause: () => void
	onResume: () => void
	onCancel: () => void
}) {
	const statusInfo = (() => {
		switch (task.status) {
			case "completed":
				return { icon: <Check className="size-4 text-primary" />, text: "上传完成" }
			case "failed":
				return {
					icon: <AlertCircle className="size-4 text-destructive" />,
					text: task.errorMessage ?? "上传失败",
				}
			case "paused":
				return { icon: <Pause className="size-4 text-muted-foreground" />, text: "已暂停" }
			case "interrupted":
				return {
					icon: <AlertCircle className="size-4 text-muted-foreground" />,
					text: "中断，需恢复",
				}
			default:
				return { icon: null, text: "上传中..." }
		}
	})()

	return (
		<div className="border-b border-border/50 px-4 py-3 last:border-b-0">
			<div className="flex items-center gap-3">
				<div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
					{task.status === "uploading" ? (
						<div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					) : (
						(statusInfo.icon ?? <Upload className="size-4" />)
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{task.fileName}</p>
					<p className="text-xs text-muted-foreground">
						{task.status === "uploading" && task.speed
							? `${formatFileSize(task.uploadedBytes)} / ${formatFileSize(task.fileSize)} • ${formatSpeed(task.speed)}`
							: task.status === "completed"
								? `${formatFileSize(task.fileSize)} • 上传完成`
								: task.status === "paused"
									? `${formatFileSize(task.uploadedBytes)} / ${formatFileSize(task.fileSize)} • 已暂停`
									: statusInfo.text}
					</p>
				</div>

				<div className="flex items-center gap-1">
					{task.status === "uploading" && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause}>
							<Pause className="size-3.5" />
						</Button>
					)}
					{(task.status === "paused" || task.status === "interrupted") && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onResume}>
							<Play className="size-3.5" />
						</Button>
					)}
					{task.status !== "completed" && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
							<X className="size-3.5" />
						</Button>
					)}
				</div>
			</div>

			{(task.status === "uploading" || task.status === "paused") && (
				<div className="ml-11 mt-2">
					<Progress value={task.progress} className="h-1" />
				</div>
			)}
		</div>
	)
}

export function FileUploadWidget({ onPause, onCancel, onResume }: FileUploadWidgetProps) {
	const { uploadTasks, isUploadWidgetExpanded, toggleUploadWidget, clearCompletedTasks } =
		useUploadStore()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [resumeTarget, setResumeTarget] = useState<UploadTask | null>(null)

	if (uploadTasks.length === 0) return null

	const activeUploads = uploadTasks.filter(
		(task) => task.status === "uploading" || task.status === "pending",
	)
	const finishedUploads = uploadTasks.filter(
		(task) => task.status === "completed" || task.status === "failed",
	)
	const totalProgress =
		activeUploads.length > 0
			? Math.round(
					activeUploads.reduce((acc, task) => acc + task.progress, 0) / activeUploads.length,
				)
			: 100

	return (
		<div className="fixed bottom-6 right-6 z-50">
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0]
					if (!file || !resumeTarget) return
					if (file.name !== resumeTarget.fileName || file.size !== resumeTarget.fileSize) {
						toast.error("文件不匹配，请选择原始文件")
						event.target.value = ""
						return
					}
					onResume(resumeTarget.id, file, resumeTarget.uploadId, resumeTarget.catalogId)
					setResumeTarget(null)
					event.target.value = ""
				}}
			/>
			<div
				className={cn(
					"overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg",
					isUploadWidgetExpanded ? "w-96" : "w-72",
				)}
			>
				{/** biome-ignore lint/a11y/useSemanticElements: 不这么用报错 */}
				<div
					role="button"
					tabIndex={0}
					onClick={toggleUploadWidget}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							toggleUploadWidget()
						}
					}}
					className="flex w-full cursor-pointer items-center justify-between bg-muted/40 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/60"
				>
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Upload className="size-4" />
						</div>
						<div>
							<p className="text-sm font-medium">
								{activeUploads.length > 0
									? `${activeUploads.length} 个任务进行中`
									: `${finishedUploads.length} 个任务已结束`}
							</p>
							{activeUploads.length > 0 && (
								<p className="text-xs text-muted-foreground">{totalProgress}%</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-1">
						{finishedUploads.length > 0 && (
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={(event) => {
									event.stopPropagation()
									clearCompletedTasks()
								}}
							>
								<Trash2 className="size-3.5" />
							</Button>
						)}
						{isUploadWidgetExpanded ? (
							<ChevronDown className="size-4" />
						) : (
							<ChevronUp className="size-4" />
						)}
					</div>
				</div>

				{!isUploadWidgetExpanded && activeUploads.length > 0 && (
					<Progress value={totalProgress} className="h-1 rounded-none" />
				)}

				{isUploadWidgetExpanded && (
					<div className="max-h-80 overflow-y-auto">
						{uploadTasks.map((task) => (
							<UploadTaskItem
								key={task.id}
								task={task}
								onPause={() => onPause(task.id)}
								onResume={() => {
									setResumeTarget(task)
									fileInputRef.current?.click()
								}}
								onCancel={() => onCancel(task.id, task.uploadId)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
