"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAboveAllMovingAverages = exports.calculateVolumeAverage = exports.calculateVolume = exports.calculateVolatility = exports.calculateRiskAdjustedCapital = exports.calculateMovingAverage2 = exports.calculateMovingAverage = exports.calculateMovingAverages = exports.calculateCandleReturnRate = exports.calculateAllMovingAverages = void 0;
function calculateAllMovingAverages(candles, periods) {
    const movingAverages = {};
    periods.forEach((period) => {
        movingAverages[`ma${period}`] = calculateMovingAverage(candles, period).slice(-1)[0];
    });
    return movingAverages;
}
exports.calculateAllMovingAverages = calculateAllMovingAverages;
function calculateCandleReturnRate(candles) {
    const openPrice = candles[0].opening_price;
    const closePrice = candles[candles.length - 1].trade_price;
    return (closePrice - openPrice) / openPrice;
}
exports.calculateCandleReturnRate = calculateCandleReturnRate;
function calculateMovingAverages(data, period = 3) {
    const movingAverages = [];
    for (let i = 0; i <= data.length - period; i++) {
        const slice = data.slice(i, i + period);
        const sum = slice.reduce((acc, cur) => acc + cur.trade_price, 0);
        movingAverages.push({
            date_time: data[i + period - 1].date_time,
            price: sum / period,
        });
    }
    return movingAverages;
}
exports.calculateMovingAverages = calculateMovingAverages;
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
function calculateMovingAverage2(data, period = 5) {
    if (data.length < period) {
        throw new Error("Not enough data to calculate moving average");
    }
    const sum = data
        .slice(-period)
        .reduce((acc, cur) => acc + cur.trade_price, 0);
    return sum / period;
}
exports.calculateMovingAverage2 = calculateMovingAverage2;
function calculateRiskAdjustedCapital(targetVolatility, volatility, size, initialCapital) {
    if (volatility === 0 || size === 0) {
        return 0;
    }
    return (targetVolatility / volatility / size) * initialCapital;
}
exports.calculateRiskAdjustedCapital = calculateRiskAdjustedCapital;
function calculateVolatility(candles) {
    const volatilities = candles.map((candle) => ((candle.high_price - candle.low_price) / candle.opening_price) *
        100);
    return (volatilities.reduce((acc, curr) => acc + curr, 0) / volatilities.length);
}
exports.calculateVolatility = calculateVolatility;
function calculateVolume(candles) {
    return candles.reduce((acc, cur) => acc + cur.candle_acc_trade_volume, 0);
}
exports.calculateVolume = calculateVolume;
function calculateVolumeAverage(candles) {
    return (candles.reduce((acc, candle) => acc + candle.candle_acc_trade_volume, 0) / candles.length);
}
exports.calculateVolumeAverage = calculateVolumeAverage;
function isAboveAllMovingAverages(currentPrice, movingAverages) {
    return (currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20);
}
exports.isAboveAllMovingAverages = isAboveAllMovingAverages;
