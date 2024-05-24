"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const movingAverageAndVolatility_1 = require("../../../investing/strategies/movingAverageAndVolatility");
(0, vitest_1.describe)("determineInvestmentAction", () => {
    (0, vitest_1.it)("should return '매수' and correct position when isSignal is true", () => {
        const isSignal = true;
        const currentPrice = 100;
        const capital = 1000;
        const result = (0, movingAverageAndVolatility_1.determineInvestmentAction)(isSignal, currentPrice, capital);
        (0, vitest_1.expect)(result).toEqual({
            signal: "매수",
            position: 10,
        });
    });
    (0, vitest_1.it)("should return '매도' and zero position when isSignal is false", () => {
        const isSignal = false;
        const currentPrice = 100;
        const capital = 1000;
        const result = (0, movingAverageAndVolatility_1.determineInvestmentAction)(isSignal, currentPrice, capital);
        (0, vitest_1.expect)(result).toEqual({
            signal: "매도",
            position: 0,
        });
    });
    (0, vitest_1.it)("should return '매수' and zero position when capital is zero", () => {
        const isSignal = true;
        const currentPrice = 100;
        const capital = 0;
        const result = (0, movingAverageAndVolatility_1.determineInvestmentAction)(isSignal, currentPrice, capital);
        (0, vitest_1.expect)(result).toEqual({
            signal: "매수",
            position: 0,
        });
    });
    (0, vitest_1.it)("should return '매도' and zero position when currentPrice is zero", () => {
        const isSignal = true;
        const currentPrice = 0;
        const capital = 1000;
        const result = (0, movingAverageAndVolatility_1.determineInvestmentAction)(isSignal, currentPrice, capital);
        (0, vitest_1.expect)(result).toEqual({
            signal: "매도",
            position: 0,
        });
    });
});
