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
const checkDailyMovingAverage_1 = require("./checkDailyMovingAverage");
Object.defineProperty(exports, "checkDailyMovingAverage", { enumerable: true, get: function () { return checkDailyMovingAverage_1.checkDailyMovingAverage; } });
const checkMinutesMovingAverage_1 = require("./checkMinutesMovingAverage");
Object.defineProperty(exports, "checkMinutesMovingAverage", { enumerable: true, get: function () { return checkMinutesMovingAverage_1.checkMinutesMovingAverage; } });
const movingAverageAndVolatility_1 = require("./movingAverageAndVolatility");
Object.defineProperty(exports, "executeMovingAverageAndVolatility", { enumerable: true, get: function () { return movingAverageAndVolatility_1.executeMovingAverageAndVolatility; } });
(() => __awaiter(void 0, void 0, void 0, function* () {
    const markets = [
        "KRW-AVAX",
        "KRW-BCH",
        "KRW-ZRX",
        "KRW-THETA",
        "KRW-NEAR",
        "KRW-BTG",
        "KRW-SHIB",
    ];
    const initialCapital = 100000;
    console.log("---------------------------------------------------");
    console.log("*** initialCapital: ", initialCapital.toLocaleString() + "원");
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");
    const result1 = yield (0, checkDailyMovingAverage_1.checkDailyMovingAverage)(markets, 5);
    console.log(result1);
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");
}))();
