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
            const results = yield Promise.all(markets.map((market) => backtestMarket(market, initialCapital, days, targetRate)));
            displayTradeTable(results);
            const allFinalMetrics = results.map((r) => r.finalMetrics);
            logResult(allFinalMetrics);
        }
        catch (error) {
            console.error("Error marketTimingVolatilityBreakoutBacktest: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.marketTimingVolatilityBreakoutBacktest = marketTimingVolatilityBreakoutBacktest;
function backtestMarket(market, initialCapital, days, targetRate) {
    return __awaiter(this, void 0, void 0, function* () {
        const tradeData = yield runStrategies(market, initialCapital, days, targetRate);
        const finalMetrics = calculateMetrics(tradeData, initialCapital);
        return {
            market,
            tradeData,
            finalMetrics: Object.assign({ market }, finalMetrics),
        };
    });
}
function runStrategies(market, initialCapital, days, targetRate) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, (days + 20).toString());
        let capital = initialCapital;
        let tradeCount = 0;
        let winCount = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        const results = [];
        for (let i = 20; i < candles.length - 1; i++) {
            const currentCandle = candles[i];
            const prevCandle = candles[i - 1];
            const noiseAverage = (0, utils_1.calculateAverageNoise)(candles.slice(i - 20, i), market);
            const range = yield (0, utils_1.calculateRange)(prevCandle);
            const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, noiseAverage);
            let investment = 0;
            if (isBreakOut) {
                const movingAverages = (0, utils_1.calculateAllMovingAverages)(candles.slice(i - 20, i), [3, 5, 10, 20]);
                const score = Object.values(movingAverages).reduce((a, b) => a + (currentCandle.trade_price > b ? 1 : 0), 0) / 4;
                const prevVolatility = range / prevCandle.trade_price;
                investment = capital * score * (targetRate / prevVolatility);
                const position = investment / currentCandle.trade_price;
                capital -= investment;
                const nextCandle = candles[i + 1];
                const profit = (nextCandle.opening_price - currentCandle.trade_price) *
                    position;
                capital += position * nextCandle.opening_price;
                tradeCount++;
                if (profit > 0)
                    winCount++;
                peakCapital = Math.max(peakCapital, capital);
                const drawdown = ((peakCapital - capital) / peakCapital) * 100;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
            }
            results.push({
                market,
                date: currentCandle.date_time,
                price: currentCandle.trade_price,
                prevRange: range,
                noiseAverage,
                signal: isBreakOut ? "OK" : "",
                investment,
                capital,
                tradeCount,
                winCount,
                maxDrawdown,
            });
        }
        return results;
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
        maxDrawdown: finalResult.maxDrawdown,
    };
}
function displayTradeTable(results) {
    results.forEach((r) => {
        console.log(r.market);
        const result = r.tradeData.map((d) => {
            return {
                date: d.date.slice(0, 10),
                price: (0, utils_1.formatPrice)(d.price),
                prevRange: (0, utils_1.formatPrice)(d.prevRange),
                noiseAverage: d.noiseAverage.toFixed(2),
                singal: d.signal,
                investment: Math.round(d.investment).toLocaleString(),
                capital: Math.round(d.capital).toLocaleString(),
                tradeCount: d.tradeCount,
                winCount: d.winCount,
                maxDrawdown: d.maxDrawdown,
            };
        });
        console.table(result);
    });
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
    const markets = ["KRW-BTC", "KRW-ETH"];
    const initialCapital = 1000000;
    const days = 200;
    const results = yield marketTimingVolatilityBreakoutBacktest(markets, initialCapital, days);
}))();
