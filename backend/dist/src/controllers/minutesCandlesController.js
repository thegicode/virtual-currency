"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetMinutesCandles = void 0;
const fetchMinutesCandles_1 = require("../services/api/fetchMinutesCandles");
function handleGetMinutesCandles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { market, unit, count, to } = req.query;
        if (!market || !unit || !count) {
            res.status(400).json({
                error: "Missing required query parameters: market, unit, count",
            });
            return;
        }
        try {
            const candlesData = yield (0, fetchMinutesCandles_1.fetchMinutesCandles)(market, parseInt(unit), parseInt(count), to);
            res.status(200).json(candlesData);
        }
        catch (error) {
            console.error("Error in handleGetMinutesCandles:", error);
            res.status(500).json({ error: "Failed to fetch candles data" });
        }
    });
}
exports.handleGetMinutesCandles = handleGetMinutesCandles;
