"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_1 = require("../../../investing/utils");
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
