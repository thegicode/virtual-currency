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
exports.scheduleMA5Trade240Execution = exports.executeMA5Trade240 = void 0;
const notifications_1 = require("../../notifications");
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
function executeMA5Trade240(markets) {
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
            const action = aTicker.trade_price > movingAverage
                ? "Buy | Hold"
                : "Sell | Reserve";
            return {
                market,
                averageTime: aCandle.time,
                averagePrice: movingAverage.toLocaleString(),
                tickerItme: (0, utils_1.formatTimestampToKoreanTime)(aTicker.trade_timestamp),
                ticekrTradePrice: aTicker.trade_price.toLocaleString(),
                action,
            };
        }));
        return yield Promise.all(promises);
    });
}
exports.executeMA5Trade240 = executeMA5Trade240;
function scheduleMA5Trade240Execution(markets) {
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
exports.scheduleMA5Trade240Execution = scheduleMA5Trade240Execution;
function generateAndSendTradeInfo(markets, chatIds, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const tradeInfo = yield executeMA5Trade240(markets);
        const message = tradeInfo
            .map((info) => `* ${info.market}
- Average Time: 
 ${info.averageTime}
- Ticker Time:
 ${info.tickerItme}
- Average Price:
 ${info.averagePrice}
- Ticker Trade Price:
 ${info.ticekrTradePrice}
- Action:
 ${info.action}
`)
            .join("\n\n");
        const resultMessage = `{index: ${index}}\n\n ${message}`;
        (0, notifications_1.sendMessagesToUsers)(message, chatIds);
        console.log(resultMessage);
    });
}
