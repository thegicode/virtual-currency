"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
(0, vitest_1.describe)("calculateMovingAverage", () => {
    (0, vitest_1.it)("should calculate the moving average correctly for a given period", () => {
        const data = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
            {
                trade_price: 730,
            },
            {
                trade_price: 740,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([
            (700 + 710 + 720) / 3,
            (710 + 720 + 730) / 3,
            (720 + 730 + 740) / 3,
        ]);
    });
    (0, vitest_1.it)("should return an empty array if the data length is less than the period", () => {
        const data = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.it)("should handle an empty data array", () => {
        const data = [];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.it)("should handle a period of 1", () => {
        const data = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
        ];
        const period = 1;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([700, 710, 720]);
    });
    (0, vitest_1.it)("should handle a period equal to the length of the data array", () => {
        const data = [
            {
                trade_price: 700,
            },
            {
                trade_price: 710,
            },
            {
                trade_price: 720,
            },
        ];
        const period = 3;
        const result = (0, utils_1.calculateMovingAverage)(data, period);
        (0, vitest_1.expect)(result).toEqual([(700 + 710 + 720) / 3]);
    });
});
(0, vitest_1.describe)("calculateAllMovingAverages", () => {
    (0, vitest_1.it)("should return correct moving averages for given periods ", () => {
        const mockCandles = [
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
            {
                trade_price: 115,
            },
            {
                trade_price: 120,
            },
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
            {
                trade_price: 115,
            },
            {
                trade_price: 120,
            },
        ];
        const periods = [3, 5, 10];
        const expected = {
            ma3: (120 + 115 + 110) / 3,
            ma5: (120 + 115 + 110 + 105 + 100) / 5,
            ma10: (120 + 115 + 110 + 105 + 100 + 120 + 115 + 110 + 105 + 100) /
                10,
        };
        const result = (0, utils_1.calculateAllMovingAverages)(mockCandles, periods);
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should handle an empty candles array", () => {
        const mockCandles = [];
        const periods = [3, 5, 10];
        const expected = {
            ma3: undefined,
            ma5: undefined,
            ma10: undefined,
        };
        const result = (0, utils_1.calculateAllMovingAverages)(mockCandles, periods);
        (0, vitest_1.expect)(result).toEqual(expected);
    });
    (0, vitest_1.it)("should handle a single period", () => {
        const mockCandles = [
            {
                trade_price: 100,
            },
            {
                trade_price: 105,
            },
            {
                trade_price: 110,
            },
        ];
        const periods = [3];
        const expected = {
            ma3: (100 + 105 + 110) / 3,
        };
        const result = (0, utils_1.calculateAllMovingAverages)(mockCandles, periods);
        (0, vitest_1.expect)(result).toEqual(expected);
    });
});
(0, vitest_1.describe)("shouldBuyBasedOnMovingAverages", () => {
    (0, vitest_1.it)("should return true if the current price is above all moving averages", () => {
        const currentPrice = 150;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };
        const result = (0, utils_1.shouldBuyBasedOnMovingAverages)(currentPrice, movingAverages);
        (0, vitest_1.expect)(result).toBe(true);
    });
    (0, vitest_1.it)("should return false if the current price is below any of the moving averages", () => {
        const currentPrice = 115;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };
        const result = (0, utils_1.shouldBuyBasedOnMovingAverages)(currentPrice, movingAverages);
        (0, vitest_1.expect)(result).toBe(false);
    });
    (0, vitest_1.it)("should return false if the current price is equal to any of the moving averages", () => {
        const currentPrice = 120;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };
        const result = (0, utils_1.shouldBuyBasedOnMovingAverages)(currentPrice, movingAverages);
        (0, vitest_1.expect)(result).toBe(false);
    });
});
