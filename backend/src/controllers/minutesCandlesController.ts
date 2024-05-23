// src/controllers/candlesController.ts
import { Request, Response } from "express";
import { fetchMinutesCandles } from "../services/api/fetchMinutesCandles";

async function handleGetMinutesCandles(req: Request, res: Response) {
    const { market, unit, count, to } = req.query;

    if (!market || !unit || !count) {
        res.status(400).json({
            error: "Missing required query parameters: market, unit, count",
        });
        return;
    }

    try {
        const candlesData = await fetchMinutesCandles(
            market as string,
            parseInt(unit as string) as TCandleUnit,
            parseInt(count as string),
            to as string
        );

        res.status(200).json(candlesData);
    } catch (error) {
        console.error("Error in handleGetMinutesCandles:", error);
        res.status(500).json({ error: "Failed to fetch candles data" });
    }
}

export { handleGetMinutesCandles };
