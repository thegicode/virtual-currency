"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVolatility = void 0;
function calculateVolatility(candles) {
    const volatilities = candles.map((candle) => ((candle.high_price - candle.low_price) / candle.opening_price) *
        100);
    return (volatilities.reduce((acc, curr) => acc + curr, 0) / volatilities.length);
}
exports.calculateVolatility = calculateVolatility;
