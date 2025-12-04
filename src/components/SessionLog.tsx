import * as React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DashboardData, PizzaRecord } from "@/hooks/usePizzaData";
import { ArrowUpDown } from "lucide-react";

export function SessionLog({ data }: { data: DashboardData }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const columns: ColumnDef<PizzaRecord>[] = [
        {
            accessorKey: "date",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent hover:text-primary"
                    >
                        Datum
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = row.getValue("date") as Date;
                return <div className="font-mono text-slate-300">{date.toLocaleDateString('nl-NL')}</div>
            },
        },
        {
            accessorKey: "player",
            header: "Speler",
            cell: ({ row }) => <div className="font-medium text-slate-200">{row.getValue("player")}</div>,
        },
        {
            accessorKey: "points",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent hover:text-primary"
                    >
                        Punten
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const points = row.getValue("points") as number;
                return (
                    <div className={`font-mono font-bold ${points > 0 ? "text-green-400" : "text-slate-500"}`}>
                        {points}
                    </div>
                )
            },
        },
    ];

    // Filter only records with points > 0 for the log, similar to original
    const tableData = React.useMemo(() =>
        [...data.records].filter(r => r.points > 0).sort((a, b) => b.date.getTime() - a.date.getTime()),
        [data.records]
    );

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <Card className="glass border-none">
            <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-widest text-primary">Sessie Logboek</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-700/50 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-800/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-slate-700/50 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-slate-400">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                                        Geen resultaten.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Vorige
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Volgende
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
