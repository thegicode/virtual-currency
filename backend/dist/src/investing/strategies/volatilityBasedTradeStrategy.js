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
exports.checkDailyVolatilityTradeStrategy = void 0;
const api_1 = require("../../services/api");
const utils_1 = require("../utils");
checkDailyVolatilityTradeStrategy(["KRW-XRP"]);
function checkDailyVolatilityTradeStrategy(markets) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield Promise.all(markets.map((market) => __awaiter(this, void 0, void 0, function* () { return yield checkVolatility(market); })));
            console.log(results);
        }
        catch (error) {
            console.error(`Error checking daily volatility:: `, error);
        }
    });
}
exports.checkDailyVolatilityTradeStrategy = checkDailyVolatilityTradeStrategy;
function checkVolatility(market) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fetchedData = yield (0, api_1.fetchDailyCandles)(market, "20");
            const movingAverages = [
                (0, utils_1.calculateMovingAverage)(fetchedData, 3),
                (0, utils_1.calculateMovingAverage)(fetchedData, 5),
                (0, utils_1.calculateMovingAverage)(fetchedData, 10),
                (0, utils_1.calculateMovingAverage)(fetchedData, 20),
            ].map((ma) => ma[ma.length - 1]);
            console.log("movingAverages", movingAverages);
        }
        catch (error) {
            console.error(`Error in checkVolatility ${market}: `, error);
        }
    });
}
