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
exports.executeMovingAverageAndVolatility = exports.checkMinutesMovingAverage = exports.checkDailyMovingAverage = void 0;
const afternoonRiseMorningInvestment_1 = require("./afternoonRiseMorningInvestment");
const checkDailyMovingAverage_1 = require("./checkDailyMovingAverage");
Object.defineProperty(exports, "checkDailyMovingAverage", { enumerable: true, get: function () { return checkDailyMovingAverage_1.checkDailyMovingAverage; } });
const checkMinutesMovingAverage_1 = require("./checkMinutesMovingAverage");
Object.defineProperty(exports, "checkMinutesMovingAverage", { enumerable: true, get: function () { return checkMinutesMovingAverage_1.checkMinutesMovingAverage; } });
const movingAverageAndVolatility_1 = require("./movingAverageAndVolatility");
Object.defineProperty(exports, "executeMovingAverageAndVolatility", { enumerable: true, get: function () { return movingAverageAndVolatility_1.executeMovingAverageAndVolatility; } });
const risingVolatilityBreakoutStrategy_1 = require("./risingVolatilityBreakoutStrategy");
const risingVolatilityBreakoutWithAdjustment_1 = require("./risingVolatilityBreakoutWithAdjustment");
const volatilityBreakoutStrategy_1 = require("./volatilityBreakoutStrategy");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const markets = [
        "KRW-DOT",
    ];
    const initialCapital = 100000;
    console.log("---------------------------------------------------");
    console.log("*** initialCapital: ", initialCapital.toLocaleString() + "원");
    console.log("---------------------------------------------------");
    yield (0, checkMinutesMovingAverage_1.checkMinutesMovingAverage)(markets, 60, 10, (message) => {
        console.log(message);
    });
    yield (0, checkMinutesMovingAverage_1.checkMinutesMovingAverage)(markets, 240, 5, (message) => {
        console.log(message);
    });
    console.log("---------------------------------------------------");
    const result1 = yield (0, checkDailyMovingAverage_1.checkDailyMovingAverage)(markets, 5);
    console.log(result1);
    console.log("---------------------------------------------------");
    const results2 = yield (0, movingAverageAndVolatility_1.executeMovingAverageAndVolatility)(markets, initialCapital, 2);
    console.log(results2);
    console.log("---------------------------------------------------");
    const results3 = yield (0, afternoonRiseMorningInvestment_1.afternoonRiseMorningInvestment)(markets, initialCapital, 2);
    console.log(results3);
    console.log("---------------------------------------------------");
    const results4 = yield (0, volatilityBreakoutStrategy_1.volatilityBreakoutStrategy)(markets, initialCapital);
    console.log(results4);
    console.log("---------------------------------------------------");
    const results5 = yield (0, risingVolatilityBreakoutStrategy_1.risingVolatilityBreakoutStrategy)(markets, initialCapital);
    console.log(results5);
    console.log("---------------------------------------------------");
    const results6 = yield (0, risingVolatilityBreakoutWithAdjustment_1.risingVolatilityBreakoutWithAdjustment)(markets, initialCapital);
    console.log(results6);
}))();
