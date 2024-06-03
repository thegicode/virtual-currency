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
const risingVolatilityBreakoutBacktest_1 = require("./risingVolatilityBreakoutBacktest");
const volatilityBreakoutBacktest_1 = require("./volatilityBreakoutBacktest");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const initialCapital = 1000000;
        const markets = [
            "KRW-LINK",
            "KRW-DOT",
        ];
        const resultCounts = 100;
        console.log("-----------------------------------------");
        console.log("initialCapital : ", initialCapital);
        console.log("resultCounts : ", resultCounts);
        console.log("-----------------------------------------");
        yield (0, checkMinutesMovingAverageBacktest_1.checkMinutesMovingAverageBacktest)(markets, 60, 10, initialCapital, resultCounts);
        yield (0, checkMinutesMovingAverageBacktest_1.checkMinutesMovingAverageBacktest)(markets, 240, 10, initialCapital, resultCounts);
        console.log("-----------------------------------------");
        yield (0, checkDailyMovingAverageBacktest_1.checkDailyMovingAverageBacktest)(markets, 5, initialCapital, resultCounts);
        console.log("-----------------------------------------");
        yield (0, movingAverageAndVolatilityBacktest_1.movingAverageAndVolatilityBacktest)(markets, initialCapital, resultCounts);
        console.log("-----------------------------------------");
        yield (0, afternoonRiseStrategyBacktest_1.afternoonRiseMorningInvestmentBacktest)(markets, initialCapital, resultCounts, 2);
        yield (0, volatilityBreakoutBacktest_1.volatilityBreakoutBacktest)(markets, initialCapital, resultCounts);
        yield (0, risingVolatilityBreakoutBacktest_1.risingVolatilityBreakoutBacktest)(markets, initialCapital, resultCounts);
    }
    catch (error) {
        console.error("Error during backtesting: ", error);
    }
}))();
