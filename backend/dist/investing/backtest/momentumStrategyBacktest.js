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
exports.fetchMarketsAndBacktest = void 0;
const api_1 = require("../../services/api");
function fetchMarketsAndBacktest(initialCapital, days = 31) {
    return __awaiter(this, void 0, void 0, function* () {
        const markets = yield (0, api_1.fetchMarketAll)();
        const selectedMarkets = markets
            .slice(40, 50)
            .map((market) => market.market);
        console.log(selectedMarkets);
        return momentumStrategyBacktest(selectedMarkets, initialCapital, days);
    });
}
exports.fetchMarketsAndBacktest = fetchMarketsAndBacktest;
function momentumStrategyBacktest(markets, initialCapital, days) {
    return __awaiter(this, void 0, void 0, function* () {
        let capital = initialCapital;
        let positions = {};
        let trades = 0;
        let wins = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        let lastResults = [];
        const candles = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            return {
                market,
                candles: yield (0, api_1.fetchDailyCandles)(market, days.toString()),
            };
        })));
        for (let day = 30; day < days; day++) {
            console.log("\n day", day);
            const results = candles.map(({ market, candles }, index) => {
                if (!candles)
                    return { market, returnRate: 0, currentPrice: 0 };
                if (index === 0)
                    console.log(candles[day].date_time);
                const currentPrice = candles[day].trade_price;
                const pastPrice = candles[day - 30].trade_price;
                const returnRate = (currentPrice - pastPrice) / pastPrice;
                return { market, returnRate, currentPrice };
            });
            const sortedResults = results.sort((a, b) => b.returnRate - a.returnRate);
            lastResults = sortedResults;
            const topMarkets = sortedResults
                .filter((result) => result.returnRate > 0)
                .slice(0, 5);
            const allNegative = sortedResults.every((result) => result.returnRate < 0);
            if (day === 42)
                console.log("topMarkets", topMarkets);
            const newPositions = {};
            topMarkets.forEach((result) => {
                const market = result.market;
                if (!positions[market]) {
                    const investment = capital * 0.1;
                    newPositions[market] = investment / result.currentPrice;
                    capital -= investment;
                    console.log("capital buy", market, capital.toLocaleString());
                }
                else {
                    newPositions[market] = positions[market];
                }
            });
            for (const market in positions) {
                if (!newPositions[market]) {
                    const oldPosition = positions[market];
                    const sellPrice = sortedResults.find((result) => result.market === market).currentPrice;
                    const profit = oldPosition *
                        (sellPrice - oldPosition * (capital / initialCapital));
                    if (profit > 0)
                        wins++;
                    capital += oldPosition * sellPrice;
                    delete positions[market];
                    console.log("capital sell", market, (profit * 100).toFixed(2), capital.toLocaleString());
                }
            }
            positions = newPositions;
            console.log("positions", positions);
            trades++;
            const currentTotal = capital +
                Object.keys(positions).reduce((sum, market) => {
                    return (sum +
                        positions[market] *
                            sortedResults.find((result) => result.market === market).currentPrice);
                }, 0);
            if (currentTotal > peakCapital) {
                peakCapital = currentTotal;
            }
            const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        const finalCapital = capital +
            Object.keys(positions).reduce((sum, market) => {
                var _a;
                const currentPrice = ((_a = lastResults.find((result) => result.market === market)) === null || _a === void 0 ? void 0 : _a.currentPrice) || 0;
                return sum + positions[market] * currentPrice;
            }, 0);
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = trades > 0 ? (wins / trades) * 100 : 0;
        return {
            finalCapital,
            performance: performance.toFixed(2) + "%",
            winRate,
            maxDrawdown,
        };
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const initialCapital = 1000000;
    const days = 200;
    const backtestResults = yield fetchMarketsAndBacktest(initialCapital, days);
    console.log(backtestResults);
}))();
