"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
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
