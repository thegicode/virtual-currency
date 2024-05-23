import express from "express";
import { handleGetMinutesCandles, handleDailyMABacktest } from "../controllers";

const router = express.Router();

router.get("/fetchDailyMABacktest", handleDailyMABacktest);
router.get("/fetchMiuntesCandles", handleGetMinutesCandles);

export default router;
