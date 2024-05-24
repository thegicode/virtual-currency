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
exports.executeMovingAverageAndVolatility = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function executeMovingAverageAndVolatility(markets, initialCapital, targetVolatility = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            const candles = yield (0, api_1.fetchDailyCandles)(market, "20");
            const movingAverages = (0, utils_1.calculateAllMovingAverages)(candles, [3, 5, 10, 20]);
            const currentPrice = candles[candles.length - 1].trade_price;
            const volatility = (0, utils_1.calculateVolatility)(candles.slice(-5));
            const shouldBuy = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
            const capitalAllocation = calculateCapitalAllocation(targetVolatility, volatility, markets.length, initialCapital);
            const investmentDecision = makeInvestmentDecision(shouldBuy, currentPrice, capitalAllocation);
            return Object.assign(Object.assign({ market,
                currentPrice,
                volatility }, investmentDecision), { capitalAllocation });
        })));
        return createMessage(results);
    });
}
exports.executeMovingAverageAndVolatility = executeMovingAverageAndVolatility;
function calculateCapitalAllocation(targetVolatility, volatility, count, initialCapital) {
    return (targetVolatility / volatility / count) * initialCapital;
}
function makeInvestmentDecision(isSignal, currentPrice, capital) {
    let position = 0;
    let signal = "보유";
    if (isSignal) {
        position = capital / currentPrice;
        signal = "매수";
    }
    else {
        position = 0;
        signal = "매도";
    }
    return { signal, position };
}
function createMessage(results) {
    const title = `\n 🔔 슈퍼 상승장(3, 5, 10, 20 이동평균) + 변동성 조절\n\n`;
    const message = results
        .map((result) => `📈 [${result.market}] 
현재 가격: ${(0, utils_1.formatPrice)(result.currentPrice)}원
변동성: ${result.volatility.toFixed(2)}%
매수 자금: ${Math.round(result.capitalAllocation).toLocaleString()}원
신호: ${result.signal}`)
        .join("\n\n");
    return `${title}${message}\n`;
}