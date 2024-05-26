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
const movingAverageAndVolatility_1 = require("../strategies/movingAverageAndVolatility");
const utils_1 = require("../utils");
function movingAverageAndVolatilityBacktest(markets, initialCapital, targetVolatility = 2, days = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => backtestMarket(market, days, targetVolatility, markets, initialCapital)));
        console.log(`\n🔔 3, 5, 10, 20일 이동평균 + 변동성 조절 backtest - ${days}일\n`);
        results.forEach((result) => {
            console.log(`📈 [${result.market}]`);
            console.log(`Trade Count: ${result.trades}`);
            console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}원`);
            console.log(`Performance: ${result.performance.toFixed(2)}%`);
            console.log(`MDD: ${result.mdd.toFixed(2)}%`);
            console.log(`Win Rate: ${result.winRate.toFixed(2)}%\n\n`);
        });
    });
}
exports.movingAverageAndVolatilityBacktest = movingAverageAndVolatilityBacktest;
function backtestMarket(market, days, targetVolatility, markets, initialCapital) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, days.toString());
        let capital = initialCapital;
        let position = 0;
        let trades = 0;
        let wins = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        for (let i = 20; i < candles.length; i++) {
            const currentCandles = candles.slice(i - 20, i);
            const movingAverages = (0, utils_1.calculateAllMovingAverages)(currentCandles, [3, 5, 10, 20]);
            const currentPrice = candles[i].trade_price;
            const volatility = (0, utils_1.calculateVolatility)(currentCandles.slice(-5));
            const isSignal = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
            const capitalAllocation = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, markets.length, capital);
            const { signal, position: newPosition } = (0, movingAverageAndVolatility_1.determineInvestmentAction)(isSignal, currentPrice, capitalAllocation);
            if (signal === "매수" && capital >= capitalAllocation) {
                capital -= capitalAllocation;
                position += newPosition;
                trades++;
            }
            else if (signal === "매도" && position > 0) {
                capital += position * currentPrice;
                position = 0;
                trades++;
                if (capital > initialCapital) {
                    wins++;
                }
            }
            const currentTotal = capital + position * currentPrice;
            if (currentTotal > peakCapital) {
                peakCapital = currentTotal;
            }
            const drawdown = ((peakCapital - currentTotal) / peakCapital) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        const finalCapital = capital + position * candles[candles.length - 1].trade_price;
        const performance = (finalCapital / initialCapital - 1) * 100;
        const winRate = (wins / trades) * 100;
        return {
            market,
            finalCapital,
            trades,
            winRate,
            mdd: maxDrawdown,
            performance,
        };
    });
}
