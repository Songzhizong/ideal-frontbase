import { Plus } from "lucide-react"
import { motion } from "motion/react"

interface CreateProjectPlaceholderCardProps {
  onClick: () => void
}

export function CreateProjectPlaceholderCard({ onClick }: CreateProjectPlaceholderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[16.75rem] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-gradient-to-br from-background via-background to-primary/5 p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
    >
      <motion.span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground group-hover:text-primary"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Plus className="size-5" aria-hidden />
      </motion.span>
      <p className="mt-3 text-sm font-medium text-foreground">创建新项目</p>
      <p className="mt-1 max-w-52 text-xs text-muted-foreground">
        快速完成环境、配额策略与初始成员编排。
      </p>
    </button>
  )
}
