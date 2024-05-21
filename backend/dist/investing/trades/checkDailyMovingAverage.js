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
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
const strategies_1 = require("../strategies");
function checkDailyMovingAverage(markets, unit = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield checkMovingAverage(market, unit);
            }
            catch (error) {
                console.error(`Error checking moving average for market ${market}:`, error);
            }
        })));
        makeMessageAndNotify(data, unit);
    });
}
exports.checkDailyMovingAverage = checkDailyMovingAverage;
function checkMovingAverage(market, unit) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fetchedData = yield (0, api_1.fetchDailyCandles)(market, unit.toString());
            const movingAverages = (0, strategies_1.calculateMovingAverage)(fetchedData);
            const currentPrice = (yield (0, api_1.fetchTicker)(market))[0].trade_price;
            const latestMovingAverage = movingAverages[movingAverages.length - 1];
            const signal = currentPrice > latestMovingAverage
                ? "매수 신호입니다."
                : "매도 신호입니다.";
            return {
                market,
                movingAverage: latestMovingAverage,
                currentPrice: currentPrice,
                signal,
            };
        }
        catch (error) {
            console.error(`Error in checkMovingAverage for market ${market}:`, error);
        }
    });
}
function makeMessageAndNotify(data, unit) {
    const messages = `${unit}일 이동평균 신호 확인 \n\n` +
        data
            .map((aData) => `[${aData.market}] 
이동평균값: ${aData.movingAverage.toLocaleString()}
현재가격: ${aData.currentPrice.toLocaleString()}
${aData.signal}`)
            .join("\n\n");
    console.log(messages);
    (0, notifications_1.sendTelegramMessageToChatId)(messages);
}
