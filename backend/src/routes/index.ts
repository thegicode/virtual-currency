import express from "express";
import { handleGetMinutesCandles } from "../controllers";

const router = express.Router();

router.get("/fetchMiuntesCandles", handleGetMinutesCandles);

export default router;
