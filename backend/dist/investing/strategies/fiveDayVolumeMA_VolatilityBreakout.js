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
exports.fiveDayVolumeMA_VolatilityBreakout = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function fiveDayVolumeMA_VolatilityBreakout(markets, initialCapital, k = 0.7, targetRate = 0.02) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const capital = initialCapital / markets.length;
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield generateSignal(market, capital, k, targetRate, markets.length);
            })));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error fiveDayVolumeMA_VolatilityBreakout: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.fiveDayVolumeMA_VolatilityBreakout = fiveDayVolumeMA_VolatilityBreakout;
function generateSignal(market, capital, k, targetRate, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const period = 5;
        const candles = yield (0, api_1.fetchDailyCandles)(market, (period + 1).toString());
        if (candles.length < 6) {
            console.warn(`Not enough data for ${market}`);
        }
        const prevCandle = candles[candles.length - 2];
        const currentCandle = candles[candles.length - 1];
        const last5Candles = candles.slice(-6, -1);
        const range = (0, utils_1.calculateRange)(prevCandle);
        const priceMovingAverage = (0, utils_1.calculateMovingAverage2)(last5Candles, period);
        const isOverPriceAverage = currentCandle.trade_price > priceMovingAverage;
        const volumeAverage = (0, utils_1.calculateVolumeAverage)(last5Candles);
        const isOverVolumeAverage = prevCandle.candle_acc_trade_volume > volumeAverage;
        const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, k);
        const isBuySign = isOverPriceAverage && isOverVolumeAverage && isBreakOut ? true : false;
        const { investment, prevVolatilityRate } = (0, utils_1.calculateAdjustedInvestment)(range, prevCandle, targetRate, size, capital);
        return {
            market,
            date: currentCandle.date_time,
            range,
            price: currentCandle.trade_price,
            signal: isBuySign ? "매수 또는 유지" : "매도 또는 유보",
            prevVolatilityRate: (prevVolatilityRate * 100).toFixed(2),
            investment: isBuySign ? investment : 0,
        };
    });
}
function createMessage(results) {
    const title = `\n 🔔  5일 이동평균 & 5일 거래량 상승장 + 변동성 돌파 + 변동성 조절\n`;
    const memo = `- 오전 9시 확인 \n\n`;
    const message = results
        .map((result) => {
        return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${result.signal}
가      격 : ${(0, utils_1.formatPrice)(result.price)}원
레  인  지 : ${(0, utils_1.formatPrice)(result.range)}원
전일변동성 : ${result.prevVolatilityRate}
매  수  금 : ${(0, utils_1.formatPrice)(result.investment)}원
`;
    })
        .join("\n");
    return `${title}${memo}${message}`;
}