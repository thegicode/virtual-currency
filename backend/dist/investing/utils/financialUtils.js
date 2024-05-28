"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAboveAllMovingAverages = exports.calculateVolume = exports.calculateVolatility = exports.calculateRiskAdjustedCapital = exports.calculateMovingAverage = exports.calculateInvestmentAmount = exports.calculateCandleReturnRate = exports.calculateAllMovingAverages = void 0;
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
function calculateInvestmentAmount(targetVolatility, volatility, size, initialCapital) {
    const percent = targetVolatility / volatility / size;
    return (percent * initialCapital) / 100;
}
exports.calculateInvestmentAmount = calculateInvestmentAmount;
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
function calculateRiskAdjustedCapital(targetVolatility, volatility, count, initialCapital) {
    if (volatility === 0 || count === 0) {
        return 0;
    }
    return (targetVolatility / volatility / count) * initialCapital;
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
function isAboveAllMovingAverages(currentPrice, movingAverages) {
    return (currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20);
}
exports.isAboveAllMovingAverages = isAboveAllMovingAverages;
