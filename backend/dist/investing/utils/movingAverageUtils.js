"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMovingAverage = void 0;
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
