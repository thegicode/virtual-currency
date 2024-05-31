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
exports.movingAverageAndVolatilityBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function movingAverageAndVolatilityBacktest(markets, initialCapital, resultCounts = 200, targetVolatility = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const adjustedApiCounts = (0, utils_1.adjustApiCounts)(resultCounts, 20);
        const results = yield Promise.all(markets.map((market) => backtestMarket(market, adjustedApiCounts, targetVolatility, markets, initialCapital)));
        logResults(results);
    });
}
exports.movingAverageAndVolatilityBacktest = movingAverageAndVolatilityBacktest;
function logResults(results) {
    console.log(`\n🔔 3, 5, 10, 20일 이동평균 + 변동성 조절 backtest\n`);
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Trade Count: ${result.tradeCount}번`);
        console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log(`MDD: ${result.mdd.toFixed(2)}%\n\n`);
    });
}
function backtestMarket(market, apiCounts, targetVolatility, markets, initialCapital) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, apiCounts.toString());
        let capital = initialCapital;
        let position = 0;
        let tradeCount = 0;
        let winCount = 0;
        let firstDate;
        let lastDate;
        let buyPrice = 0;
        let tradesData = [];
        let mddPrices = [];
        candles.slice(20).forEach((candle, index) => {
            if (index === 0)
                firstDate = candle.date_time;
            if (index === candles.length - 20 - 1)
                lastDate = candle.date_time;
            const currentCandles = candles.slice(index, index + 20);
            const movingAverages = (0, utils_1.calculateAllMovingAverages)(currentCandles, [3, 5, 10, 20]);
            const currentPrice = candle.trade_price;
            const volatility = (0, utils_1.calculateVolatility)(currentCandles.slice(-5));
            const isSignal = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
            const capitalAllocation = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, markets.length, capital);
            let profit = 0;
            let signal = "";
            if (isSignal && buyPrice === 0) {
                signal = "Buy";
                buyPrice = currentPrice;
                position = capitalAllocation / currentPrice;
                capital -= capitalAllocation;
            }
            else if (!isSignal && position > 0) {
                signal = "Sell";
                profit = (currentPrice - buyPrice) * position;
                capital += position * currentPrice;
                position = 0;
                buyPrice = 0;
                tradeCount++;
                if (profit > 0) {
                    winCount++;
                }
            }
            else if (isSignal && buyPrice > 0) {
                signal = "Hold";
            }
            const capitalAllocation2 = signal === "Buy" ? capitalAllocation : 0;
            tradesData.push({
                date: candle.date_time.slice(0, 10),
                price: currentPrice,
                signal,
                position: position.toFixed(2),
                profit: Math.ceil(profit !== null && profit !== void 0 ? profit : 0).toLocaleString(),
                capitalAllocation: Math.ceil(capitalAllocation2).toLocaleString(),
                capital: Math.ceil(capital),
                volatility: volatility.toFixed(2),
                tradeCount,
                winCount,
            });
            if (signal !== "")
                mddPrices.push(candle.trade_price);
        });
        const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
        const lastTradeData = tradesData[tradesData.length - 1];
        const finalCapital = ["Buy", "Hold"].includes(lastTradeData.signal)
            ? capital + position * lastTradeData.price
            : lastTradeData.capital;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
        return {
            market,
            firstDate,
            lastDate,
            finalCapital,
            tradeCount,
            performance,
            mdd: maxDrawdown,
            winRate,
        };
    });
}
