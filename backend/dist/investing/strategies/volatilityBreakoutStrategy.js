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
exports.volatilityBreakoutStrategy = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function volatilityBreakoutStrategy(markets, initialCapital, k = 0.5) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
                return yield generateSignal(market, initialCapital, k, markets.length);
            })));
            return createMessage(results);
        }
        catch (error) {
            console.error("Error volatilityBreakoutStrategy: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.volatilityBreakoutStrategy = volatilityBreakoutStrategy;
function generateSignal(market, initialCapital, k, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, "2");
        const range = yield (0, utils_1.calculateRange)(candles[0]);
        const isBreakOut = (0, utils_1.checkBreakout)(candles[1], range, k);
        const signal = isBreakOut ? "Buy" : "Sell";
        return {
            market,
            date: candles[1].date_time,
            signal,
            price: candles[1].trade_price,
            investment: initialCapital / size,
            range,
        };
    });
}
function createMessage(results) {
    const title = `\n 🔔 다자 가상화폐 + 변동성 돌파\n`;
    const memo = `- 오전 9시 확인 \n\n`;
    const message = results
        .map((result) => {
        const isBuy = result.signal === "Buy";
        const investment = isBuy ? result.investment : null;
        return `📈 [${result.market}] 
날      짜 : ${result.date}
신      호 : ${isBuy ? "매수 또는 유지" : "매도 또는 유보"}
가      격 : ${(0, utils_1.formatPrice)(result.price)}원
레  인  지 : ${(0, utils_1.formatPrice)(result.range)}원
매  수  금 : ${(0, utils_1.formatPrice)(result.investment)}원
`;
    })
        .join("\n");
    return `${title}${memo}${message}`;
}
