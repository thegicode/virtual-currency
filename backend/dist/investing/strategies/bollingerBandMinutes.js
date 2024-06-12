"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
function fetchHourlyCandleData(market, minutes) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, api_1.fetchMinutesCandles)(market, minutes, 60);
    });
}
function computeBollingerBands(candles, period = 20, multiplier = 2) {
    const closingPrices = candles.map((candle) => candle.trade_price);
    const middleBand = closingPrices.slice(-period).reduce((acc, price) => acc + price, 0) /
        period;
    const variance = closingPrices
        .slice(-period)
        .reduce((acc, price) => acc + Math.pow(price - middleBand, 2), 0) /
        period;
    const stdDeviation = Math.sqrt(variance);
    const upperBand = middleBand + stdDeviation * multiplier;
    const lowerBand = middleBand - stdDeviation * multiplier;
    return { middleBand, upperBand, lowerBand };
}
function generateBollingerBandSignal(currentPrice, bollingerBands) {
    if (currentPrice <= bollingerBands.lowerBand) {
        return "매수 신호";
    }
    else if (currentPrice >= bollingerBands.upperBand) {
        return "매도 신호";
    }
    return "유지";
}
function executeBollingerBandStrategy(market, minutes) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield fetchHourlyCandleData(market, minutes);
        const bollingerBands = computeBollingerBands(candles);
        const currentPrice = candles[candles.length - 1].trade_price;
        const signal = generateBollingerBandSignal(currentPrice, bollingerBands);
        const message = `📈 [${market}]\n시간: ${new Date(candles[candles.length - 1].date_time).toLocaleString()}\n현재 가격: ${currentPrice}\n볼린저 밴드: 상단 ${bollingerBands.upperBand}, 중간 ${bollingerBands.middleBand}, 하단 ${bollingerBands.lowerBand}\n신호: ${signal}`;
        console.log(message);
        if (signal !== "유지")
            yield (0, notifications_1.sendTelegramMessageToChatId)(message);
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const markets = ["KRW-AERGO"];
    markets.forEach((market) => exec(market));
    function exec(market) {
        return __awaiter(this, void 0, void 0, function* () {
            const minutes = 1;
            yield executeBollingerBandStrategy(market, minutes);
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield executeBollingerBandStrategy(market, minutes);
            }), minutes * 60 * 1000);
        });
    }
}))();
