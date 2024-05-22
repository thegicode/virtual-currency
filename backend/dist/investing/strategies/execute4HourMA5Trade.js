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
exports.schedule4HourMA5TradeExecution = exports.execute4HourMA5Trade = void 0;
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function execute4HourMA5Trade(markets) {
    return __awaiter(this, void 0, void 0, function* () {
        const tickers = yield (0, api_1.fetchTicker)(markets.join(", "));
        const promises = markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            const fetchData = yield (0, api_1.fetchMinutes)(market, "240", "5");
            const movingAverage = (0, utils_1.calculateMovingAverage)(fetchData)[0];
            const aCandle = fetchData[fetchData.length - 1];
            const aTicker = tickers.find((t) => t.market === market);
            if (!aTicker) {
                throw new Error(`Ticker data for market ${market} not found`);
            }
            const signal = aTicker.trade_price > movingAverage
                ? "매수 or 유지"
                : "매도 or 유보";
            return {
                market,
                averageTime: aCandle.time,
                averagePrice: movingAverage.toLocaleString(),
                tickerItme: (0, utils_1.formatTimestampToKoreanTime)(aTicker.trade_timestamp),
                ticekrTradePrice: aTicker.trade_price.toLocaleString(),
                signal,
            };
        }));
        return yield Promise.all(promises);
    });
}
exports.execute4HourMA5Trade = execute4HourMA5Trade;
function schedule4HourMA5TradeExecution(markets) {
    return __awaiter(this, void 0, void 0, function* () {
        let index = 0;
        const chatIds = (yield (0, notifications_1.getChatIds)());
        yield generateAndSendTradeInfo(markets, chatIds, index);
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            ++index;
            yield generateAndSendTradeInfo(markets, chatIds, index);
        }), 1000 * 60 * 240);
    });
}
exports.schedule4HourMA5TradeExecution = schedule4HourMA5TradeExecution;
function generateAndSendTradeInfo(markets, chatIds, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const tradeInfo = yield execute4HourMA5Trade(markets);
        const message = tradeInfo
            .map((info) => `[${info.market}]
Average Time
| ${info.averageTime}
Ticker Time
| ${info.tickerItme}
평균 가격
| ${info.averagePrice}
현재 가격
| ${info.ticekrTradePrice}
신호
| ${info.signal}`)
            .join("\n\n");
        const resultMessage = `240분 캔들의 5이동평균 전략\n\n{index: ${index}}\n\n ${message}`;
        (0, notifications_1.sendMessagesToUsers)(message, chatIds);
        console.log(resultMessage);
    });
}
