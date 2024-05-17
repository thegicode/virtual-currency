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
exports.tradeBasedOnMA = void 0;
const api_1 = require("../../services/api");
const movingAverage_1 = require("../strategies/movingAverage");
const utils_1 = require("../utils");
function tradeBasedOnMA(markets) {
    return __awaiter(this, void 0, void 0, function* () {
        const tickers = yield (0, api_1.fetchTicker)(markets.join(", "));
        const promises = markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            const fetchData = yield (0, api_1.fetchMinutes)(market, "240", "5");
            const movingAverage = (0, movingAverage_1.calculateMovingAverage)(fetchData)[0];
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
exports.tradeBasedOnMA = tradeBasedOnMA;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
            "KRW-NEAR",
        ];
        const result = yield tradeBasedOnMA(markets);
        console.log(result);
    }
    catch (error) {
        console.error("Error executing trading strategy:", error);
    }
}))();
