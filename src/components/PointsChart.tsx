import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/usePizzaData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = [
    '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316',
    '#ec4899', '#14b8a6', '#84cc16', '#d946ef', '#0ea5e9', '#f43f5e'
];

export function PointsChart({ data }: { data: DashboardData }) {
    const { sessionsByDate, totals } = data;
    const dates = Object.keys(sessionsByDate).sort();
    const players = Object.keys(totals);

    const accumulatedData: any[] = [];
    const currentTotals: Record<string, number> = {};

    dates.forEach(date => {
        const entry: any = { date: new Date(date).toLocaleDateString() };
        players.forEach(player => {
            const points = sessionsByDate[date][player] || 0;
            currentTotals[player] = (currentTotals[player] || 0) + points;
            entry[player] = currentTotals[player];
        });
        accumulatedData.push(entry);
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Puntenverloop</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={accumulatedData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" className="text-xs" stroke="#888888" />
                            <YAxis className="text-xs" stroke="#888888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend />
                            {players.map((player, index) => (
                                <Line
                                    key={player}
                                    type="monotone"
                                    dataKey={player}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
