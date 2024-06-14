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
exports.marketTimingVolatilityBreakoutBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function marketTimingVolatilityBreakoutBacktest(markets, initialCapital, days, targetRate = 0.02) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const marketCandles = yield Promise.all(markets.map((market) => (0, api_1.fetchDailyCandles)(market, (days + 20).toString())));
            const dateGroups = {};
            marketCandles.forEach((candles, marketIdx) => {
                candles.forEach((candle) => {
                    const date = candle.date_time.split("T")[0];
                    if (!dateGroups[date]) {
                        dateGroups[date] = {};
                    }
                    dateGroups[date][markets[marketIdx]] = candle;
                });
            });
            const results = yield runDateBasedBacktest(dateGroups, initialCapital, targetRate);
            console.log("results", results);
        }
        catch (error) {
            console.error("Error marketTimingVolatilityBreakoutBacktest: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.marketTimingVolatilityBreakoutBacktest = marketTimingVolatilityBreakoutBacktest;
function runDateBasedBacktest(dateGroups, initialCapital, targetRate) {
    return __awaiter(this, void 0, void 0, function* () {
        let capital = initialCapital;
        let tradeCount = 0;
        let winCount = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        const results = [];
        for (const date in dateGroups) {
            const marketCandles = dateGroups[date];
            const resultsForDate = yield Promise.all(Object.keys(marketCandles).map((market) => __awaiter(this, void 0, void 0, function* () {
                const currentCandle = marketCandles[market];
                const prevDate = new Date(date);
                prevDate.setDate(prevDate.getDate() - 1);
                const prevCandleDate = prevDate.toISOString().split("T")[0];
                if (!dateGroups[prevCandleDate] ||
                    !dateGroups[prevCandleDate][market]) {
                    return null;
                }
                const prevCandle = dateGroups[prevCandleDate][market];
                return yield backtestCandle(currentCandle, prevCandle, capital, targetRate);
            })));
            resultsForDate
                .filter((result) => result !== null)
                .forEach((result) => {
                if (!result)
                    return;
                capital = result.capital;
                tradeCount += result.tradeCount;
                winCount += result.winCount;
                peakCapital = Math.max(peakCapital, capital);
                const drawdown = ((peakCapital - capital) / peakCapital) * 100;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
                results.push(result);
            });
        }
        const finalMetrics = calculateMetrics(results, initialCapital);
        return {
            results,
            finalMetrics: Object.assign(Object.assign({}, finalMetrics), { maxDrawdown }),
        };
    });
}
function backtestCandle(currentCandle, prevCandle, capital, targetRate) {
    return __awaiter(this, void 0, void 0, function* () {
        const noiseAverage = (0, utils_1.calculateAverageNoise)([prevCandle, currentCandle], currentCandle.market);
        const range = yield (0, utils_1.calculateRange)(prevCandle);
        const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, noiseAverage);
        let investment = 0;
        if (isBreakOut) {
            const movingAverages = (0, utils_1.calculateAllMovingAverages)([prevCandle, currentCandle], [3, 5, 10, 20]);
            const score = Object.values(movingAverages).reduce((a, b) => a + (currentCandle.trade_price > b ? 1 : 0), 0) / 4;
            const prevVolatility = range / prevCandle.trade_price;
            investment = capital * score * (targetRate / prevVolatility);
            const position = investment / currentCandle.trade_price;
            capital -= investment;
            const nextCandle = currentCandle;
            const profit = (nextCandle.opening_price - currentCandle.trade_price) * position;
            capital += position * nextCandle.opening_price;
            const tradeCount = 1;
            const winCount = profit > 0 ? 1 : 0;
            return {
                market: currentCandle.market,
                date: currentCandle.date_time,
                price: currentCandle.trade_price,
                prevRange: range,
                noiseAverage,
                signal: "매수 또는 보유",
                investment,
                capital,
                tradeCount,
                winCount,
                maxDrawdown: 0,
            };
        }
        return {
            market: currentCandle.market,
            date: currentCandle.date_time,
            price: currentCandle.trade_price,
            prevRange: range,
            noiseAverage,
            signal: "매도 또는 유보",
            investment,
            capital,
            tradeCount: 0,
            winCount: 0,
            maxDrawdown: 0,
        };
    });
}
function calculateMetrics(results, initialCapital) {
    const finalResult = results[results.length - 1];
    const finalCapital = finalResult.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = finalResult.tradeCount > 0
        ? (finalResult.winCount / finalResult.tradeCount) * 100
        : 0;
    return {
        firstDate: results[0].date,
        lastDate: finalResult.date,
        finalCapital,
        performance,
        tradeCount: finalResult.tradeCount,
        winRate,
        maxDrawdown: results.reduce((acc, result) => Math.max(acc, result.maxDrawdown), 0),
    };
}
function logResult(results) {
    console.log(`\n🔔 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파\n`);
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Trade Count: ${result.tradeCount}번`);
        console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log(`maxDrawdown: ${result.maxDrawdown.toFixed(2)}%\n`);
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const markets = ["KRW-ETH", "KRW-LINK"];
    const initialCapital = 1000000;
    const days = 100;
    const results = yield marketTimingVolatilityBreakoutBacktest(markets, initialCapital, days);
}))();
