import { Download, Eye, FolderInput, Link, Pencil, Trash2 } from "lucide-react"
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/packages/ui/context-menu"
import type { FileManagerItem } from "../types"
import type { FileBrowserItemActionHandlers } from "./file-browser-actions"

interface FileBrowserItemMenuContentProps extends FileBrowserItemActionHandlers {
  item: FileManagerItem
  isRecycleBin: boolean
}

export function FileBrowserItemMenuContent({
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
}: FileBrowserItemMenuContentProps) {
  return (
    <ContextMenuContent className="w-48">
      <ContextMenuItem onSelect={() => onOpenItem(item)}>
        <Eye className="mr-2 size-4" />
        {item.kind === "folder" ? "打开" : "预览"}
      </ContextMenuItem>
      {item.kind === "file" && (
        <ContextMenuItem onSelect={() => onDownloadItem(item)}>
          <Download className="mr-2 size-4" />
          下载
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => onRenameItem(item)}>
        <Pencil className="mr-2 size-4" />
        重命名
      </ContextMenuItem>
      {item.kind === "file" && (
        <ContextMenuItem onSelect={() => onMoveItem(item)}>
          <FolderInput className="mr-2 size-4" />
          移动到...
        </ContextMenuItem>
      )}
      {item.kind === "file" && (
        <ContextMenuItem onSelect={() => onCopyLink(item)}>
          <Link className="mr-2 size-4" />
          复制链接
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      {isRecycleBin ? (
        <>
          <ContextMenuItem onSelect={() => onRecoverItem(item)}>恢复</ContextMenuItem>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onHardDeleteItem(item)}
          >
            彻底删除
          </ContextMenuItem>
        </>
      ) : (
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDeleteItem(item)}
        >
          <Trash2 className="mr-2 size-4" />
          删除
        </ContextMenuItem>
      )}
    </ContextMenuContent>
  )
}
