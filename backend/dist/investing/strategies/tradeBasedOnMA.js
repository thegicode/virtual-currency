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
const fetchMinutes_1 = require("../../services/api/fetchMinutes");
const movingAverage_1 = require("./movingAverage");
function tradeBasedOnMA() {
    return __awaiter(this, void 0, void 0, function* () {
        const markets = ["KRW-BTC", "KRW-XRP"];
        const promises = markets.map((market) => __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, fetchMinutes_1.fetchMinutes)(market, "240", "5");
            console.log("data", data);
            const movingAverage = (0, movingAverage_1.calculateMovingAverage)(data);
            const aData = data[data.length - 1];
            const action = aData.trade_price > movingAverage[0]
                ? "Buy | Hold"
                : "Sell | Reserve";
            return {
                market,
                time: aData.time,
                action,
            };
        }));
        return yield Promise.all(promises);
    });
}
exports.tradeBasedOnMA = tradeBasedOnMA;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decisions = yield tradeBasedOnMA();
        console.log(decisions);
    }
    catch (error) {
        console.error("Error executing trading strategy:", error);
    }
}))();
