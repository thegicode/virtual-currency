import { describe, it, expect } from "vitest";
import { determineInvestmentAction } from "../../../investing/strategies/movingAverageAndVolatility";

describe("determineInvestmentAction", () => {
    it("should return '매수' and correct position when isSignal is true", () => {
        const isSignal = true;
        const currentPrice = 100;
        const capital = 1000;

        const result = determineInvestmentAction(
            isSignal,
            currentPrice,
            capital
        );

        expect(result).toEqual({
            signal: "매수",
            position: 10,
        });
    });

    it("should return '매도' and zero position when isSignal is false", () => {
        const isSignal = false;
        const currentPrice = 100;
        const capital = 1000;

        const result = determineInvestmentAction(
            isSignal,
            currentPrice,
            capital
        );
        expect(result).toEqual({
            signal: "매도",
            position: 0,
        });
    });

    it("should return '매수' and zero position when capital is zero", () => {
        const isSignal = true;
        const currentPrice = 100;
        const capital = 0;

        const result = determineInvestmentAction(
            isSignal,
            currentPrice,
            capital
        );
        expect(result).toEqual({
            signal: "매수",
            position: 0,
        });
    });

    it("should return '매도' and zero position when currentPrice is zero", () => {
        const isSignal = true;
        const currentPrice = 0;
        const capital = 1000;

        const result = determineInvestmentAction(
            isSignal,
            currentPrice,
            capital
        );
        expect(result).toEqual({
            signal: "매도",
            position: 0,
        });
    });
});
