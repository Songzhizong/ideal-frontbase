import { Download, Eye, FolderInput, Link, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FileManagerItem } from "../types"

export interface FileBrowserItemActionHandlers {
	onOpenItem: (item: FileManagerItem) => void
	onDownloadItem: (item: FileManagerItem) => void
	onRenameItem: (item: FileManagerItem) => void
	onMoveItem: (item: FileManagerItem) => void
	onCopyLink: (item: FileManagerItem) => void
	onDeleteItem: (item: FileManagerItem) => void
	onRecoverItem: (item: FileManagerItem) => void
	onHardDeleteItem: (item: FileManagerItem) => void
}

interface ActionCellProps extends FileBrowserItemActionHandlers {
	item: FileManagerItem
	isRecycleBin: boolean
}

export const ActionCell = memo(function ActionCell({
	item,
	isRecycleBin,
	onOpenItem,
	onDownloadItem,
	onRenameItem,
	onMoveItem,
	onCopyLink,
	onDeleteItem,
	onRecoverItem,
	onHardDeleteItem,
}: ActionCellProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<MoreHorizontal className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onSelect={() => onOpenItem(item)}>
					<Eye className="mr-2 size-4" />
					{item.kind === "folder" ? "打开" : "预览"}
				</DropdownMenuItem>
				{item.kind === "file" && (
					<DropdownMenuItem onSelect={() => onDownloadItem(item)}>
						<Download className="mr-2 size-4" />
						下载
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => onRenameItem(item)}>
					<Pencil className="mr-2 size-4" />
					重命名
				</DropdownMenuItem>
				{item.kind === "file" && (
					<DropdownMenuItem onSelect={() => onMoveItem(item)}>
						<FolderInput className="mr-2 size-4" />
						移动到...
					</DropdownMenuItem>
				)}
				{item.kind === "file" && (
					<DropdownMenuItem onSelect={() => onCopyLink(item)}>
						<Link className="mr-2 size-4" />
						复制链接
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				{isRecycleBin ? (
					<>
						<DropdownMenuItem onSelect={() => onRecoverItem(item)}>恢复</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onSelect={() => onHardDeleteItem(item)}
						>
							彻底删除
						</DropdownMenuItem>
					</>
				) : (
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onSelect={() => onDeleteItem(item)}
					>
						<Trash2 className="mr-2 size-4" />
						删除
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
})
