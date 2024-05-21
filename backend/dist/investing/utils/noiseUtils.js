"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectLowNoiseCryptos = exports.calculateAverageNoise = void 0;
function calculateNoise(candle) {
    const range = candle.high_price - candle.low_price;
    const body = candle.opening_price - candle.trade_price;
    return 1 - Math.abs(body) / range;
}
function calculateAverageNoise(candles) {
    const noiseValues = candles.map(calculateNoise);
    const totalNoise = noiseValues.reduce((sum, noise) => sum + noise, 0);
    return totalNoise / noiseValues.length;
}
exports.calculateAverageNoise = calculateAverageNoise;
function selectLowNoiseCryptos(cryptos, n) {
    const cryptowithNoise = cryptos.map((crypto) => {
        const averageNoise = calculateAverageNoise(crypto.candles);
        return Object.assign(Object.assign({}, crypto), { averageNoise });
    });
    cryptowithNoise.sort((a, b) => a.averageNoise - b.averageNoise);
    return cryptowithNoise.slice(0, n);
}
exports.selectLowNoiseCryptos = selectLowNoiseCryptos;
