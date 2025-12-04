import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRzc9wFULPeDX3JrH_9swutuqkgz03AYoZ1xaAJ3piIcE0hPijMPRbD9XYHh--cm_6wO7U9MCQcHOO/pub?gid=0&single=true&output=csv";
const REFRESH_INTERVAL_MS = 30000;

const COLS = {
    date: "Datum",
    player: "Speler",
    present: "Aanwezig",
    winner: "Winnaar",
    injured: "Geblesseerd"
};

export interface PizzaRecord {
    date: Date;
    player: string;
    present: string;
    winner: string;
    injured: string;
    points: number;
}

export interface DashboardData {
    records: PizzaRecord[];
    totals: Record<string, number>;
    sessionsByDate: Record<string, Record<string, number>>;
    manToBeat: { name: string; points: number } | null;
    manInVorm: { name: string; delta: number } | null;
    totalSessions: number;
    bestWinRate: { name: string; percentage: number } | null;
    mostConsistent: string;
    roomForImprovement: string;
    playerStats: Record<string, {
        wins: number;
        attendance: number;
        winRate: number;
        injured: number;
        absent: number;
        totalSessions: number;
    }>;
    loading: boolean;
    error: string | null;
}

const isTrue = (v: any) => ["1", "ja", "true", "y", "yes"].includes(String(v).trim().toLowerCase());

const calcPoints = (r: any) => {
    const injuredVal = String(r[COLS.injured] || "").trim().toLowerCase();
    if (isTrue(injuredVal) || injuredVal === "0.5") return 0.5;
    if (isTrue(r[COLS.present])) return 1 + (isTrue(r[COLS.winner]) ? 1 : 0);
    return 0;
};

