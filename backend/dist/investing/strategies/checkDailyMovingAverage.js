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
exports.checkDailyMovingAverage = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function checkDailyMovingAverage(markets, period = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield checkMovingAverage(market, period); })));
            const validResults = results.filter((result) => result !== undefined);
            notifyResults(validResults, period);
        }
        catch (error) {
            console.error(`Error checking daily moving averages:`, error);
        }
    });
}
exports.checkDailyMovingAverage = checkDailyMovingAverage;
function checkMovingAverage(market, period) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fetchedData = yield (0, api_1.fetchDailyCandles)(market, period.toString());
            const movingAverages = (0, utils_1.calculateMovingAverage)(fetchedData, period);
            const currentPrice = (yield (0, api_1.fetchTicker)(market))[0].trade_price;
            const latestMovingAverage = movingAverages[movingAverages.length - 1];
            const signal = currentPrice > latestMovingAverage ? "매수" : "매도";
            return {
                market,
                movingAverage: latestMovingAverage,
                currentPrice: currentPrice,
                signal,
            };
        }
        catch (error) {
            console.error(`Error checking moving average for market ${market}:`, error);
        }
    });
}
function notifyResults(data, period) {
    const title = `\n 🔔 일캔들 ${period}일 이동평균 신호 확인 🔔\n\n`;
    const message = data
        .map((aData) => `📈 [${aData.market}] 
현재 가격: ${aData.currentPrice.toLocaleString()}원
평균 가격: ${aData.movingAverage.toLocaleString()}원
신호: ${aData.signal}`)
        .join("\n\n");
    const messages = `${title}${message}\n`;
    console.log(messages);
}
