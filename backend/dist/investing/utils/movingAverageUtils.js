"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAboveAllMovingAverages = exports.calculateAllMovingAverages = exports.calculateMovingAverage = void 0;
function calculateMovingAverage(data, period = 3) {
    const movingAverages = [];
    for (let i = 0; i <= data.length - period; i++) {
        const slice = data.slice(i, i + period);
        const sum = slice.reduce((acc, cur) => acc + cur.trade_price, 0);
        movingAverages.push(sum / period);
    }
    return movingAverages;
}
exports.calculateMovingAverage = calculateMovingAverage;
function calculateAllMovingAverages(candles, periods) {
    const movingAverages = {};
    periods.forEach((period) => {
        movingAverages[`ma${period}`] = calculateMovingAverage(candles, period).slice(-1)[0];
    });
    return movingAverages;
}
exports.calculateAllMovingAverages = calculateAllMovingAverages;
function isAboveAllMovingAverages(currentPrice, movingAverages) {
    return (currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20);
}
exports.isAboveAllMovingAverages = isAboveAllMovingAverages;
