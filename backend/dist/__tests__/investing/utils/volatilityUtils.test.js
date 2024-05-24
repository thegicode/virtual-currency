"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
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
