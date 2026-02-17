import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/packages/ui"

const rows = [
  { project: "Nexus", cost: 3200 },
  { project: "Infera", cost: 4600 },
  { project: "Site", cost: 1200 },
]

export function TableWithFooterDemo() {
  const total = rows.reduce((sum, row) => sum + row.cost, 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>项目</TableHead>
          <TableHead className="text-right">本月成本 ($)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.project}>
            <TableCell>{row.project}</TableCell>
            <TableCell className="text-right tabular-nums">{row.cost.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>合计</TableCell>
          <TableCell className="text-right tabular-nums">{total.toLocaleString()}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default TableWithFooterDemo
