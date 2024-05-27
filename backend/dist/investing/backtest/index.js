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
exports.checkDailyMovingAverageBacktest = void 0;
const afternoonRiseStrategyBacktest_1 = require("./afternoonRiseStrategyBacktest");
const checkDailyMovingAverageBacktest_1 = require("./checkDailyMovingAverageBacktest");
Object.defineProperty(exports, "checkDailyMovingAverageBacktest", { enumerable: true, get: function () { return checkDailyMovingAverageBacktest_1.checkDailyMovingAverageBacktest; } });
const checkMinutesMovingAverageBacktest_1 = require("./checkMinutesMovingAverageBacktest");
const movingAverageAndVolatilityBacktest_1 = require("./movingAverageAndVolatilityBacktest");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const initialCapital = 10000;
        const markets = [
            "KRW-BTC",
        ];
        const apiCounts = 100;
        console.log("-----------------------------------------");
        console.log("initialCapital : ", initialCapital);
        console.log("-----------------------------------------");
        yield (0, checkMinutesMovingAverageBacktest_1.checkMinutesMovingAverageBacktest)(markets, 240, 10, initialCapital, apiCounts);
        yield (0, checkMinutesMovingAverageBacktest_1.checkMinutesMovingAverageBacktest)(markets, 240, 5, initialCapital, apiCounts);
        console.log("-----------------------------------------");
        yield (0, checkDailyMovingAverageBacktest_1.checkDailyMovingAverageBacktest)(markets, 5, initialCapital, apiCounts);
        console.log("-----------------------------------------");
        yield (0, movingAverageAndVolatilityBacktest_1.movingAverageAndVolatilityBacktest)(markets, initialCapital, apiCounts);
        console.log("-----------------------------------------");
        yield (0, afternoonRiseStrategyBacktest_1.multiCryptoAfternoonRiseMorningInvestmentBacktest)(markets, initialCapital, apiCounts);
    }
    catch (error) {
        console.error("Error during backtesting: ", error);
    }
}))();
