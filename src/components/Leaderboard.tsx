import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/usePizzaData";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function Leaderboard({ data }: { data: DashboardData }) {
    const { totals, playerStats } = data;
    const sortedPlayers = Object.entries(totals).sort(([, a], [, b]) => b - a);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <TooltipProvider delayDuration={0}>
                        {sortedPlayers.map(([player, points], index) => {
                            const stats = playerStats[player] || {
                                wins: 0,
                                attendance: 0,
                                winRate: 0,
                                injured: 0,
                                absent: 0,
                                totalSessions: 0
                            };

                            const attendanceRate = stats.totalSessions > 0
                                ? ((stats.attendance / stats.totalSessions) * 100).toFixed(1)
                                : "0.0";

                            return (
                                <div key={player} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-center font-bold text-muted-foreground">
                                            {index + 1}.
                                        </span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-medium cursor-help decoration-dotted underline-offset-4 hover:underline">
                                                    {player}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="w-64 p-4 bg-[#1e293b] text-slate-200 border-slate-700 shadow-xl">
                                                <div className="space-y-3">
                                                    <h4 className="text-lg font-bold text-center text-red-500">{player}</h4>
                                                    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                                                        <span className="text-slate-400 text-right">Totaal Punten:</span>
                                                        <span className="font-bold">{points % 1 === 0 ? points : points.toFixed(1)}</span>

                                                        <span className="text-slate-400 text-right">Aanwezig:</span>
                                                        <span className="font-bold">{stats.attendance}</span>

                                                        <span className="text-slate-400 text-right">Geblesseerd:</span>
                                                        <span className="font-bold">{stats.injured}</span>

                                                        <span className="text-slate-400 text-right">Afwezig:</span>
                                                        <span className="font-bold">{stats.absent}</span>

                                                        <span className="text-slate-400 text-right">Totaal Sessies:</span>
                                                        <span className="font-bold">{stats.attendance} / {stats.totalSessions}</span>

                                                        <span className="text-slate-400 text-right">Aanwezigheid %:</span>
                                                        <span className="font-bold">{attendanceRate}%</span>

                                                        <span className="text-slate-400 text-right">Gewonnen:</span>
                                                        <span className="font-bold">{stats.wins}</span>

                                                        <span className="text-slate-400 text-right">Win Rate %:</span>
                                                        <span className="font-bold">{stats.winRate}%</span>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Badge variant={index === 0 ? "default" : "secondary"}>
                                        {points % 1 === 0 ? points : points.toFixed(1)} pts
                                    </Badge>
                                </div>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
}
