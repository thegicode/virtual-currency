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
            const { movingAverages, currentPrice, volatility } = yield fetchMarketData(market);
            return makeInvestmentDecision(market, movingAverages, currentPrice, volatility, initialCapital, targetVolatility, markets.length);
        })));
        return makeMessage(results);
    });
}
exports.executeMovingAverageAndVolatility = executeMovingAverageAndVolatility;
function fetchMarketData(market) {
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, "20");
        const movingAverages = {
            ma3: (0, utils_1.calculateMovingAverage)(candles, 3).slice(-1)[0],
            ma5: (0, utils_1.calculateMovingAverage)(candles, 5).slice(-1)[0],
            ma10: (0, utils_1.calculateMovingAverage)(candles, 10).slice(-1)[0],
            ma20: (0, utils_1.calculateMovingAverage)(candles, 20).slice(-1)[0],
        };
        const currentPrice = candles.slice(-1)[0].trade_price;
        const volatility = (0, utils_1.calculateVolatility)(candles.slice(-5));
        return {
            movingAverages,
            currentPrice,
            volatility,
        };
    });
}
function makeInvestmentDecision(market, movingAverages, currentPrice, volatility, initialCapital, targetVolatility, marketCount) {
    let allocatedCapital = 0;
    let position = 0;
    let signal = "보유";
    if (currentPrice > movingAverages.ma3 &&
        currentPrice > movingAverages.ma5 &&
        currentPrice > movingAverages.ma10 &&
        currentPrice > movingAverages.ma20) {
        allocatedCapital =
            (targetVolatility / volatility / marketCount) * initialCapital;
        position = allocatedCapital / currentPrice;
        signal = "매수";
    }
    else {
        allocatedCapital = 0;
        position = 0;
        signal = "매도";
    }
    return {
        market,
        currentPrice,
        volatility,
        signal,
    };
}
function makeMessage(results) {
    const title = `\n 🔔 슈퍼 상승장(3, 5, 10, 20 이동평균) + 변동성 조절\n\n`;
    const message = results
        .map((result) => `📈 [${result.market}] 
현재 가격: ${(0, utils_1.formatPrice)(result.currentPrice)}원
변동성: ${result.volatility.toFixed(2)}%
신호: ${result.signal}`)
        .join("\n\n");
    return `${title}${message}\n`;
}
