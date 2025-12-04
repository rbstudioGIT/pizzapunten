import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, CalendarCheck, Medal, UserCheck, UserX } from "lucide-react";
import type { DashboardData } from "@/hooks/usePizzaData";

export function StatsCards({ data }: { data: DashboardData }) {
    const { manToBeat, manInVorm, totalSessions, bestWinRate, mostConsistent, roomForImprovement } = data;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Man to Beat</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{manToBeat?.name || "—"}</div>
                    <p className="text-xs text-muted-foreground">
                        {manToBeat?.points ? `${manToBeat.points} pts` : "—"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Man in Vorm</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{manInVorm?.name || "—"}</div>
                    <p className={`text-xs ${manInVorm?.delta && manInVorm.delta > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                        {manInVorm?.delta ? `${manInVorm.delta > 0 ? "+" : ""}${manInVorm.delta} pts` : "—"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trainingen</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSessions}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Winrate</CardTitle>
                    <Medal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{bestWinRate?.name || "—"}</div>
                    <p className="text-xs text-muted-foreground">
                        {bestWinRate?.percentage ? `${bestWinRate.percentage}%` : "—"}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Consistent</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mostConsistent}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Room for Improvement</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{roomForImprovement}</div>
                </CardContent>
            </Card>
        </div>
    );
}
