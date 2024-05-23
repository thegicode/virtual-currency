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
exports.checkMinutesMovingAverage = void 0;
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function checkMinutesMovingAverage(markets, candleUnit, movingAveragePeriod) {
    return __awaiter(this, void 0, void 0, function* () {
        let executionCount = 0;
        const chatIds = (yield (0, notifications_1.getChatIds)());
        yield executeAndNotifyInterval();
        setInterval(executeAndNotifyInterval, 1000 * 60 * candleUnit);
        function executeAndNotifyInterval() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield executeAndNotify(movingAveragePeriod, executionCount, markets, candleUnit, chatIds);
                    executionCount++;
                }
                catch (error) {
                    console.error(`Error during interval execution: ${error instanceof Error ? error.message : error}`);
                }
            });
        }
    });
}
exports.checkMinutesMovingAverage = checkMinutesMovingAverage;
function executeAndNotify(movingAveragePeriod, executionCount, markets, candleUnit, chatIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const tradeInfos = yield getTradeInfos(markets, movingAveragePeriod, candleUnit);
        const message = formatTradeInfosMessage(tradeInfos, executionCount, candleUnit, movingAveragePeriod);
        console.log(message);
    });
}
function getTradeInfos(markets, movingAveragePeriod, candleUnit) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            const candles = yield (0, api_1.fetchMinutesCandles)(market, candleUnit, movingAveragePeriod);
            const movingAverage = (0, utils_1.calculateMovingAverage)(candles)[0];
            const latestCandle = candles[candles.length - 1];
            const ticker = (yield (0, api_1.fetchTicker)(market))[0];
            if (!ticker) {
                throw new Error(`Ticker data for market ${market} not found`);
            }
            const signal = ticker.trade_price > movingAverage ? "매수" : "매도";
            return {
                market,
                averageTime: latestCandle.date,
                averagePrice: movingAverage,
                tickerTime: ticker.trade_timestamp,
                tickerTradePrice: ticker.trade_price,
                signal,
            };
        }));
        return Promise.all(promises);
    });
}
function formatTradeInfosMessage(tradeInfos, executionCount, candleUnit, movingAveragePeriod) {
    const title = `\n 🔔 ${candleUnit}분캔들의 ${movingAveragePeriod} 이동평균 ${executionCount + 1}번째 실행\n\n`;
    const message = tradeInfos
        .map((info) => {
        return `📈 [${info.market}]
평균 시간: ${info.averageTime}
티커 시간: ${(0, utils_1.formatTimestampToKoreanTime)(info.tickerTime)}
평균 가격: ${(0, utils_1.formatPrice)(info.averagePrice)}원
현재 가격: ${(0, utils_1.formatPrice)(info.tickerTradePrice)}원
신호: ${info.signal}`;
    })
        .join("\n\n");
    return `${title}${message}\n`;
}
