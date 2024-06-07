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
exports.averageNoiseRatioSignalCheck = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function averageNoiseRatioSignalCheck(markets, initialCapital, k = 0.5, targetRate = 0.01) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const noiseAveraged = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield getNoiseAverages(market); })));
            const selectedData = selectMarkets(noiseAveraged);
            const results = yield gerateSignal(selectedData, initialCapital, k, targetRate, markets.length);
            return createMessage(results);
        }
        catch (error) {
            console.error("Error averageNoiseRatioSignalCheck: ", error);
            return "Error in executing the strategy.";
        }
    });
}
exports.averageNoiseRatioSignalCheck = averageNoiseRatioSignalCheck;
function getNoiseAverages(market) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const candles = yield (0, api_1.fetchDailyCandles)(market, (31).toString());
        const noiseAverage = (_a = (0, utils_1.calculateAverageNoise)(candles, market)) !== null && _a !== void 0 ? _a : 0;
        return {
            market,
            candles,
            noiseAverage,
        };
    });
}
function selectMarkets(noiseAveraged) {
    const filterdData = noiseAveraged.filter((aData) => aData.noiseAverage < 0.55);
    const sorted = filterdData.sort((a, b) => a.noiseAverage - b.noiseAverage);
    return sorted.slice(0, 4);
}
function gerateSignal(noiseAveragedData, initialCapital, k, targetRate, size) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(noiseAveragedData.map(({ market, candles, noiseAverage }) => __awaiter(this, void 0, void 0, function* () {
            const currentCandle = candles[candles.length - 1];
            const prevCandle = candles[candles.length - 2];
            const last5Candles = candles.slice(-6, -1);
            const range = yield (0, utils_1.calculateRange)(prevCandle);
            const priceMovingAverage = (0, utils_1.calculateMovingAverage2)(last5Candles, 5);
            const isOverPriceAverage = currentCandle.trade_price > priceMovingAverage;
            const isBreakOut = (0, utils_1.checkBreakout)(currentCandle, range, k);
            const isBuySign = isOverPriceAverage && isBreakOut ? true : false;
            const { investment } = (0, utils_1.calculateAdjustedInvestment)(range, prevCandle, targetRate, size, initialCapital);
            return {
                market,
                date: currentCandle.date_time,
                noiseAverage,
                signal: isBuySign ? "매수 또는 보유" : "매도 또는 유보",
                price: currentCandle.trade_price,
                investment: isBuySign ? investment : 0,
            };
        })));
    });
}
function createMessage(results) {
    const title = `\n 🔔 다자 가상화폐 + 평균 노이즈 비율\n`;
    const memo = `- 오전 9시 확인 \n\n`;
    const message = results
        .map((result) => {
        return `📈 [${result.market}] 
날      짜 : ${result.date}
평균노이즈 : ${result.noiseAverage.toFixed(3)}
신      호 : ${result.signal}
가      격 : ${(0, utils_1.formatPrice)(result.price)}원
매  수  금 : ${(0, utils_1.formatPrice)(Math.round(result.investment))}원
`;
    })
        .join("\n");
    return `${title}${memo}${message}`;
}
