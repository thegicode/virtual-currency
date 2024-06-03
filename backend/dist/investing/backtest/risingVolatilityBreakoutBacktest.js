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
exports.risingVolatilityBreakoutBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function risingVolatilityBreakoutBacktest(markets, initialCapital, period, k = 0.5, transactionFee = 0.002) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield backtest(market, initialCapital, period, k, transactionFee, markets.length);
            })));
            logResult(results);
        }
        catch (error) {
            console.error("Error risingVolatilityBreakoutBacktest: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.risingVolatilityBreakoutBacktest = risingVolatilityBreakoutBacktest;
function backtest(market, initialCapital, period, k, transactionFee, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const avragePeriod = 5;
        const adjustedApiCounts = (0, utils_1.adjustApiCounts)(period, avragePeriod);
        const candles = yield (0, api_1.fetchDailyCandles)(market, adjustedApiCounts.toString());
        const { tradesData, maxDrawdown } = runStrategies(market, candles, initialCapital, k, size, avragePeriod);
        const { firstDate, lastDate, finalCapital, performance, tradeCount, winRate, } = calculateFinalMetrics(tradesData, initialCapital / size);
        const results = tradesData.map((aData) => {
            return {
                date: aData.date.slice(0, 10),
                price: (0, utils_1.formatPrice)(aData.price),
                range: aData.range ? (0, utils_1.formatPrice)(aData.range) : 0,
                sellPrice: aData.sellPrice ? (0, utils_1.formatPrice)(aData.sellPrice) : 0,
                position: aData.position ? (0, utils_1.formatPrice)(aData.position) : 0,
                investment: aData.investment
                    ? (0, utils_1.formatPrice)(Math.round(aData.investment))
                    : 0,
                profit: aData.profit
                    ? Math.round(aData.profit).toLocaleString()
                    : 0,
                capital: Math.round(aData.capital).toLocaleString(),
                tradeCount: aData.tradeCount,
                winCount: aData.winCount,
            };
        });
        return {
            market,
            firstDate,
            lastDate,
            finalCapital,
            performance,
            tradeCount,
            winRate,
            mdd: maxDrawdown,
        };
    });
}
function runStrategies(market, candles, initialCapital, k, size, avragePeriod) {
    let tradesData = [];
    let mddPrices = [];
    let realCapital = initialCapital / size;
    let tradeCount = 0;
    let winCount = 0;
    const movingAverages = (0, utils_1.calculateMovingAverage)(candles, avragePeriod).slice(1);
    candles.slice(avragePeriod).forEach((candle, index) => {
        const prevCandle = candles[index + avragePeriod - 1];
        const nextCandle = candles[index + avragePeriod + 1] || candle;
        const tradePrice = candle.trade_price;
        const range = (0, utils_1.calculateRange)(prevCandle);
        const isOverMovingAverage = candle.trade_price > movingAverages[index];
        const isBreakOut = (0, utils_1.checkBreakout)(candle, range, k);
        let thisData = {};
        if (isOverMovingAverage && isBreakOut) {
            const buyPrice = tradePrice;
            const position = realCapital / tradePrice;
            const investment = tradePrice * position;
            realCapital -= investment;
            const sellPrice = nextCandle.trade_price;
            const profit = (sellPrice - buyPrice) * position;
            realCapital += position * sellPrice;
            tradeCount++;
            if (profit > 0)
                winCount++;
            mddPrices.push(tradePrice);
            thisData = {
                sellPrice,
                position,
                investment,
                profit,
            };
        }
        tradesData.push(Object.assign(Object.assign({}, thisData), { date: candle.date_time, price: tradePrice, range: range, capital: realCapital, tradeCount,
            winCount }));
    });
    const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
    return { tradesData, maxDrawdown };
}
function calculateFinalMetrics(tradesData, initialCapital) {
    const lastTrade = tradesData[tradesData.length - 1];
    const finalCapital = lastTrade.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = lastTrade.tradeCount > 0
        ? (lastTrade.winCount / lastTrade.tradeCount) * 100
        : 0;
    return {
        firstDate: tradesData[0].date,
        lastDate: tradesData[tradesData.length - 1].date,
        finalCapital,
        performance,
        tradeCount: lastTrade.tradeCount,
        winRate,
    };
}
function logResult(results) {
    console.log(`\n🔔 다자 가상화폐 + 상승장 + 변동성 돌파 Backtest\n`);
    results.forEach((result) => {
        console.log(`📈 [${result.market}]`);
        console.log(`첫째 날: ${result.firstDate}`);
        console.log(`마지막 날: ${result.lastDate}`);
        console.log(`Trade Count: ${result.tradeCount}번`);
        console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
        console.log(`Performance: ${result.performance.toFixed(2)}%`);
        console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
        console.log(`MDD: ${result.mdd.toFixed(2)}%\n`);
    });
}
