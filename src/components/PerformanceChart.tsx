import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/usePizzaData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "#ef4444", // Red
    "#eab308", // Yellow
    "#3b82f6", // Blue
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#8b5cf6", // Violet
];

export function PerformanceChart({ data }: { data: DashboardData }) {
    const { sessionsByDate, totals } = data;

    // Transform data for Recharts
    const dates = Object.keys(sessionsByDate).sort();
    const players = Object.keys(totals);

    // Calculate cumulative points over time
    const chartData = dates.map(date => {
        const point: any = { date };
        players.forEach(player => {
            // Calculate cumulative points up to this date
            let cumulative = 0;
            for (const d of dates) {
                if (d > date) break;
                cumulative += sessionsByDate[d]?.[player] || 0;
            }
            point[player] = cumulative;
        });
        return point;
    });

    return (
        <Card className="glass border-none">
            <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-widest text-primary">Puntenverloop</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] min-h-[400px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {players.map((player, index) => (
                                <Line
                                    key={player}
                                    type="monotone"
                                    dataKey={player}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "white" }}
                                    style={{
                                        filter: `drop-shadow(0 0 4px ${CHART_COLORS[index % CHART_COLORS.length]})`
                                    }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
