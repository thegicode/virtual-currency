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
exports.backtestMovingAverageTrades = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function backtestMovingAverageTrades(markets, candleUnit, movingAveragePeriod, initialCapital) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => backtestMarket(market, candleUnit, movingAveragePeriod, initialCapital)));
        results.forEach((result) => {
            console.log(`\n[${result.market}]`);
            console.log(`Final Capital: ${Math.round(result.finalCapital).toLocaleString()}`);
            console.log(`Return Rate: ${result.returnRate.toFixed(2)}%`);
            console.log(`Trade Count: ${result.tradeCount}`);
            console.log(`Max Drawdown: ${result.maxDrawdown.toFixed(2)}%`);
        });
    });
}
exports.backtestMovingAverageTrades = backtestMovingAverageTrades;
function backtestMarket(market, candleUnit, movingAveragePeriod, initialCapital) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchMinutes)(market, candleUnit, 200);
        const movingAverages = (0, utils_1.calculateMovingAverage)(candles);
        const trades = [];
        let capital = initialCapital;
        let position = 0;
        let maxCapital = initialCapital;
        let maxDrawdown = 0;
        candles.forEach((candle, index) => {
            if (index < movingAveragePeriod)
                return;
            const currentPrice = candle.trade_price;
            const movingAverage = movingAverages[index - movingAveragePeriod];
            let action = "유보";
            if (currentPrice > movingAverage && capital > 0) {
                position = capital / currentPrice;
                capital = 0;
                action = "매수";
            }
            else if (currentPrice < movingAverage && position > 0) {
                capital = position * currentPrice;
                position = 0;
                action = "매도";
            }
            const currentCapital = capital + position * currentPrice;
            trades.push({
                date: candle.candle_date_time_kst,
                action,
                price: currentPrice,
                capital: currentCapital,
                position,
            });
            if (currentCapital > maxCapital) {
                maxCapital = currentCapital;
            }
            const drawdown = ((maxCapital - currentCapital) / maxCapital) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        });
        const finalCapital = capital + position * candles[candles.length - 1].trade_price;
        const returnRate = ((finalCapital - initialCapital) / initialCapital) * 100;
        const tradeCount = trades.filter((trade) => trade.action !== "유보").length;
        return {
            market,
            trades,
            finalCapital,
            tradeCount,
            returnRate,
            maxDrawdown,
        };
    });
}