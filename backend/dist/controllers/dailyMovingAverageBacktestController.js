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
exports.handleDailyMABacktest = void 0;
const backtest_1 = require("../investing/backtest");
function handleDailyMABacktest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { markets, period, initialCapital, days } = req.query;
        const marketsArray = markets.split(",").map((m) => m.trim());
        if (!markets || !period || !initialCapital) {
            res.status(400).json({
                error: "Missing required query parameters: markets, period, initialCapital",
            });
            return;
        }
        try {
            const backtestData = yield (0, backtest_1.checkDailyMovingAverageBacktest)(marketsArray, parseInt(period), parseInt(initialCapital), parseInt(days));
            res.status(200).json(backtestData);
        }
        catch (error) {
            console.error("Error in handleDailyMABacktest:", error);
            res.status(500).json({
                error: "Failed to fetch checkDailyMovingAverageBacktest",
            });
        }
    });
}
exports.handleDailyMABacktest = handleDailyMABacktest;
