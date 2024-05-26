"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBollingerBands = void 0;
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
exports.calculateBollingerBands = calculateBollingerBands;
