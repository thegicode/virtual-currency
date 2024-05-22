"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduleMovingAverageTrades_1 = require("./strategies/scheduleMovingAverageTrades");
(() => {
    (0, scheduleMovingAverageTrades_1.scheduleMovingAverageTrades)(["KRW-BTC", "KRW-ETH", "KRW-SBD"], 240, 5);
})();
