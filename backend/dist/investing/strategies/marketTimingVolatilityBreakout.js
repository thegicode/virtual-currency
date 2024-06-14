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
exports.marketTimingVolatilityBreakout = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function marketTimingVolatilityBreakout(markets, initialCapital, targetRate = 0.02) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const capital = initialCapital / markets.length;
            const results = yield Promise.all(markets.map((market) => generateSignal(market, capital, targetRate)));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error averageNoiseRatioSignalCheck: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.marketTimingVolatilityBreakout = marketTimingVolatilityBreakout;
function generateSignal(market, capital, targetRate) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, (21).toString());
        const currentCandleIndex = 20;
        const currentCandle = candles[currentCandleIndex];
        const prevCandle = candles[currentCandleIndex - 1];
        const noiseAverage = (0, utils_1.calculateAverageNoise)(candles.slice(0, currentCandleIndex), market);
        const range = yield (0, utils_1.calculateRange)(prevCandle);
        const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, noiseAverage);
        let buySignal = {
            investment: 0,
        };
        if (isBreakOut) {
            const movingAverages = (0, utils_1.calculateAllMovingAverages)(candles.slice(0, currentCandleIndex), [3, 5, 10, 20]);
            const score = Object.values(movingAverages).reduce((a, b) => a + (currentCandle.trade_price > b ? 1 : 0), 0);
            const capitalScroed = (capital * score) / 4;
            const prevVolatility = range / prevCandle.trade_price;
            const investment = (targetRate / prevVolatility) * capitalScroed;
            buySignal = {
                investment,
            };
        }
        return {
            market,
            date: currentCandle.date_time,
            price: currentCandle.trade_price,
            prevRange: range,
            noiseAverage,
            signal: isBreakOut ? "매수 또는 보유" : "매도 또는 유보",
            investment: buySignal.investment,
        };
    });
}
function createMessage(results) {
    const title = `\n 🔔 평균 노이즈 비율 + 마켓 타이밍 + 변동성 돌파\n\n`;
    const message = results
        .map((result) => {
        return `📈 [${result.market}] 
날      짜 : ${result.date}
가      격 : ${(0, utils_1.formatPrice)(result.price)}원
평균노이즈 : ${result.noiseAverage.toFixed(3)}
신      호 : ${result.signal}
매  수  금 : ${(0, utils_1.formatPrice)(Math.round(result.investment))}원
`;
    })
        .join("\n");
    return `${title}${message}`;
}
