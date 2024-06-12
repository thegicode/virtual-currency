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
const api_1 = require("../../services/api");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, api_1.fetchDailyCandles)("KRW-SOL", "100");
    function calculateMovingAverages(data, shortPeriod, longPeriod) {
        data.forEach((row, index) => {
            if (index >= shortPeriod - 1) {
                const shortPrices = data
                    .slice(index - shortPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.short_avg_price =
                    shortPrices.reduce((acc, price) => acc + price, 0) /
                        shortPeriod;
            }
            if (index >= longPeriod - 1) {
                const longPrices = data
                    .slice(index - longPeriod + 1, index + 1)
                    .map((d) => d.trade_price);
                row.long_avg_price =
                    longPrices.reduce((acc, price) => acc + price, 0) /
                        longPeriod;
            }
        });
    }
    function calculateMovingAverageCrossover(data, shortPeriod, longPeriod) {
        calculateMovingAverages(data, shortPeriod, longPeriod);
        data.forEach((row, index) => {
            if (index >= longPeriod - 1) {
                if (row.short_avg_price && row.long_avg_price) {
                    if (row.short_avg_price > row.long_avg_price) {
                        row.signal = 1;
                    }
                    else if (row.short_avg_price < row.long_avg_price) {
                        row.signal = -1;
                    }
                    else {
                        row.signal = 0;
                    }
                }
            }
            else {
                row.signal = 0;
            }
        });
    }
    function backtestMovingAverageCrossover(data, initialCapital) {
        let capital = initialCapital;
        let position = 0;
        let tradeCount = 0;
        data.forEach((row) => {
            if (row.signal === 1 && capital > 0) {
                position = capital / row.trade_price;
                capital = 0;
                tradeCount++;
            }
            else if (row.signal === -1 && position > 0) {
                capital = position * row.trade_price;
                position = 0;
                tradeCount++;
            }
            row.capital = capital + position * row.trade_price;
        });
        return { data, tradeCount };
    }
    const initialCapital = 10000;
    const shortPeriod = 12;
    const longPeriod = 26;
    calculateMovingAverageCrossover(data, shortPeriod, longPeriod);
    const { data: movingAverageCrossoverResult, tradeCount } = backtestMovingAverageCrossover(data, initialCapital);
    const finalCapitalMovingAverageCrossover = movingAverageCrossoverResult[movingAverageCrossoverResult.length - 1]
        .capital;
    const returnRateMovingAverageCrossover = (finalCapitalMovingAverageCrossover / initialCapital - 1) * 100;
    console.log("Moving Average Crossover Strategy Results:");
    console.log(movingAverageCrossoverResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalMovingAverageCrossover}`);
    console.log(`Return Rate: ${returnRateMovingAverageCrossover.toFixed(2)}%`);
    console.log(`Trade Count: ${tradeCount}`);
}))();
