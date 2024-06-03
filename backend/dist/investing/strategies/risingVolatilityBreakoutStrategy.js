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
exports.risingVolatilityBreakoutStrategy = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const markets = ["KRW-THETA", "KRW-DOGE", "KRW-DOT", "KRW-AVAX"];
    risingVolatilityBreakoutStrategy(markets, 100000);
}))();
function risingVolatilityBreakoutStrategy(markets, initialCapital, k = 0.5) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const capital = initialCapital / markets.length;
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield generateSignal(market, capital, k); })));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error risingVolatilityBreakoutStrategy: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.risingVolatilityBreakoutStrategy = risingVolatilityBreakoutStrategy;
function generateSignal(market, capital, k) {
    return __awaiter(this, void 0, void 0, function* () {
        const period = 5;
        const candles = yield (0, api_1.fetchDailyCandles)(market, period.toString());
        const currentCandle = candles[candles.length - 1];
        const range = yield (0, utils_1.calculateRange)(candles[period - 2]);
        const movingAverage = (0, utils_1.calculateMovingAverage)(candles, period)[0];
        const isOverMovingAverage = currentCandle.trade_price > movingAverage;
        const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, k);
        const isBuySign = isOverMovingAverage && isBreakOut ? true : false;
        return {
            market,
            date: currentCandle.date_time,
            range,
            price: currentCandle.trade_price,
            signal: isBuySign ? "매수 또는 유지" : "매도 또는 유보",
            investment: isBuySign ? capital : 0,
        };
    });
}
function createMessage(results) {
    const title = `\n 🔔 다자 가상화폐 + 상승장 + 변동성 돌파\n`;
    const memo = `- 오전 9시 확인 \n\n`;
    const message = results
        .map((result) => {
        return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${result.signal}
가      격 : ${(0, utils_1.formatPrice)(result.price)}원
레  인  지 : ${(0, utils_1.formatPrice)(result.range)}원
매  수  금 : ${(0, utils_1.formatPrice)(result.investment)}원
`;
    })
        .join("\n");
    return `${title}${memo}${message}`;
}
