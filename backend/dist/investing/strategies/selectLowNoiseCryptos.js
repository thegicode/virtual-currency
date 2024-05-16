"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectLowNoiseCryptos = void 0;
const noise_1 = require("./noise");
function selectLowNoiseCryptos(cryptos, n) {
    const cryptowithNoise = cryptos.map((crypto) => {
        const averageNoise = (0, noise_1.calculateAverageNoise)(crypto.candles);
        return Object.assign(Object.assign({}, crypto), { averageNoise });
    });
    cryptowithNoise.sort((a, b) => a.averageNoise - b.averageNoise);
    return cryptowithNoise.slice(0, n);
}
exports.selectLowNoiseCryptos = selectLowNoiseCryptos;
