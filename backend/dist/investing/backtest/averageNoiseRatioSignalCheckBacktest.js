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
exports.averageNoiseRatioSignalCheckBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function averageNoiseRatioSignalCheckBacktest(markets, initialCapital, resultCounts, k = 0.5, targetRate = 0.01, transactionFee = 0.002) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const marketsCandles = yield Promise.all(markets.map((market) => getCandles(market, resultCounts)));
            const dateNoiseData = generateDateNoiseData(marketsCandles, resultCounts);
            const filterdData = filterAndSortMarketsByNoise(dateNoiseData);
            const results = yield runBacktest(marketsCandles, filterdData, initialCapital, resultCounts, k, targetRate, transactionFee, markets.length);
            logResult(results);
        }
        catch (error) {
            console.error("Error averageNoiseRatioSignalCheckBacktest: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.averageNoiseRatioSignalCheckBacktest = averageNoiseRatioSignalCheckBacktest;
function getCandles(market, resultCounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const adjustedApiCounts = (0, utils_1.adjustApiCounts)(resultCounts, 30);
        const candles = yield (0, api_1.fetchDailyCandles)(market, adjustedApiCounts.toString());
        return {
            market,
            candles,
        };
    });
}
function generateDateNoiseData(marketsCandles, resultCounts) {
    let result = [];
    for (let day = 0; day <= resultCounts; day++) {
        let dailyNoiseData = {
            date_time: "",
            noises: [],
        };
        marketsCandles.forEach(({ market, candles }) => {
            const newCandles = candles.slice(day, 30 + day);
            const noiseAverage = (0, utils_1.calculateAverageNoise)(newCandles, market);
            if (!newCandles[newCandles.length - 1])
                return;
            if (!dailyNoiseData.date_time) {
                dailyNoiseData.date_time =
                    newCandles[newCandles.length - 1].date_time;
            }
            dailyNoiseData.noises.push({
                market,
                value: noiseAverage,
            });
        });
        if (dailyNoiseData.date_time)
            result.push(dailyNoiseData);
    }
    return result;
}
function filterAndSortMarketsByNoise(dateNoiseData) {
    const reesult = dateNoiseData.map((aNoiseData) => {
        const { date_time, noises } = aNoiseData;
        const filtered = noises.filter((item) => item.value < 0.55);
        const sorted = filtered.sort((a, b) => a.value - b.value);
        return {
            date_time,
            noises: sorted.slice(0, 4),
        };
    });
    return reesult;
}
function runBacktest(marketsCandles, dateNoiseData, initialCapital, resultCounts, k, targetRate, transactionFee, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const { signalData, maxDrawdown } = yield runStrategies(marketsCandles, dateNoiseData, initialCapital, resultCounts, k, targetRate, transactionFee, size);
        const tradeData = signalData.map((s) => s.signals);
        const tableData1 = [];
        tradeData.forEach((td) => {
            td.forEach((aTd) => {
                tableData1.push(aTd);
            });
        });
        const tableData = tableData1.map((aData) => {
            var _a, _b, _c, _d, _e, _f;
            const position = (_a = aData.position) !== null && _a !== void 0 ? _a : 0;
            const profit = (_b = aData.profit) !== null && _b !== void 0 ? _b : 0;
            const investment = (_c = aData.investment) !== null && _c !== void 0 ? _c : 0;
            return {
                date: aData.date_time,
                market: aData.market,
                range: aData.range.toFixed(2),
                buyPrice: (_d = aData.buyPrice) !== null && _d !== void 0 ? _d : 0,
                sellPrice: (_e = aData.sellPrice) !== null && _e !== void 0 ? _e : 0,
                position: position.toFixed(2),
                investment: (_f = Math.round(investment).toLocaleString()) !== null && _f !== void 0 ? _f : 0,
                capital: Math.round(aData.capital).toLocaleString(),
                profit: Math.round(profit).toLocaleString(),
                tradeCount: aData.tradeCount,
                winCount: aData.winCount,
            };
        });
        const finalMetrics = calculateFinalMetrics(signalData, initialCapital);
        return Object.assign(Object.assign({}, finalMetrics), { maxDrawdown });
    });
}
function runStrategies(marketsCandles, dateNoiseData, capital, resultCounts, k, targetRate, transactionFee, size) {
    return __awaiter(this, void 0, void 0, function* () {
        let mddPrices = [];
        let tradeCount = 0;
        let winCount = 0;
        const signalData = yield Promise.all(dateNoiseData.map((aNoiseData, index) => __awaiter(this, void 0, void 0, function* () {
            const date_time = aNoiseData.date_time;
            const signals = yield Promise.all(aNoiseData.noises.map((aNoise, idx) => __awaiter(this, void 0, void 0, function* () {
                const market = aNoise.market;
                const candles = marketsCandles.filter((mc) => mc.market === market)[0].candles;
                const currentCandle = candles[29 + index];
                const nextCandle = candles[29 + index + 1] || currentCandle;
                const prevCandle = candles[29 + index - 1];
                const last5Candles = candles.slice(29 + index - 4, 29 + index + 1);
                const priceMovingAverage = (0, utils_1.calculateMovingAverage2)(last5Candles, 5);
                const isOverPriceAverage = prevCandle.trade_price > priceMovingAverage;
                const range = yield (0, utils_1.calculateRange)(prevCandle);
                const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, k);
                const isBuySign = isOverPriceAverage && isBreakOut ? true : false;
                let thisData = {};
                if (isBuySign) {
                    const buyPrice = nextCandle.opening_price;
                    const { investment, prevVolatilityRate } = (0, utils_1.calculateAdjustedInvestment)(range, prevCandle, targetRate, size, capital);
                    const position = investment / buyPrice;
                    capital -= investment;
                    const sellPrice = nextCandle.trade_price;
                    const profit = (sellPrice - buyPrice) * position;
                    capital += position * sellPrice;
                    tradeCount++;
                    if (profit > 0)
                        winCount++;
                    mddPrices.push(currentCandle.trade_price);
                    thisData = {
                        buyPrice,
                        sellPrice,
                        position,
                        investment,
                        profit,
                    };
                }
                return Object.assign(Object.assign({}, thisData), { date_time: idx === 0 ? date_time : "", market, range: range, capital,
                    tradeCount,
                    winCount });
            })));
            return {
                date_time,
                signals,
            };
        })));
        const maxDrawdown = (0, utils_1.calculateMDD)(mddPrices);
        return { signalData, maxDrawdown };
    });
}
function calculateFinalMetrics(signalData, initialCapital) {
    const lastData = signalData[signalData.length - 1];
    const lastSignals = lastData.signals;
    const lastSinganlsLast = lastSignals[lastSignals.length - 1];
    const finalCapital = lastSinganlsLast.capital;
    const performance = (finalCapital / initialCapital - 1) * 100;
    const winRate = lastSinganlsLast.tradeCount > 0
        ? (lastSinganlsLast.winCount / lastSinganlsLast.tradeCount) * 100
        : 0;
    return {
        firstDate: signalData[0].date_time,
        lastDate: lastData.date_time,
        finalCapital,
        performance,
        tradeCount: lastSinganlsLast.tradeCount,
        winRate,
    };
}
function logResult(result) {
    console.log(`\n🔔  다자 가상화폐 + 평균 노이즈 비율\n`);
    console.log(`첫째 날: ${result.firstDate}`);
    console.log(`마지막 날: ${result.lastDate}`);
    console.log(`Trade Count: ${result.tradeCount}번`);
    console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
    console.log(`Performance: ${result.performance.toFixed(2)}%`);
    console.log(`Win Rate: ${result.winRate.toFixed(2)}%`);
    console.log(`maxDrawdown: ${result.maxDrawdown.toFixed(2)}%\n`);
}
