"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
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
(0, vitest_1.describe)("calculateRiskAdjustedCapital", () => {
    (0, vitest_1.it)("should correctly calculate the capital allocation based on volatility", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 10;
        const initialCapital = 1000000;
        const result = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, count, initialCapital);
        (0, vitest_1.expect)(result).toBeCloseTo((targetVolatility / volatility / count) * initialCapital, 5);
    });
    (0, vitest_1.it)("should handle zero volatility by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 0;
        const count = 10;
        const initialCapital = 1000000;
        const result = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, count, initialCapital);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("should handle zero initial capital by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 10;
        const initialCapital = 0;
        const result = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, count, initialCapital);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("should handle zero count by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 0;
        const initialCapital = 1000000;
        const result = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, count, initialCapital);
        (0, vitest_1.expect)(result).toBe(0);
    });
    (0, vitest_1.it)("should handle negative volatility by returning a negative value", () => {
        const targetVolatility = 2;
        const volatility = -1.5;
        const count = 10;
        const initialCapital = 1000000;
        const result = (0, utils_1.calculateRiskAdjustedCapital)(targetVolatility, volatility, count, initialCapital);
        (0, vitest_1.expect)(result).toBeCloseTo((targetVolatility / volatility / count) * initialCapital, 5);
    });
});
(0, vitest_1.describe)("calculateVolatility", () => {
    (0, vitest_1.it)("should return the correct average volatility for given candles", () => {
        const mockCandles = [
            {
                opening_price: 95,
                trade_price: 100,
                high_price: 110,
                low_price: 90,
            },
            {
                opening_price: 100,
                trade_price: 105,
                high_price: 115,
                low_price: 95,
            },
            {
                opening_price: 105,
                trade_price: 110,
                high_price: 120,
                low_price: 100,
            },
            {
                opening_price: 110,
                trade_price: 115,
                high_price: 125,
                low_price: 105,
            },
            {
                opening_price: 115,
                trade_price: 120,
                high_price: 130,
                low_price: 110,
            },
        ];
        const expectedVolatility = (((110 - 90) / 95) * 100 +
            ((115 - 95) / 100) * 100 +
            ((120 - 100) / 105) * 100 +
            ((125 - 105) / 110) * 100 +
            ((130 - 110) / 115) * 100) /
            5;
        const result = (0, utils_1.calculateVolatility)(mockCandles);
        (0, vitest_1.expect)(result).toBeCloseTo(expectedVolatility, 5);
    });
    (0, vitest_1.it)("should handle empty array by returing NaN", () => {
        const mockCandles = [];
        const result = (0, utils_1.calculateVolatility)(mockCandles);
        (0, vitest_1.expect)(result).toBeNaN();
    });
    (0, vitest_1.it)("should handle an array with one element correctly", () => {
        const mockCandles = [
            {
                opening_price: 95,
                trade_price: 100,
                high_price: 110,
                low_price: 90,
            },
        ];
        const expectedVolatility = ((110 - 90) / 95) * 100;
        const result = (0, utils_1.calculateVolatility)(mockCandles);
        (0, vitest_1.expect)(result).toBeCloseTo(expectedVolatility, 5);
    });
});
(0, vitest_1.describe)("isAboveAllMovingAverages", () => {
    (0, vitest_1.it)("should return true if the current price is above all moving averages", () => {
        const currentPrice = 150;
        const movingAverages = {
            ma3: 140,
            ma5: 130,
            ma10: 120,
            ma20: 110,
        };
        const result = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
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
        const result = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
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
        const result = (0, utils_1.isAboveAllMovingAverages)(currentPrice, movingAverages);
        (0, vitest_1.expect)(result).toBe(false);
    });
});
