"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkMinutesMovingAverage_1 = require("./strategies/checkMinutesMovingAverage");
(() => {
    (0, checkMinutesMovingAverage_1.checkMinutesMovingAverage)(["KRW-BTC", "KRW-ETH", "KRW-SBD"], 240, 5);
})();
