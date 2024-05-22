"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeMA5Trade240_1 = require("./strategies/executeMA5Trade240");
(() => {
    (0, executeMA5Trade240_1.scheduleMA5Trade240Execution)(["KRW-BTC", "KRW-ETH", "KRW-SBD"]);
})();
