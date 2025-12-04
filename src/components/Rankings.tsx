import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/hooks/usePizzaData";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Crown, AlertTriangle } from "lucide-react";

export function Rankings({ data }: { data: DashboardData }) {
    const { totals, playerStats } = data;
    const sortedPlayers = Object.entries(totals).sort(([, a], [, b]) => b - a);
    const top3 = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    // Calculate the "Pizza Line" index (halfway point)
    // In legacy code: Math.ceil(entries.length / 2)
    // If 10 players, halfIndex = 5. Line is after 5th player.
    // If 11 players, halfIndex = 6. Line is after 6th player.
    const totalPlayers = sortedPlayers.length;
    const halfIndex = Math.ceil(totalPlayers / 2);

    // The line should be rendered AFTER this rank.
    // Rank is 1-based index.
    // So if halfIndex is 5, line is after Rank 5.

    const podiumVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: { delay: i * 0.2, duration: 0.5, type: "spring" as const }
        })
    };

    const renderPlayerTooltip = (player: string, points: number, children: React.ReactNode) => {
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
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent className="w-64 p-4 bg-[#0f172a]/95 backdrop-blur border-slate-700 shadow-2xl text-slate-200">
                    <div className="space-y-3">
                        <h4 className="text-lg font-bold text-center text-primary tracking-wider uppercase">{player}</h4>
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                            <span className="text-slate-400 text-right">Totaal Punten:</span>
                            <span className="font-bold text-white">{points % 1 === 0 ? points : points.toFixed(1)}</span>

                            <span className="text-slate-400 text-right">Aanwezig:</span>
                            <span className="font-bold text-white">{stats.attendance}</span>

                            <span className="text-slate-400 text-right">Geblesseerd:</span>
                            <span className="font-bold text-white">{stats.injured}</span>

                            <span className="text-slate-400 text-right">Afwezig:</span>
                            <span className="font-bold text-white">{stats.absent}</span>

                            <span className="text-slate-400 text-right">Aanwezigheid %:</span>
                            <span className="font-bold text-white">{attendanceRate}%</span>

                            <span className="text-slate-400 text-right">Gewonnen:</span>
                            <span className="font-bold text-white">{stats.wins}</span>

                            <span className="text-slate-400 text-right">Win Rate %:</span>
                            <span className="font-bold text-white">{stats.winRate}%</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <Card className="h-full glass border-none overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold uppercase tracking-widest text-center text-primary">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
                <TooltipProvider delayDuration={0}>
                    {/* Podium */}
                    <div className="flex justify-center items-end gap-2 md:gap-4 h-48 mb-4">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <motion.div
                                custom={1}
                                variants={podiumVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center w-1/3"
                            >
                                {renderPlayerTooltip(top3[1][0], top3[1][1], (
                                    <div className="flex flex-col items-center cursor-help group">
                                        <div className="text-sm font-bold text-slate-300 mb-1 group-hover:text-white transition-colors">{top3[1][0]}</div>
                                        <div className="w-full bg-slate-700/50 border-t-4 border-slate-400 h-24 rounded-t-lg flex items-start justify-center pt-2 relative group-hover:bg-slate-700/80 transition-colors">
                                            <span className="text-2xl font-bold text-slate-400">2</span>
                                            <div className="absolute bottom-2 text-xs font-mono text-slate-300">{top3[1][1]} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <motion.div
                                custom={0}
                                variants={podiumVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center w-1/3 z-10"
                            >
                                {renderPlayerTooltip(top3[0][0], top3[0][1], (
                                    <div className="flex flex-col items-center cursor-help group">
                                        <Crown className="w-8 h-8 text-yellow-400 mb-1 animate-bounce" />
                                        <div className="text-lg font-bold text-yellow-400 mb-1 group-hover:text-yellow-300 transition-colors">{top3[0][0]}</div>
                                        <div className="w-full bg-yellow-500/20 border-t-4 border-yellow-400 h-32 rounded-t-lg flex items-start justify-center pt-2 relative shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:bg-yellow-500/30 transition-colors">
                                            <span className="text-4xl font-bold text-yellow-400">1</span>
                                            <div className="absolute bottom-2 text-sm font-mono text-yellow-200 font-bold">{top3[0][1]} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <motion.div
                                custom={2}
                                variants={podiumVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col items-center w-1/3"
                            >
                                {renderPlayerTooltip(top3[2][0], top3[2][1], (
                                    <div className="flex flex-col items-center cursor-help group">
                                        <div className="text-sm font-bold text-amber-700 mb-1 group-hover:text-amber-600 transition-colors">{top3[2][0]}</div>
                                        <div className="w-full bg-amber-900/30 border-t-4 border-amber-700 h-16 rounded-t-lg flex items-start justify-center pt-2 relative group-hover:bg-amber-900/50 transition-colors">
                                            <span className="text-2xl font-bold text-amber-700">3</span>
                                            <div className="absolute bottom-2 text-xs font-mono text-amber-600">{top3[2][1]} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Rest of the list */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {rest.map(([player, points], index) => {
                            const rank = index + 4;
                            const isLast = rank === totalPlayers;
                            const showLineAbove = rank === halfIndex + 1; // If halfIndex is 5, line is after 5, so above 6.

                            // Wait, if halfIndex is 5.
                            // Rank 1, 2, 3 are in podium.
                            // Rank 4 is first in list.
                            // Rank 5 is second in list.
                            // Line should be AFTER Rank 5.
                            // So BEFORE Rank 6.

                            return (
                                <React.Fragment key={player}>
                                    {showLineAbove && (
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 1, duration: 0.5 }}
                                            className="relative py-2 flex items-center justify-center"
                                        >
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t-2 border-dashed border-red-500/50"></div>
                                            </div>
                                            <span className="relative bg-slate-900 px-2 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/30 rounded-full">
                                                De Lijn
                                            </span>
                                        </motion.div>
                                    )}

                                    {renderPlayerTooltip(player, points, (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.05) }}
                                            className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-help border 
                                                ${isLast
                                                    ? "bg-red-900/20 border-red-500/50 hover:bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                                    : "bg-slate-800/30 border-transparent hover:bg-slate-700/50 hover:border-slate-600"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 text-center font-mono text-sm ${isLast ? "text-red-400 font-bold" : "text-slate-500"}`}>
                                                    {rank}.
                                                </span>
                                                <span className={`font-medium ${isLast ? "text-red-200" : "text-slate-200"}`}>
                                                    {player}
                                                    {isLast && <AlertTriangle className="inline-block ml-2 h-4 w-4 text-red-500 animate-pulse" />}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className={`${isLast ? "bg-red-950/50 border-red-500/50 text-red-300" : "bg-slate-900/50 border-slate-700 text-slate-300"} font-mono`}>
                                                {points % 1 === 0 ? points : points.toFixed(1)}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
