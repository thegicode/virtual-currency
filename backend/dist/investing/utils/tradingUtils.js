"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRange = exports.checkBreakout2 = exports.checkBreakout = exports.calculateAverageNoise = void 0;
function calculateNoise(candle) {
    const range = candle.high_price - candle.low_price;
    const body = candle.opening_price - candle.trade_price;
    return 1 - Math.abs(body) / range;
}
function calculateAverageNoise(candles, market) {
    if (!candles) {
        console.warn("no candles in ", market);
        return 0;
    }
    const noiseValues = candles.map(calculateNoise);
    const totalNoise = noiseValues.reduce((sum, noise) => sum + noise, 0);
    return totalNoise / noiseValues.length;
}
exports.calculateAverageNoise = calculateAverageNoise;
function checkBreakout(candle, range, k) {
    return candle.trade_price > candle.opening_price + range * k;
}
exports.checkBreakout = checkBreakout;
function checkBreakout2(realPrice, candle, range, k) {
    return realPrice > candle.opening_price + range * k;
}
exports.checkBreakout2 = checkBreakout2;
function calculateRange(candle) {
    return candle.high_price - candle.low_price;
}
exports.calculateRange = calculateRange;
