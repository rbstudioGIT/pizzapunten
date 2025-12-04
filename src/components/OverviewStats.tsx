import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowUpRight, CalendarCheck, Medal, UserCheck, Zap } from "lucide-react";
import type { DashboardData } from "@/hooks/usePizzaData";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export function OverviewStats({ data }: { data: DashboardData }) {
    const { manToBeat, manInVorm, totalSessions, bestWinRate, mostConsistent, roomForImprovement } = data;

    const stats = [
        {
            title: "Man to Beat",
            value: manToBeat ? manToBeat.name : "—",
            subtext: manToBeat ? `${manToBeat.points} punten` : "",
            icon: Trophy,
            color: "text-yellow-400",
            glow: "shadow-yellow-400/20"
        },
        {
            title: "Man in Vorm",
            value: manInVorm ? manInVorm.name : "—",
            subtext: manInVorm ? `+${manInVorm.delta.toFixed(1)} (laatste 3)` : "Geen data",
            icon: ArrowUpRight,
            color: "text-green-400",
            glow: "shadow-green-400/20"
        },
        {
            title: "Trainingen",
            value: totalSessions.toString(),
            subtext: "Totaal aantal sessies",
            icon: CalendarCheck,
            color: "text-blue-400",
            glow: "shadow-blue-400/20"
        },
        {
            title: "Best Winrate",
            value: bestWinRate ? bestWinRate.name : "—",
            subtext: bestWinRate ? `${bestWinRate.percentage}% gewonnen` : "",
            icon: Medal,
            color: "text-purple-400",
            glow: "shadow-purple-400/20"
        },
        {
            title: "Most Consistent",
            value: mostConsistent,
            subtext: "Meeste aanwezigheid",
            icon: UserCheck,
            color: "text-cyan-400",
            glow: "shadow-cyan-400/20"
        },
        {
            title: "Room for Improvement",
            value: roomForImprovement,
            subtext: "Kan vaker komen",
            icon: Zap,
            color: "text-red-400",
            glow: "shadow-red-400/20"
        }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
            {stats.map((stat, index) => (
                <motion.div key={index} variants={item}>
                    <Card className={`glass border-l-4 ${stat.color.replace('text-', 'border-')} hover:scale-[1.02] transition-transform duration-300`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color} drop-shadow-sm`}>
                                {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.subtext}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}
