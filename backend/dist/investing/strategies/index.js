"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMinutesMovingAverage = exports.checkDailyMovingAverage = void 0;
const checkDailyMovingAverage_1 = require("./checkDailyMovingAverage");
Object.defineProperty(exports, "checkDailyMovingAverage", { enumerable: true, get: function () { return checkDailyMovingAverage_1.checkDailyMovingAverage; } });
const checkMinutesMovingAverage_1 = require("./checkMinutesMovingAverage");
Object.defineProperty(exports, "checkMinutesMovingAverage", { enumerable: true, get: function () { return checkMinutesMovingAverage_1.checkMinutesMovingAverage; } });
(() => {
    const markets = ["KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-AVAX", "KRW-DOGE"];
    (0, checkMinutesMovingAverage_1.checkMinutesMovingAverage)(markets, 60, 10);
})();
