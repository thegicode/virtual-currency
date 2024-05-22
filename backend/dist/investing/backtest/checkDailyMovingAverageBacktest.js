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
exports.checkDailyMovingAverageBacktest = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
const INITIAL_CAPITAL = 10000;
function checkDailyMovingAverageBacktest(markets, period = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield backtestMarket(market, period); })));
        results.forEach((result) => {
            console.log(`[${result.market}]`);
            console.log(`Final Capital: ${result.capital}`);
            console.log(`Total Trades: ${result.trades}`);
            console.log(`Return Rate: ${result.returnRate.toFixed(2)}%`);
            console.log(`Maximum Drawdown (MDD): ${result.mdd.toFixed(2)}%`);
            console.log("");
        });
    });
}
exports.checkDailyMovingAverageBacktest = checkDailyMovingAverageBacktest;
function backtestMarket(market, period) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, "200");
        const movingAverages = (0, utils_1.calculateMovingAverage)(candles);
        let capital = INITIAL_CAPITAL;
        let position = 0;
        let trades = 0;
        let peak = INITIAL_CAPITAL;
        let mdd = 0;
        const log = [];
        candles.slice(period).forEach((candle, index) => {
            const currentPrice = candle.trade_price;
            const movingAverage = movingAverages[index];
            if (currentPrice > movingAverage && capital > 0) {
                position = capital / currentPrice;
                capital = 0;
                trades++;
                log.push(`[${candle.time}] Buy at ${currentPrice}`);
            }
            else if (currentPrice < movingAverage && position > 0) {
                capital = position * currentPrice;
                position = 0;
                trades++;
                log.push(`[${candle.time}] Sell at ${currentPrice}`);
            }
            const currentValue = capital + position * currentPrice;
            if (currentValue > peak) {
                peak = currentValue;
            }
            const drawdown = ((peak - currentValue) / peak) * 100;
            if (drawdown > mdd) {
                mdd = drawdown;
            }
        });
        const finalCapital = capital + position * candles[candles.length - 1].trade_price;
        const returnRate = (finalCapital / INITIAL_CAPITAL - 1) * 100;
        return {
            market,
            capital: Math.round(finalCapital).toLocaleString(),
            trades,
            log,
            mdd,
            returnRate,
        };
    });
}
