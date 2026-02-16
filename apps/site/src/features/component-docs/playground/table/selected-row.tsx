import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui"

const rows = [
  { id: "s1", service: "gateway", env: "prod" },
  { id: "s2", service: "scheduler", env: "staging" },
  { id: "s3", service: "worker", env: "dev" },
]

export function TableSelectedRowDemo() {
  const [selectedId, setSelectedId] = useState("s2")

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>服务</TableHead>
          <TableHead>环境</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const selected = selectedId === row.id

          return (
            <TableRow
              key={row.id}
              data-state={selected ? "selected" : undefined}
              className="cursor-pointer"
              onClick={() => {
                setSelectedId(row.id)
              }}
            >
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.service}</TableCell>
              <TableCell>{row.env}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default TableSelectedRowDemo
