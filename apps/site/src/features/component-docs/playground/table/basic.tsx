import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui"

const rows = [
  { name: "auth-service", owner: "平台组", status: "运行中" },
  { name: "order-service", owner: "交易组", status: "运行中" },
  { name: "billing-service", owner: "计费组", status: "维护中" },
]

export function TableBasicDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>服务名</TableHead>
          <TableHead>负责人</TableHead>
          <TableHead>状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TableBasicDemo
