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
exports.checkDailyMovingAverageBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function checkDailyMovingAverageBacktest(markets, period = 3, initialCapital, days) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield backtestMarket(market, period, initialCapital, days); })));
        logResults(results, period);
        return results;
    });
}
exports.checkDailyMovingAverageBacktest = checkDailyMovingAverageBacktest;
function logResults(results, period) {
    console.log(`\n🔔 일 캔들 ${period}일 이동평균 backtest\n`);
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Total Trades: ${result.trades}번`);
        console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`MDD: ${result.mdd.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log("");
    });
}
function backtestMarket(market, period, initialCapital, apiCounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, apiCounts.toString());
        const movingAverages = (0, utils_1.calculateMovingAverage)(candles);
        let capital = initialCapital;
        let position = 0;
        let trades = 0;
        let wins = 0;
        let buyPrice = 0;
        let firstDate;
        let lastDate;
        let tradeData = [];
        let mddPrices = [];
        candles.slice(period).forEach((candle, index) => {
            var _a, _b;
            if (index === 0)
                firstDate = candle.date_time;
            if (index === candles.length - period - 1) {
                lastDate = candle.date_time;
            }
            const currentPrice = candle.trade_price;
            const movingAverage = movingAverages[index];
            if (currentPrice > movingAverage && capital > 0) {
                buyPrice = currentPrice;
                position = capital / currentPrice;
                tradeData.push({
                    capital,
                    signal: "Buy",
                });
                mddPrices.push(candle.trade_price);
                capital = 0;
            }
            else if (currentPrice < movingAverage && position > 0) {
                const sellPrice = currentPrice;
                const profit = (sellPrice - buyPrice) * position;
                capital = position * sellPrice;
                position = 0;
                trades++;
                if (profit > 0) {
                    wins++;
                }
                tradeData.push({
                    capital,
                    signal: "Sell",
                    profit,
                });
                mddPrices.push(candle.trade_price);
            }
            else {
                tradeData.push({
                    signal: "",
                });
                if (position > 0) {
                    mddPrices.push(candle.trade_price);
                }
            }
            tradeData[index] = {
                date: candle.date_time.slice(0, 10),
                price: currentPrice,
                movingAverage: movingAverage.toFixed(2),
                signal: tradeData[index].signal,
                position: position.toFixed(2),
                profit: Math.ceil((_a = tradeData[index].profit) !== null && _a !== void 0 ? _a : 0).toLocaleString(),
                capital: Math.ceil((_b = tradeData[index].capital) !== null && _b !== void 0 ? _b : 0).toLocaleString(),
                trades,
                wins,
            };
        });
        const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
        const finalCapital = capital + position * candles[candles.length - 1].trade_price;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = trades > 0 ? (wins / trades) * 100 : 0;
        return {
            market,
            firstDate,
            lastDate,
            finalCapital,
            trades,
            mdd: maxDrawdown,
            performance,
            winRate,
        };
    });
}
