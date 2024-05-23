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
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
const api_1 = require("../../../services/api");
vitest_1.vi.mock("../../src/services/api");
vitest_1.vi.mock("../../src/investing/utils");
(0, vitest_1.describe)("checkDailyMovingAverageBacktest", () => {
    (0, vitest_1.it)("should return the correct results for a given market", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockMarket = "KRW-BTC";
        const mockPeriod = 3;
        const mockInitialCapital = 1000000;
        const mockCandles = [
            { trade_price: 100, date_time: "2023-01-01" },
            { trade_price: 110, date_time: "2023-01-02" },
            { trade_price: 105, date_time: "2023-01-03" },
            { trade_price: 120, date_time: "2023-01-04" },
            { trade_price: 130, date_time: "2023-01-05" },
        ];
        const mockMovingAverage = [105, 111.67, 118.33];
        api_1.fetchDailyCandles.mockResolvedValue(mockCandles);
        utils_1.calculateMovingAverage.mockReturnValue(mockMovingAverage);
        const results = yield checkDailyMovingAverageBacktest([mockMarket], mockPeriod, mockInitialCapital);
        (0, vitest_1.expect)(results).toHaveLength(1);
        const result = results[0];
        (0, vitest_1.expect)(result.market).toBe(mockMarket);
        (0, vitest_1.expect)(result.trades).toBeGreaterThan(0);
        (0, vitest_1.expect)(result.capital).toBeDefined();
        (0, vitest_1.expect)(result.returnRate).toBeDefined();
        (0, vitest_1.expect)(result.mdd).toBeDefined();
        (0, vitest_1.expect)(result.winRate).toBeDefined();
    }));
    (0, vitest_1.it)("should handle multiple markets correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockMarkets = ["KRW-BTC", "KRW-ETH"];
        const mockPeriod = 3;
        const mockInitialCapital = 1000000;
        const mockCandles = [
            { trade_price: 100, date_time: "2023-01-01" },
            { trade_price: 110, date_time: "2023-01-02" },
            { trade_price: 105, date_time: "2023-01-03" },
            { trade_price: 120, date_time: "2023-01-04" },
            { trade_price: 130, date_time: "2023-01-05" },
        ];
        const mockMovingAverage = [105, 111.67, 118.33];
        api_1.fetchDailyCandles.mockResolvedValue(mockCandles);
        utils_1.calculateMovingAverage.mockReturnValue(mockMovingAverage);
        const results = yield checkDailyMovingAverageBacktest(mockMarkets, mockPeriod, mockInitialCapital);
        (0, vitest_1.expect)(results).toHaveLength(mockMarkets.length);
        results.forEach((result, index) => {
            (0, vitest_1.expect)(result.market).toBe(mockMarkets[index]);
            (0, vitest_1.expect)(result.trades).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.capital).toBeDefined();
            (0, vitest_1.expect)(result.returnRate).toBeDefined();
            (0, vitest_1.expect)(result.mdd).toBeDefined();
            (0, vitest_1.expect)(result.winRate).toBeDefined();
        });
    }));
});
