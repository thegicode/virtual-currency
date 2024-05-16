import express from "express";
import { getCandlesMinutes } from "./controllers/candlesController";

const router = express.Router();

router.get("/fetchCandlesMinutes", getCandlesMinutes);

export default router;
