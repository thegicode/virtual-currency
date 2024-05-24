import { describe, it, expect } from "vitest";
import { calculateRiskAdjustedCapital } from "../../../investing/utils";

describe("calculateRiskAdjustedCapital", () => {
    it("should correctly calculate the capital allocation based on volatility", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 10;
        const initialCapital = 1000000;

        const result = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            count,
            initialCapital
        );
        expect(result).toBeCloseTo(
            (targetVolatility / volatility / count) * initialCapital,
            5
        );
    });

    it("should handle zero volatility by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 0;
        const count = 10;
        const initialCapital = 1000000;

        const result = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            count,
            initialCapital
        );
        expect(result).toBe(0);
    });

    it("should handle zero initial capital by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 10;
        const initialCapital = 0;

        const result = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            count,
            initialCapital
        );
        expect(result).toBe(0);
    });

    it("should handle zero count by returning zero", () => {
        const targetVolatility = 2;
        const volatility = 1.5;
        const count = 0;
        const initialCapital = 1000000;

        const result = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            count,
            initialCapital
        );
        expect(result).toBe(0);
    });

    it("should handle negative volatility by returning a negative value", () => {
        const targetVolatility = 2;
        const volatility = -1.5;
        const count = 10;
        const initialCapital = 1000000;

        const result = calculateRiskAdjustedCapital(
            targetVolatility,
            volatility,
            count,
            initialCapital
        );

        expect(result).toBeCloseTo(
            (targetVolatility / volatility / count) * initialCapital,
            5
        );
    });
});
