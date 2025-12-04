import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/usePizzaData";

export function HistoryTable({ data }: { data: DashboardData }) {
    const { records } = data;
    const activeRecords = [...records].filter(r => r.points > 0).reverse();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Overzicht per sessie</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[500px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Speler</TableHead>
                                <TableHead>Punten</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeRecords.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell>{r.date.toLocaleDateString()}</TableCell>
                                    <TableCell>{r.player}</TableCell>
                                    <TableCell>{r.points % 1 === 0 ? r.points : r.points.toFixed(1)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
