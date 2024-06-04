"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMDD = exports.calculateBollingerBands = exports.calculateAdjustedInvestment = void 0;
function calculateAdjustedInvestment(range, candle, targetRate, size, capital) {
    const prevVolatilityRate = range / candle.opening_price;
    const investmentRate = targetRate / prevVolatilityRate / size;
    const investment = investmentRate * capital;
    return {
        investment,
        prevVolatilityRate,
    };
}
exports.calculateAdjustedInvestment = calculateAdjustedInvestment;
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
function calculateMDD(prices) {
    let peak = prices[0];
    let maxDrawdown = 0;
    for (let price of prices) {
        if (price > peak) {
            peak = price;
        }
        else {
            const drawdown = ((peak - price) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
    }
    return maxDrawdown;
}
exports.calculateMDD = calculateMDD;
