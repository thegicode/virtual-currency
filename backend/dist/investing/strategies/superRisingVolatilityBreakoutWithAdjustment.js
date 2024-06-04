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
exports.superRisingVolatilityBreakoutWithAdjustment = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function superRisingVolatilityBreakoutWithAdjustment(markets, initialCapital, k = 0.5, targetRate = 0.02) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const capital = initialCapital / markets.length;
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield generateSignal(market, capital, k, targetRate, markets.length);
            })));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error superRisingVolatilityBreakoutWithAdjustment: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.superRisingVolatilityBreakoutWithAdjustment = superRisingVolatilityBreakoutWithAdjustment;
function generateSignal(market, capital, k, targetRate, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const period = 20;
        const candles = yield (0, api_1.fetchDailyCandles)(market, period.toString());
        const currentCandle = candles[period - 1];
        const prevCandle = candles[period - 2];
        const range = (0, utils_1.calculateRange)(prevCandle);
        const movingAverages = (0, utils_1.calculateAllMovingAverages)(candles, [3, 5, 10, 20]);
        const isOverMovingAverage = (0, utils_1.isAboveAllMovingAverages)(currentCandle.trade_price, movingAverages);
        const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, k);
        const isBuySign = isOverMovingAverage && isBreakOut ? true : false;
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
    const title = `\n 🔔 슈퍼 상승장(4개 이동평균 상승장) + 변동성 돌파 + 변동성 조절\n`;
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
