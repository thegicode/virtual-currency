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
const api_1 = require("../../services/api");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    function fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, api_1.fetchDailyCandles)("KRW-SOL", "200");
        });
    }
    const data = yield fetchData();
    function calculateRSI(data, n) {
        let gains = 0;
        let losses = 0;
        for (let i = 1; i <= n; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                gains += change;
            }
            else {
                losses -= change;
            }
        }
        let avgGain = gains / n;
        let avgLoss = losses / n;
        data[n].rsi = 100 - 100 / (1 + avgGain / avgLoss);
        for (let i = n + 1; i < data.length; i++) {
            const change = data[i].trade_price - data[i - 1].trade_price;
            if (change > 0) {
                avgGain = (avgGain * (n - 1) + change) / n;
                avgLoss = (avgLoss * (n - 1)) / n;
            }
            else {
                avgGain = (avgGain * (n - 1)) / n;
                avgLoss = (avgLoss * (n - 1) - change) / n;
            }
            data[i].rsi = 100 - 100 / (1 + avgGain / avgLoss);
        }
    }
    function calculateBollingerBandsAndRSI(data, n, k, rsiPeriod) {
        calculateRSI(data, rsiPeriod);
        data.forEach((row, index) => {
            if (index >= n) {
                const prices = data
                    .slice(index - n, index)
                    .map((d) => d.trade_price);
                const avgPrice = prices.reduce((acc, price) => acc + price, 0) / n;
                const stdDev = Math.sqrt(prices
                    .map((price) => Math.pow(price - avgPrice, 2))
                    .reduce((acc, diff) => acc + diff, 0) / n);
                const upperBand = avgPrice + k * stdDev;
                const lowerBand = avgPrice - k * stdDev;
                row.avg_price = avgPrice;
                row.upper_band = upperBand;
                row.lower_band = lowerBand;
                if (row.rsi && row.rsi < 30 && row.trade_price < lowerBand) {
                    row.signal = 1;
                }
                else if (row.rsi &&
                    row.rsi > 70 &&
                    row.trade_price > upperBand) {
                    row.signal = -1;
                }
                else {
                    row.signal = 0;
                }
            }
            else {
                row.signal = 0;
            }
        });
    }
    function backtestBollingerBandsAndRSI(data, initialCapital) {
        let capital = initialCapital;
        let position = 0;
        data.forEach((row) => {
            if (row.signal === 1 && capital > 0) {
                position = capital / row.trade_price;
                capital = 0;
            }
            else if (row.signal === -1 && position > 0) {
                capital = position * row.trade_price;
                position = 0;
            }
            row.capital = capital + position * row.trade_price;
        });
        return data;
    }
    const initialCapital = 10000;
    const n = 20;
    const k = 2;
    const rsiPeriod = 14;
    calculateBollingerBandsAndRSI(data, n, k, rsiPeriod);
    const bollingerBandsAndRSIResult = backtestBollingerBandsAndRSI(data, initialCapital);
    const finalCapitalBollingerBandsAndRSI = bollingerBandsAndRSIResult[bollingerBandsAndRSIResult.length - 1]
        .capital;
    const returnRateBollingerBandsAndRSI = (finalCapitalBollingerBandsAndRSI / initialCapital - 1) * 100;
    console.log("Bollinger Bands and RSI Strategy Results:");
    console.log(bollingerBandsAndRSIResult.slice(-10));
    console.log(`Final Capital: ${finalCapitalBollingerBandsAndRSI}`);
    console.log(`Return Rate: ${returnRateBollingerBandsAndRSI.toFixed(2)}%`);
});
start();
