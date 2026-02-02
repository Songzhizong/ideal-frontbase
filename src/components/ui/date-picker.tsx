import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
	value?: Date | undefined
	onChange: (date: Date | undefined) => void
	placeholder?: string
	className?: string
	clearable?: boolean
}

export function DatePicker({
	value,
	onChange,
	placeholder = "选择日期",
	className,
	clearable = true,
}: DatePickerProps) {
	return (
		<Popover>
			<div className="relative inline-flex">
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"h-9 w-48 justify-start text-left font-normal whitespace-nowrap pr-8",
							!value && "text-muted-foreground",
							className,
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						<span className="truncate">
							{value ? format(value, "yyyy-MM-dd", { locale: zhCN }) : placeholder}
						</span>
					</Button>
				</PopoverTrigger>
				{value && clearable ? (
					<button
						type="button"
						aria-label="清除日期"
						className="absolute right-2 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60"
						onClick={(event) => {
							event.stopPropagation()
							onChange(undefined)
						}}
					>
						<X className="size-3" />
					</button>
				) : null}
			</div>
			<PopoverContent className="w-auto p-0">
				<Calendar mode="single" selected={value} onSelect={onChange} required={false} />
			</PopoverContent>
		</Popover>
	)
}
