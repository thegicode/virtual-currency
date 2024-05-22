"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const execute4HourMA5Trade_1 = require("./strategies/execute4HourMA5Trade");
(() => {
    (0, execute4HourMA5Trade_1.schedule4HourMA5TradeExecution)(["KRW-BTC", "KRW-ETH", "KRW-SBD"]);
})();
