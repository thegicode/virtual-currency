// src/controllers/candlesController.ts
import { Request, Response } from "express";
import { fetchMinutes } from "../services/api/fetchMinutes";

async function getCandlesMinutes(req: Request, res: Response) {
    const { market, unit, count, to } = req.query;

    if (!market || !unit || !count) {
        return res
            .status(400)
            .json({ error: "Required query parameters: market, unit, count" });
    }

    try {
        const candlesData = await fetchMinutes(
            market as string,
            Number(unit) as TCandleUnit,
            Number(count),
            to as string
        );
        res.json(candlesData);
    } catch (error) {
        console.error("Error in getCandlesMinutes:", error);
        res.status(500).json({ error: "Failed to fetch candles data" });
    }
}

export { getCandlesMinutes };
