"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trades_1 = require("./trades");
(() => {
    try {
        const markets = [
            "KRW-BTC",
            "KRW-ETH",
            "KRW-DOGE",
            "KRW-XRP",
            "KRW-SBD",
            "KRW-NEAR",
        ];
        (0, trades_1.scheduleMA5Trade240Execution)(markets);
    }
    catch (error) {
        console.error("Error executing trading strategy:", error);
    }
})();
