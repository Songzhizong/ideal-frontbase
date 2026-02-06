import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, RotateCcw } from "lucide-react"
import { parseAsString } from "nuqs"
import { useMemo } from "react"
import {
	DataTablePagination,
	DataTableRoot,
	DataTableTable,
	remote,
	stateUrl,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const STATUSES = ["active", "paused", "archived"] as const
const STATUS_OPTIONS = [
	{ value: "all", label: "All statuses" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "archived", label: "Archived" },
	{ value: "empty", label: "Empty" },
] as const

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
})

interface DemoRow {
	id: string
	name: string
	owner: string
	status: (typeof STATUSES)[number]
	amount: number
	updatedAt: string
}

interface DemoFilters {
	q: string
	status: string
}

interface DemoResponse {
	rows: DemoRow[]
	total: number
	pageCount: number
}

const DEMO_ROWS = createDemoRows(137)

function createDemoRows(count: number): DemoRow[] {
	const owners = ["Avery", "Jordan", "Casey", "Riley", "Morgan"]
	const rows: DemoRow[] = []

	for (let index = 0; index < count; index += 1) {
		const id = String(index + 1).padStart(4, "0")
		rows.push({
			id: `INV-${id}`,
			name: `Invoice ${id}`,
			owner: owners[index % owners.length] ?? "Unknown",
			status: STATUSES[index % STATUSES.length] ?? "active",
			amount: 1200 + (index * 37) % 9000,
			updatedAt: new Date(Date.UTC(2024, 0, 1 + index)).toISOString(),
		})
	}

	return rows
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

function applyFilters(rows: DemoRow[], filters: DemoFilters): DemoRow[] {
	if (filters.status === "empty") return []

	let next = rows
	if (filters.status && filters.status !== "all") {
		next = next.filter((row) => row.status === filters.status)
	}

	const query = filters.q.trim().toLowerCase()
	if (!query) return next

	return next.filter((row) => {
		return (
			row.id.toLowerCase().includes(query) ||
			row.name.toLowerCase().includes(query) ||
			row.owner.toLowerCase().includes(query)
		)
	})
}

type SortableField = "id" | "name" | "amount" | "status" | "updatedAt"

function isSortableField(value: string): value is SortableField {
	return (
		value === "id" ||
		value === "name" ||
		value === "amount" ||
		value === "status" ||
		value === "updatedAt"
	)
}

function compareValues(left: string | number, right: string | number): number {
	if (typeof left === "number" && typeof right === "number") {
		return left - right
	}
	return String(left).localeCompare(String(right))
}

function applySort(
	rows: DemoRow[],
	sort: { field: string; order: "asc" | "desc" } | null,
): DemoRow[] {
	if (!sort || !isSortableField(sort.field)) return rows

	const direction = sort.order === "asc" ? 1 : -1
	const sorted = [...rows]
	const field = sort.field

	sorted.sort((left, right) => {
		const result = compareValues(left[field], right[field])
		return result * direction
	})

	return sorted
}

function paginate(rows: DemoRow[], page: number, size: number): DemoResponse {
	const safeSize = Math.max(1, size)
	const safePage = Math.max(1, page)
	const total = rows.length
	const pageCount = total === 0 ? 0 : Math.ceil(total / safeSize)
	const start = (safePage - 1) * safeSize
	const paged = rows.slice(start, start + safeSize)

	return {
		rows: paged,
		total,
		pageCount,
	}
}

async function fetchDemoRows(args: {
	page: number
	size: number
	sort: { field: string; order: "asc" | "desc" }[]
	filters: DemoFilters
}): Promise<DemoResponse> {
	await delay(650)
	const filtered = applyFilters(DEMO_ROWS, args.filters)
	const sorted = applySort(filtered, args.sort[0] ?? null)
	return paginate(sorted, args.page, args.size)
}

function SortableHeader({
	column,
	label,
}: {
	column: Column<DemoRow, unknown>
	label: string
}) {
	const canSort = column.getCanSort()
	const sorted = column.getIsSorted()
	const icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
	const Icon = canSort ? icon : ArrowUpDown

	return (
		<button
			type="button"
			className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1 px-2")}
			onClick={column.getToggleSortingHandler()}
			disabled={!canSort}
		>
			<span>{label}</span>
			<Icon className="h-3.5 w-3.5 text-muted-foreground" />
		</button>
	)
}

export function TableV2DemoPage() {
	const state = stateUrl({
		key: "table_v2_demo",
		parsers: {
			q: parseAsString.withDefault(""),
			status: parseAsString.withDefault("all"),
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoRow, DemoFilters, DemoResponse>({
			queryKey: ["table-v2-demo"],
			queryFn: fetchDemoRows,
			map: (response) => ({
				rows: response.rows,
				pageCount: response.pageCount,
				total: response.total,
			}),
		})
	}, [])

	const columns = useMemo<ColumnDef<DemoRow>[]>(
		() => [
			{
				accessorKey: "id",
				header: ({ column }) => <SortableHeader column={column} label="ID" />,
				cell: ({ row }) => row.original.id,
				enableSorting: true,
			},
			{
				accessorKey: "name",
				header: ({ column }) => <SortableHeader column={column} label="Name" />,
				cell: ({ row }) => row.original.name,
				enableSorting: true,
			},
			{
				accessorKey: "owner",
				header: "Owner",
				cell: ({ row }) => row.original.owner,
			},
			{
				accessorKey: "status",
				header: ({ column }) => <SortableHeader column={column} label="Status" />,
				cell: ({ row }) => (
					<Badge variant="secondary" className="capitalize">
						{row.original.status}
					</Badge>
				),
				enableSorting: true,
			},
			{
				accessorKey: "amount",
				header: ({ column }) => <SortableHeader column={column} label="Amount" />,
				cell: ({ row }) => currencyFormatter.format(row.original.amount),
				enableSorting: true,
			},
			{
				accessorKey: "updatedAt",
				header: ({ column }) => <SortableHeader column={column} label="Updated" />,
				cell: ({ row }) => row.original.updatedAt.slice(0, 10),
				enableSorting: true,
			},
		],
		[],
	)

	const dt = useDataTable<DemoRow, DemoFilters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
	})

	const filters = dt.filters.state

	return (
		<div className="flex flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Table V2 Demo</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
						<div className="grid gap-2">
							<Label htmlFor="table-v2-search">Search</Label>
							<Input
								id="table-v2-search"
								placeholder="Search by id, name, or owner"
								value={filters.q}
								onChange={(event) => dt.filters.set("q", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="table-v2-status">Status</Label>
							<Select
								value={filters.status}
								onValueChange={(value) => dt.filters.set("status", value)}
							>
								<SelectTrigger id="table-v2-status">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => dt.filters.reset()}
							>
								<RotateCcw className="h-4 w-4" />
								Reset filters
							</Button>
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => dt.actions.resetAll()}
							>
								<RotateCcw className="h-4 w-4" />
								Reset state
							</Button>
							<Button className="gap-2" onClick={() => dt.actions.refetch()}>
								<RefreshCw className="h-4 w-4" />
								Refetch
							</Button>
						</div>
					</div>
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>Tip: choose Status = "Empty" or search for "no-match".</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Results</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<DataTableRoot
						dt={dt}
						layout={{ stickyHeader: true, stickyPagination: true }}
					>
						<div className="overflow-x-auto">
							<DataTableTable />
						</div>
						<DataTablePagination />
					</DataTableRoot>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>State Snapshot</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="overflow-x-auto rounded-md border border-border/50 bg-muted/30 p-3 text-xs">
						{JSON.stringify(
							{
								status: dt.status,
								activity: dt.activity,
								pagination: dt.pagination,
								sort: dt.table.getState().sorting,
								filters: dt.filters.state,
							},
							null,
							2,
						)}
					</pre>
				</CardContent>
			</Card>
		</div>
	)
}
