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
exports.checkMinutesMovingAverageBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function checkMinutesMovingAverageBacktest(markets, candleUnit, movingAveragePeriod, initialCapital, apiCounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => backtestMarket(market, candleUnit, movingAveragePeriod, initialCapital, apiCounts)));
        console.log(`\n🔔 ${candleUnit}분캔들 ${movingAveragePeriod} 이동평균 backtest\n`);
        results.forEach((result) => {
            console.log(`📈 [${result.market}]`);
            console.log(`first Time: ${result.firstTime}`);
            console.log(`last Time: ${result.lastTime}`);
            console.log(`Trade Count: ${result.tradeCount}번`);
            console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
            console.log(`Performance: ${result.performance.toFixed(2)}%`);
            console.log(`MDD: ${result.mdd.toFixed(2)}%`);
            console.log(`Win Rate: ${result.winRate.toFixed(2)}%\n\n`);
        });
    });
}
exports.checkMinutesMovingAverageBacktest = checkMinutesMovingAverageBacktest;
function backtestMarket(market, candleUnit, movingAveragePeriod, initialCapital, apiCounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchMinutesCandles)(market, candleUnit, apiCounts);
        const movingAverages = (0, utils_1.calculateMovingAverage)(candles);
        const tradesData = [];
        let capital = initialCapital;
        let position = 0;
        let winCount = 0;
        let tradeCount = 0;
        let buyPrice = 0;
        let firstTime;
        let lastTime;
        let mddPrices = [];
        candles
            .slice(movingAveragePeriod)
            .forEach((candle, index) => {
            if (index === 0)
                firstTime = candle.date_time;
            if (index === candles.length - movingAveragePeriod - 1)
                lastTime = candle.date_time;
            const currentPrice = candle.trade_price;
            const movingAverage = movingAverages[index];
            let signal = "";
            let profit = 0;
            if (currentPrice > movingAverage && capital > 0) {
                buyPrice = currentPrice;
                position = capital / currentPrice;
                capital = 0;
                signal = "Buy";
            }
            else if (currentPrice < movingAverage && position > 0) {
                capital = position * currentPrice;
                profit = (currentPrice - buyPrice) * position;
                position = 0;
                tradeCount++;
                signal = "Sell";
                if (profit > 0) {
                    winCount++;
                }
            }
            else if (currentPrice > movingAverage && position > 0) {
                signal = "Hold";
            }
            const currentCapital = capital + position * currentPrice;
            tradesData.push({
                date: candle.date_time.slice(0, 10),
                price: currentPrice,
                movingAverage: movingAverage.toFixed(5),
                signal,
                position: position.toFixed(2),
                profit: Math.ceil(profit !== null && profit !== void 0 ? profit : 0).toLocaleString(),
                capital: Math.ceil(currentCapital !== null && currentCapital !== void 0 ? currentCapital : 0).toLocaleString(),
                tradeCount,
                winCount,
            });
            if (signal !== "")
                mddPrices.push(candle.trade_price);
        });
        const finalCapital = capital + position * candles[candles.length - 1].trade_price;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
        const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
        return {
            market,
            firstTime,
            lastTime,
            finalCapital,
            tradeCount,
            performance,
            mdd: maxDrawdown,
            winRate,
        };
    });
}
