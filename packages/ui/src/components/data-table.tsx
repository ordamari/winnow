import type { ReactNode } from "react"

import { Skeleton } from "@winnow/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@winnow/ui/components/table"

export function DataTable({
  columns,
  rows,
  loading = false,
  emptyTitle = "No results",
}: {
  columns: { key: string; header: string }[]
  rows: Array<Record<string, ReactNode>>
  loading?: boolean
  emptyTitle?: string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : null}
        {!loading && rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-16 text-center text-muted-foreground"
            >
              {emptyTitle}
            </TableCell>
          </TableRow>
        ) : null}
        {!loading
          ? rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{row[column.key]}</TableCell>
                ))}
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  )
}
