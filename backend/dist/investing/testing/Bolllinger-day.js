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
exports.bollingerBandsBacktest = void 0;
const api_1 = require("../../services/api");
function bollingerBandsBacktest(market, initialCapital, days = 200, period = 20) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, days.toString());
        const { middleBand, upperBand, lowerBand } = calculateBollingerBands(candles, period);
        let capital = initialCapital;
        let position = 0;
        let trades = 0;
        let wins = 0;
        let peakCapital = initialCapital;
        let maxDrawdown = 0;
        for (let i = 0; i < upperBand.length; i++) {
            const currentPrice = candles[period - 1 + i].trade_price;
            if (currentPrice < lowerBand[i]) {
                const investment = capital;
                position += investment / currentPrice;
                capital -= investment;
                trades++;
            }
            else if (currentPrice > upperBand[i] && position > 0) {
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
            initialCapital,
            finalCapital,
            trades,
            winRate,
            performance: performance.toFixed(2) + "%",
            mdd: maxDrawdown,
        };
    });
}
exports.bollingerBandsBacktest = bollingerBandsBacktest;
function calculateBollingerBands(candles, period = 20) {
    const middleBand = [];
    const upperBand = [];
    const lowerBand = [];
    for (let i = period - 1; i < candles.length; i++) {
        const slice = candles.slice(i - period + 1, i + 1);
        const prices = slice.map((candle) => candle.trade_price);
        const mean = prices.reduce((sum, price) => sum + price, 0) / period;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
            period;
        const stdDev = Math.sqrt(variance);
        middleBand.push(mean);
        upperBand.push(mean + 2 * stdDev);
        lowerBand.push(mean - 2 * stdDev);
    }
    return { middleBand, upperBand, lowerBand };
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const market = "KRW-DOGE";
    const initialCapital = 1000000;
    const days = 200;
    const backtestResult = yield bollingerBandsBacktest(market, initialCapital, days);
    console.log(backtestResult);
}))();
