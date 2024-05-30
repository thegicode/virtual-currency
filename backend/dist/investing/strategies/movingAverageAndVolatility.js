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
exports.determineInvestmentAction = exports.executeMovingAverageAndVolatility = void 0;
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
            const capitalAllocation = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, markets.length, initialCapital);
            const investmentDecision = determineInvestmentAction(shouldBuy, currentPrice, capitalAllocation);
            return Object.assign(Object.assign({ market,
                currentPrice,
                volatility }, investmentDecision), { capitalAllocation });
        })));
        return createMessage(results);
    });
}
exports.executeMovingAverageAndVolatility = executeMovingAverageAndVolatility;
function determineInvestmentAction(isSignal, currentPrice, capital) {
    let position = 0;
    let signal = "";
    if (isSignal && currentPrice > 0) {
        position = capital / currentPrice;
        signal = "Buy";
    }
    else {
        position = 0;
        signal = "Sell";
    }
    return { signal, position };
}
exports.determineInvestmentAction = determineInvestmentAction;
function createMessage(results) {
    const title = `\n 🔔 슈퍼 상승장(3, 5, 10, 20 이동평균) + 변동성 조절\n\n`;
    const message = results
        .map((result) => {
        const isBuy = result.signal === "Buy";
        const defaultMessage = `📈 [${result.market && result.market}] 
신호: ${isBuy ? "매수" : "매도"}
현재 가격: ${(0, utils_1.formatPrice)(result.currentPrice)}원
변동성: ${result.volatility.toFixed(2)}%
`;
        const buyMessage = `투자 금액: ${Math.round(result.capitalAllocation).toLocaleString()}원
매수 수량: ${result.position}`;
        const messages = isBuy
            ? `${defaultMessage}${buyMessage}`
            : defaultMessage;
        return messages;
    })
        .join("\n\n");
    return `${title}${message}`;
}