export function usePizzaData() {
    const [data, setData] = useState<DashboardData>({
        records: [],
        totals: {},
        sessionsByDate: {},
        manToBeat: null,
        manInVorm: null,
        totalSessions: 0,
        bestWinRate: null,
        mostConsistent: "—",
        roomForImprovement: "—",
        playerStats: {},
        loading: true,
        error: null,
    });

    const fetchData = async () => {
        try {
            const res = await fetch(`${CSV_URL}&t=${Date.now()}`);
            if (!res.ok) throw new Error("Sheet laden mislukt: " + res.status);
            const csv = await res.text();

            Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h: string) => h.trim().replace(/,$/, ""),
                complete: (results: any) => {
                    processData(results.data);
                },
                error: (err: any) => {
                    setData(prev => ({ ...prev, error: err.message, loading: false }));
                }
            });
        } catch (error: any) {
            setData(prev => ({ ...prev, error: error.message, loading: false }));
        }
    };

    const processData = (rawRecords: any[]) => {
        const records: PizzaRecord[] = rawRecords
            .filter(r => r[COLS.date] && r[COLS.player])
            .map(r => {
                let date = new Date(r[COLS.date]);
                if (isNaN(date.getTime())) date = new Date(0);
                return {
                    date,
                    player: r[COLS.player].trim(),
                    present: r[COLS.present] || "nee",
                    winner: r[COLS.winner] || "nee",
                    injured: r[COLS.injured] || "nee",
                    points: calcPoints(r)
                };
            })
            .filter(r => r.date.getTime() !== 0)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const totals: { [key: string]: number } = {};
        const sessionsByDate: { [key: string]: { [key: string]: number } } = {};
        const playerPresence: { [key: string]: number } = {};
        const playerWins: { [key: string]: number } = {};

        records.forEach(r => {
            totals[r.player] = (totals[r.player] || 0) + r.points;

            const dateKey = r.date.toISOString().split("T")[0];
            if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = {};
            sessionsByDate[dateKey][r.player] = (sessionsByDate[dateKey][r.player] || 0) + r.points;

            if (isTrue(r.present)) {
                playerPresence[r.player] = (playerPresence[r.player] || 0) + 1;
                if (isTrue(r.winner)) {
                    playerWins[r.player] = (playerWins[r.player] || 0) + 1;
                }
            }
        });

        // Man to Beat
        const sortedTotals = Object.entries(totals).sort(([, a], [, b]) => b - a);
        const manToBeat = sortedTotals.length > 0 ? { name: sortedTotals[0][0], points: sortedTotals[0][1] } : null;

        // Man in Vorm
        const sortedDates = Object.keys(sessionsByDate).sort();
        let manInVorm = null;
        if (sortedDates.length >= 2) {
            const last3Dates = sortedDates.slice(-3);
            const prev3Dates = sortedDates.slice(Math.max(0, sortedDates.length - 6), -3);

            const sumPoints = (dates: string[]) => {
                const sum: { [key: string]: number } = {};
                dates.forEach(d => {
                    Object.entries(sessionsByDate[d] || {}).forEach(([p, pts]) => {
                        sum[p] = (sum[p] || 0) + pts;
                    });
                });
                return sum;
            };

            const last3 = sumPoints(last3Dates);
            const prev3 = sumPoints(prev3Dates);

            const deltas = Object.keys(last3).map(p => ({
                name: p,
                delta: last3[p] - (prev3[p] || 0)
            })).sort((a, b) => b.delta - a.delta);

            if (deltas.length > 0 && deltas[0].delta !== 0) {
                manInVorm = deltas[0];
            }
        }

        // Best Win Rate
        const winRates = Object.keys(playerPresence).map(p => ({
            name: p,
            rate: playerWins[p] / playerPresence[p]
        })).sort((a, b) => b.rate - a.rate);
        const bestWinRate = winRates.length > 0 ? { name: winRates[0].name, percentage: Math.round(winRates[0].rate * 100) } : null;

        // Most/Least Consistent
        const sortedPresence = Object.entries(playerPresence).sort(([, a], [, b]) => b - a);
        const mostConsistent = sortedPresence.length > 0 ? sortedPresence[0][0] : "—";
        const roomForImprovement = sortedPresence.length > 0 ? sortedPresence[sortedPresence.length - 1][0] : "—";

        const playerStats: Record<string, {
            wins: number;
            attendance: number;
            winRate: number;
            injured: number;
            absent: number;
            totalSessions: number;
        }> = {};

        const totalSessionsCount = sortedDates.length;
        const playerInjuries: Record<string, number> = {};

        records.forEach(r => {
            if (isTrue(r.injured) || String(r.injured).trim() === "0.5") {
                playerInjuries[r.player] = (playerInjuries[r.player] || 0) + 1;
            }
        });

        // We need to iterate over ALL players found in totals (everyone who has points or played)
        Object.keys(totals).forEach(player => {
            const wins = playerWins[player] || 0;
            const attendance = playerPresence[player] || 0;
            const injured = playerInjuries[player] || 0;
            // Absent is total sessions minus (attendance + injured)? 
            // Or just total sessions - attendance if injured counts as present?
            // Usually absent = totalSessions - attendance. 
            // But if injured implies not playing but maybe present? 
            // Let's assume absent = totalSessions - attendance. 
            // Wait, if someone joined later, they shouldn't be marked absent for earlier sessions.
            // But for this dashboard, usually it's simple: Total Sessions - Attendance.
            // Let's stick to the requested fields.
            const absent = totalSessionsCount - attendance;

            playerStats[player] = {
                wins,
                attendance,
                winRate: attendance > 0 ? Math.round((wins / attendance) * 100) : 0,
                injured,
                absent,
                totalSessions: totalSessionsCount
            };
        });

        setData({
            records,
            totals,
            sessionsByDate,
            manToBeat,
            manInVorm,
            totalSessions: sortedDates.length,
            bestWinRate,
            mostConsistent,
            roomForImprovement,
            playerStats,
            loading: false,
            error: null
        });
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    return data;
}
