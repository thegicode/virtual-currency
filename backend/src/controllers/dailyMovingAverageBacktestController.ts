import { Request, Response } from "express";
import { checkDailyMovingAverageBacktest } from "../investing/backtest";

export async function handleDailyMABacktest(req: Request, res: Response) {
    const { markets, period, initialCapital, days } = req.query;

    const marketsArray = (markets as string).split(",").map((m) => m.trim());

    if (!markets || !period || !initialCapital) {
        res.status(400).json({
            error: "Missing required query parameters: markets, period, initialCapital",
        });
        return;
    }

    try {
        const backtestData = await checkDailyMovingAverageBacktest(
            marketsArray,
            parseInt(period as string),
            parseInt(initialCapital as string),
            parseInt(days as string)
        );

        res.status(200).json(backtestData);
    } catch (error) {
        console.error("Error in handleDailyMABacktest:", error);
        res.status(500).json({
            error: "Failed to fetch checkDailyMovingAverageBacktest",
        });
    }
}
